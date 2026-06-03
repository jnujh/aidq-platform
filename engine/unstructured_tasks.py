"""비정형(image/text) 진단 — Celery map-reduce 오케스트레이션.

정형 byte-range 엔진(tasks.py)과 동일한 chord 패턴을 재사용:
  group(process_*_batch × N) → aggregate_unstructured

- 분산 단위: 이미지=ZIP 엔트리 배치, 텍스트=행 배치.
- map(process_*_batch): 무거운 임베딩 추출 + per-item 통계 (seam.*_map).
- reduce(aggregate_unstructured): 전역 지표 합산 + 결과 발행 (seam.*_reduce).
- Sentinel 패턴: 배치 실패 시 {'_error'} 반환 → 콜백 항상 실행(hang 방지).
- 텍스트 회귀는 v1에서 단일 호출(비분산) 폴백.

설계: docs/sessions/unstructured-engine/2026-06-02-비정형확장-deep-interview-스펙.md
"""
import json
import os

import pika
from celery import chord, group
from celery.exceptions import SoftTimeLimitExceeded

from celery_app import app
from worker import (get_s3_client, download_csv_from_s3,
                    RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASS,
                    RESULT_EXCHANGE, RESULT_ROUTING_KEY)
from dsc_cells import seam
from unstructured_loader import image_index, decode_image_entries, load_text

IMG_BATCH = int(os.getenv('IMG_BATCH', '64'))
TXT_BATCH = int(os.getenv('TXT_BATCH', '256'))
USE_EMBEDDINGS = os.getenv('USE_EMBEDDINGS', '1') not in ('0', 'false', 'False')


# ── 결과 발행 (tasks.py와 동일 패턴, 순환 import 회피용 로컬 정의) ──
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


def _publish_error(job_id, error_message):
    _publish({'jobId': job_id, 'success': False, 'dataType': None,
              'totalScore': None, 'resultDetail': None, 'errorMessage': str(error_message)})
    print(f'[비정형 에러 발행] jobId={job_id}: {error_message}')


def _build_result_message(job_id, merged, modality, task, total, class_names):
    """Spring DiagnosisResultMessage 형식 (dataType=UNSTRUCTURED)."""
    kind = '이미지' if modality == 'image' else '텍스트'
    result_detail = {
        # merged는 평평한 지표 + 'metrics'(동일 내용 중첩)를 함께 가지므로 'metrics'도 제외
        'metrics': {k: v for k, v in merged.items() if k not in ('score', 'grade', 'metrics')},
        'summary': f'종합 점수 {merged["score"]}점 ({merged["grade"]}등급). '
                   f'{kind} 샘플 {total}건'
                   + (f', 클래스 {len(class_names)}개.' if class_names else '.'),
        'grade': merged['grade'],
        'modality': modality,
        'taskType': task,
        'sampleCount': total,
        'classNames': class_names,
    }
    return {
        'jobId': job_id,
        'success': True,
        'dataType': 'UNSTRUCTURED',
        'totalScore': merged['score'],
        'resultDetail': json.dumps(result_detail, ensure_ascii=False),
        'errorMessage': None,
    }


def _chunk(lst, size):
    return [lst[i:i + size] for i in range(0, len(lst), max(1, size))]


# =====================================================================
# 디스패처 (run_diagnosis에서 호출)
# =====================================================================

def run_image_diagnosis(message):
    """이미지 ZIP → 클래스 폴더 인덱싱 → 배치 chord 분산."""
    job_id = message['jobId']
    s3_key = message['s3Key']
    weights = message.get('weights') or None
    try:
        s3 = get_s3_client()
        entries, class_names = image_index(s3, s3_key)
        total = len(entries)
        batches = _chunk(entries, IMG_BATCH)
        print(f'[이미지 Coordinator] jobId={job_id}, {total}장, 클래스 {len(class_names)}개, '
              f'{len(batches)}배치 → chord')
        callback = aggregate_unstructured.s(job_id, 'image', weights, class_names,
                                            total, 'classification') \
            .on_error(on_unstructured_error.s(job_id=job_id))
        chord(group(process_image_batch.s(s3_key, b, USE_EMBEDDINGS) for b in batches))(callback)
    except Exception as e:
        print(f'  [이미지 Coordinator 실패] {e}')
        _publish_error(job_id, e)


def run_text_diagnosis(message):
    """텍스트 CSV → 열 결정 → (분류) 행 배치 chord / (회귀) 단일 폴백."""
    job_id = message['jobId']
    s3_key = message['s3Key']
    weights = message.get('weights') or None
    task = message.get('task') or 'classification'
    text_col = message.get('textColumn')
    label_col = message.get('labelColumn')
    try:
        df = download_csv_from_s3(s3_key)
        texts, labels, class_names, tcol, lcol, task = load_text(
            df, text_col, label_col, task)
        total = len(texts)
        print(f'[텍스트 Coordinator] jobId={job_id}, {total}건, text="{tcol}" label="{lcol}", task={task}')

        if task == 'regression':
            # v1: 텍스트 회귀는 비분산 단일 호출 폴백
            from dsc_cells import compute_dsc_text_regression
            result = compute_dsc_text_regression(texts, labels, weights=weights,
                                                  use_embeddings=USE_EMBEDDINGS)
            _publish(_build_result_message(job_id, result, 'text', 'regression', total, None))
            print(f'  [텍스트 회귀 단일] score={result["score"]}')
            return

        batches_t = _chunk(texts, TXT_BATCH)
        batches_l = _chunk(labels, TXT_BATCH)
        print(f'  {len(batches_t)}배치 → chord')
        callback = aggregate_unstructured.s(job_id, 'text', weights, class_names,
                                            total, 'classification') \
            .on_error(on_unstructured_error.s(job_id=job_id))
        chord(group(process_text_batch.s(t, l, USE_EMBEDDINGS)
                    for t, l in zip(batches_t, batches_l)))(callback)
    except Exception as e:
        print(f'  [텍스트 Coordinator 실패] {e}')
        _publish_error(job_id, e)


# =====================================================================
# map 태스크 (워커 분산)
# =====================================================================

@app.task(bind=True, name='tasks.process_image_batch')
def process_image_batch(self, s3_key, entries, use_embeddings):
    """이미지 배치: ZIP에서 자기 엔트리만 디코딩 + per-item/임베딩. 예외→sentinel."""
    try:
        s3 = get_s3_client()
        images, labels = decode_image_entries(s3, s3_key, entries)
        if not images:
            return {'_error': f'{s3_key} 배치 디코딩 0건'}
        return seam.image_map(images, labels, use_embeddings=use_embeddings)
    except SoftTimeLimitExceeded as e:
        return {'_error': f'이미지 배치 시간초과: {e}'}
    except Exception as e:
        return {'_error': f'이미지 배치 실패: {e}'}


@app.task(bind=True, name='tasks.process_text_batch')
def process_text_batch(self, texts, labels, use_embeddings):
    """텍스트 배치: per-item + DistilBERT 임베딩. 예외→sentinel."""
    try:
        return seam.text_map(texts, labels, use_embeddings=use_embeddings)
    except SoftTimeLimitExceeded as e:
        return {'_error': f'텍스트 배치 시간초과: {e}'}
    except Exception as e:
        return {'_error': f'텍스트 배치 실패: {e}'}


# =====================================================================
# reduce 태스크 (chord 콜백)
# =====================================================================

@app.task(bind=True, name='tasks.aggregate_unstructured')
def aggregate_unstructured(self, partials, job_id, modality, weights, class_names, total, task):
    """전역 지표 합산 → 결과 발행. 항상 실행(sentinel 검사)."""
    try:
        errors = [p['_error'] for p in partials
                  if isinstance(p, dict) and '_error' in p]
        good = [p for p in partials if isinstance(p, dict) and '_error' not in p]
        if not good:
            _publish_error(job_id, '모든 배치 실패: ' + '; '.join(errors[:3]))
            return
        if errors:
            print(f'[비정형 Aggregator] 일부 배치 실패 {len(errors)}개 (계속): {errors[:2]}')

        if modality == 'image':
            merged = seam.image_reduce(good, weights, use_embeddings=USE_EMBEDDINGS)
        else:
            merged = seam.text_reduce(good, weights, use_embeddings=USE_EMBEDDINGS)

        _publish(_build_result_message(job_id, merged, modality, task, total, class_names))
        print(f'[비정형 Aggregator] jobId={job_id}, modality={modality}, '
              f'score={merged["score"]}, grade={merged["grade"]}, n={total}')
    except Exception as e:
        _publish_error(job_id, f'비정형 합산 실패: {e}')


@app.task(bind=True, name='tasks.on_unstructured_error')
def on_unstructured_error(self, *args, **kwargs):
    """콜백 자체 실패 백스톱."""
    job_id = kwargs.get('job_id')
    print(f'[on_unstructured_error] jobId={job_id}')
    if job_id is not None:
        try:
            _publish_error(job_id, '비정형 집계 콜백 실패')
        except Exception:
            pass
