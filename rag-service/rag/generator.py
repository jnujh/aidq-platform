"""LLM 생성 모듈 — 검색된 문서 + 사용자 입력으로 Claude API 호출

Augmentation: 검색 결과를 프롬프트에 조합
Generation: Claude API로 최종 응답 생성
"""
import os
import json

import anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# ── 1단계: 가중치 추천 프롬프트 ──

WEIGHT_PROMPT = """You are a data quality expert for an AI-Ready data quality diagnosis platform.

Our platform has exactly 8 quality metrics. You must recommend weights for these 8 metrics based on the user's data usage purpose.

## The 8 Metrics (these are fixed — recommend weights only for these)
- completeness: Missing value ratio (how complete is the data)
- uniqueness: Duplicate row ratio (how unique is the data)
- validity: Type/format validity (are data formats correct)
- consistency: Categorical expression uniformity (are representations consistent)
- outlier_ratio: Outlier ratio (how many abnormal values exist)
- class_balance: Class balance (is the target variable distribution balanced)
- feature_correlation: High-correlation feature ratio (are features redundant)
- value_accuracy: Value accuracy (are distributions reasonable)

## Rules
1. Each weight must be an integer between 0 and 100
2. All weights must sum to exactly 100
3. Weight of 0 means the metric is disabled (not evaluated)
4. Base your reasoning on the reference documents provided below
5. Write your reasoning in Korean (한국어)
6. Be specific — mention actual examples from the reference documents, not generic advice
7. When citing a reference document, use its FULL NAME (e.g., "Kaggle Telco Customer Churn 데이터셋 분석에 따르면..."), NOT document numbers

## Reference Documents (from RAG search)
{context}

## User's Data Usage Purpose
"{purpose}"

## Response Format (JSON only)
{{
  "weights": {{
    "completeness": <int>,
    "uniqueness": <int>,
    "validity": <int>,
    "consistency": <int>,
    "outlier_ratio": <int>,
    "class_balance": <int>,
    "feature_correlation": <int>,
    "value_accuracy": <int>
  }},
  "reasoning": "<Markdown 형식의 한국어 추천 근거. 아래 형식을 반드시 따를 것>"
}}

## Reasoning Format (Markdown)
The "reasoning" field MUST follow this exact Markdown structure.
IMPORTANT: Do NOT use Markdown tables. Use lists instead.

### 📋 추천 요약
> 한 문장으로 이 가중치 배분의 핵심 전략을 설명

### 📊 가중치 배분
(가중치 높은 순으로 8개 모두 나열. 아래 형식 그대로 사용:)
- 🔴 **completeness** — 18점 (상)
- 🔴 **class_balance** — 16점 (상)
- 🟡 **validity** — 12점 (중)
- ...

(🔴=상(15+), 🟡=중(8~14), 🟢=하(0~7))

### 🔍 상세 근거
(가중치 높은 순서대로 8개 지표 모두 설명. 아래 형식:)

#### 🔴 completeness (18점)
설명 2~3문장. 참조 문서 인용 시 "**문서 전체 이름**에 따르면..." 형식으로 볼드 처리.

#### 🟡 validity (12점)
설명 2~3문장.

(이런 식으로 8개 지표를 빠짐없이 #### 소제목으로 작성)
"""

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
5. Base ALL recommendations on the reference documents provided. Do not hallucinate techniques or facts not in the documents.
6. When citing a reference document, use its FULL NAME (e.g., "**Kaggle Telco Customer Churn 분석**에 따르면...") with bold.
7. You MUST use Markdown tables where appropriate (e.g., technique comparisons). Tables render correctly in our frontend.

## Report Structure (follow this EXACTLY)

### 📊 종합 평가
> 전체 점수와 등급을 한 문장으로 요약

**주요 지표 현황:**
- ✅ **지표명** — 점수% (간단한 한 줄 해석)
- ✅ **지표명** — 점수%
- ⚠️ **지표명** — 점수% ← 개선 필요
- ❌ **지표명** — 점수% ← 심각

(✅=90%이상 양호, ⚠️=80~90% 주의, ❌=80%미만 심각. 8개 지표를 점수 높은 순으로 모두 나열)

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
    "01_missing_value_handling": "scikit-learn 결측치 처리 기법 가이드",
    "02_outlier_detection_treatment": "scikit-learn 이상치 탐지/처리 가이드",
    "03_class_imbalance_solutions": "imbalanced-learn 클래스 불균형 해결 가이드",
    "04_feature_scaling": "scikit-learn 피처 스케일링 가이드",
    "05_duplicate_detection": "pandas 중복 데이터 탐지 가이드",
    "06_data_type_validation": "scikit-learn 데이터 타입/인코딩 가이드",
    "07_consistency_standardization": "pandas 일관성 표준화 가이드",
    "08_feature_correlation_management": "scikit-learn 피처 상관관계 관리 가이드",
    "01_iso_25012_quality_dimensions": "ISO/IEC 25012 데이터 품질 차원 정의",
    "02_ai_ml_data_quality": "AI/ML 데이터 품질 요구사항 (ISO 5259 기반)",
    "03_google_rules_of_ml": "Google Rules of Machine Learning",
    "04_task_specific_requirements": "ML 태스크별 데이터 품질 요구사항",
    "05_quality_impact_on_performance": "데이터 품질이 모델 성능에 미치는 영향",
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


def generate_weights(purpose: str, search_results: list[dict]) -> dict:
    """1단계: 검색 결과를 바탕으로 가중치 추천 생성

    Returns:
        {"weights": {...}, "reasoning": "..."}
    """
    if not ANTHROPIC_API_KEY:
        return {
            "weights": {
                "completeness": 20, "uniqueness": 15, "validity": 10,
                "consistency": 10, "outlier_ratio": 10, "class_balance": 10,
                "feature_correlation": 10, "value_accuracy": 15,
            },
            "reasoning": "[API 키 미설정] 기본 가중치를 반환합니다.",
        }

    context = _build_context(search_results)
    prompt = WEIGHT_PROMPT.format(context=context, purpose=purpose)

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = _strip_code_block(response.content[0].text.strip())

    try:
        result = json.loads(response_text)
        weights = result.get("weights", {})
        reasoning = result.get("reasoning", "")

        # 가중치 합계 검증
        total = sum(weights.values())
        if total != 100:
            # 합계가 100이 아니면 정규화
            factor = 100 / total if total > 0 else 1
            weights = {k: round(v * factor) for k, v in weights.items()}
            # 반올림 오차 보정
            diff = 100 - sum(weights.values())
            if diff != 0:
                max_key = max(weights, key=weights.get)
                weights[max_key] += diff

        # 가중치를 0~1 비율로 변환 (프론트엔드 호환)
        weights_ratio = {k: v / 100.0 for k, v in weights.items()}

        return {"weights": weights_ratio, "reasoning": reasoning}

    except (json.JSONDecodeError, KeyError):
        return {
            "weights": {
                "completeness": 0.20, "uniqueness": 0.15, "validity": 0.10,
                "consistency": 0.10, "outlier_ratio": 0.10, "class_balance": 0.10,
                "feature_correlation": 0.10, "value_accuracy": 0.15,
            },
            "reasoning": f"[파싱 실패] 기본 가중치를 반환합니다. 원본 응답: {response_text[:200]}",
        }


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
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text.strip()
