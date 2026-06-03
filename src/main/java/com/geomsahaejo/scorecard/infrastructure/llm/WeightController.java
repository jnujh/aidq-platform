package com.geomsahaejo.scorecard.infrastructure.llm;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weights")
@RequiredArgsConstructor
public class WeightController {

    private final LlmService llmService;

    @PostMapping("/recommend")
    public ApiResponse<WeightRecommendation> recommend(@RequestBody WeightRequest request) {
        WeightRecommendation recommendation =
                llmService.recommendWeights(request.purpose(), request.dataType());
        return ApiResponse.success(recommendation);
    }

    // dataType: 'image' | 'text' | 'tabular'(또는 null). 모달리티별 가중치 추천 라우팅.
    public record WeightRequest(String purpose, String dataType) {}
}
