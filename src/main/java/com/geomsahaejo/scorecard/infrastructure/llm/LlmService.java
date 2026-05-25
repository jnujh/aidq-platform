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
import java.util.Map;

@Slf4j
@Service
public class LlmService {

    private final RestClient ragClient;
    private final ObjectMapper objectMapper;
    private final String ragServiceUrl;

    public LlmService(
            @Value("${rag.service-url:http://localhost:8001}") String ragServiceUrl,
            ObjectMapper objectMapper) {
        this.ragServiceUrl = ragServiceUrl;
        this.objectMapper = objectMapper;
        this.ragClient = RestClient.builder()
                .baseUrl(ragServiceUrl)
                .build();
    }

    public WeightRecommendation recommendWeights(String purpose) {
        log.info("[LLM] 가중치 추천 요청 - purpose: {}", purpose);

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of("purpose", purpose));

            String response = ragClient.post()
                    .uri("/api/recommend-weights")
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseWeightResponse(response);

        } catch (Exception e) {
            log.error("[LLM] RAG 가중치 추천 실패", e);
            throw new CustomException(ErrorType.INTERNAL_SERVER_ERROR, "가중치 추천에 실패했습니다.");
        }
    }

    public String generateReport(String diagnosisResultJson, String purpose) {
        log.info("[LLM] 리포트 생성 요청 - purpose: {}", purpose);

        try {
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("diagnosis_result", objectMapper.readTree(diagnosisResultJson));
            if (purpose != null && !purpose.isBlank()) {
                requestMap.put("purpose", purpose);
            }

            String requestBody = objectMapper.writeValueAsString(requestMap);

            String response = ragClient.post()
                    .uri("/api/generate-report")
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("report").asText();

        } catch (Exception e) {
            log.error("[LLM] RAG 리포트 생성 실패", e);
            return null;
        }
    }

    private WeightRecommendation parseWeightResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            Map<String, Double> weights = new HashMap<>();
            JsonNode weightsNode = root.path("weights");
            for (String field : weightsNode.propertyNames()) {
                weights.put(field, weightsNode.path(field).asDouble());
            }

            String reasoning = root.path("reasoning").asText();

            return new WeightRecommendation(weights, reasoning);

        } catch (Exception e) {
            log.error("[LLM] RAG 응답 파싱 실패: {}", response, e);
            throw new CustomException(ErrorType.INTERNAL_SERVER_ERROR, "가중치 응답 파싱에 실패했습니다.");
        }
    }
}
