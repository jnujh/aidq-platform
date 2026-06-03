"""Bridge (Step 6): pika consumer → Celery dispatcher.

Spring Boot의 JacksonJsonMessageConverter 메시지는 Celery kombu 프로토콜과 비호환이라,
pika로 직접 소비한 뒤 Celery task.delay()로 위임한다. 태스크가 수분~수십분 걸릴 수 있으므로
디스패치 직후 즉시 ACK하고, 이후 책임(재큐/에러/정리)은 Celery가 진다.

설계: docs/sessions/parallel-engine/2026-06-01-impl-3-tasks-bridge.md
"""
import json
import time

import pika

from tasks import run_diagnosis
from worker import (RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASS,
                    DIAGNOSIS_QUEUE)


def on_message(ch, method, properties, body):
    try:
        message = json.loads(body)
        run_diagnosis.delay(message)
        print(f'[Bridge] jobId={message.get("jobId")} → Celery 위임')
    except Exception as e:
        print(f'[Bridge] 메시지 처리 실패: {e}')
    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    print('=== Bridge 시작 (pika → Celery) ===')
    for attempt in range(30):
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=RABBITMQ_HOST, port=RABBITMQ_PORT,
                credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS),
                heartbeat=600))
            break
        except pika.exceptions.AMQPConnectionError:
            print(f'  RabbitMQ 연결 대기 중... ({attempt + 1}/30)')
            time.sleep(2)
    else:
        print('RabbitMQ 연결 실패. 종료.')
        return

    channel = connection.channel()
    channel.queue_declare(queue=DIAGNOSIS_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=DIAGNOSIS_QUEUE, on_message_callback=on_message)
    print('diagnosis.queue 대기 중...')
    channel.start_consuming()


if __name__ == '__main__':
    main()
