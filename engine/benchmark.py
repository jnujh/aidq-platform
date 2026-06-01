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
ROW_SIZES = [50_000, 200_000, 800_000]   # 측정할 데이터 행 수
N_NUMERIC, N_CATEGORICAL = 8, 4          # 합성 데이터 컬럼 구성 (+ target 1)
DATA_PREFIX = 'benchmark/data/'          # S3 테스트 데이터 키 접두사
RESULTS_KEY = 'benchmark/results.jsonl'  # S3 측정 결과 누적 파일
OUT_DIR = '/app/benchmark_out'           # PNG 산출 디렉터리 (docker cp 대상)
RESULT_TIMEOUT_SEC = 1800                # 단건 결과 대기 상한


def _data_key(rows: int) -> str:
    return f'{DATA_PREFIX}rows_{rows}.csv'


# ── 1) 합성 데이터 생성 + S3 업로드 ──
def _build_csv_bytes(rows: int) -> bytes:
    """진단 부하가 의미 있도록 수치형/범주형/타깃을 섞은 합성 CSV 생성 (시드 고정)."""
    rng = np.random.default_rng(42)
    data = {}
    for i in range(N_NUMERIC):
        data[f'num_{i}'] = rng.normal(100, 25, rows).round(3)
    for i in range(N_CATEGORICAL):
        data[f'cat_{i}'] = rng.choice(['A', 'B', 'C', 'D'], rows)
    data['target'] = rng.integers(0, 2, rows)
    df = pd.DataFrame(data)
    buf = io.BytesIO()
    df.to_csv(buf, index=False, encoding='utf-8')
    return buf.getvalue()


def gen():
    s3 = get_s3_client()
    for rows in ROW_SIZES:
        key = _data_key(rows)
        try:
            size = s3.head_object(Bucket=S3_BUCKET, Key=key)['ContentLength']
            print(f'  [skip] {key} 이미 존재 ({size/1024/1024:.1f}MB)')
            continue
        except Exception:
            pass
        body = _build_csv_bytes(rows)
        s3.put_object(Bucket=S3_BUCKET, Key=key, Body=body)
        print(f'  [업로드] {key} — {rows}행, {len(body)/1024/1024:.1f}MB')
    print('데이터 준비 완료. 청크 분할 크기(TARGET/MIN_CHUNK_SIZE_BYTES)를 파일 크기보다 작게 잡아야 병렬화됨.')


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


def run(workers: int):
    conn = _connect()
    ch = conn.channel()
    # Spring 미기동 환경 대비: exchange 선언 (DirectExchange, durable — Spring과 동일)
    ch.exchange_declare(exchange=RESULT_EXCHANGE, exchange_type='direct', durable=True)
    # 결과 수신용 임시 큐 (exclusive/auto-delete) → diagnosis.result 바인딩 (Spring result.queue와 공존)
    tmp = ch.queue_declare(queue='', exclusive=True, auto_delete=True).method.queue
    ch.queue_bind(queue=tmp, exchange=RESULT_EXCHANGE, routing_key=RESULT_ROUTING_KEY)

    print(f'=== 벤치마크 측정 (workers={workers}) ===')
    for rows in ROW_SIZES:
        key = _data_key(rows)
        job_id = f'bench-{workers}-{rows}-{int(time.time())}'
        print(f'  [측정] rows={rows}, key={key} → 디스패치')
        r = _dispatch_and_wait(ch, tmp, job_id, key)
        record = {'workers': workers, 'rows': rows, 'jobId': job_id, **r}
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
def plot():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    records = [r for r in _load_results() if r.get('success') and r.get('elapsed')]
    if not records:
        print('성공한 측정 결과가 없습니다.')
        return
    os.makedirs(OUT_DIR, exist_ok=True)

    worker_counts = sorted({r['workers'] for r in records})
    row_sizes = sorted({r['rows'] for r in records})

    def elapsed_of(w, rows):
        vals = [r['elapsed'] for r in records if r['workers'] == w and r['rows'] == rows]
        return min(vals) if vals else None  # 동일 조건 중복 측정 시 최선값

    # 차트 1: 데이터 크기별 처리시간 (워커 수별 라인). slim 이미지에 한글 폰트가 없어 라벨은 영문.
    plt.figure(figsize=(8, 5))
    for w in worker_counts:
        ys = [elapsed_of(w, rows) for rows in row_sizes]
        plt.plot([r // 1000 for r in row_sizes], ys, marker='o', label=f'{w} worker(s)')
    plt.xlabel('Data size (K rows)')
    plt.ylabel('Processing time (s)')
    plt.title('Diagnosis time by data size (per worker count)')
    plt.legend(); plt.grid(True, alpha=0.3)
    p1 = os.path.join(OUT_DIR, 'time_by_size.png')
    plt.savefig(p1, dpi=120, bbox_inches='tight'); plt.close()

    # 차트 2: 워커 수별 speedup = T(1)/T(N) (데이터 크기별 라인 + Amdahl 이상선)
    plt.figure(figsize=(8, 5))
    for rows in row_sizes:
        base = elapsed_of(1, rows)
        if not base:
            continue
        ys = [base / elapsed_of(w, rows) if elapsed_of(w, rows) else None
              for w in worker_counts]
        plt.plot(worker_counts, ys, marker='o', label=f'{rows // 1000}K rows')
    plt.plot(worker_counts, worker_counts, '--', color='gray', label='ideal (linear)')
    plt.xlabel('Workers'); plt.ylabel('Speedup (T1 / TN)')
    plt.title('Speedup by worker count (per data size)')
    plt.legend(); plt.grid(True, alpha=0.3)
    p2 = os.path.join(OUT_DIR, 'speedup.png')
    plt.savefig(p2, dpi=120, bbox_inches='tight'); plt.close()

    paths = [p1, p2]

    # 차트 3: compute-only speedup (직렬 준비 제외 → 순수 병렬 진단 speedup, 직렬 분할 제거 효과 입증)
    def compute_of(w, rows):
        vals = [r.get('compute_s') for r in records
                if r['workers'] == w and r['rows'] == rows and r.get('compute_s') is not None]
        return min(vals) if vals else None

    if any(r.get('compute_s') is not None for r in records):
        plt.figure(figsize=(8, 5))
        for rows in row_sizes:
            base = compute_of(1, rows)
            if not base:
                continue
            ys = [base / compute_of(w, rows) if compute_of(w, rows) else None
                  for w in worker_counts]
            plt.plot(worker_counts, ys, marker='o', label=f'{rows // 1000}K rows')
        plt.plot(worker_counts, worker_counts, '--', color='gray', label='ideal (linear)')
        plt.xlabel('Workers'); plt.ylabel('Compute-only speedup')
        plt.title('Compute-only speedup (serial prep excluded)')
        plt.legend(); plt.grid(True, alpha=0.3)
        p3 = os.path.join(OUT_DIR, 'speedup_compute.png')
        plt.savefig(p3, dpi=120, bbox_inches='tight'); plt.close()
        paths.append(p3)

    # S3 업로드 (보존)
    s3 = get_s3_client()
    for p in paths:
        with open(p, 'rb') as f:
            s3.put_object(Bucket=S3_BUCKET, Key=f'benchmark/{os.path.basename(p)}', Body=f.read())
    print(f'차트 저장: {", ".join(paths)} (+ S3 benchmark/)')
    print(f'호스트 복사: docker cp <engine-container>:{OUT_DIR} ./docs/benchmark')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Step 8 병렬 진단 벤치마크')
    sub = parser.add_subparsers(dest='cmd', required=True)
    sub.add_parser('gen', help='합성 테스트 데이터 생성 + S3 업로드')
    p_run = sub.add_parser('run', help='워커 수별 측정 (외부에서 --scale 선행)')
    p_run.add_argument('--workers', type=int, required=True, help='현재 기동 중인 워커 수 (라벨)')
    sub.add_parser('plot', help='누적 결과 시각화 (PNG)')
    args = parser.parse_args()

    if args.cmd == 'gen':
        gen()
    elif args.cmd == 'run':
        run(args.workers)
    elif args.cmd == 'plot':
        plot()
