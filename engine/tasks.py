"""Celery 태스크 (byte-range 분산 재설계).

coordinator(run_diagnosis) → 소/대용량 분기 → 대용량은 chord로 병렬:
  group(process_chunk × N byte-range) → aggregate_results.

핵심:
  - 직렬 사전분할 제거: 코디네이터는 경계 탐색(통독 X) + 흩뿌린 샘플로 전역통계만 만들고,
    각 워커가 자기 byte-range를 S3 Range GET으로 직접 읽어 병렬 처리. 청크 파일 없음.
  - Sentinel 패턴: process_chunk가 예외를 흡수하고 {'_error': ...}를 반환 → chord 콜백이
    항상 실행되어 hang 불가.
  - 결과 메시지 형식은 worker.py와 동일 → Spring Boot 변경 0.

설계: docs/sessions/parallel-engine/2026-06-01-redesign-deep-interview.md
"""
import json
import os
import time

import pika
import redis as _redis
from botocore.exceptions import ClientError
from celery import chord, group
from celery.exceptions import SoftTimeLimitExceeded

from celery_app import app
from partitioner import (MIN_CHUNK_SIZE, get_file_size, detect_encoding, read_header,
                         discover_byte_ranges, read_chunk_df, sample_rows_via_ranges,
                         compute_global_stats)
from dsc_engine import compute_dsc, auto_detect_columns, compute_partial_metrics
from aggregator import merge_partial_results, build_result_message
from worker import (get_s3_client, download_csv_from_s3, S3_BUCKET,
                    RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASS,
                    RESULT_EXCHANGE, RESULT_ROUTING_KEY)


# ── 결과 발행 (단명 pika 연결) ──
def _publish(body: dict):
    conn = pika.BlockingConnection(pika.ConnectionParameters(
        host=RABBITMQ_HOST, port=RABBITMQ_PORT,
        credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)))
    try:
        ch = conn.channel()
        ch.basic_publish(
            exchange=RESULT_EXCHANGE, routing_key=RESULT_ROUTING_KEY,
            body=json.dumps(body, ensure_ascii=False),
            properties=pika.BasicProperties(content_type='application/json', delivery_mode=2))
    finally:
        conn.close()


def _publish_result(msg: dict):
    _publish(msg)
    print(f'[결과 발행] jobId={msg["jobId"]}, success={msg["success"]}')


def _publish_error(job_id, error_message):
    _publish({'jobId': job_id, 'success': False, 'dataType': None,
              'totalScore': None, 'resultDetail': None, 'errorMessage': str(error_message)})
    print(f'[에러 발행] jobId={job_id}: {error_message}')


def _record_timing(job_id, data: dict):
    """벤치마크용 직렬 준비시간 등을 Redis(db=1)에 best-effort 기록. 실패해도 진단엔 무영향."""
    try:
        r = _redis.Redis(host=os.getenv('REDIS_HOST', 'redis'),
                         port=int(os.getenv('REDIS_PORT', '6379')), db=1)
        r.setex(f'bench:timing:{job_id}', 3600, json.dumps(data))
    except Exception:
        pass


def _process_small_file(s3, job_id, s3_key, weights):
    """MIN_CHUNK_SIZE 미만: 분할 없이 기존 compute_dsc로 단건 처리."""
    df = download_csv_from_s3(s3_key)
    target_col, num, cat = auto_detect_columns(df)
    result = compute_dsc(df, target_col, num, cat, reference_df=df, weights=weights)
    gs = {'target_col': target_col, 'numerical_cols': num, 'categorical_cols': cat}
    _publish_result(build_result_message(job_id, result, gs, len(df)))
    print(f'[소용량 처리] jobId={job_id}, score={result["score"]}, grade={result["grade"]}')


@app.task(bind=True, name='tasks.run_diagnosis')
def run_diagnosis(self, message):
    """Coordinator. Bridge가 호출. 소/대용량 분기 후 대용량은 byte-range chord."""
    job_id = message['jobId']
    s3_key = message['s3Key']
    weights = message.get('weights') or None
    print(f'[Coordinator] jobId={job_id}, key={s3_key}')
    t0 = time.time()
    try:
        s3 = get_s3_client()
        size = get_file_size(s3, S3_BUCKET, s3_key)
        if size < MIN_CHUNK_SIZE:
            print(f'  소용량 {size/1024/1024:.1f}MB → 단건 처리')
            _process_small_file(s3, job_id, s3_key, weights)
            _record_timing(job_id, {'serial_prep_s': round(time.time() - t0, 3),
                                    'n_ranges': 1, 'file_mb': round(size/1024/1024, 1)})
            return
        print(f'  대용량 {size/1024/1024:.1f}MB → byte-range 분산')
        enc = detect_encoding(s3, S3_BUCKET, s3_key)
        header, header_end = read_header(s3, S3_BUCKET, s3_key, enc)
        ranges = discover_byte_ranges(s3, S3_BUCKET, s3_key, size, header_end)
        sample_rows = sample_rows_via_ranges(s3, S3_BUCKET, s3_key, size, header_end, enc)
        global_stats = compute_global_stats(sample_rows, header, 0, enc)
        serial_prep_s = time.time() - t0  # 직렬 준비(통독X): 경계탐색+샘플+전역통계
        _record_timing(job_id, {'serial_prep_s': round(serial_prep_s, 3),
                                'n_ranges': len(ranges), 'sample_rows': len(sample_rows),
                                'file_mb': round(size/1024/1024, 1)})
        print(f'  구간 {len(ranges)}개 (header_end={header_end}, sample={len(sample_rows)}행, '
              f'직렬준비={serial_prep_s:.2f}s) → chord 디스패치')
        callback = aggregate_results.s(job_id, global_stats, weights) \
            .on_error(on_aggregate_error.s(job_id=job_id))
        chord(group(process_chunk.s(s3_key, start, end, header, enc, global_stats)
                    for (start, end) in ranges))(callback)
    except Exception as e:
        print(f'  [Coordinator 실패] {e}')
        _publish_error(job_id, e)


@app.task(bind=True, name='tasks.process_chunk')
def process_chunk(self, s3_key, start, end, header, encoding, global_stats):
    """Worker 태스크. 자기 byte-range를 읽어 부분지표 계산. 예외 흡수 → sentinel (chord hang 방지)."""
    try:
        s3 = get_s3_client()
        df = None
        for attempt in range(3):  # 일시 S3 오류 수동 재시도
            try:
                df = read_chunk_df(s3, S3_BUCKET, s3_key, start, end, header, encoding)
                break
            except ClientError:
                if attempt == 2:
                    raise
                time.sleep(1.5 * (attempt + 1))
        return compute_partial_metrics(
            df, global_stats['target_col'], global_stats['numerical_cols'],
            global_stats['categorical_cols'], global_stats['quantiles'])
    except SoftTimeLimitExceeded as e:
        return {'_error': f'{s3_key}[{start}:{end}] 시간초과: {e}'}
    except Exception as e:
        return {'_error': f'{s3_key}[{start}:{end}] 처리 실패: {e}'}


@app.task(bind=True, name='tasks.aggregate_results')
def aggregate_results(self, partial_results, job_id, global_stats, weights):
    """Chord 콜백. 항상 실행 → 에러 검사 후 결과/에러 발행. total_rows는 부분결과 합."""
    try:
        errors = [p['_error'] for p in partial_results
                  if isinstance(p, dict) and '_error' in p]
        if errors:
            _publish_error(job_id, '청크 처리 실패: ' + '; '.join(errors[:3]))
            return
        merged = merge_partial_results(partial_results, global_stats, weights)
        total_rows = sum(p['uniqueness']['n_rows'] for p in partial_results)
        _publish_result(build_result_message(job_id, merged, global_stats, total_rows))
        print(f'[Aggregator] jobId={job_id}, score={merged["score"]}, '
              f'grade={merged["grade"]}, rows={total_rows}')
    except Exception as e:
        _publish_error(job_id, f'합산 실패: {e}')


@app.task(bind=True, name='tasks.on_aggregate_error')
def on_aggregate_error(self, *args, **kwargs):
    """콜백(aggregate_results) 자체가 실패할 때의 백스톱. 시그니처 안전을 위해 *args/**kwargs."""
    job_id = kwargs.get('job_id')
    print(f'[on_aggregate_error] jobId={job_id}')
    if job_id is not None:
        try:
            _publish_error(job_id, '집계 콜백 실패')
        except Exception:
            pass
