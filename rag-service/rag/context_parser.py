"""사용맥락 파싱 모듈 — 한국어 입력에서 task_type, domain 추출 + 영어 번역

Claude API 한 번 호출로 번역 + 구조화 파싱을 동시에 수행한다.
"""
import os
import json

import anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

PARSE_PROMPT = """You are a data science context parser. Given a user's description of their data usage purpose (in Korean or English), extract the following information and respond in JSON format only.

Fields to extract:
1. "query_en": English translation of the full purpose description (for vector search)
2. "task_type": One of [binary_classification, multi_classification, regression, time_series, clustering, recommendation, nlp, anomaly_detection]
3. "domain": One of [telecom, finance, retail, healthcare, hr, ecommerce, web, security, entertainment, marketing, real_estate, transportation, general]
4. "sub_task": A short English phrase describing the specific sub-task (e.g., "churn_prediction", "fraud_detection", "price_prediction")

Rules:
- If the task type is ambiguous, make your best guess based on context clues
- If the domain is not clearly identifiable, use "general"
- The query_en should be a natural English sentence, not just keywords
- Respond with ONLY the JSON object, no other text

User's purpose description:
"{purpose}"
"""


def parse_context(purpose: str) -> dict:
    """사용맥락을 파싱하여 영어 쿼리 + 메타데이터 반환

    Args:
        purpose: 사용자가 입력한 사용맥락 (한국어 또는 영어)

    Returns:
        {
            "query_en": "English translation for search",
            "task_type": "binary_classification",
            "domain": "telecom",
            "sub_task": "churn_prediction"
        }
    """
    if not ANTHROPIC_API_KEY:
        # API 키 없으면 기본값 반환 (개발/테스트용)
        return {
            "query_en": purpose,
            "task_type": "",
            "domain": "",
            "sub_task": "",
        }

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[
            {"role": "user", "content": PARSE_PROMPT.format(purpose=purpose)}
        ],
    )

    response_text = response.content[0].text.strip()

    # Claude가 ```json ... ``` 으로 감싸는 경우 벗겨냄
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        response_text = "\n".join(lines).strip()

    try:
        parsed = json.loads(response_text)
        return {
            "query_en": parsed.get("query_en", purpose),
            "task_type": parsed.get("task_type", ""),
            "domain": parsed.get("domain", "general"),
            "sub_task": parsed.get("sub_task", ""),
        }
    except json.JSONDecodeError:
        # JSON 파싱 실패 시 원문 그대로 사용
        return {
            "query_en": purpose,
            "task_type": "",
            "domain": "",
            "sub_task": "",
        }
