"""LLM 생성 모듈 — 검색된 문서 + 사용자 입력으로 Claude API 호출

Augmentation: 검색 결과를 프롬프트에 조합
Generation: Claude API로 최종 응답 생성
"""
import os
import json
import re

import anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# ── 1단계: 가중치 추천 프롬프트 ──

WEIGHT_PROMPT = """You are a data quality expert for an AI-Ready data quality diagnosis platform.

Our platform diagnoses {modality_label} data. You must recommend weights for the metrics listed below, based on the user's data usage purpose.

## The Metrics (these are fixed — recommend weights only for these)
{metrics_block}

## Rules
1. Each weight must be an integer between 0 and 100
2. All weights must sum to exactly 100
3. Weight of 0 means the metric is disabled (not evaluated)
4. **Hybrid grounding (RAG + general expertise)**: Prioritize the reference documents below and cite them. Where the documents are thin, missing, or do not cover this modality/purpose, supplement with your own expert data-quality knowledge — but ALWAYS make the basis explicit so the user can judge reliability:
   - Document-grounded claims → cite the FULL document name, e.g., "**Kaggle Telco Customer Churn 데이터셋 분석**에 따르면...".
   - General-expertise claims (not from the documents) → mark with "(일반 지식)".
   Prefer grounded reasoning; use general knowledge to FILL GAPS, not to contradict the documents.
5. Write your reasoning in Korean (한국어)
6. Be specific and concrete — tie each weight to either a cited document or a clearly-marked expert rationale. Avoid vague generic advice.
7. When citing a reference document, use its FULL NAME, NOT document numbers.

## Reference Documents (from RAG search)
{context}

## User's Data Usage Purpose
"{purpose}"

## Output Format (반드시 이 순서로 두 부분 출력)
**PART 1** — 가중치만 담은 JSON 코드블록 (정수 0~100, 합계 정확히 100). reasoning은 절대 넣지 말 것:
```json
{{
{weights_json_template}
}}
```

**PART 2** — JSON 블록 다음 줄에 `===REASONING===` 한 줄, 그 뒤에 한국어 Markdown 근거(평문, JSON 아님).
긴 설명·줄바꿈·따옴표 자유롭게 사용 가능.

## Reasoning (PART 2 형식 — Markdown 표 금지, 리스트 사용)
### 📋 추천 요약
> 한 문장으로 핵심 전략. 마지막 줄에 "근거: 참조 문서 N건 + 일반 지식 보강" (문서 없으면 "일반 지식 기반").

### 📊 가중치 배분
(높은 순으로 {metric_count}개 모두: `- 🔴 **(지표명)** — N점 (상)`. 🔴=상(15+) 🟡=중(8~14) 🟢=하(0~7))

### 🔍 상세 근거
(높은 순으로 {metric_count}개 모두. `#### (지표명) (N점)` 뒤 1~2문장.
문서 근거는 "**문서 전체 이름**에 따르면…"(볼드), 문서에 없는 전문 지식은 "(일반 지식)"으로 구분 표기.)
"""

# 모달리티별 지표 레지스트리 — (설명, 사전등록 fallback 가중치 0~1).
# 정형은 기존 v3.2 8종, 이미지/텍스트는 팀원 v5 cell의 10종(dsc_cells DEFAULT_WEIGHTS_*와 동일).
METRIC_REGISTRY = {
    "tabular": {
        "label": "tabular (structured)",
        "metrics": {
            "completeness": "Missing value ratio (how complete is the data)",
            "uniqueness": "Duplicate row ratio (how unique is the data)",
            "validity": "Type/format validity (are data formats correct)",
            "consistency": "Categorical expression uniformity",
            "outlier_ratio": "Outlier ratio (how many abnormal values exist)",
            "class_balance": "Class balance (target distribution balance)",
            "feature_correlation": "High-correlation feature ratio (redundancy)",
            "value_accuracy": "Value accuracy (are distributions reasonable)",
        },
        "fallback": {
            "completeness": 0.20, "uniqueness": 0.15, "validity": 0.10,
            "consistency": 0.10, "outlier_ratio": 0.10, "class_balance": 0.10,
            "feature_correlation": 0.10, "value_accuracy": 0.15,
        },
    },
    "image": {
        "label": "image (classification)",
        "metrics": {
            "completeness_image": "Pixel masking ratio (black/missing pixels)",
            "uniqueness": "Perceptual-hash duplicate ratio",
            "validity": "Image load/decode success ratio",
            "consistency": "Color mode + size uniformity",
            "outlier_ratio": "Mean-intensity outlier ratio",
            "class_balance": "Class balance across labels",
            "feature_correlation": "ResNet18 embedding dimension redundancy",
            "label_consistency": "k-NN embedding label agreement (chance-corrected)",
            "feature_informativeness": "Embedding→label mutual information / H(Y)",
            "sample_quality_image": "Blur (Laplacian var) + contrast (RMS) blend",
        },
        "fallback": {
            "completeness_image": 0.15, "uniqueness": 0.10, "validity": 0.05,
            "consistency": 0.05, "outlier_ratio": 0.05, "class_balance": 0.10,
            "feature_correlation": 0.05, "label_consistency": 0.20,
            "feature_informativeness": 0.10, "sample_quality_image": 0.15,
        },
    },
    "text": {
        "label": "text (classification)",
        "metrics": {
            "completeness_text": "Protected/empty token ratio ([MASK]/[PAD]/empty)",
            "uniqueness": "Normalized-hash duplicate ratio",
            "validity": "UTF-8 + non-empty + min-1-token ratio",
            "consistency": "Token-count bucket entropy uniformity",
            "outlier_ratio": "Token-count outlier ratio",
            "class_balance": "Class balance across labels",
            "feature_correlation": "DistilBERT embedding dimension redundancy",
            "label_consistency": "k-NN embedding label agreement (chance-corrected)",
            "feature_informativeness": "Embedding→label mutual information / H(Y)",
            "sample_quality_text": "Type-token ratio + length adequacy blend",
        },
        "fallback": {
            "completeness_text": 0.15, "uniqueness": 0.10, "validity": 0.05,
            "consistency": 0.05, "outlier_ratio": 0.05, "class_balance": 0.10,
            "feature_correlation": 0.05, "label_consistency": 0.20,
            "feature_informativeness": 0.10, "sample_quality_text": 0.15,
        },
    },
}


def _normalize_modality(data_type: str | None) -> str:
    dt = (data_type or "tabular").lower()
    return dt if dt in METRIC_REGISTRY else "tabular"

# ── 2단계: 개선 가이드 프롬프트 ──

REPORT_PROMPT = """You are a data quality improvement advisor for an AI-Ready data quality diagnosis platform.

Based on the diagnosis results and reference documents, write a detailed improvement guide in Korean.

## Diagnosis Results
{diagnosis_result}

## User's Data Usage Purpose
"{purpose}"

## Reference Documents (from RAG search)
{context}

## Writing Rules
1. Write entirely in Korean (한국어). Do NOT mix Chinese, Japanese, or other languages.
2. Use Markdown formatting with emoji icons for visual hierarchy.
3. Be specific — reference actual techniques and examples from the reference documents.
4. When mentioning technical terms, add simple explanations in parentheses.
5. **Hybrid grounding (RAG + general expertise)**: Prioritize and cite the reference documents. Where they are thin, missing, or do not cover this data modality, supplement with your own expert data-quality knowledge — but clearly distinguish the basis so the user can judge reliability:
   - Document-grounded → "**문서 전체 이름**에 따르면..." (bold citation).
   - General-expertise (not in the documents) → mark with "(일반 지식)".
   Do NOT contradict the documents; use general knowledge only to fill gaps. Do not invent fake sources or fabricated statistics.
6. When citing a reference document, use its FULL NAME with bold.
7. You MUST use Markdown tables where appropriate (e.g., technique comparisons). Tables render correctly in our frontend.

## Report Structure (follow this EXACTLY)

### 📊 종합 평가
> 전체 점수와 등급을 한 문장으로 요약

**주요 지표 현황:**
- ✅ **지표명** — 점수% (간단한 한 줄 해석)
- ✅ **지표명** — 점수%
- ⚠️ **지표명** — 점수% ← 개선 필요
- ❌ **지표명** — 점수% ← 심각

(✅=90%이상 양호, ⚠️=80~90% 주의, ❌=80%미만 심각. 진단 결과의 모든 지표를 점수 높은 순으로 나열)

---

### ✅ 강점 분석
(90% 이상인 지표들을 간략히 설명. 각 지표 2문장 이내로 핵심만)

---

### 🔧 개선 필요 항목
(80% 미만인 지표를 심각도 순으로 상세 분석. 각 항목은 아래 형식:)

#### ❌ 지표명 (점수%) — 심각도: 높음

**현황:** 현재 상태를 구체적 수치와 함께 1~2문장으로 설명

**문제점:** 이 문제가 사용 목적(모델 학습 등)에 미치는 영향 1~2문장

**해결 방안:** (참조 문서 기반으로 구체적 기법을 표로 정리)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| 기법명 | 설명 | 조건 |

---

### 🚀 실행 가이드
(가장 시급한 개선 3가지를 우선순위별로 정리)

**1순위: 제목**
- 목표: 한 줄
- 구체적 실행 단계 2~3개

**2순위: 제목**
- 목표: 한 줄
- 구체적 실행 단계 2~3개

**3순위: 제목**
- 목표: 한 줄
- 구체적 실행 단계 2~3개

Write the report:
"""


def _strip_code_block(text: str) -> str:
    """Claude가 ```json ... ``` 으로 감싸는 경우 벗겨냄"""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # 첫 줄(```json 또는 ```)과 마지막 줄(```) 제거
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


# 파일명 → 사람이 읽을 수 있는 출처명 매핑
_SOURCE_DISPLAY_NAMES = {
    "01_telco_customer_churn": "Kaggle Telco Customer Churn 데이터셋 분석",
    "02_credit_card_fraud": "Kaggle Credit Card Fraud Detection 데이터셋 분석",
    "03_bank_marketing": "Kaggle Bank Marketing 데이터셋 분석",
    "04_santander_customer_satisfaction": "Kaggle Santander Customer Satisfaction 데이터셋 분석",
    "05_employee_attrition": "Kaggle IBM HR Employee Attrition 데이터셋 분석",
    "06_titanic": "Kaggle Titanic 데이터셋 분석",
    "07_forest_cover_type": "Kaggle Forest Cover Type 데이터셋 분석",
    "08_otto_group_product": "Kaggle Otto Group Product Classification 데이터셋 분석",
    "09_house_prices": "Kaggle House Prices 데이터셋 분석",
    "10_medical_cost": "Kaggle Medical Cost 데이터셋 분석",
    "11_bike_sharing_demand": "Kaggle Bike Sharing Demand 데이터셋 분석",
    "12_rossmann_store_sales": "Kaggle Rossmann Store Sales 데이터셋 분석",
    "13_store_item_demand": "Kaggle Store Item Demand 데이터셋 분석",
    "14_web_traffic_time_series": "Kaggle Web Traffic Time Series 데이터셋 분석",
    "15_online_retail": "Kaggle Online Retail 데이터셋 분석",
    "16_mall_customer_segmentation": "Kaggle Mall Customer Segmentation 데이터셋 분석",
    "17_movielens": "Kaggle MovieLens 데이터셋 분석",
    "18_sentiment_analysis": "Kaggle Sentiment Analysis 데이터셋 분석",
    "19_spam_detection": "Kaggle SMS Spam Detection 데이터셋 분석",
    "20_ieee_cis_fraud": "Kaggle IEEE-CIS Fraud Detection 데이터셋 분석",
    "21_network_intrusion": "Kaggle KDD Cup 99 Network Intrusion 데이터셋 분석",
    "22_cifar10_image_classification": "Kaggle CIFAR-10 이미지 분류 데이터셋 분석",
    "23_fashion_mnist_image_classification": "Kaggle Fashion-MNIST 이미지 분류 데이터셋 분석",
    "24_ag_news_text_classification": "Kaggle AG News 텍스트 분류 데이터셋 분석",
    "25_mnist_image_classification": "MNIST 손글씨 이미지 분류 데이터셋 분석",
    "26_cifar100_image_classification": "CIFAR-100 이미지 분류 데이터셋 분석",
    "27_caltech101_image_classification": "Caltech-101 이미지 분류 데이터셋 분석",
    "28_oxford_flowers102_image_classification": "Oxford 102 Flowers 이미지 분류 데이터셋 분석",
    "29_stanford_dogs_image_classification": "Stanford Dogs 이미지 분류 데이터셋 분석",
    "30_imdb_sentiment_text_classification": "IMDB 영화리뷰 감성분류 데이터셋 분석",
    "31_yelp_polarity_text_classification": "Yelp Review Polarity 텍스트 분류 데이터셋 분석",
    "32_20newsgroups_text_classification": "20 Newsgroups 텍스트 분류 데이터셋 분석",
    "33_sst2_text_classification": "SST-2 (GLUE) 문장 감성분류 데이터셋 분석",
    "34_trec_question_text_classification": "TREC 질문유형 분류 데이터셋 분석",
    "01_missing_value_handling": "scikit-learn 결측치 처리 기법 가이드",
    "02_outlier_detection_treatment": "scikit-learn 이상치 탐지/처리 가이드",
    "03_class_imbalance_solutions": "imbalanced-learn 클래스 불균형 해결 가이드",
    "04_feature_scaling": "scikit-learn 피처 스케일링 가이드",
    "05_duplicate_detection": "pandas 중복 데이터 탐지 가이드",
    "06_data_type_validation": "scikit-learn 데이터 타입/인코딩 가이드",
    "07_consistency_standardization": "pandas 일관성 표준화 가이드",
    "08_feature_correlation_management": "scikit-learn 피처 상관관계 관리 가이드",
    "09_image_quality_diagnosis": "이미지 데이터 품질 진단 가이드 (cleanlab/Confident Learning · imagehash · ResNet18 임베딩 기반)",
    "10_text_quality_diagnosis": "텍스트 데이터 품질 진단 가이드 (cleanlab · MinHash 중복제거 · DistilBERT 임베딩 기반)",
    "11_image_augmentation_balancing": "이미지 증강·클래스 균형 가이드 (RandAugment · MixUp · CutMix)",
    "12_text_cleaning_dedup": "텍스트 정제·중복제거 가이드 (NFKC · MinHash/LSH · 품질 필터)",
    "13_embedding_outlier_ood_detection": "임베딩 기반 이상치·OOD 탐지 가이드 (k-NN · Mahalanobis · Isolation Forest)",
    "01_iso_25012_quality_dimensions": "ISO/IEC 25012 데이터 품질 차원 정의",
    "02_ai_ml_data_quality": "AI/ML 데이터 품질 요구사항 (ISO 5259 기반)",
    "03_google_rules_of_ml": "Google Rules of Machine Learning",
    "04_task_specific_requirements": "ML 태스크별 데이터 품질 요구사항",
    "05_quality_impact_on_performance": "데이터 품질이 모델 성능에 미치는 영향",
    "06_iso_5259_ai_data_quality": "ISO/IEC 5259 AI 분석·ML 데이터 품질 표준",
    "07_data_centric_ai_principles": "데이터 중심 AI 원칙 (Andrew Ng · 라벨 품질)",
}


def _build_context(search_results: list[dict]) -> str:
    """검색 결과를 프롬프트용 컨텍스트 문자열로 변환"""
    context_parts = []
    for i, result in enumerate(search_results, 1):
        source = result["metadata"].get("source_file", "unknown")
        section = result["metadata"].get("section", "")
        subsection = result["metadata"].get("subsection", "")

        # 사람이 읽을 수 있는 출처명 사용
        display_name = _SOURCE_DISPLAY_NAMES.get(source, source)
        location = " > ".join(filter(None, [display_name, section, subsection]))
        context_parts.append(
            f"[Document {i}] ({location})\n{result['content']}"
        )

    return "\n\n---\n\n".join(context_parts)


def _salvage_weights(text: str, keys: list[str]) -> dict:
    """JSON이 잘려 파싱 실패해도 weights 정수만 정규식으로 복구 (weights는 JSON 앞부분이라 보통 온전).
    모든 기대 지표가 잡힐 때만 반환(부분이면 무효)."""
    out = {}
    for k in keys:
        m = re.search(rf'"{re.escape(k)}"\s*:\s*(\d+)', text)
        if m:
            out[k] = int(m.group(1))
    return out if len(out) == len(keys) else {}


def generate_weights(purpose: str, search_results: list[dict],
                     data_type: str | None = None) -> dict:
    """1단계: 검색 결과를 바탕으로 가중치 추천 생성 (모달리티 인식).

    data_type: 'tabular' | 'image' | 'text'. None → tabular.
    Returns:
        {"weights": {...0~1...}, "reasoning": "..."}
    """
    modality = _normalize_modality(data_type)
    spec = METRIC_REGISTRY[modality]
    metric_keys = list(spec["metrics"].keys())

    if not ANTHROPIC_API_KEY:
        return {
            "weights": dict(spec["fallback"]),
            "reasoning": "[API 키 미설정] 기본 가중치를 반환합니다.",
        }

    context = _build_context(search_results)
    metrics_block = "\n".join(f"- {k}: {v}" for k, v in spec["metrics"].items())
    weights_json_template = ",\n".join(f'    "{k}": <int>' for k in metric_keys)
    prompt = WEIGHT_PROMPT.format(
        context=context, purpose=purpose,
        modality_label=spec["label"],
        metrics_block=metrics_block,
        weights_json_template=weights_json_template,
        metric_count=len(metric_keys),
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        # 10지표(이미지/텍스트) × 하이브리드 근거는 길어서 4000이면 JSON이 잘려 파싱 실패함 → 8000.
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()

    def _normalize_to_ratio(weights):
        total = sum(weights.values())
        if total != 100:
            factor = 100 / total if total > 0 else 1
            weights = {k: round(v * factor) for k, v in weights.items()}
            diff = 100 - sum(weights.values())
            if diff != 0:
                max_key = max(weights, key=weights.get)
                weights[max_key] += diff
        return {k: v / 100.0 for k, v in weights.items()}

    # PART1: 가중치 JSON 블록 파싱 (펜스 우선). LLM이 평평한 {...} 또는 중첩
    # {"weights": {...}, "reasoning": "..."} 형태로 줄 수 있어 둘 다 처리한다(greedy로 중첩 전체 포착).
    jm = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL) or re.search(r'(\{.*\})', text, re.DOTALL)
    weights = None
    reasoning_from_json = ""
    if jm:
        try:
            parsed = json.loads(jm.group(1))
            if isinstance(parsed.get("weights"), dict):  # 중첩 형태면 한 겹 풀고 reasoning도 회수
                reasoning_from_json = str(parsed.get("reasoning") or "")
                parsed = parsed["weights"]
            weights = {k: int(parsed[k]) for k in metric_keys}
        except Exception:
            weights = None
    if weights is None:
        weights = _salvage_weights(text, metric_keys) or None
    if not weights:
        return {"weights": dict(spec["fallback"]),
                "reasoning": f"[파싱 실패] 기본 가중치를 반환합니다. 원본 응답: {text[:200]}"}

    # PART2: reasoning = 중첩 JSON 안의 reasoning(있으면) 우선, 없으면 JSON 블록 이후 평문(===REASONING=== 마커 제거)
    if reasoning_from_json.strip():
        reasoning = reasoning_from_json.strip()
    else:
        rest = text[jm.end():] if jm else ""
        reasoning = re.sub(r'={2,}\s*REASONING\s*={2,}', '', rest, flags=re.IGNORECASE).strip()
    if not reasoning:
        reasoning = "(근거 설명이 생성되지 않았습니다.)"
    return {"weights": _normalize_to_ratio(weights), "reasoning": reasoning}


def generate_report(diagnosis_result: dict, purpose: str, search_results: list[dict]) -> str:
    """2단계: 검색 결과를 바탕으로 개선 가이드 생성

    Returns:
        개선 가이드 텍스트 (한국어, 순수 텍스트)
    """
    if not ANTHROPIC_API_KEY:
        return "[API 키 미설정] 리포트를 생성할 수 없습니다."

    context = _build_context(search_results)
    prompt = REPORT_PROMPT.format(
        diagnosis_result=json.dumps(diagnosis_result, ensure_ascii=False, indent=2),
        purpose=purpose or "지정되지 않음",
        context=context,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        # 10지표 + 개선항목 표가 길어 잘리지 않도록 상향(가중치 추천과 동일 사유).
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text.strip()
