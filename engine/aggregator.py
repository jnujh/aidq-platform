"""부분 결과 합산 (Step 4).

N개 청크의 부분 카운트(compute_partial_metrics)를 합쳐 최종 DSC 점수를 산출하고,
Spring Boot가 기대하는 결과 메시지 형식으로 구성한다.

핵심: 비율/평균은 여기서 1회만 계산 → compute_dsc와 ±0.01 일치.
설계: docs/sessions/parallel-engine/2026-06-01-impl-2-metrics-aggregation.md
"""
import json
import math
from collections import Counter

from dsc_engine import DEFAULT_WEIGHTS


def _mean(scores):
    return float(sum(scores) / len(scores)) if scores else 1.0


def merge_partial_results(partial_results, global_stats, weights=None):
    """N개 부분결과 합산 → compute_dsc와 동일 출력 {score, grade, <8지표>}."""
    w = weights or DEFAULT_WEIGHTS
    numerical_cols = global_stats['numerical_cols']
    categorical_cols = global_stats['categorical_cols']
    quantiles = global_stats.get('quantiles', {})

    # completeness
    miss = sum(p['completeness']['missing_count'] for p in partial_results)
    cells = sum(p['completeness']['total_cells'] for p in partial_results)
    completeness = 1.0 if cells == 0 else 1.0 - miss / cells

    # validity (컬럼별 비율 → 컬럼 평균)
    v_scores = []
    for col in numerical_cols + categorical_cols:
        valid = sum(p['validity'].get(col, {}).get('valid', 0) for p in partial_results)
        total = sum(p['validity'].get(col, {}).get('total', 0) for p in partial_results)
        v_scores.append(1.0 if total == 0 else valid / total)
    validity = _mean(v_scores)

    # consistency (범주형만)
    c_scores = []
    for col in categorical_cols:
        suffix = sum(p['consistency'].get(col, {}).get('suffix_count', 0) for p in partial_results)
        total = sum(p['consistency'].get(col, {}).get('total', 0) for p in partial_results)
        c_scores.append(1.0 if total == 0 else 1.0 - suffix / total)
    consistency = _mean(c_scores)

    # outlier_ratio (전역 Q1/Q3, 컬럼 전체 기준 분기)
    o_scores = []
    for col in numerical_cols:
        total = sum(p['outlier'].get(col, {}).get('valid_total', 0) for p in partial_results)
        oc = sum(p['outlier'].get(col, {}).get('outlier_count', 0) for p in partial_results)
        if col not in quantiles:
            o_scores.append(1.0)
            continue
        iqr = quantiles[col]['q3'] - quantiles[col]['q1']
        if total < 4 or iqr == 0:
            o_scores.append(1.0)
        else:
            o_scores.append(1.0 - oc / total)
    outlier_ratio = _mean(o_scores)

    # class_balance (Counter 병합)
    total_counts = Counter()
    for p in partial_results:
        for label, cnt in p['class_counts'].items():
            total_counts[label] += cnt
    n_classes = len(total_counts)
    if n_classes <= 1:
        class_balance = 1.0
    else:
        s = sum(total_counts.values())
        min_ratio = min(total_counts.values()) / s
        class_balance = min(min_ratio / (1.0 / n_classes), 1.0)

    # feature_correlation (쌍별 sufficient stats → 피어슨 재구성)
    if any(p.get('corr_skipped') for p in partial_results):
        feature_correlation = 1.0
    else:
        agg = {}
        for p in partial_results:
            for e in p['corr_stats']:
                key = (e['ci'], e['cj'])
                a = agg.setdefault(key, {'n': 0, 'sx': 0.0, 'sy': 0.0,
                                         'sxx': 0.0, 'syy': 0.0, 'sxy': 0.0})
                for f in ('n', 'sx', 'sy', 'sxx', 'syy', 'sxy'):
                    a[f] += e[f]
        high, total_pairs = 0, 0
        for a in agg.values():
            n = a['n']
            if n < 2:
                continue
            den_x = n * a['sxx'] - a['sx'] ** 2
            den_y = n * a['syy'] - a['sy'] ** 2
            if den_x <= 0 or den_y <= 0:  # 상수열 → pandas corr NaN → 제외
                continue
            r = min(abs(n * a['sxy'] - a['sx'] * a['sy']) / math.sqrt(den_x * den_y), 1.0)
            total_pairs += 1
            if r > 0.95:
                high += 1
        feature_correlation = 1.0 if total_pairs == 0 else 1.0 - high / total_pairs

    # uniqueness (청크 내 중복 + 샘플 보정)
    sum_dup = sum(p['uniqueness']['dup_count'] for p in partial_results)
    sum_rows = sum(p['uniqueness']['n_rows'] for p in partial_results)
    chunk_ratio = sum_dup / sum_rows if sum_rows > 0 else 0.0
    uniqueness = 1.0 - max(global_stats.get('sample_duplicate_ratio', 0.0), chunk_ratio)

    metrics = {
        'completeness': completeness,
        'uniqueness': uniqueness,
        'validity': validity,
        'consistency': consistency,
        'outlier_ratio': outlier_ratio,
        'class_balance': class_balance,
        'feature_correlation': feature_correlation,
        'value_accuracy': 1.0,
    }
    score = sum(metrics[k] * w[k] for k in w) * 100
    if score >= 90:   grade = 'A'
    elif score >= 75: grade = 'B'
    elif score >= 60: grade = 'C'
    else:             grade = 'D'
    return {'score': round(score, 2), 'grade': grade,
            **{k: round(v, 4) for k, v in metrics.items()}}


def build_result_message(job_id, merged, global_stats, total_rows):
    """Spring Boot DiagnosisResultMessage 형식 (worker.py publish_result와 동일)."""
    numerical_cols = global_stats['numerical_cols']
    categorical_cols = global_stats['categorical_cols']
    target_col = global_stats['target_col']
    n_cols = len(numerical_cols) + len(categorical_cols)

    result_detail = {
        'metrics': {k: v for k, v in merged.items() if k not in ('score', 'grade')},
        'columns': [{'name': c, 'type': 'numeric' if c in numerical_cols else 'categorical'}
                    for c in numerical_cols + categorical_cols],
        'summary': f'종합 점수 {merged["score"]}점 ({merged["grade"]}등급). '
                   f'분석 컬럼 {n_cols}개, 데이터 행 {total_rows}건.',
        'targetColumn': target_col,
        'grade': merged['grade'],
    }
    return {
        'jobId': job_id,
        'success': True,
        'dataType': 'STRUCTURED',
        'totalScore': merged['score'],
        'resultDetail': json.dumps(result_detail, ensure_ascii=False),
        'errorMessage': None,
    }
