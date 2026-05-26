package com.geomsahaejo.scorecard.job.dto;

public record JobRetryResponse(
        Long jobId,
        Long parentJobId,
        String status
) {
}
