"""진단 엔진 워커 — RabbitMQ에서 진단 요청을 받아 처리하고 결과를 발행한다."""
import os
import io
import json
import time
import pika
import boto3
import pandas as pd
from dsc_engine import compute_dsc, auto_detect_columns

# ── 환경변수 ──
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USERNAME', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASSWORD', 'guest')

S3_ENDPOINT = os.getenv('AWS_S3_ENDPOINT', '')
S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'scorecard-uploads')
S3_REGION = os.getenv('AWS_REGION', 'ap-northeast-2')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID', 'test')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', 'test')

DIAGNOSIS_QUEUE = 'diagnosis.queue'
RESULT_EXCHANGE = 'diagnosis.exchange'
RESULT_ROUTING_KEY = 'diagnosis.result'


def get_s3_client():
    kwargs = {
        'region_name': S3_REGION,
        'aws_access_key_id': AWS_ACCESS_KEY,
        'aws_secret_access_key': AWS_SECRET_KEY,
    }
    if S3_ENDPOINT:
        kwargs['endpoint_url'] = S3_ENDPOINT
    return boto3.client('s3', **kwargs)


def download_csv_from_s3(s3_key: str) -> pd.DataFrame:
    s3 = get_s3_client()
    response = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
    content = response['Body'].read()
    return pd.read_csv(io.BytesIO(content))


def publish_result(channel, result_message: dict):
    channel.basic_publish(
        exchange=RESULT_EXCHANGE,
        routing_key=RESULT_ROUTING_KEY,
        body=json.dumps(result_message, ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type='application/json',
            delivery_mode=2,
        )
    )
    print(f'[결과 발행] jobId={result_message["jobId"]}, success={result_message["success"]}')


def on_message(ch, method, properties, body):
    message = json.loads(body)
    job_id = message['jobId']
    s3_key = message['s3Key']
    original_filename = message.get('originalFilename', '')

    print(f'[진단 요청 수신] jobId={job_id}, file={original_filename}')

    try:
        # 1) S3에서 CSV 다운로드
        df = download_csv_from_s3(s3_key)
        print(f'  파일 로드 완료: {len(df)} rows, {len(df.columns)} cols')

        # 2) 컬럼 자동 판별
        target_col, numerical_cols, categorical_cols = auto_detect_columns(df)
        print(f'  target={target_col}, numerical={len(numerical_cols)}, categorical={len(categorical_cols)}')

        # 3) 맞춤 가중치 적용
        weights = message.get('weights', None)
        if weights:
            print(f'  맞춤 가중치 적용: {weights}')

        # 4) DSC 진단 수행
        result = compute_dsc(
            df=df,
            target_col=target_col,
            numerical_cols=numerical_cols,
            categorical_cols=categorical_cols,
            reference_df=df,
            weights=weights,
        )
        print(f'  진단 완료: score={result["score"]}, grade={result["grade"]}')

        # 4) 성공 결과 발행
        result_detail = {
            'metrics': {k: v for k, v in result.items() if k not in ('score', 'grade')},
            'columns': [
                {'name': col, 'type': 'numeric' if col in numerical_cols else 'categorical'}
                for col in df.columns if col != target_col
            ],
            'summary': f'종합 점수 {result["score"]}점 ({result["grade"]}등급). '
                       f'분석 컬럼 {len(df.columns)-1}개, 데이터 행 {len(df)}건.',
            'targetColumn': target_col,
            'grade': result['grade'],
        }

        publish_result(ch, {
            'jobId': job_id,
            'success': True,
            'dataType': 'STRUCTURED',
            'totalScore': result['score'],
            'resultDetail': json.dumps(result_detail, ensure_ascii=False),
            'errorMessage': None,
        })

    except Exception as e:
        print(f'  진단 실패: {e}')
        publish_result(ch, {
            'jobId': job_id,
            'success': False,
            'dataType': None,
            'totalScore': None,
            'resultDetail': None,
            'errorMessage': str(e),
        })

    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    print('=== DSC 진단 엔진 워커 시작 ===')

    # RabbitMQ 연결 (재시도 포함)
    for attempt in range(30):
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS),
                    heartbeat=600,
                )
            )
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

    print(f'diagnosis.queue 대기 중...')
    channel.start_consuming()


if __name__ == '__main__':
    main()
