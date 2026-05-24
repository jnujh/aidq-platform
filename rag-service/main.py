"""RAG Service — FastAPI 기반 데이터 품질 진단 RAG 서비스"""
from fastapi import FastAPI
from pydantic import BaseModel

from rag.context_parser import parse_context
from rag.retriever import search_for_weights, search_for_report
from rag.generator import generate_weights, generate_report

app = FastAPI(
    title="Scorecard RAG Service",
    description="데이터 품질 진단을 위한 RAG 기반 LLM 서비스",
    version="0.2.0",
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
    """1단계: 사용맥락 기반 평가지표 가중치 추천 (RAG)

    흐름: 사용맥락 파싱 → ChromaDB 검색 → Claude로 가중치 생성
    """
    # R 이전: 사용맥락 파싱 (한국어 → 영어 + task_type/domain 추출)
    context = parse_context(request.purpose)

    # R (Retrieval): 관련 문서 검색
    search_results = search_for_weights(
        query_en=context["query_en"],
        task_type=context["task_type"],
        domain=context["domain"],
        k=5,
    )

    # A + G (Augmentation + Generation): 프롬프트 조합 + Claude 호출
    result = generate_weights(
        purpose=request.purpose,
        search_results=search_results,
    )

    return WeightRecommendResponse(
        weights=result["weights"],
        reasoning=result["reasoning"],
    )


@app.post("/api/generate-report", response_model=ReportGenerateResponse)
async def api_generate_report(request: ReportGenerateRequest):
    """2단계: 진단 결과 기반 개선 가이드 생성 (RAG)

    흐름: 낮은 점수 지표 추출 → ChromaDB 검색 → Claude로 리포트 생성
    """
    # R (Retrieval): 낮은 점수 지표 기반 문서 검색
    search_results = search_for_report(
        diagnosis_result=request.diagnosis_result,
        k=5,
    )

    # A + G (Augmentation + Generation): 프롬프트 조합 + Claude 호출
    report = generate_report(
        diagnosis_result=request.diagnosis_result,
        purpose=request.purpose or "",
        search_results=search_results,
    )

    return ReportGenerateResponse(report=report)
