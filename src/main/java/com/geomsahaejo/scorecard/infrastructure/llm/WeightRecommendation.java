package com.geomsahaejo.scorecard.infrastructure.llm;

import java.util.Map;

public record WeightRecommendation(
        Map<String, Double> weights,
        String reasoning
) {
}
