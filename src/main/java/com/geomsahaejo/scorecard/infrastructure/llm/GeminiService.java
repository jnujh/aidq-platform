package com.geomsahaejo.scorecard.infrastructure.llm;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(
            @Value("${llm.api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public WeightRecommendation recommendWeights(String purpose) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new CustomException(ErrorType.INTERNAL_SERVER_ERROR, "LLM API 키가 설정되지 않았습니다.");
        }

        String prompt = buildPrompt(purpose);

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(Map.of("role", "user", "content", prompt)),
                    "temperature", 0.3,
                    "response_format", Map.of("type", "json_object")
            ));

            String response = restClient.post()
                    .uri("/chat/completions")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseResponse(response);

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("[LLM] API 호출 실패", e);
            throw new CustomException(ErrorType.INTERNAL_SERVER_ERROR, "LLM 가중치 추천에 실패했습니다.");
        }
    }

    private String buildPrompt(String purpose) {
        return """
                당신은 데이터 품질 진단 전문가입니다.
                사용자가 데이터셋의 사용 목적을 알려주면, 아래 8개 품질 지표의 가중치를 추천해주세요.

                ## 8개 품질 지표
                - completeness: 결측치 비율 (데이터가 얼마나 완전한가)
                - uniqueness: 중복 행 비율 (데이터가 얼마나 유일한가)
                - validity: 타입/형식 유효성 (데이터 형식이 올바른가)
                - consistency: 범주형 표현 일관성 (같은 의미의 값이 통일되어 있는가)
                - outlier_ratio: 이상치 비율 (비정상적인 값이 얼마나 있는가)
                - class_balance: 클래스 균형 (타겟 변수의 클래스 비율이 균형적인가)
                - feature_correlation: 고상관 피처 비율 (피처 간 상관관계가 너무 높지 않은가)
                - value_accuracy: 값 정확성 (값의 분포가 정상적인가)

                ## 규칙
                1. 각 가중치는 0~100 사이의 정수로, 합계가 100이 되어야 합니다
                2. 사용 목적에 따라 중요한 지표는 높이고, 덜 중요한 지표는 낮추세요
                3. 가중치가 0이면 해당 지표가 비활성화됩니다
                4. 추천 이유를 한국어로 자세히 설명해주세요 (각 지표를 왜 이 가중치로 설정했는지)

                ## 응답 JSON 형식 (반드시 이 형식으로)
                {
                  "weights": {
                    "completeness": 20,
                    "uniqueness": 15,
                    "validity": 10,
                    "consistency": 10,
                    "outlier_ratio": 5,
                    "class_balance": 10,
                    "feature_correlation": 5,
                    "value_accuracy": 25
                  },
                  "reasoning": "추천 이유를 여기에 작성"
                }

                ## 사용자의 데이터 사용 목적
                "%s"
                """.formatted(purpose);
    }

    public String generateReport(String diagnosisResultJson, String purpose) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("[LLM] API 키 미설정 — 리포트 생성 건너뜀");
            return null;
        }

        String prompt = buildReportPrompt(diagnosisResultJson, purpose);

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(Map.of("role", "user", "content", prompt)),
                    "temperature", 0.5
            ));

            String response = restClient.post()
                    .uri("/chat/completions")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0)
                    .path("message").path("content").asText();

        } catch (Exception e) {
            log.error("[LLM] 리포트 생성 실패", e);
            return null;
        }
    }

    private String buildReportPrompt(String diagnosisResultJson, String purpose) {
        String purposeSection = (purpose != null && !purpose.isBlank())
                ? "## 사용자의 데이터 사용 목적\n\"%s\"\n\n".formatted(purpose)
                : "";

        return """
                당신은 데이터 품질 진단 전문가입니다.
                아래 진단 결과를 분석하여 한국어로 리포트를 작성해주세요.

                %s## 진단 결과 JSON
                %s

                ## 리포트 작성 규칙
                1. **종합 평가**: 종합 점수와 등급에 대한 전체적인 해석
                2. **강점 분석**: 점수가 높은 지표(0.9 이상)를 짚어서 왜 좋은지 설명
                3. **개선 필요 항목**: 점수가 낮은 지표(0.8 미만)를 짚어서 구체적 개선 방법 제시
                4. **실행 가이드**: 가장 시급한 개선 사항 3가지를 우선순위별로 나열
                5. 전문 용어를 쓸 때는 괄호 안에 쉬운 설명을 추가해주세요
                6. 반드시 한국어로만 작성해주세요. 중국어, 일본어, 영어 등 다른 언어를 절대 섞지 마세요.
                7. "없다", "존재하지 않는다" 등은 반드시 한국어로 표현해주세요.
                8. Markdown 문법을 사용하지 마세요. 순수 텍스트로만 작성해주세요.
                9. 제목은 [종합 평가], [강점 분석] 형태로, 목록은 숫자(1. 2. 3.)로 작성해주세요.
                """.formatted(purposeSection, diagnosisResultJson);
    }

    private WeightRecommendation parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("choices").get(0)
                    .path("message").path("content").asText();

            JsonNode result = objectMapper.readTree(text);

            Map<String, Double> weights = new HashMap<>();
            JsonNode weightsNode = result.path("weights");
            for (String field : weightsNode.propertyNames()) {
                weights.put(field, weightsNode.path(field).asDouble() / 100.0);
            }

            String reasoning = result.path("reasoning").asText();

            return new WeightRecommendation(weights, reasoning);

        } catch (Exception e) {
            log.error("[LLM] 응답 파싱 실패: {}", response, e);
            throw new CustomException(ErrorType.INTERNAL_SERVER_ERROR, "LLM 응답 파싱에 실패했습니다.");
        }
    }
}
