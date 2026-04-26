package com.geomsahaejo.scorecard.infrastructure.mq;

import java.util.Map;

public record DiagnosisMessage(
        Long jobId,
        Long userId,
        String s3Key,
        String originalFilename,
        Map<String, Double> weights
) {
}
