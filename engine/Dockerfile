FROM python:3.11-slim

# 벤치마크 차트 한글 라벨용 폰트 (matplotlib가 /usr/share/fonts 스캔 → fc-cache 불필요)
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-nanum \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 비정형 임베딩 모델을 이미지에 미리 굽기(bake) — 런타임 다운로드 제거 → 첫 진단도 빠르고 재시작/다중워커에서 일관.
# 캐시 경로(/root/.cache)가 런타임 HOME과 동일해 진단 시 그대로 재사용. 모델 ID는 image_cell/text_cell과 일치.
RUN python -c "import torchvision.models as m; m.resnet18(weights=m.ResNet18_Weights.DEFAULT)" \
    && python -c "from transformers import AutoModel, AutoTokenizer; AutoTokenizer.from_pretrained('distilbert-base-uncased'); AutoModel.from_pretrained('distilbert-base-uncased')"

COPY celery_app.py partitioner.py aggregator.py tasks.py bridge.py dsc_engine.py worker.py benchmark.py ./
COPY unstructured_tasks.py unstructured_loader.py ./
COPY dsc_cells/ ./dsc_cells/
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
