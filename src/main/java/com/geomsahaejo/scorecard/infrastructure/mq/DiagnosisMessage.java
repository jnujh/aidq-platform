package com.geomsahaejo.scorecard.infrastructure.mq;

public record DiagnosisMessage(
        Long jobId,
        Long userId,
        String s3Key,
        String originalFilename
) {
}
