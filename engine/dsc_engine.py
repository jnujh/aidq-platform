"""DSC 스코어링 엔진 v3.2
팀원(고준서) 구현을 추출하여 독립 모듈화.
원본: https://github.com/gary5876/capstone-dsc (notebooks/_dev/apply_dsc_engine_v3.py)
"""
import numpy as np
import pandas as pd
import re
from scipy import stats as sp_stats


def calc_completeness(df, target_col, placeholder_numerical=-1, placeholder_categorical='empty'):
    feature_df = df.drop(columns=[target_col], errors='ignore')
    total_cells = feature_df.shape[0] * feature_df.shape[1]
    if total_cells == 0:
        return 1.0
    missing_count = feature_df.isnull().sum().sum()
    if placeholder_numerical is not None:
        for col in feature_df.select_dtypes(include=[np.number]).columns:
            missing_count += (feature_df[col] == placeholder_numerical).sum()
    if placeholder_categorical is not None:
        for col in feature_df.select_dtypes(include=['object', 'category']).columns:
            ph = (placeholder_categorical.get(col, 'empty')
                  if isinstance(placeholder_categorical, dict)
                  else placeholder_categorical)
            missing_count += (feature_df[col].astype(str) == str(ph)).sum()
    return 1.0 - (missing_count / total_cells)


def calc_uniqueness(df, target_col):
    n = len(df)
    if n <= 1:
        return 1.0
    return 1.0 - (df.duplicated().sum() / n)


def calc_validity(df, target_col, numerical_cols, categorical_cols):
    scores = []
    for col in numerical_cols:
        if col not in df.columns:
            continue
        converted = pd.to_numeric(df[col], errors='coerce')
        total = len(df[col].dropna())
        scores.append(converted.notna().sum() / total if total > 0 else 1.0)
    for col in categorical_cols:
        if col not in df.columns:
            continue
        s = df[col].dropna().astype(str)
        if len(s) == 0:
            scores.append(1.0)
            continue
        valid = s.apply(lambda x: 0 < len(x.strip()) < 200)
        scores.append(valid.mean())
    return float(np.mean(scores)) if scores else 1.0


def calc_consistency(df, target_col, categorical_cols):
    if not categorical_cols:
        return 1.0
    scores = []
    for col in categorical_cols:
        if col not in df.columns:
            continue
        s = df[col].dropna().astype(str)
        if len(s) == 0:
            scores.append(1.0)
            continue
        has_suffix = s.apply(lambda x: bool(re.search(r'-\d+$', x)))
        scores.append(1.0 - has_suffix.mean())
    return float(np.mean(scores)) if scores else 1.0


def calc_outlier_ratio(df, target_col, numerical_cols, reference_df=None):
    if not numerical_cols:
        return 1.0
    scores = []
    for col in numerical_cols:
        if col not in df.columns:
            continue
        s = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(s) < 4:
            scores.append(1.0)
            continue
        if reference_df is not None and col in reference_df.columns:
            ref = pd.to_numeric(reference_df[col], errors='coerce').dropna()
            if len(ref) >= 4:
                q1, q3 = ref.quantile(0.25), ref.quantile(0.75)
            else:
                q1, q3 = s.quantile(0.25), s.quantile(0.75)
        else:
            q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            scores.append(1.0)
            continue
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outlier_count = ((s < lower) | (s > upper)).sum()
        scores.append(1.0 - outlier_count / len(s))
    return float(np.mean(scores)) if scores else 1.0


def calc_class_balance(df, target_col):
    counts = df[target_col].value_counts()
    n_classes = len(counts)
    if n_classes <= 1:
        return 1.0
    min_ratio = counts.min() / counts.sum()
    ideal_ratio = 1.0 / n_classes
    return min(min_ratio / ideal_ratio, 1.0)


def calc_feature_correlation(df, target_col, numerical_cols, threshold=0.95):
    cols = [c for c in numerical_cols if c in df.columns]
    if len(cols) < 2:
        return 1.0
    num_df = df[cols].apply(pd.to_numeric, errors='coerce')
    corr = num_df.corr().abs()
    upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
    total_pairs = upper.size - upper.isna().sum().sum()
    if total_pairs == 0:
        return 1.0
    high_corr_pairs = (upper > threshold).sum().sum()
    return 1.0 - (high_corr_pairs / total_pairs)


def calc_value_accuracy(df, target_col, numerical_cols, categorical_cols, reference_df=None):
    if reference_df is None:
        return 1.0
    scores = []
    for col in numerical_cols:
        if col not in df.columns or col not in reference_df.columns:
            continue
        ref = pd.to_numeric(reference_df[col], errors='coerce').dropna()
        cur = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(ref) < 5 or len(cur) < 5:
            scores.append(1.0)
            continue
        ks_stat, _ = sp_stats.ks_2samp(ref, cur)
        scores.append(1.0 - float(ks_stat))
    for col in categorical_cols:
        if col not in df.columns or col not in reference_df.columns:
            continue
        ref_counts = reference_df[col].astype(str).value_counts(normalize=True)
        cur_counts = df[col].astype(str).value_counts(normalize=True)
        all_cats = ref_counts.index.union(cur_counts.index)
        ref_p = ref_counts.reindex(all_cats, fill_value=0)
        cur_p = cur_counts.reindex(all_cats, fill_value=0)
        tvd = 0.5 * (ref_p - cur_p).abs().sum()
        scores.append(1.0 - float(tvd))
    return float(np.mean(scores)) if scores else 1.0


DEFAULT_WEIGHTS = {
    'completeness': 0.20, 'uniqueness': 0.15, 'validity': 0.10,
    'consistency': 0.10, 'outlier_ratio': 0.05,
    'class_balance': 0.05, 'feature_correlation': 0.05,
    'value_accuracy': 0.30,
}


def compute_dsc(df, target_col, numerical_cols, categorical_cols,
                weights=None, reference_df=None):
    """DSC 점수(0~100) + 등급 + 지표별 점수 반환."""
    w = weights or DEFAULT_WEIGHTS
    metrics = {
        'completeness':        calc_completeness(df, target_col),
        'uniqueness':          calc_uniqueness(df, target_col),
        'validity':            calc_validity(df, target_col, numerical_cols, categorical_cols),
        'consistency':         calc_consistency(df, target_col, categorical_cols),
        'outlier_ratio':       calc_outlier_ratio(df, target_col, numerical_cols, reference_df=reference_df),
        'class_balance':       calc_class_balance(df, target_col),
        'feature_correlation': calc_feature_correlation(df, target_col, numerical_cols),
        'value_accuracy':      calc_value_accuracy(df, target_col, numerical_cols, categorical_cols, reference_df=reference_df),
    }
    score = sum(metrics[k] * w[k] for k in w) * 100
    if score >= 90:   grade = 'A'
    elif score >= 75: grade = 'B'
    elif score >= 60: grade = 'C'
    else:             grade = 'D'
    return {'score': round(score, 2), 'grade': grade,
            **{k: round(v, 4) for k, v in metrics.items()}}


def auto_detect_columns(df):
    """DataFrame에서 수치형/범주형 컬럼과 target 컬럼을 자동 판별."""
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

    # target 컬럼 추정: 마지막 컬럼 또는 'target', 'label', 'class' 등
    target_candidates = ['target', 'label', 'class', 'y', 'Churn', 'default']
    target_col = None
    for candidate in target_candidates:
        if candidate in df.columns:
            target_col = candidate
            break
    if target_col is None:
        target_col = df.columns[-1]

    if target_col in numerical_cols:
        numerical_cols.remove(target_col)
    if target_col in categorical_cols:
        categorical_cols.remove(target_col)

    return target_col, numerical_cols, categorical_cols
