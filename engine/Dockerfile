FROM python:3.11-slim

# 벤치마크 차트 한글 라벨용 폰트 (matplotlib가 /usr/share/fonts 스캔 → fc-cache 불필요)
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-nanum \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY celery_app.py partitioner.py aggregator.py tasks.py bridge.py dsc_engine.py worker.py benchmark.py ./
COPY unstructured_tasks.py unstructured_loader.py ./
COPY dsc_cells/ ./dsc_cells/
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
