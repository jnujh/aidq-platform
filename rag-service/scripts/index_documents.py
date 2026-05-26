"""문서 인덱싱 스크립트 — documents/ 폴더의 마크다운을 ChromaDB에 저장

실행: cd rag-service && python scripts/index_documents.py
"""
import os
import sys
import glob

from langchain.text_splitter import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# ── 프로젝트 루트 설정 ──
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DOCUMENTS_DIR = os.path.join(PROJECT_ROOT, "documents")
CHROMA_DB_DIR = os.path.join(PROJECT_ROOT, "data", "chroma_db")

# ── 메타데이터 매핑 ──

KAGGLE_METADATA = {
    "01_telco_customer_churn": {
        "task_type": "binary_classification",
        "domain": "telecom",
        "dataset_name": "telco_churn",
    },
    "02_credit_card_fraud": {
        "task_type": "binary_classification",
        "domain": "finance",
        "dataset_name": "credit_fraud",
    },
    "03_bank_marketing": {
        "task_type": "binary_classification",
        "domain": "finance",
        "dataset_name": "bank_marketing",
    },
    "04_santander_customer_satisfaction": {
        "task_type": "binary_classification",
        "domain": "finance",
        "dataset_name": "santander_satisfaction",
    },
    "05_employee_attrition": {
        "task_type": "binary_classification",
        "domain": "hr",
        "dataset_name": "employee_attrition",
    },
    "06_titanic": {
        "task_type": "multi_classification",
        "domain": "general",
        "dataset_name": "titanic",
    },
    "07_forest_cover_type": {
        "task_type": "multi_classification",
        "domain": "environment",
        "dataset_name": "forest_cover",
    },
    "08_otto_group_product": {
        "task_type": "multi_classification",
        "domain": "ecommerce",
        "dataset_name": "otto_product",
    },
    "09_house_prices": {
        "task_type": "regression",
        "domain": "real_estate",
        "dataset_name": "house_prices",
    },
    "10_medical_cost": {
        "task_type": "regression",
        "domain": "healthcare",
        "dataset_name": "medical_cost",
    },
    "11_bike_sharing_demand": {
        "task_type": "regression",
        "domain": "transportation",
        "dataset_name": "bike_sharing",
    },
    "12_rossmann_store_sales": {
        "task_type": "time_series",
        "domain": "retail",
        "dataset_name": "rossmann_sales",
    },
    "13_store_item_demand": {
        "task_type": "time_series",
        "domain": "retail",
        "dataset_name": "store_item_demand",
    },
    "14_web_traffic_time_series": {
        "task_type": "time_series",
        "domain": "web",
        "dataset_name": "web_traffic",
    },
    "15_online_retail": {
        "task_type": "clustering",
        "domain": "ecommerce",
        "dataset_name": "online_retail",
    },
    "16_mall_customer_segmentation": {
        "task_type": "clustering",
        "domain": "marketing",
        "dataset_name": "mall_segmentation",
    },
    "17_movielens": {
        "task_type": "recommendation",
        "domain": "entertainment",
        "dataset_name": "movielens",
    },
    "18_sentiment_analysis": {
        "task_type": "nlp",
        "domain": "social_media",
        "dataset_name": "sentiment_analysis",
    },
    "19_spam_detection": {
        "task_type": "nlp",
        "domain": "email",
        "dataset_name": "spam_detection",
    },
    "20_ieee_cis_fraud": {
        "task_type": "anomaly_detection",
        "domain": "finance",
        "dataset_name": "ieee_fraud",
    },
    "21_network_intrusion": {
        "task_type": "anomaly_detection",
        "domain": "security",
        "dataset_name": "network_intrusion",
    },
}

TECHNIQUE_METADATA = {
    "01_missing_value_handling": {"quality_dimension": "completeness"},
    "02_outlier_detection_treatment": {"quality_dimension": "outlier_ratio"},
    "03_class_imbalance_solutions": {"quality_dimension": "class_balance"},
    "04_feature_scaling": {"quality_dimension": "value_accuracy"},
    "05_duplicate_detection": {"quality_dimension": "uniqueness"},
    "06_data_type_validation": {"quality_dimension": "validity"},
    "07_consistency_standardization": {"quality_dimension": "consistency"},
    "08_feature_correlation_management": {"quality_dimension": "feature_correlation"},
}

# quality_dimension을 청크 내용에서 자동 감지하기 위한 키워드 매핑
QUALITY_KEYWORDS = {
    "completeness": ["missing", "null", "NaN", "imputation", "completeness"],
    "uniqueness": ["duplicate", "dedup", "uniqueness", "repeated"],
    "validity": ["data type", "dtype", "encoding", "parsing", "validity"],
    "consistency": ["inconsistency", "standardiz", "case", "format", "consistency"],
    "outlier_ratio": ["outlier", "extreme", "IQR", "z-score", "skew"],
    "class_balance": ["imbalance", "class balance", "minority", "SMOTE", "churn rate"],
    "feature_correlation": ["correlation", "multicollinearity", "VIF", "redundant"],
    "value_accuracy": ["distribution", "scaling", "normalization", "skewness", "accuracy"],
}


def detect_quality_dimensions(text: str) -> list[str]:
    """청크 텍스트에서 관련 품질 차원을 자동 감지"""
    text_lower = text.lower()
    dimensions = []
    for dim, keywords in QUALITY_KEYWORDS.items():
        if any(kw.lower() in text_lower for kw in keywords):
            dimensions.append(dim)
    return dimensions


def load_and_chunk_documents():
    """모든 문서를 로드하고 청킹하여 (텍스트, 메타데이터) 리스트 반환"""

    # 마크다운 헤더 기준 1차 분할
    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("##", "section"),
            ("###", "subsection"),
        ]
    )

    # 800자 초과 시 2차 분할
    char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " "],
    )

    all_chunks = []  # (text, metadata) 튜플 리스트

    # ── 1. Kaggle 문서 (21개) ──
    kaggle_files = sorted(glob.glob(os.path.join(DOCUMENTS_DIR, "kaggle", "*.md")))
    for filepath in kaggle_files:
        filename = os.path.splitext(os.path.basename(filepath))[0]
        file_meta = KAGGLE_METADATA.get(filename, {})

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 마크다운 헤더로 1차 분할
        md_chunks = md_splitter.split_text(content)

        for chunk in md_chunks:
            # 800자 초과 시 2차 분할
            if len(chunk.page_content) > 800:
                sub_chunks = char_splitter.split_text(chunk.page_content)
            else:
                sub_chunks = [chunk.page_content]

            for sub_text in sub_chunks:
                # 품질 차원 자동 감지
                quality_dims = detect_quality_dimensions(sub_text)

                metadata = {
                    "source_type": "kaggle_notebook",
                    "task_type": file_meta.get("task_type", ""),
                    "domain": file_meta.get("domain", ""),
                    "dataset_name": file_meta.get("dataset_name", ""),
                    "quality_dimension": ",".join(quality_dims) if quality_dims else "",
                    "stage": "both",
                    "section": chunk.metadata.get("section", ""),
                    "subsection": chunk.metadata.get("subsection", ""),
                    "source_file": filename,
                }
                all_chunks.append((sub_text, metadata))

    # ── 2. 해결 기법 문서 (8개) ──
    technique_files = sorted(glob.glob(os.path.join(DOCUMENTS_DIR, "techniques", "*.md")))
    for filepath in technique_files:
        filename = os.path.splitext(os.path.basename(filepath))[0]
        file_meta = TECHNIQUE_METADATA.get(filename, {})

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        md_chunks = md_splitter.split_text(content)

        for chunk in md_chunks:
            if len(chunk.page_content) > 800:
                sub_chunks = char_splitter.split_text(chunk.page_content)
            else:
                sub_chunks = [chunk.page_content]

            for sub_text in sub_chunks:
                metadata = {
                    "source_type": "technique_doc",
                    "task_type": "",
                    "domain": "",
                    "dataset_name": "",
                    "quality_dimension": file_meta.get("quality_dimension", ""),
                    "stage": "improvement_guide",
                    "section": chunk.metadata.get("section", ""),
                    "subsection": chunk.metadata.get("subsection", ""),
                    "source_file": filename,
                }
                all_chunks.append((sub_text, metadata))

    # ── 3. 품질 정의 문서 (5개) ──
    definition_files = sorted(glob.glob(os.path.join(DOCUMENTS_DIR, "definitions", "*.md")))
    for filepath in definition_files:
        filename = os.path.splitext(os.path.basename(filepath))[0]

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        md_chunks = md_splitter.split_text(content)

        for chunk in md_chunks:
            if len(chunk.page_content) > 800:
                sub_chunks = char_splitter.split_text(chunk.page_content)
            else:
                sub_chunks = [chunk.page_content]

            for sub_text in sub_chunks:
                quality_dims = detect_quality_dimensions(sub_text)

                metadata = {
                    "source_type": "quality_definition",
                    "task_type": "",
                    "domain": "",
                    "dataset_name": "",
                    "quality_dimension": ",".join(quality_dims) if quality_dims else "",
                    "stage": "both",
                    "section": chunk.metadata.get("section", ""),
                    "subsection": chunk.metadata.get("subsection", ""),
                    "source_file": filename,
                }
                all_chunks.append((sub_text, metadata))

    return all_chunks


def index_to_chromadb(chunks: list[tuple[str, dict]]):
    """청크를 임베딩하여 ChromaDB에 저장"""

    print(f"임베딩 모델 로딩 중... (all-MiniLM-L6-v2, 384차원)")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )

    # 기존 DB 삭제 후 재생성 (전체 재인덱싱)
    if os.path.exists(CHROMA_DB_DIR):
        import shutil
        shutil.rmtree(CHROMA_DB_DIR)
        print(f"기존 ChromaDB 삭제: {CHROMA_DB_DIR}")

    os.makedirs(CHROMA_DB_DIR, exist_ok=True)

    texts = [text for text, _ in chunks]
    metadatas = [meta for _, meta in chunks]
    ids = [f"chunk_{i:04d}" for i in range(len(chunks))]

    print(f"ChromaDB에 {len(chunks)}개 청크 저장 중...")
    vectorstore = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        ids=ids,
        persist_directory=CHROMA_DB_DIR,
        collection_name="rag_docs",
    )

    print(f"저장 완료: {CHROMA_DB_DIR}")
    return vectorstore


def verify_index(vectorstore):
    """인덱싱 결과 검증 — 테스트 쿼리로 검색 품질 확인"""

    test_queries = [
        ("customer churn prediction class imbalance", "class_balance 관련 문서"),
        ("missing values imputation techniques", "결측치 처리 기법"),
        ("house prices outlier regression", "회귀 이상치"),
        ("fraud detection extreme imbalance", "사기 탐지 불균형"),
        ("time series forecasting data quality", "시계열 품질"),
    ]

    print("\n=== 검색 테스트 ===")
    for query, description in test_queries:
        results = vectorstore.similarity_search(query, k=3)
        print(f"\n쿼리: \"{query}\" ({description})")
        for i, doc in enumerate(results):
            source = doc.metadata.get("source_file", "unknown")
            section = doc.metadata.get("section", "")
            subsection = doc.metadata.get("subsection", "")
            preview = doc.page_content[:100].replace("\n", " ")
            print(f"  [{i+1}] {source} > {section} > {subsection}")
            print(f"      {preview}...")


def print_stats(chunks):
    """인덱싱 통계 출력"""
    print("\n=== 인덱싱 통계 ===")

    by_source = {}
    for _, meta in chunks:
        src = meta["source_type"]
        by_source[src] = by_source.get(src, 0) + 1

    for src, count in sorted(by_source.items()):
        print(f"  {src}: {count}개 청크")

    lengths = [len(text) for text, _ in chunks]
    print(f"\n  총 청크 수: {len(chunks)}")
    print(f"  평균 청크 길이: {sum(lengths) // len(lengths)}자")
    print(f"  최소/최대 청크 길이: {min(lengths)}자 / {max(lengths)}자")


def main():
    print("=== RAG 문서 인덱싱 시작 ===\n")

    # 1. 문서 로딩 + 청킹
    print("1. 문서 로딩 및 청킹...")
    chunks = load_and_chunk_documents()
    print(f"   {len(chunks)}개 청크 생성 완료")
    print_stats(chunks)

    # 2. 임베딩 + ChromaDB 저장
    print("\n2. 임베딩 및 ChromaDB 저장...")
    vectorstore = index_to_chromadb(chunks)

    # 3. 검색 테스트
    verify_index(vectorstore)

    print("\n=== 인덱싱 완료 ===")


if __name__ == "__main__":
    main()
