"""Celery 태스크 (Step 5).

coordinator(run_diagnosis) → 소/대용량 분기 → 대용량은 chord로 병렬:
  group(process_chunk × N) → aggregate_results.

핵심:
  - Sentinel 패턴: process_chunk가 예외를 흡수하고 {'_error': ...}를 반환 → chord 콜백이
    항상 실행되어 hang 불가. 콜백이 에러 마커를 검사해 _publish_error.
  - cleanup 중앙화: aggregate_results의 finally에서 접두사 일괄 삭제(멱등).
  - 결과 메시지 형식은 worker.py와 동일 → Spring Boot 변경 0.

설계: docs/sessions/parallel-engine/2026-06-01-impl-3-tasks-bridge.md
"""
import io
import json
import time

import pandas as pd
import pika
from botocore.exceptions import ClientError
from celery import chord, group
from celery.exceptions import SoftTimeLimitExceeded

from celery_app import app
from partitioner import (MIN_CHUNK_SIZE, detect_encoding,
                         stream_split_and_sample, compute_global_stats)
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


def _chunk_prefix(s3_key: str) -> str:
    """partitioner의 청크 키 규칙과 일치: uploads/1/x.csv → uploads/1/x/chunks/"""
    return s3_key.rsplit('.', 1)[0] + '/chunks/'


def cleanup_chunks(s3, bucket: str, prefix: str) -> int:
    """접두사 기반 청크 일괄 삭제 (멱등 — 성공/에러/재호출 모두 안전)."""
    token, deleted = None, 0
    while True:
        kwargs = {'Bucket': bucket, 'Prefix': prefix}
        if token:
            kwargs['ContinuationToken'] = token
        resp = s3.list_objects_v2(**kwargs)
        objs = resp.get('Contents', [])
        if objs:
            s3.delete_objects(Bucket=bucket,
                              Delete={'Objects': [{'Key': o['Key']} for o in objs]})
            deleted += len(objs)
        if resp.get('IsTruncated'):
            token = resp.get('NextContinuationToken')
        else:
            break
    if deleted:
        print(f'[청크 정리] {prefix} — {deleted}개 삭제')
    return deleted


def _process_small_file(s3, job_id, s3_key, weights):
    """32MB 미만: 분할 없이 기존 compute_dsc로 단건 처리."""
    df = download_csv_from_s3(s3_key)
    target_col, num, cat = auto_detect_columns(df)
    result = compute_dsc(df, target_col, num, cat, reference_df=df, weights=weights)
    gs = {'target_col': target_col, 'numerical_cols': num, 'categorical_cols': cat}
    _publish_result(build_result_message(job_id, result, gs, len(df)))
    print(f'[소용량 처리] jobId={job_id}, score={result["score"]}, grade={result["grade"]}')


@app.task(bind=True, name='tasks.run_diagnosis')
def run_diagnosis(self, message):
    """Coordinator. Bridge가 호출. 소/대용량 분기."""
    job_id = message['jobId']
    s3_key = message['s3Key']
    weights = message.get('weights') or None
    prefix = _chunk_prefix(s3_key)
    print(f'[Coordinator] jobId={job_id}, key={s3_key}')
    try:
        s3 = get_s3_client()
        size = s3.head_object(Bucket=S3_BUCKET, Key=s3_key)['ContentLength']
        if size < MIN_CHUNK_SIZE:
            print(f'  소용량 {size/1024/1024:.1f}MB → 단건 처리')
            _process_small_file(s3, job_id, s3_key, weights)
            return
        print(f'  대용량 {size/1024/1024:.1f}MB → 스트리밍 분할')
        enc = detect_encoding(s3, S3_BUCKET, s3_key)
        chunk_keys, sample_rows, header, total_rows = stream_split_and_sample(
            s3, S3_BUCKET, s3_key, enc)
        global_stats = compute_global_stats(sample_rows, header, total_rows, enc)
        print(f'  청크 {len(chunk_keys)}개, 총 {total_rows}행 → chord 디스패치')
        callback = aggregate_results.s(job_id, global_stats, weights, total_rows, prefix) \
            .on_error(on_aggregate_error.s(job_id=job_id, chunk_prefix=prefix))
        chord(group(process_chunk.s(ck, job_id, global_stats) for ck in chunk_keys))(callback)
    except Exception as e:
        print(f'  [Coordinator 실패] {e}')
        try:
            cleanup_chunks(get_s3_client(), S3_BUCKET, prefix)
        except Exception:
            pass
        _publish_error(job_id, e)


@app.task(bind=True, name='tasks.process_chunk')
def process_chunk(self, chunk_key, job_id, global_stats):
    """Worker 태스크. 예외를 흡수하고 sentinel 반환 (chord hang 방지)."""
    try:
        s3 = get_s3_client()
        data = None
        for attempt in range(3):  # 일시 S3 오류 수동 재시도
            try:
                data = s3.get_object(Bucket=S3_BUCKET, Key=chunk_key)['Body'].read()
                break
            except ClientError:
                if attempt == 2:
                    raise
                time.sleep(1.5 * (attempt + 1))
        df = pd.read_csv(io.BytesIO(data))
        return compute_partial_metrics(
            df, global_stats['target_col'], global_stats['numerical_cols'],
            global_stats['categorical_cols'], global_stats['quantiles'])
    except SoftTimeLimitExceeded as e:
        return {'_error': f'{chunk_key} 시간초과: {e}'}
    except Exception as e:
        return {'_error': f'{chunk_key} 처리 실패: {e}'}


@app.task(bind=True, name='tasks.aggregate_results')
def aggregate_results(self, partial_results, job_id, global_stats,
                      weights, total_rows, chunk_prefix):
    """Chord 콜백. 항상 실행 → 에러 검사 후 결과/에러 발행. finally에서 청크 정리."""
    try:
        errors = [p['_error'] for p in partial_results
                  if isinstance(p, dict) and '_error' in p]
        if errors:
            _publish_error(job_id, '청크 처리 실패: ' + '; '.join(errors[:3]))
        else:
            merged = merge_partial_results(partial_results, global_stats, weights)
            _publish_result(build_result_message(job_id, merged, global_stats, total_rows))
            print(f'[Aggregator] jobId={job_id}, score={merged["score"]}, grade={merged["grade"]}')
    except Exception as e:
        _publish_error(job_id, f'합산 실패: {e}')
    finally:
        try:
            cleanup_chunks(get_s3_client(), S3_BUCKET, chunk_prefix)
        except Exception as e:
            print(f'[청크 정리 실패] {e}')


@app.task(bind=True, name='tasks.on_aggregate_error')
def on_aggregate_error(self, *args, **kwargs):
    """콜백(aggregate_results) 자체가 실패할 때의 백스톱. 시그니처 안전을 위해 *args/**kwargs."""
    job_id = kwargs.get('job_id')
    chunk_prefix = kwargs.get('chunk_prefix')
    print(f'[on_aggregate_error] jobId={job_id}')
    if job_id is not None:
        try:
            _publish_error(job_id, '집계 콜백 실패')
        except Exception:
            pass
    if chunk_prefix:
        try:
            cleanup_chunks(get_s3_client(), S3_BUCKET, chunk_prefix)
        except Exception:
            pass
