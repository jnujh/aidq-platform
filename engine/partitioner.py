"""대용량 CSV byte-range 분산 읽기 + 전역 샘플 추출.

직렬 사전분할(전체 통독)을 제거하고, 각 워커가 S3 Range GET으로 자기 바이트 구간을
직접 읽어 병렬 처리한다. 청크 파일을 S3에 쓰지/지우지 않는다.

핵심 불변식:
  - 경계 탐색은 목표 오프셋 근처 수 KB만 Range로 읽어 줄바꿈에 스냅 (전체 통독 금지)
  - 바이트로 자르되 읽기는 줄 경계로 되맞춤 → 모든 행은 정확히 한 워커가 통째로 처리
  - 청크 읽기/샘플은 항상 src_encoding으로 디코드 (utf-8-sig는 BOM만 영향, 중간 청크엔 무해)

설계: docs/sessions/parallel-engine/2026-06-01-redesign-deep-interview.md
"""
import csv
import io
import os

import pandas as pd

from dsc_engine import auto_detect_columns

# 기본 256MB/32MB. 환경변수로 오버라이드 가능 (테스트·벤치마크에서 청크 크기 조절용)
# compose의 ${VAR:-}는 미설정 시 빈 문자열을 주입하므로, 빈 값도 기본값으로 처리한다.
def _env_int(name, default):
    val = os.getenv(name)
    return int(val) if val else default

TARGET_CHUNK_SIZE = _env_int('TARGET_CHUNK_SIZE_BYTES', 256 * 1024 * 1024)  # 청크당 목표 크기
MIN_CHUNK_SIZE = _env_int('MIN_CHUNK_SIZE_BYTES', 32 * 1024 * 1024)         # 이 미만은 분할 안 함
MAX_SAMPLE_ROWS = 400_000               # 샘플 상한 (메모리 ~160MB, Q1/Q3 오차 ~0.16%)
BOUNDARY_PROBE = 1 * 1024 * 1024        # 경계 스냅 시 한 번에 읽는 윈도우 (줄바꿈 탐색용)
SAMPLE_WINDOWS = 64                     # 전역 샘플을 위해 흩뿌릴 Range 개수
SAMPLE_WINDOW_SIZE = 1 * 1024 * 1024    # 샘플 윈도우 1개 크기

# csv 필드 길이 상한 해제 (대용량 텍스트 셀 대비)
csv.field_size_limit(10 * 1024 * 1024)


def calc_grid_size(file_size_bytes: int) -> int:
    """예상 청크 수. file_size < MIN_CHUNK_SIZE면 1(분할 불필요 신호)."""
    if file_size_bytes < MIN_CHUNK_SIZE:
        return 1
    return -(-file_size_bytes // TARGET_CHUNK_SIZE)  # ceil


def get_file_size(s3, bucket: str, key: str) -> int:
    return int(s3.head_object(Bucket=bucket, Key=key)['ContentLength'])


def detect_encoding(s3, bucket: str, key: str) -> str:
    """Range로 첫 8KB만 읽어 utf-8-sig/cp949 판별."""
    resp = s3.get_object(Bucket=bucket, Key=key, Range='bytes=0-8191')
    head = resp['Body'].read()
    resp['Body'].close()
    for enc in ('utf-8-sig', 'cp949'):
        try:
            head.decode(enc)
            return enc
        except UnicodeDecodeError:
            continue
    # 8KB 경계에서 멀티바이트 문자가 잘렸을 수 있음 → 기본값 utf-8-sig
    return 'utf-8-sig'


def read_header(s3, bucket: str, key: str, encoding: str, probe: int = 65536):
    """첫 줄(헤더)과 데이터가 시작하는 바이트 오프셋 반환. (header_list, header_end)"""
    end = probe - 1
    resp = s3.get_object(Bucket=bucket, Key=key, Range=f'bytes=0-{end}')
    data = resp['Body'].read()
    resp['Body'].close()
    nl = data.find(b'\n')
    if nl == -1:
        raise ValueError(f'헤더가 너무 깁니다 (>{probe}B): {key}')
    header_line = data[:nl].decode(encoding)
    header = next(csv.reader([header_line]))
    return header, nl + 1  # 헤더 다음 행이 시작하는 바이트


def _find_next_newline(s3, bucket, key, offset, file_size, window=BOUNDARY_PROBE) -> int:
    """offset 이상에서 '다음 행이 시작하는' 바이트 위치(줄바꿈 다음). 전체 통독 없이 윈도우 단위 탐색."""
    if offset <= 0:
        return 0
    if offset >= file_size:
        return file_size
    pos = offset
    while pos < file_size:
        end = min(pos + window - 1, file_size - 1)
        resp = s3.get_object(Bucket=bucket, Key=key, Range=f'bytes={pos}-{end}')
        data = resp['Body'].read()
        resp['Body'].close()
        nl = data.find(b'\n')
        if nl != -1:
            return pos + nl + 1
        pos = end + 1  # 이 윈도우에 줄바꿈 없음(아주 긴 행) → 다음 윈도우
    return file_size


def discover_byte_ranges(s3, bucket, key, file_size, header_end,
                         target_chunk_size=TARGET_CHUNK_SIZE):
    """행 경계에 스냅된 (start, end) 바이트 구간 목록.

    start는 항상 행 시작, end는 행 끝 직후. 경계 후보 근처만 읽어 줄바꿈에 스냅하므로
    전체 파일을 통독하지 않는다(직렬 비용 ≈0).
    """
    data_size = file_size - header_end
    n = max(1, -(-data_size // target_chunk_size))  # ceil
    if n == 1:
        return [(header_end, file_size)]

    boundaries = [header_end]
    for i in range(1, n):
        cand = header_end + i * target_chunk_size
        if cand >= file_size:
            break
        b = _find_next_newline(s3, bucket, key, cand, file_size)
        if b > boundaries[-1] and b < file_size:
            boundaries.append(b)
    boundaries.append(file_size)
    return [(boundaries[i], boundaries[i + 1]) for i in range(len(boundaries) - 1)]


def read_chunk_df(s3, bucket, key, start, end, header, encoding):
    """[start, end) 바이트를 읽어 완전한 행들의 DataFrame 반환 (헤더 행 없음 → names로 주입).

    경계가 행 시작/끝에 스냅돼 있으므로 잘린 행이 없다.
    """
    resp = s3.get_object(Bucket=bucket, Key=key, Range=f'bytes={start}-{end - 1}')
    data = resp['Body'].read()
    resp['Body'].close()
    text = data.decode(encoding)
    if not text.strip():
        return pd.DataFrame(columns=header)
    return pd.read_csv(io.StringIO(text), header=None, names=header)


def sample_rows_via_ranges(s3, bucket, key, file_size, header_end, encoding,
                           max_sample_rows=MAX_SAMPLE_ROWS,
                           n_windows=SAMPLE_WINDOWS, window=SAMPLE_WINDOW_SIZE):
    """파일 전역에 흩뿌린 작은 Range들을 읽어 균일 샘플을 근사 (전체 통독 없음).

    각 윈도우의 첫·끝 줄은 부분행일 수 있어 버린다 (필드 수 검증은 compute_global_stats에서).
    """
    data_size = file_size - header_end
    if data_size <= 0:
        return []

    # 데이터 영역이 작으면 통째로 한 번에 (윈도우 흩뿌릴 필요 없음)
    if data_size <= n_windows * window:
        offsets = [(header_end, file_size)]
    else:
        step = data_size // n_windows
        offsets = []
        for i in range(n_windows):
            pos = header_end + i * step
            start = header_end if i == 0 else _find_next_newline(s3, bucket, key, pos, file_size)
            end = min(start + window, file_size)
            if start < end:
                offsets.append((start, end))

    rows = []
    for (start, end) in offsets:
        resp = s3.get_object(Bucket=bucket, Key=key, Range=f'bytes={start}-{end - 1}')
        data = resp['Body'].read()
        resp['Body'].close()
        text = data.decode(encoding, errors='ignore')
        lines = text.split('\n')
        body = lines[1:-1] if len(lines) > 2 else []  # 양끝 부분행 제거
        for r in csv.reader(body):
            if r:
                rows.append(r)
        if len(rows) >= max_sample_rows:
            break
    return rows[:max_sample_rows]


def compute_global_stats(sample_rows, header, total_rows, src_encoding):
    """샘플로 전역 통계 산출. auto_detect_columns도 여기서 1회 수행(전역 컬럼 셋 확정).

    샘플 DataFrame은 반드시 pd.read_csv(StringIO)로 만들어 Worker의 청크 읽기와
    동일한 dtype 추론을 거친다 → 컬럼 판별 일치 (회귀 정확성의 핵심).
    필드 수가 헤더와 다른 행은 제외(흩뿌린 샘플의 부분행 방어).
    """
    n_cols = len(header)
    clean_rows = [r for r in sample_rows if len(r) == n_cols]

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(header)
    w.writerows(clean_rows)
    buf.seek(0)
    sample_df = pd.read_csv(buf)

    target_col, numerical_cols, categorical_cols = auto_detect_columns(sample_df)

    quantiles = {}
    for col in numerical_cols:
        s = pd.to_numeric(sample_df[col], errors='coerce').dropna()
        if len(s) >= 4:
            quantiles[col] = {'q1': float(s.quantile(0.25)), 'q3': float(s.quantile(0.75))}

    n = len(sample_df)
    sample_dup_ratio = float(sample_df.duplicated().sum() / n) if n > 0 else 0.0

    return {
        'target_col': target_col,
        'numerical_cols': numerical_cols,
        'categorical_cols': categorical_cols,
        'quantiles': quantiles,
        'sample_duplicate_ratio': sample_dup_ratio,
        'total_rows': total_rows,
        'encoding': src_encoding,
    }
