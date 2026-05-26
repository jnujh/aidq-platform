package com.geomsahaejo.scorecard.jobresult.dto;

import java.math.BigDecimal;

/**
 * 재진단(자식) 결과 조회 응답에 포함되는 부모 결과 요약.
 * resultDetail 은 워커가 산출한 항목별 점수 JSON 의 원문(패스스루).
 */
public record ParentResultDto(
        Long jobId,
        BigDecimal totalScore,
        String resultDetail
) {
}
