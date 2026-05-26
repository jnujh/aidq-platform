package com.geomsahaejo.scorecard.infrastructure.llm;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

class LlmServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("가중치 응답 JSON 파싱 성공")
    void parseWeightResponse_success() {
        LlmService service = new LlmService("http://localhost:8001", objectMapper);

        String response = """
                {
                  "weights": {
                    "completeness": 0.20,
                    "uniqueness": 0.15,
                    "validity": 0.10,
                    "consistency": 0.10,
                    "outlier_ratio": 0.10,
                    "class_balance": 0.15,
                    "feature_correlation": 0.10,
                    "value_accuracy": 0.10
                  },
                  "reasoning": "이탈 예측에서는 class_balance가 중요합니다."
                }
                """;

        WeightRecommendation result = ReflectionTestUtils.invokeMethod(
                service, "parseWeightResponse", response);

        assertThat(result).isNotNull();
        assertThat(result.weights()).hasSize(8);
        assertThat(result.weights().get("class_balance")).isEqualTo(0.15);
        assertThat(result.reasoning()).contains("class_balance");
    }

    @Test
    @DisplayName("가중치 응답 파싱 - 빈 reasoning")
    void parseWeightResponse_emptyReasoning() {
        LlmService service = new LlmService("http://localhost:8001", objectMapper);

        String response = """
                {
                  "weights": {
                    "completeness": 0.20, "uniqueness": 0.15, "validity": 0.10,
                    "consistency": 0.10, "outlier_ratio": 0.10, "class_balance": 0.10,
                    "feature_correlation": 0.10, "value_accuracy": 0.15
                  },
                  "reasoning": ""
                }
                """;

        WeightRecommendation result = ReflectionTestUtils.invokeMethod(
                service, "parseWeightResponse", response);

        assertThat(result).isNotNull();
        assertThat(result.weights()).hasSize(8);
    }
}
