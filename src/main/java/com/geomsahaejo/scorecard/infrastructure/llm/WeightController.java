package com.geomsahaejo.scorecard.infrastructure.llm;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weights")
@RequiredArgsConstructor
public class WeightController {

    private final GeminiService geminiService;

    @PostMapping("/recommend")
    public ApiResponse<WeightRecommendation> recommend(@RequestBody WeightRequest request) {
        WeightRecommendation recommendation = geminiService.recommendWeights(request.purpose());
        return ApiResponse.success(recommendation);
    }

    public record WeightRequest(String purpose) {}
}
