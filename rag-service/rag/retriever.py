"""벡터DB 검색 모듈 — ChromaDB에서 관련 문서 청크 검색

1단계(가중치 추천): task_type + domain 필터로 관련 사례 검색
2단계(개선 가이드): quality_dimension 필터로 해결 기법 검색
"""
import os

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CHROMA_DB_DIR = os.path.join(PROJECT_ROOT, "data", "chroma_db")

# 임베딩 모델 (모듈 로드 시 1회 초기화)
_embeddings = None
_vectorstore = None


def _get_vectorstore():
    """ChromaDB 벡터스토어 싱글턴 로드"""
    global _embeddings, _vectorstore

    if _vectorstore is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
        )
        _vectorstore = Chroma(
            persist_directory=CHROMA_DB_DIR,
            embedding_function=_embeddings,
            collection_name="rag_docs",
        )
    return _vectorstore


def search_for_weights(query_en: str, task_type: str = "", domain: str = "", k: int = 5) -> list[dict]:
    """1단계: 가중치 추천을 위한 문서 검색

    task_type과 domain으로 필터링 후 유사도 검색.
    필터 매칭이 부족하면 필터를 점진적으로 완화.
    """
    vectorstore = _get_vectorstore()

    # 필터 구성: task_type + stage
    where_filter = _build_weight_filter(task_type, domain)

    results = vectorstore.similarity_search_with_score(
        query=query_en,
        k=k,
        filter=where_filter,
    )

    # 필터링 결과가 부족하면 필터 완화하여 재검색
    if len(results) < 3 and where_filter:
        results_no_filter = vectorstore.similarity_search_with_score(
            query=query_en,
            k=k,
        )
        # 기존 결과 + 필터 없는 결과 합쳐서 k개로 제한
        seen_ids = {doc.page_content[:50] for doc, _ in results}
        for doc, score in results_no_filter:
            if doc.page_content[:50] not in seen_ids and len(results) < k:
                results.append((doc, score))
                seen_ids.add(doc.page_content[:50])

    return [
        {
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": round(float(score), 4),
        }
        for doc, score in results
    ]


def search_for_report(diagnosis_result: dict, k: int = 5) -> list[dict]:
    """2단계: 개선 가이드를 위한 문서 검색

    진단 결과에서 낮은 점수 지표를 추출하여 해당 기법 문서 검색.
    """
    vectorstore = _get_vectorstore()

    # 낮은 점수 지표 추출 (0.8 미만)
    low_metrics = _extract_low_metrics(diagnosis_result)

    if not low_metrics:
        # 모든 지표가 양호하면 일반 검색
        query = "data quality improvement recommendations"
        results = vectorstore.similarity_search_with_score(query=query, k=k)
    else:
        # 낮은 지표에 대한 검색 쿼리 구성
        query = f"how to fix {', '.join(low_metrics)} data quality issues"

        # quality_dimension 필터 (technique_doc 우선)
        where_filter = {
            "$or": [
                {"source_type": "technique_doc"},
                {"source_type": "kaggle_notebook"},
            ]
        }

        results = vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=where_filter,
        )

    return [
        {
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": round(float(score), 4),
        }
        for doc, score in results
    ]


def _build_weight_filter(task_type: str, domain: str) -> dict | None:
    """1단계 검색용 메타데이터 필터 구성"""
    conditions = []

    if task_type:
        conditions.append({"task_type": task_type})

    if not conditions:
        return None

    if len(conditions) == 1:
        return conditions[0]

    return {"$and": conditions}


def _extract_low_metrics(diagnosis_result: dict) -> list[str]:
    """진단 결과에서 0.8 미만인 지표 이름 추출"""
    metrics = diagnosis_result.get("metrics", {})
    low = []
    for metric_name, metric_data in metrics.items():
        if isinstance(metric_data, dict):
            score = metric_data.get("score", 1.0)
        elif isinstance(metric_data, (int, float)):
            score = metric_data
        else:
            continue

        if score < 0.8:
            low.append(metric_name)

    return low
