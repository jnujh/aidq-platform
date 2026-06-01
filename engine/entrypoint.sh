#!/bin/bash
# Celery Worker + Bridge 동시 실행. 어느 한쪽이 죽으면 전체 종료 → 컨테이너 재시작.
set -m

celery -A celery_app worker --concurrency=1 --loglevel=info &
CELERY_PID=$!

python -u bridge.py &
BRIDGE_PID=$!

wait -n $CELERY_PID $BRIDGE_PID
echo "[entrypoint] 프로세스 종료 감지 → 전체 종료"
kill $CELERY_PID $BRIDGE_PID 2>/dev/null
exit 1
