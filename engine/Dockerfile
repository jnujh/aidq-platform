FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY celery_app.py partitioner.py aggregator.py tasks.py bridge.py dsc_engine.py worker.py benchmark.py ./
COPY unstructured_tasks.py unstructured_loader.py ./
COPY dsc_cells/ ./dsc_cells/
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
