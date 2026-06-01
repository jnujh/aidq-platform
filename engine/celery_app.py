"""Celery 앱 설정 — broker=RabbitMQ, result backend=Redis.

병렬 진단 엔진의 모든 태스크(tasks.py)가 이 앱 인스턴스에 등록된다.
설정값은 t3.small(메모리 제약) + 수분~수십분 걸리는 진단 태스크 특성에 맞춰 결정.
"""
import os

from celery import Celery

# ── 환경변수 (worker.py와 동일 네이밍) ──
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USERNAME', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASSWORD', 'guest')

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))

BROKER_URL = f'amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}:{RABBITMQ_PORT}//'
RESULT_BACKEND = f'redis://{REDIS_HOST}:{REDIS_PORT}/0'

# include=['tasks']: 워커 기동 시 tasks 모듈을 명시 import → 태스크 등록
# (단일 모듈 레이아웃이라 autodiscover_tasks는 부적합)
app = Celery('scorecard_engine', broker=BROKER_URL, backend=RESULT_BACKEND,
             include=['tasks'])

app.conf.update(
    # 직렬화: Spring Boot와의 메시지는 Bridge가 처리하므로 내부 태스크는 json으로 통일
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],

    # RabbitMQ가 늦게 떠도 기동 시 재연결 대기 (Celery 5.x 기본 비활성)
    broker_connection_retry_on_startup=True,

    # ACK 정책: 태스크 완료 후 ACK + worker 사망 시 재큐 (대용량 청크 유실 방지)
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # t3.small 메모리 제약: 한 번에 1개 청크만 (인스턴스 추가로 수평 확장)
    worker_prefetch_multiplier=1,
    worker_concurrency=1,

    # 타임아웃: 대용량 청크 진단은 길어질 수 있음 (hang 방지 backstop)
    task_time_limit=1800,       # 30분 하드 리밋
    task_soft_time_limit=1500,  # 25분 소프트 리밋 (정리 기회)

    # 결과 만료: chord 집계 후 Redis에 남은 부분결과 1시간 뒤 정리
    result_expires=3600,
)
