package com.geomsahaejo.scorecard.jobresult.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobResultResponse(
        Long jobId,
        BigDecimal totalScore,
        String resultS3Key,
        String reportS3Key,
        LocalDateTime createdAt,
        // 워커가 산출한 항목별 점수 JSON 원문(패스스루). 비교 UI 가 직접 파싱.
        String resultDetail,
        // 재진단(자식 Job) 인 경우 부모 결과 요약. 1차 진단이면 null.
        ParentResultDto parent
) {
}
