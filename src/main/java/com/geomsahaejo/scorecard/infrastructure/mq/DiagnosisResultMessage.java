package com.geomsahaejo.scorecard.infrastructure.mq;

import java.math.BigDecimal;

public record DiagnosisResultMessage(
        Long jobId,
        boolean success,
        String dataType,
        BigDecimal totalScore,
        String resultDetail,
        String errorMessage
) {
}
