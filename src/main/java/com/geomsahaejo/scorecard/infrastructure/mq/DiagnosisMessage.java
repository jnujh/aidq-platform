package com.geomsahaejo.scorecard.infrastructure.mq;

import java.util.Map;

public record DiagnosisMessage(
        Long jobId,
        Long userId,
        String s3Key,
        String originalFilename,
        Map<String, Double> weights,
        // 비정형 라우팅용. null/미지정이면 엔진이 tabular(정형)로 처리 → 기존 동작 유지.
        String dataType,     // 'image' | 'text' | 'tabular'
        String task,         // 'classification' | 'regression'
        String textColumn,   // 텍스트 진단 시 텍스트 열 이름 (선택)
        String labelColumn   // 텍스트 진단 시 라벨 열 이름 (선택)
) {
}
