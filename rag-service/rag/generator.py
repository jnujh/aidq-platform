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
  "reasoning": "<한국어로 추천 이유를 구체적으로 설명. 참조 문서의 실제 사례를 인용하여 설명>"
}}
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
2. Do NOT use Markdown syntax. Write in plain text only.
3. Use [제목] format for headings, numbered lists (1. 2. 3.) for items.
4. Be specific — reference actual techniques and examples from the reference documents.
5. Structure your report as:
   - [종합 평가]: Overall score interpretation
   - [강점 분석]: Metrics scoring 0.9+ and why they're good
   - [개선 필요 항목]: Metrics scoring below 0.8, with SPECIFIC fix recommendations from the reference documents
   - [실행 가이드]: Top 3 most urgent improvements, prioritized, with concrete steps
6. When mentioning technical terms, add simple explanations in parentheses.
7. Base ALL recommendations on the reference documents provided. Do not hallucinate techniques or facts not in the documents.

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


def _build_context(search_results: list[dict]) -> str:
    """검색 결과를 프롬프트용 컨텍스트 문자열로 변환"""
    context_parts = []
    for i, result in enumerate(search_results, 1):
        source = result["metadata"].get("source_file", "unknown")
        section = result["metadata"].get("section", "")
        subsection = result["metadata"].get("subsection", "")

        location = " > ".join(filter(None, [source, section, subsection]))
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
        max_tokens=2000,
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
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text.strip()
