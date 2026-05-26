package com.geomsahaejo.scorecard.job.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record JobStatusResponse(
        Long jobId,
        String jobName,
        String originalFilename,
        String dataType,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        // 재진단(자식 Job) 인 경우 부모 Job 의 id. 1차 진단이면 null.
        Long parentJobId,
        // 사용자가 입력한 사용 목적. 재진단 화면에서 부모의 값을 읽기 전용 표시.
        String purpose,
        // 진단 요청 시점의 가중치 스냅샷. 재진단 화면에서 부모의 값을 읽기 전용 표시.
        Map<String, Double> weights
) {
}
