"""RAG Service — FastAPI 기반 데이터 품질 진단 RAG 서비스"""
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Scorecard RAG Service",
    description="데이터 품질 진단을 위한 RAG 기반 LLM 서비스",
    version="0.1.0",
)


# ── 요청/응답 모델 ──


class WeightRecommendRequest(BaseModel):
    purpose: str


class WeightRecommendResponse(BaseModel):
    weights: dict[str, float]
    reasoning: str


class ReportGenerateRequest(BaseModel):
    diagnosis_result: dict
    purpose: str | None = None


class ReportGenerateResponse(BaseModel):
    report: str


# ── 엔드포인트 ──


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/recommend-weights", response_model=WeightRecommendResponse)
async def recommend_weights(request: WeightRecommendRequest):
    """1단계: 사용맥락 기반 평가지표 가중치 추천 (RAG)"""
    # TODO: 구현 예정
    # 1. 사용맥락 파싱 (한국어 → 영어 번역 + task_type 추출)
    # 2. ChromaDB에서 관련 문서 검색
    # 3. Claude API로 가중치 추천 생성
    return WeightRecommendResponse(
        weights={
            "completeness": 0.20,
            "uniqueness": 0.15,
            "validity": 0.10,
            "consistency": 0.10,
            "outlier_ratio": 0.10,
            "class_balance": 0.10,
            "feature_correlation": 0.10,
            "value_accuracy": 0.15,
        },
        reasoning="[placeholder] RAG 구현 후 실제 추천 근거가 여기에 들어갑니다.",
    )


@app.post("/api/generate-report", response_model=ReportGenerateResponse)
async def generate_report(request: ReportGenerateRequest):
    """2단계: 진단 결과 기반 개선 가이드 생성 (RAG)"""
    # TODO: 구현 예정
    # 1. 진단 결과에서 낮은 점수 지표 추출
    # 2. ChromaDB에서 해결 기법 문서 검색
    # 3. Claude API로 개선 가이드 생성
    return ReportGenerateResponse(
        report="[placeholder] RAG 구현 후 실제 리포트가 여기에 들어갑니다.",
    )
