package com.geomsahaejo.scorecard.job.dto;

import java.time.LocalDateTime;

public record JobStatusResponse(
        Long jobId,
        String originalFilename,
        String dataType,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
