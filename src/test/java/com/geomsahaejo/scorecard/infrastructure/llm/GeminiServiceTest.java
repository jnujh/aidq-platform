package com.geomsahaejo.scorecard.infrastructure.llm;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GeminiServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("API 키 미설정 시 가중치 추천 예외")
    void recommendWeights_noApiKey() {
        GeminiService service = new GeminiService("", objectMapper);

        CustomException ex = assertThrows(CustomException.class,
                () -> service.recommendWeights("ML 학습용"));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.INTERNAL_SERVER_ERROR);
    }

    @Test
    @DisplayName("API 키 미설정 시 리포트 생성은 null 반환")
    void generateReport_noApiKey() {
        GeminiService service = new GeminiService("", objectMapper);

        String report = service.generateReport("{}", "ML 학습용");

        assertThat(report).isNull();
    }

    @Test
    @DisplayName("정상 JSON 응답 파싱 성공")
    void parseResponse_success() {
        GeminiService service = new GeminiService("test-key", objectMapper);

        String response = """
                {
                  "choices": [{
                    "message": {
                      "content": "{\\"weights\\": {\\"completeness\\": 20, \\"uniqueness\\": 15, \\"validity\\": 10, \\"consistency\\": 10, \\"outlier_ratio\\": 10, \\"class_balance\\": 15, \\"feature_correlation\\": 10, \\"value_accuracy\\": 10}, \\"reasoning\\": \\"테스트 이유\\"}"
                    }
                  }]
                }
                """;

        WeightRecommendation result = ReflectionTestUtils.invokeMethod(service, "parseResponse", response);

        assertThat(result).isNotNull();
        assertThat(result.weights()).hasSize(8);
        assertThat(result.reasoning()).isEqualTo("테스트 이유");
    }

    @Test
    @DisplayName("잘못된 JSON 응답 파싱 실패")
    void parseResponse_invalidJson() {
        GeminiService service = new GeminiService("test-key", objectMapper);

        CustomException ex = assertThrows(CustomException.class,
                () -> ReflectionTestUtils.invokeMethod(service, "parseResponse", "invalid json"));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.INTERNAL_SERVER_ERROR);
    }
}
