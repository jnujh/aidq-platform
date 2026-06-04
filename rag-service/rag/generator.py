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
4. **Grounding (인용 방식 매우 중요)**: 자료(Source)가 관련 있으면 그 **실제 데이터셋·도구·표준 이름을 직접 대고**, 그 사례에서 무엇이 중요했는지를 근거로 본 데이터에 유추 연결한다.
   - 좋은 예: "Telco 고객 이탈 데이터셋 분석에서는 클래스 불균형이 모델 성능을 좌우했으므로, 본 데이터에서도 클래스 균형을 우선해야 합니다."
   - 나쁜 예(금지): "참고 자료의 Telco 데이터셋에서…", "참고 자료에서 언급했듯이…", "문서 3에 따르면…". → 사용자는 '참고 자료/문서'가 뭔지 모른다. 그 단어 자체를 쓰지 말 것.
   - 자료가 없으면 데이터 품질 전문가로서 자신감 있게 권고하되 출처를 지어내지 말 것. "(일반 지식)" 같은 꼬리표 금지.
5. Write your reasoning in Korean (한국어).
6. Be specific and concrete — tie each weight to either a cited source or a clearly-marked expert rationale. Avoid vague generic advice.
7. 근거 인용 시 별표(`**...**`)로 감싸지 말 것 — 한글 조사가 뒤에 붙으면 렌더링이 깨져 별표가 그대로 노출된다. 강조는 별표 없이 평문으로.
8. **CRITICAL — use the EXACT metric key names** shown in the JSON template below (PART 1). Do NOT translate, rename, abbreviate, merge, or "improve" them (e.g., keep `label_consistency` exactly as `label_consistency` — never rewrite it as `label_informativeness`). Output the keys in the SAME ORDER as the template. (단, PART 2 reasoning의 사람이 읽는 지표명은 아래 한글명으로 표기.)

## 지표 한글명 (PART 2 reasoning에서만 사용; PART 1 JSON 키는 영문 그대로)
completeness/completeness_text/completeness_image=완전성 · uniqueness=고유성(중복도) · validity=유효성 · consistency=일관성 · outlier_ratio=이상치 비율 · class_balance=클래스 균형 · feature_correlation=특성 상관도 · value_accuracy=값 정확도 · label_consistency=레이블 일관성 · feature_informativeness=특성 정보량 · sample_quality_text/sample_quality_image=샘플 품질

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

## Reasoning (PART 2 형식 — Markdown 표 금지, 리스트 사용. 지표명은 위 '지표 한글명'으로)
### 📋 추천 요약
> 한 문장으로 핵심 전략을 간결하게.

### 📊 가중치 배분
(높은 순으로 {metric_count}개 모두: `- 🔴 (한글 지표명) — N점 (상)`. 🔴=상(15+) 🟡=중(8~14) 🟢=하(0~7))

### 🔍 상세 근거
(높은 순으로 {metric_count}개 모두. `#### (한글 지표명) (N점)` 뒤 1문장으로 짧게.
출처가 있으면 실제 도구·표준·기관명을 자연스러운 문장으로(예: "scikit-learn 가이드에 따르면"), 별표로 감싸지 말 것. 출처가 없으면 전문가 권고로 자연스럽게 쓰고 "(일반 지식)" 같은 꼬리표는 붙이지 말 것.)
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

REPORT_PROMPT = """You are a data quality improvement advisor. Write a CONCISE, scannable improvement guide in Korean (한국어 전용).

## Diagnosis Results
{diagnosis_result}

## User's Data Usage Purpose
"{purpose}"

## Reference Material (우리 지식베이스 검색 결과)
{context}

## 지표 한글명 (영문 키가 보이면 반드시 아래 한글명으로 바꿔 표기)
completeness / completeness_text / completeness_image = 완전성
uniqueness = 고유성(중복도)
validity = 유효성
consistency = 일관성
outlier_ratio = 이상치 비율
class_balance = 클래스 균형
feature_correlation = 특성 상관도
value_accuracy = 값 정확도
label_consistency = 레이블 일관성
feature_informativeness = 특성 정보량
sample_quality_text / sample_quality_image = 샘플 품질

## 세분화 정보 (groupBreakdown) — 있으면 반드시 구체적으로 활용
`groupBreakdown` 필드가 있으면 품질 저하가 어느 그룹에 몰렸는지 데이터로 알 수 있다.
이때는 **추상·추정 표현 금지** — 반드시 그룹 이름과 수치로 콕 짚는다.
- `unit`: "class"면 그룹=클래스(데이터셋 폴더/라벨 이름, 예: desert/ocean/forest), "column"이면 그룹=컬럼 이름.
- `counts`: 그룹별 표본 수. 클래스 균형(class_balance)을 다룰 땐 **counts에서 가장 적은 그룹을 이름+건수로 명시**한다.
- `metrics`: 지표별 "그룹→점수" 맵(오름차순, 맨 앞이 최악, 0~1). 해당 지표를 다룰 땐 **맨 앞(최저) 그룹을 이름+점수로 명시**한다.

규칙 (groupBreakdown 있을 때 — 강제):
- "소수 클래스가 부족한 것으로 추정" 같은 두루뭉술·추정 표현 금지. counts를 읽어
  "데이터셋 중 ocean이 120건으로 desert 400·forest 380 대비 가장 부족"처럼 이름+건수로 단정한다.
- 품질 지표도 "특정 클래스 품질 낮음"이 아니라 "desert 클래스의 샘플 품질이 41%로 최저(ocean 88·forest 85)"처럼 이름+수치로.
- 그룹 이름은 데이터 원래 이름(영문 폴더명이면 그대로 쓰되 자연스러우면 한글 병기 가능). 없는 그룹·수치는 절대 지어내지 말 것.

groupBreakdown이 없으면 (옛 결과 등): 위 구체 지목이 불가하므로 일반 서술로 권고하고,
특정 그룹을 날조하지 말 것(헤지 표현 허용).
※ "groupBreakdown"은 내부 필드명 — 사용자에게 그 단어를 절대 노출하지 말 것
  (없을 때도 "groupBreakdown 정보 부재" 같은 표현 금지, "클래스별 세부 수치가 없어" 정도로 자연스럽게).

## 작성 규칙
1. 전부 한국어. **간결·명료**하게. 장황한 서술·같은 말 반복·불필요한 미사여구 금지. 각 항목은 핵심만 짧게.
2. 지표는 위 '지표 한글명'으로만 표기. 영문 키(feature_informativeness 등)를 그대로 노출하지 말 것.
   그룹/컬럼 이름(사막·바다·소득 등)은 그대로 노출 가능(사용자가 아는 자기 데이터의 이름임).
3. 근거(출처) 표기 — 매우 중요:
   - 자료(Source)를 쓸 땐 그 **실제 데이터셋·도구·표준 이름을 직접 대고** 사례로 연결한다.
     좋은 예: "Telco 고객 이탈 데이터셋 분석에서는 결측이 소수 클래스 손실로 이어졌으므로, 본 데이터에서도 완전성을 우선해야 합니다.", "imbalanced-learn이 제안하는 SMOTE", "ISO/IEC 25012 표준이 정의한".
   - 금지: "참고 자료의 ~", "참고 자료에서 ~", "문서 3", "문서 5" 같은 내부 지칭어 (사용자는 '참고 자료/문서'가 뭔지 모른다 — 그 단어 자체를 쓰지 말 것).
   - 금지: 출처·강조를 별표(`**...**`)로 감싸기 — 한글 조사가 뒤에 붙으면 렌더링이 깨져 별표가 그대로 보인다. 강조는 별표 없이 평문으로.
   - 참조 자료에 없으면 데이터 품질 전문가로서 자신감 있게 권고하되 출처를 지어내지 말 것. ⚠️ "(일반 지식)" 같은 꼬리표는 붙이지 말 것 — 전문성이 떨어져 보인다.
4. 기술 용어엔 괄호로 짧은 설명. 기법 비교는 마크다운 표 사용(프론트에서 정상 렌더).
5. **아래 구조만** 출력. 구조 밖 섹션(최종 정리·추가 권장사항·모니터링 표 등)을 임의로 덧붙이지 말 것.

## 출력 구조 (이대로만, 짧게)

### 📊 종합 평가
> 종합 점수·등급 + 한 문장 핵심 진단. (강점은 여기서 한 줄로만 언급, 별도 섹션 만들지 말 것)

**지표 현황** (점수 높은 순, 모든 지표):
- ✅ 완전성 — 96% · 결측 거의 없음
- ⚠️ 고유성 — 72% · 일부 중복
- ❌ 클래스 균형 — 25% · 심각한 불균형

(기준: ✅ 90%↑ · ⚠️ 80~90% · ❌ 80%↓. 해석은 한 줄로 짧게.)

### 🔧 개선 필요 항목
(80% 미만 지표만, 심각도 높은 순. 각 항목 아래 형식으로 짧게:)

#### ❌ 레이블 일관성 (30%)
- 현황: 한 문장. groupBreakdown이 있으면 추상 표현 금지 — 최저 그룹/최소 클래스를 이름+수치로 명시(예: "ocean이 120건으로 가장 부족", "desert 샘플 품질 41%로 최저").
- 영향: 사용 목적에 미치는 영향 한 문장.
- 해결: 아래 표(3행 이내). 출처는 자연스러운 문장으로 셀 안 또는 표 바로 위 한 줄에. 지목한 그룹부터 개선하도록 안내.

| 기법 | 방법 | 적용 조건 |
|------|------|-----------|
| … | … | … |

### 🚀 우선 실행 3가지
1. (지표) — 목표 한 줄 + 핵심 단계 1~2개
2. …
3. …

Write the guide:
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
    for result in search_results:
        source = result["metadata"].get("source_file", "unknown")
        section = result["metadata"].get("section", "")
        subsection = result["metadata"].get("subsection", "")

        # 사람이 읽을 수 있는 출처명 사용. 'Document N' 같은 번호는 넣지 않는다
        # (LLM이 "문서 3" 식으로 인용하는 것을 막기 위함 — 사용자는 내부 문서를 볼 수 없음).
        display_name = _SOURCE_DISPLAY_NAMES.get(source, source)
        loc = " > ".join(filter(None, [section, subsection]))
        header = f"[Source: {display_name}" + (f" — {loc}" if loc else "") + "]"
        context_parts.append(f"{header}\n{result['content']}")

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


def _salvage_weights_positional(text: str, keys: list[str]) -> dict:
    """모델이 키 이름을 바꿔치기(rename/hallucination)했을 때 위치 기반으로 복구.
    예: label_consistency를 label_informativeness로 바꿔 출력 → 이름 매칭 실패.
    PART1 JSON 블록의 정수 값을 등장 순서대로 추출해 기대 키 순서대로 매핑한다.
    모델은 템플릿이 준 순서를 유지하므로 안전. 값 개수가 정확히 일치할 때만 반환."""
    jm = (re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
          or re.search(r'(\{.*?\})', text, re.DOTALL))
    block = jm.group(1) if jm else text
    values = re.findall(r'"[^"]+"\s*:\s*(\d+)', block)
    if len(values) == len(keys):
        return {k: int(v) for k, v in zip(keys, values)}
    return {}


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
        weights = (_salvage_weights(text, metric_keys)
                   or _salvage_weights_positional(text, metric_keys)
                   or None)
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
