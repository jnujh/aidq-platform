package com.geomsahaejo.scorecard.jobresult.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobResultResponse(
        Long jobId,
        BigDecimal totalScore,
        String resultS3Key,
        String reportS3Key,
        LocalDateTime createdAt
) {
}
