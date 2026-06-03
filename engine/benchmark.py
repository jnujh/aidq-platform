"""Step 8 벤치마크: 데이터 크기 × 워커 수별 병렬 진단 성능 측정 + 시각화.

워커 수는 이 스크립트가 아니라 외부에서 `docker compose up -d --scale engine=N` 으로 제어한다.
(스크립트가 직접 스케일하면 자기 자신이 든 컨테이너를 재생성해 죽으므로.)
이 스크립트는 컨테이너 안에서 실행되며 데이터 준비 · 디스패치+측정 · 시각화만 담당한다.

순차/병렬 정의: 동일한 chord 경로에서 워커 수만 1/2/4로 바꿔 측정한다.
  - 워커 1개 = 순차 baseline (청크를 한 워커가 하나씩 처리)
  - speedup(N) = T(1) / T(N)

사용 흐름:
  # 1) 테스트 데이터 생성 (최초 1회, S3 업로드 — 멱등)
  docker compose up -d --scale engine=1 engine
  docker exec scorecard-engine-1 python benchmark.py gen

  # 2) 청크 분할을 강제하려면 작은 청크 크기로 엔진 재기동
  #    (기본 256MB/32MB면 중소형 파일은 분할 안 돼 병렬 효과가 안 나옴)
  export TARGET_CHUNK_SIZE_BYTES=8388608 MIN_CHUNK_SIZE_BYTES=8388608   # 8MB

  # 3) 워커 수별 측정 (스케일 → 측정 반복; 결과는 S3에 누적)
  docker compose up -d --scale engine=1 engine && docker exec scorecard-engine-1 python benchmark.py run --workers 1
  docker compose up -d --scale engine=2 engine && docker exec scorecard-engine-1 python benchmark.py run --workers 2
  docker compose up -d --scale engine=4 engine && docker exec scorecard-engine-1 python benchmark.py run --workers 4

  # 4) 시각화 (PNG → /app/benchmark_out + S3) 후 호스트로 복사
  docker exec scorecard-engine-1 python benchmark.py plot
  docker cp scorecard-engine-1:/app/benchmark_out ./docs/benchmark
"""
import argparse
import io
import json
import os
import time

import numpy as np
import pandas as pd
import pika

from worker import (get_s3_client, S3_BUCKET,
                    RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASS,
                    RESULT_EXCHANGE, RESULT_ROUTING_KEY, DIAGNOSIS_QUEUE)

# ── 설정 ──
SIZES_GB = [2, 8, 32]                     # 측정할 데이터 크기(GB). CLI --sizes로 오버라이드
N_NUMERIC, N_CATEGORICAL = 8, 4          # 합성 데이터 컬럼 구성 (+ target 1)
DATA_PREFIX = 'benchmark/data/'          # S3 테스트 데이터 키 접두사
RESULTS_KEY = 'benchmark/results.jsonl'  # S3 측정 결과 누적 파일
OUT_DIR = '/app/benchmark_out'           # PNG 산출 디렉터리 (docker cp 대상)
RESULT_TIMEOUT_SEC = 6 * 3600            # 단건 결과 대기 상한 (대용량 대비 6h)
GEN_PART_ROWS = 700_000                  # 멀티파트 1파트당 행수 (~64MB, 5MB 하한 충족)


def _data_key(gb) -> str:
    label = f'{gb:g}'.replace('.', 'p')
    return f'{DATA_PREFIX}size_{label}gb.csv'


# ── 1) 합성 데이터 생성 + S3 업로드 (멀티파트 스트리밍 → 로컬 디스크 불필요) ──
def _gen_rows_csv(rng, rows, header=False) -> bytes:
    """수치형/범주형/타깃 섞은 합성 CSV 조각 (시드 rng 공유). header=True면 헤더 포함."""
    data = {f'num_{i}': rng.normal(100, 25, rows).round(3) for i in range(N_NUMERIC)}
    for i in range(N_CATEGORICAL):
        data[f'cat_{i}'] = rng.choice(['A', 'B', 'C', 'D'], rows)
    data['target'] = rng.integers(0, 2, rows)
    buf = io.StringIO()
    pd.DataFrame(data).to_csv(buf, index=False, header=header)
    return buf.getvalue().encode('utf-8')


def _gen_one(s3, gb):
    """gb 크기 CSV를 멀티파트 업로드로 스트리밍 생성 (메모리 ~1파트, 로컬 디스크 0)."""
    key = _data_key(gb)
    target = int(gb * 1024 ** 3)
    try:
        sz = s3.head_object(Bucket=S3_BUCKET, Key=key)['ContentLength']
        if sz >= target * 0.97:
            print(f'  [skip] {key} 이미 존재 ({sz/1024**3:.2f}GB)')
            return
    except Exception:
        pass
    print(f'  [생성] {key} 목표 {gb}GB → 멀티파트 스트리밍')
    mpu = s3.create_multipart_upload(Bucket=S3_BUCKET, Key=key)
    parts, pno, written = [], 1, 0
    rng = np.random.default_rng(42)
    try:
        while written < target:
            body = _gen_rows_csv(rng, GEN_PART_ROWS, header=(pno == 1))
            resp = s3.upload_part(Bucket=S3_BUCKET, Key=key, PartNumber=pno,
                                  UploadId=mpu['UploadId'], Body=body)
            parts.append({'PartNumber': pno, 'ETag': resp['ETag']})
            written += len(body); pno += 1
            if pno % 20 == 0:
                print(f'    {written/1024**3:.2f}/{gb}GB ({pno-1}파트)')
        s3.complete_multipart_upload(Bucket=S3_BUCKET, Key=key, UploadId=mpu['UploadId'],
                                     MultipartUpload={'Parts': parts})
        print(f'  [완료] {key} — {written/1024**3:.2f}GB, {pno-1}파트')
    except Exception:
        s3.abort_multipart_upload(Bucket=S3_BUCKET, Key=key, UploadId=mpu['UploadId'])
        raise


def gen(sizes=None):
    s3 = get_s3_client()
    for gb in (sizes or SIZES_GB):
        _gen_one(s3, gb)
    print('데이터 준비 완료. 청크(TARGET/MIN_CHUNK_SIZE_BYTES)보다 파일이 커야 병렬화됨.')


# ── 결과 누적 파일 (S3 jsonl) ──
def _append_result(record: dict):
    s3 = get_s3_client()
    try:
        prev = s3.get_object(Bucket=S3_BUCKET, Key=RESULTS_KEY)['Body'].read().decode('utf-8')
    except Exception:
        prev = ''
    prev += json.dumps(record, ensure_ascii=False) + '\n'
    s3.put_object(Bucket=S3_BUCKET, Key=RESULTS_KEY, Body=prev.encode('utf-8'))


def _load_results() -> list:
    s3 = get_s3_client()
    raw = s3.get_object(Bucket=S3_BUCKET, Key=RESULTS_KEY)['Body'].read().decode('utf-8')
    return [json.loads(line) for line in raw.splitlines() if line.strip()]


def _read_timing(job_id) -> dict:
    """코디네이터가 Redis(db=1)에 기록한 직렬 준비시간 등. 없으면 빈 dict."""
    try:
        import redis
        r = redis.Redis(host=os.getenv('REDIS_HOST', 'redis'),
                        port=int(os.getenv('REDIS_PORT', '6379')), db=1)
        raw = r.get(f'bench:timing:{job_id}')
        return json.loads(raw) if raw else {}
    except Exception:
        return {}


# ── 2) 워커 수별 측정 ──
def _connect():
    return pika.BlockingConnection(pika.ConnectionParameters(
        host=RABBITMQ_HOST, port=RABBITMQ_PORT,
        credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS),
        heartbeat=RESULT_TIMEOUT_SEC + 60))


def _dispatch_and_wait(ch, result_queue, job_id, s3_key) -> dict:
    """job을 diagnosis.queue로 발행하고, 임시 결과 큐에서 동일 jobId 결과를 기다린다."""
    ch.queue_declare(queue=DIAGNOSIS_QUEUE, durable=True)  # bridge가 소비하는 큐 (멱등)
    ch.basic_publish(
        exchange='', routing_key=DIAGNOSIS_QUEUE,  # 기본 exchange → 큐 이름으로 직접 전달
        body=json.dumps({'jobId': job_id, 's3Key': s3_key, 'originalFilename': s3_key}),
        properties=pika.BasicProperties(content_type='application/json', delivery_mode=2))

    t0 = time.time()
    deadline = t0 + RESULT_TIMEOUT_SEC
    while time.time() < deadline:
        method, props, body = ch.basic_get(queue=result_queue, auto_ack=True)
        if method is None:
            time.sleep(0.3)
            continue
        msg = json.loads(body)
        if str(msg.get('jobId')) != str(job_id):
            continue  # 다른 job 결과 (이론상 없음 — 순차 측정)
        elapsed = time.time() - t0
        timing = _read_timing(job_id)
        serial = timing.get('serial_prep_s')
        # compute-only = end-to-end − 직렬 준비(경계탐색+샘플+전역통계). 단일 클럭(여기) 기준이라 정확.
        compute = round(elapsed - serial, 2) if serial is not None else None
        return {'elapsed': round(elapsed, 2),
                'serial_prep_s': serial, 'compute_s': compute,
                'n_ranges': timing.get('n_ranges'),
                'success': bool(msg.get('success')),
                'score': msg.get('totalScore'),
                'error': msg.get('errorMessage')}
    return {'elapsed': None, 'success': False, 'score': None, 'error': 'timeout'}


def run(workers: int, sizes=None):
    conn = _connect()
    ch = conn.channel()
    # Spring 미기동 환경 대비: exchange 선언 (DirectExchange, durable — Spring과 동일)
    ch.exchange_declare(exchange=RESULT_EXCHANGE, exchange_type='direct', durable=True)
    # 결과 수신용 임시 큐 (exclusive/auto-delete) → diagnosis.result 바인딩 (Spring result.queue와 공존)
    tmp = ch.queue_declare(queue='', exclusive=True, auto_delete=True).method.queue
    ch.queue_bind(queue=tmp, exchange=RESULT_EXCHANGE, routing_key=RESULT_ROUTING_KEY)
    s3 = get_s3_client()

    print(f'=== 벤치마크 측정 (workers={workers}) ===')
    for gb in (sizes or SIZES_GB):
        key = _data_key(gb)
        try:
            size_mb = round(s3.head_object(Bucket=S3_BUCKET, Key=key)['ContentLength'] / 1024**2, 1)
        except Exception:
            print(f'  [건너뜀] {key} 없음 — gen 먼저 실행')
            continue
        job_id = f'bench-{workers}-{gb:g}gb-{int(time.time())}'
        print(f'  [측정] {gb}GB ({size_mb}MB), key={key} → 디스패치')
        r = _dispatch_and_wait(ch, tmp, job_id, key)
        record = {'workers': workers, 'gb': gb, 'size_mb': size_mb, 'jobId': job_id, **r}
        _append_result(record)
        if r['success']:
            extra = (f', 직렬{r["serial_prep_s"]}s/compute{r["compute_s"]}s'
                     if r.get('serial_prep_s') is not None else '')
            status = f'{r["elapsed"]}s, score={r["score"]}{extra}'
        else:
            status = f'실패: {r["error"]}'
        print(f'    → {status}')
    conn.close()
    print('측정 완료 → S3 결과 누적.')


# ── 3) 시각화 ──
# ── 시각화 스타일 (디자인 레퍼런스 매칭의 단일 변경 지점) ──
# 레퍼런스 이미지를 받으면 아래 STYLE 값(색·폰트·크기)만 갈아끼우면 전 차트에 반영된다.
STYLE = {
    'font_family': 'NanumGothic',   # 한글 폰트 (엔진 이미지에 fonts-nanum 설치)
    'palette': ['#2563EB', '#60A5FA', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED'],  # 시리즈 색
    'ideal_color': '#9CA3AF',       # 이상선(점선)
    'bg': '#EEF1F6',                 # Shiftee 톤 밝은 회청 배경
    'grid_alpha': 0.25,
    'figsize': (8, 5),
    'dpi': 150,
    'title_size': 14,
    'label_size': 11,
    'marker': 'o',
    # ── 히어로 차트(레퍼런스 매칭) 전용 색 ──
    'bar_pale': '#C5D6F2',          # 일반 막대(연파랑)
    'bar_vivid': '#2563EB',         # 강조 막대(진파랑) — 최선 결과
    'bar_vivid_top': '#3B82F6',     # 그라디언트 상단
    'pill_bg': '#1F2937',           # 다크 알약 주석 배경
    'pill_fg': '#FFFFFF',
    'trend': '#1E3A8A',             # 점선 추세선(네이비)
    'badge_bg': '#2563EB',          # 원형 배지
    'badge_fg': '#FFFFFF',
    'text_dark': '#1F2937',
    'text_muted': '#6B7280',
    'accent': '#2563EB',            # 제목 강조 숫자
}


def _setup_style():
    """matplotlib 전역 스타일 적용 후 plt 반환. STYLE 단일 지점에서 제어."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from cycler import cycler
    # 폰트가 없는 환경(로컬 등)에서도 죽지 않도록: 설치돼 있으면 한글 폰트, 아니면 기본
    from matplotlib.font_manager import findfont, FontProperties
    fam = STYLE['font_family']
    try:
        findfont(FontProperties(family=fam), fallback_to_default=False)
    except Exception:
        fam = plt.rcParams['font.family']  # 폰트 미설치 → 기본(영문) 유지
        print(f"[plot] '{STYLE['font_family']}' 폰트 미발견 → 기본 폰트 사용(한글 깨질 수 있음)")
    plt.rcParams.update({
        'font.family': fam,
        'axes.unicode_minus': False,                 # 한글 폰트 음수기호 깨짐 방지
        'figure.facecolor': STYLE['bg'],
        'axes.facecolor': STYLE['bg'],
        'axes.prop_cycle': cycler(color=STYLE['palette']),
        'axes.titlesize': STYLE['title_size'],
        'axes.labelsize': STYLE['label_size'],
        'figure.dpi': STYLE['dpi'],
    })
    return plt


def _fmt_time(sec):
    if sec >= 60:
        m = sec / 60
        return f'{m:.1f}분' if m < 10 else f'{m:.0f}분'
    return f'{sec:.0f}초'


def _grad_bar(ax, x, w, h, c0, c1, zorder=3):
    """세로 그라디언트(아래 c0→위 c1) 막대. imshow를 막대 영역에 클립."""
    import matplotlib.colors as mcolors
    grad = np.linspace(0, 1, 256).reshape(-1, 1)
    cmap = mcolors.LinearSegmentedColormap.from_list('', [c0, c1])
    ax.imshow(grad, extent=[x - w / 2, x + w / 2, 0, h], origin='lower',
              aspect='auto', cmap=cmap, zorder=zorder)


def _rich_line(fig, x, y, segments, fontsize, weight='bold'):
    """한 줄 안에서 색을 섞는 텍스트 (figure fraction 좌표, 좌상단 정렬)."""
    from matplotlib.offsetbox import TextArea, HPacker, AnnotationBbox
    boxes = [TextArea(t, textprops=dict(color=c, fontsize=fontsize, fontweight=weight,
                                        fontfamily=STYLE['font_family'])) for t, c in segments]
    pack = HPacker(children=boxes, align='baseline', pad=0, sep=0)
    fig.add_artist(AnnotationBbox(pack, (x, y), xycoords='figure fraction',
                                  box_alignment=(0, 1), frameon=False))


def plot_hero(workers, times, speedups, eyebrow, headline, headline_badge,
              accuracy_text, context_text, out_name='hero_time.png', sample=False):
    """레퍼런스(Shiftee) 디자인 참조 히어로 차트 v2.

    x=워커 수, y=처리 시간(내려가는 그라디언트 막대=빠를수록 좋음). 최선 막대 진파랑 강조,
    곡선 점선 추세선·'N배 빠름' 알약(연결선)·헤드라인 원형배지·컬러 헤드라인·정확도 콜아웃.
    headline=[(텍스트,색),...] 컬러 혼합. STYLE 단일 지점으로 제어.
    """
    plt = _setup_style()
    S = STYLE
    fig, ax = plt.subplots(figsize=(12, 7))
    fig.patch.set_facecolor(S['bg'])
    fig.subplots_adjust(left=0.05, right=0.96, top=0.66, bottom=0.13)
    n = len(workers)
    xs = list(range(n))
    ymax = max(times) * 1.32
    bw = 0.46

    # 막대 (일반=연파랑 단색, 최선=진파랑 그라디언트)
    for i, (x, t) in enumerate(zip(xs, times)):
        if i == n - 1:
            _grad_bar(ax, x, bw, t, '#3B82F6', '#1B43C0')   # 아래 밝게→위 진하게
        else:
            ax.bar(x, t, width=bw, color=S['bar_pale'], zorder=3, edgecolor='none')
        ax.text(x, t + ymax * 0.025, _fmt_time(t), ha='center', va='bottom',
                fontsize=13, fontweight='bold', color=S['text_dark'], zorder=6)

    # 곡선 점선 추세선 (3점이면 2차식으로 부드럽게) + 흰 원 마커
    deg = min(len(xs) - 1, 3)
    coef = np.polyfit(xs, times, deg)
    xx = np.linspace(0, n - 1, 100)
    ax.plot(xx, np.polyval(coef, xx), '--', color=S['trend'], lw=1.8, zorder=4)
    ax.scatter(xs, times, s=85, facecolor='white', edgecolor=S['trend'],
               linewidth=2, zorder=5)

    # 'N배 빠름' 알약 + 마커로 가는 연결선
    for i, (x, t, sp) in enumerate(zip(xs, times, speedups)):
        label = '기준' if i == 0 else f'{sp:.1f}배 빠름'
        ax.annotate(label, xy=(x, t), xytext=(x, t + ymax * 0.13),
                    ha='center', va='center', fontsize=11, color=S['pill_fg'], zorder=7,
                    bbox=dict(boxstyle='round,pad=0.5', fc=S['pill_bg'], ec='none'),
                    arrowprops=dict(arrowstyle='-', color=S['pill_bg'], lw=1.2,
                                    shrinkA=6, shrinkB=8))

    # 헤드라인 원형 배지 (최선 막대 안, scatter로 정원 유지)
    bx, by = n - 1, times[-1] * 0.48
    ax.scatter([bx], [by], s=5200, color=S['badge_bg'], edgecolor='white',
               linewidth=3, zorder=8)
    ax.text(bx, by, headline_badge, ha='center', va='center', fontsize=18,
            fontweight='bold', color=S['badge_fg'], zorder=9)

    ax.set_xlim(-0.6, n - 0.4); ax.set_ylim(0, ymax); ax.set_aspect('auto')
    ax.set_xticks(xs); ax.set_xticklabels([f'{w}워커' for w in workers], fontsize=13,
                                          color=S['text_dark'])
    ax.set_yticks([])
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    ax.spines['bottom'].set_color('#CBD5E1')
    ax.tick_params(length=0)

    # 헤드라인 블록 (좌상단): eyebrow + 컬러 혼합 헤드라인
    fig.text(0.05, 0.92, eyebrow, fontsize=13, color=S['text_muted'])
    _rich_line(fig, 0.05, 0.88, headline, fontsize=30)
    # 정확도 콜아웃 (우상단)
    fig.text(0.95, 0.93, accuracy_text, ha='right', va='top', fontsize=11.5,
             color=S['accent'], fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.6', fc='white', ec=S['accent'], lw=1.4))
    # 컨텍스트 푸터
    foot = context_text + ('   ※ 예시 수치 (A6 실측 전 시안)' if sample else '')
    fig.text(0.05, 0.035, foot, fontsize=10, color=S['text_muted'])

    os.makedirs(OUT_DIR, exist_ok=True)
    p = os.path.join(OUT_DIR, out_name)
    plt.savefig(p, dpi=STYLE['dpi'], facecolor=S['bg'], bbox_inches='tight'); plt.close()
    print(f'히어로 차트 저장: {p}')
    return p


def plot():
    plt = _setup_style()

    records = [r for r in _load_results() if r.get('success') and r.get('elapsed')]
    if not records:
        print('성공한 측정 결과가 없습니다.')
        return
    os.makedirs(OUT_DIR, exist_ok=True)

    records = [r for r in records if r.get('gb') is not None]  # GB급 측정만
    if not records:
        print('GB급 측정 결과가 없습니다.')
        return
    worker_counts = sorted({r['workers'] for r in records})
    sizes = sorted({r['gb'] for r in records})

    def elapsed_of(w, gb):
        vals = [r['elapsed'] for r in records if r['workers'] == w and r['gb'] == gb]
        return min(vals) if vals else None  # 동일 조건 중복 측정 시 최선값

    # 차트 1: 데이터 크기별 처리시간 (워커 수별 라인)
    plt.figure(figsize=STYLE['figsize'])
    for w in worker_counts:
        ys = [elapsed_of(w, gb) for gb in sizes]
        plt.plot(sizes, ys, marker=STYLE['marker'], label=f'{w} 워커')
    plt.xlabel('데이터 크기 (GB)')
    plt.ylabel('처리 시간 (초)')
    plt.title('데이터 크기별 진단 시간 (워커 수별)')
    plt.legend(); plt.grid(True, alpha=STYLE['grid_alpha'])
    p1 = os.path.join(OUT_DIR, 'time_by_size.png')
    plt.savefig(p1, dpi=STYLE['dpi'], bbox_inches='tight'); plt.close()

    # 차트 2: 워커 수별 speedup = T(1)/T(N) (데이터 크기별 라인 + Amdahl 이상선)
    plt.figure(figsize=STYLE['figsize'])
    for gb in sizes:
        base = elapsed_of(1, gb)
        if not base:
            continue
        ys = [base / elapsed_of(w, gb) if elapsed_of(w, gb) else None
              for w in worker_counts]
        plt.plot(worker_counts, ys, marker=STYLE['marker'], label=f'{gb:g}GB')
    plt.plot(worker_counts, worker_counts, '--', color=STYLE['ideal_color'], label='이상 (선형)')
    plt.xlabel('워커 수'); plt.ylabel('Speedup (T1 / TN)')
    plt.title('워커 수별 Speedup (데이터 크기별)')
    plt.legend(); plt.grid(True, alpha=STYLE['grid_alpha'])
    p2 = os.path.join(OUT_DIR, 'speedup.png')
    plt.savefig(p2, dpi=STYLE['dpi'], bbox_inches='tight'); plt.close()

    paths = [p1, p2]

    # 차트 3: compute-only speedup (직렬 준비 제외 → 순수 병렬 진단 speedup, 직렬 분할 제거 효과 입증)
    def compute_of(w, gb):
        vals = [r.get('compute_s') for r in records
                if r['workers'] == w and r['gb'] == gb and r.get('compute_s') is not None]
        return min(vals) if vals else None

    if any(r.get('compute_s') is not None for r in records):
        plt.figure(figsize=STYLE['figsize'])
        for gb in sizes:
            base = compute_of(1, gb)
            if not base:
                continue
            ys = [base / compute_of(w, gb) if compute_of(w, gb) else None
                  for w in worker_counts]
            plt.plot(worker_counts, ys, marker=STYLE['marker'], label=f'{gb:g}GB')
        plt.plot(worker_counts, worker_counts, '--', color=STYLE['ideal_color'], label='이상 (선형)')
        plt.xlabel('워커 수'); plt.ylabel('Compute 전용 Speedup')
        plt.title('Compute 전용 Speedup (직렬 준비 제외)')
        plt.legend(); plt.grid(True, alpha=STYLE['grid_alpha'])
        p3 = os.path.join(OUT_DIR, 'speedup_compute.png')
        plt.savefig(p3, dpi=STYLE['dpi'], bbox_inches='tight'); plt.close()
        paths.append(p3)

    # S3 업로드 (보존)
    s3 = get_s3_client()
    for p in paths:
        with open(p, 'rb') as f:
            s3.put_object(Bucket=S3_BUCKET, Key=f'benchmark/{os.path.basename(p)}', Body=f.read())
    print(f'차트 저장: {", ".join(paths)} (+ S3 benchmark/)')
    print(f'호스트 복사: docker cp <engine-container>:{OUT_DIR} ./docs/benchmark')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='병렬 진단 벤치마크 (GB급)')
    sub = parser.add_subparsers(dest='cmd', required=True)
    p_gen = sub.add_parser('gen', help='합성 테스트 데이터 생성 + S3 업로드')
    p_gen.add_argument('--sizes', type=float, nargs='+', help='생성할 크기(GB) 목록 (예: 2 8 32 100)')
    p_run = sub.add_parser('run', help='워커 수별 측정 (외부에서 워커 수 조절 선행)')
    p_run.add_argument('--workers', type=int, required=True, help='현재 기동 중인 워커 수 (라벨)')
    p_run.add_argument('--sizes', type=float, nargs='+', help='측정할 크기(GB) 목록')
    sub.add_parser('plot', help='누적 결과 시각화 (PNG)')
    args = parser.parse_args()

    if args.cmd == 'gen':
        gen(args.sizes)
    elif args.cmd == 'run':
        run(args.workers, args.sizes)
    elif args.cmd == 'plot':
        plot()
