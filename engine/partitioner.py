"""대용량 CSV 스트리밍 분할기 + 전역 샘플 추출.

S3의 단일 CSV를 메모리 ~210MB(데이터 크기 무관)로 N개 청크 파일로 분할하고,
동시에 reservoir 샘플을 뽑아 전역 통계(컬럼 판별, Q1/Q3, 중복비율)를 계산한다.

핵심 불변식:
  - 분할은 csv 모듈 + StreamingBody만 사용 (pandas 금지, .read() 전체 로드 금지)
  - pandas는 상한 걸린 샘플(≤MAX_SAMPLE_ROWS)에만 제한적으로 사용
  - 청크는 항상 UTF-8로 정규화 기록 → Worker는 인코딩 분기 불필요

설계: docs/sessions/parallel-engine/2026-06-01-impl-1-celery-partitioner.md
"""
import csv
import io
import random

import pandas as pd

from dsc_engine import auto_detect_columns

TARGET_CHUNK_SIZE = 256 * 1024 * 1024   # 256MB — 청크당 목표 크기
MIN_CHUNK_SIZE = 32 * 1024 * 1024       # 32MB  — 이 미만은 분할 안 함 (coordinator 단건 처리)
MAX_SAMPLE_ROWS = 400_000               # 샘플 상한 (메모리 ~160MB, Q1/Q3 오차 ~0.16%)
PART_FLUSH_SIZE = 5 * 1024 * 1024       # 5MB — S3 Multipart 최소 파트 크기

# csv 필드 길이 상한 해제 (대용량 텍스트 셀 대비)
csv.field_size_limit(10 * 1024 * 1024)


def calc_grid_size(file_size_bytes: int) -> int:
    """예상 청크 수. file_size < MIN_CHUNK_SIZE면 1(분할 불필요 신호)."""
    if file_size_bytes < MIN_CHUNK_SIZE:
        return 1
    return -(-file_size_bytes // TARGET_CHUNK_SIZE)  # ceil


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


class _ChunkWriter:
    """청크 1개를 S3 Multipart Upload로 스트리밍 기록. 버퍼 5MB 단위 flush."""

    def __init__(self, s3, bucket: str, key: str, header: list):
        self.s3 = s3
        self.bucket = bucket
        self.key = key
        self.upload_id = s3.create_multipart_upload(Bucket=bucket, Key=key)['UploadId']
        self.parts = []
        self.part_number = 0
        self.bytes_written = 0  # 청크 전체 누적 (롤오버 판단용)
        self._buf = io.StringIO()
        self._writer = csv.writer(self._buf)
        self._writer.writerow(header)  # 각 청크에 헤더 포함

    def write_row(self, row: list):
        self._writer.writerow(row)
        if self._buf.tell() >= PART_FLUSH_SIZE:
            self._flush_part()

    def _flush_part(self, final: bool = False):
        data = self._buf.getvalue().encode('utf-8')
        if not data:
            return
        # 마지막 파트가 아니면서 5MB 미만이면 다음 파트로 미룸 (S3 최소 파트 제약)
        if not final and len(data) < PART_FLUSH_SIZE:
            return
        self.part_number += 1
        resp = self.s3.upload_part(
            Bucket=self.bucket, Key=self.key, UploadId=self.upload_id,
            PartNumber=self.part_number, Body=data,
        )
        self.parts.append({'ETag': resp['ETag'], 'PartNumber': self.part_number})
        self.bytes_written += len(data)
        self._buf = io.StringIO()
        self._writer = csv.writer(self._buf)

    def complete(self):
        self._flush_part(final=True)
        self.s3.complete_multipart_upload(
            Bucket=self.bucket, Key=self.key, UploadId=self.upload_id,
            MultipartUpload={'Parts': self.parts},
        )

    def abort(self):
        try:
            self.s3.abort_multipart_upload(
                Bucket=self.bucket, Key=self.key, UploadId=self.upload_id,
            )
        except Exception:
            pass


def _chunk_key(src_key: str, index: int) -> str:
    """uploads/1/uuid_data.csv → uploads/1/uuid_data/chunks/chunk-0.csv"""
    base = src_key.rsplit('.', 1)[0]
    return f'{base}/chunks/chunk-{index}.csv'


def stream_split_and_sample(s3, bucket, key, src_encoding,
                            target_chunk_size=TARGET_CHUNK_SIZE,
                            max_sample_rows=MAX_SAMPLE_ROWS):
    """단일 패스 스트리밍 분할 + reservoir 샘플 추출.

    반환: (chunk_keys, sample_rows, header, total_rows)
    """
    resp = s3.get_object(Bucket=bucket, Key=key)
    body = resp['Body']  # StreamingBody — .read() 호출 금지
    reader = csv.reader(io.TextIOWrapper(body, encoding=src_encoding, newline=''))

    header = next(reader)

    chunk_keys = []
    sample_rows = []      # reservoir
    total_rows = 0
    writer = None

    def new_chunk():
        ck = _chunk_key(key, len(chunk_keys))
        chunk_keys.append(ck)
        return _ChunkWriter(s3, bucket, ck, header)

    try:
        writer = new_chunk()
        for row in reader:
            # 1) 청크 기록 + 바이트 기반 롤오버
            writer.write_row(row)
            if writer.bytes_written >= target_chunk_size:
                writer.complete()
                writer = new_chunk()

            # 2) reservoir 샘플링 (균일 + 상한 보장)
            total_rows += 1
            if len(sample_rows) < max_sample_rows:
                sample_rows.append(row)
            else:
                j = random.randint(0, total_rows - 1)
                if j < max_sample_rows:
                    sample_rows[j] = row

        writer.complete()
        writer = None
    except Exception:
        # 미완료 multipart 정리 후 재전파 (완료된 청크는 호출자가 cleanup_chunks로 일괄 삭제)
        if writer is not None:
            writer.abort()
        raise
    finally:
        body.close()

    return chunk_keys, sample_rows, header, total_rows


def compute_global_stats(sample_rows, header, total_rows, src_encoding):
    """샘플로 전역 통계 산출. auto_detect_columns도 여기서 1회 수행(전역 컬럼 셋 확정).

    샘플 DataFrame은 반드시 pd.read_csv(StringIO)로 만들어 Worker의 청크 읽기와
    동일한 dtype 추론을 거친다 → 컬럼 판별 일치 (회귀 정확성의 핵심).
    """
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(header)
    w.writerows(sample_rows)
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
