package com.geomsahaejo.scorecard.job.dto;

/**
 * 업로드 시점의 비정형 진단 스펙. 모두 선택값.
 * - dataType: 'image' | 'text' | 'tabular'. null/blank → 정형(tabular) 기존 흐름.
 * - task: 'classification' | 'regression'.
 * - textColumn/labelColumn: 텍스트 CSV 진단 시 열 지정(선택).
 */
public record DiagnosisSpec(
        String dataType,
        String task,
        String textColumn,
        String labelColumn
) {
    public static final DiagnosisSpec TABULAR = new DiagnosisSpec(null, null, null, null);

    public static DiagnosisSpec ofNullable(String dataType, String task,
                                           String textColumn, String labelColumn) {
        return new DiagnosisSpec(dataType, task, textColumn, labelColumn);
    }
}
