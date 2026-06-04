"""map-reduce 분산 seam — 팀원 원본 cell을 수정하지 않고 병렬화.

목적: 무거운 부분(임베딩 추출 + per-item 통계)을 워커들에 분산(map)하고,
전역 지표(중복/일관성/이상치/임베딩 기반 kNN·MI)는 집계 노드에서 1회 계산(reduce).

원칙:
- 팀원 cell(image_cell.py / text_cell.py)의 내부 함수를 import해서 **그대로 재사용**.
  공식·상수를 복제하지 않고 원본 정의에 의존 → 동기화 안전.
- map 결과는 Celery JSON 직렬화를 통과해야 하므로 numpy를 list/네이티브로 변환.
- 데이터가 cap 이하면 단건(compute_dsc_image/text)과 동일 결과(전수 계산).

각 modality는 두 함수:
- *_map(items, labels, use_embeddings) → 부분결과 dict (JSON-safe)
- *_reduce(partials, weights, ...)     → {score, grade, <지표...>, metrics}
"""
from __future__ import annotations

import hashlib
from collections import Counter
from math import log

import numpy as np

from . import image_cell as _img
from . import text_cell as _txt
from .shared_metrics import to_grade

# 임베딩 집계 시 비용 상한 (원본 cell의 sample_cap과 동일 사양)
_IMG_EMBED_CAP = 2000
_TXT_EMBED_CAP = 1000


# =====================================================================
# 공통 헬퍼
# =====================================================================

def _dup_complement(hashes):
    """1 - (중복 hash 비율). 원본 cell의 uniqueness 정의와 동일."""
    n = len(hashes)
    if n <= 1:
        return 1.0
    counts = Counter(hashes)
    duplicates = sum(c - 1 for c in counts.values() if c > 1)
    return float(1.0 - duplicates / n)


def _entropy_consistency(keys):
    """카테고리 key 분포의 정규화 entropy 보수 (1=완전 일관)."""
    if len(keys) <= 1:
        return 1.0
    counts = Counter(keys)
    if len(counts) <= 1:
        return 1.0
    probs = np.array([c / len(keys) for c in counts.values()])
    ent = float(-(probs * np.log(probs)).sum())
    max_ent = log(len(counts))
    return float(1.0 - ent / max_ent) if max_ent > 0 else 1.0


def _iqr_outlier_complement(values):
    """IQR 기반 non-outlier 비율. 원본 cell의 outlier_ratio 정의와 동일."""
    arr = np.asarray(values, dtype=float)
    if len(arr) < 4:
        return 1.0
    q1, q3 = np.percentile(arr, 25), np.percentile(arr, 75)
    iqr = q3 - q1
    if iqr == 0:
        return 1.0
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    outliers = int(((arr < lower) | (arr > upper)).sum())
    return float(1.0 - outliers / len(arr))


def _subsample_feats(feats, labels, cap, random_state=1):
    """집계된 feature가 cap을 넘으면 균일 subsample (원본 sample_cap 사양 보존)."""
    feats = np.asarray(feats, dtype=float)
    y = np.asarray(labels)
    if cap and len(feats) > cap:
        idx = np.random.RandomState(random_state).choice(len(feats), cap, replace=False)
        return feats[idx], y[idx]
    return feats, y


def _finalize(metrics, weights, group_breakdown=None):
    """metrics dict + 가중치 → {score, grade, <flat 지표>, metrics}. 원본 cell 반환과 동일 구조.

    group_breakdown(선택)은 부가 필드로만 부착 — 집계식(score)에는 영향 없음.
    """
    score = sum(metrics[k] * weights[k] for k in weights) * 100
    rounded = {k: round(float(v), 4) for k, v in metrics.items()}
    result = {'score': round(score, 2), 'grade': to_grade(score),
              **rounded, 'metrics': rounded}
    if group_breakdown is not None:
        result['groupBreakdown'] = group_breakdown
    return result


# =====================================================================
# 그룹(클래스)별 분해 — 세분화 진단
# 설계: docs/sessions/granular-diagnosis/2026-06-04-세분화-진단-설계.md
# A형 지표(per-item 점수 존재)만 라벨로 group-by. B형(중복/임베딩)은 제외.
# =====================================================================

def _class_name_fn(class_names):
    """라벨 정수 → 사람이 읽는 클래스명. class_names 없으면 문자열화."""
    def name(label):
        if class_names and 0 <= label < len(class_names):
            return str(class_names[label])
        return str(label)
    return name


def _sort_asc(d):
    """그룹맵을 점수 오름차순(나쁜 그룹 먼저)으로 정렬한 dict 반환."""
    return dict(sorted(d.items(), key=lambda kv: kv[1]))


def _group_breakdown(labels, per_item_metrics, special_metrics, class_names=None):
    """공통 그룹 분해 빌더.

    labels: per-item 라벨(int) 리스트.
    per_item_metrics: {metric_name: per_item_value_list} — 그룹별 평균으로 집계할 A형 지표.
    special_metrics: {metric_name: (per_item_value_list, agg_fn)} — 그룹별 agg_fn(list) 적용(IQR/entropy).
    반환: {unit, groups, counts, metrics} (metrics 각 지표맵은 오름차순 정렬).
    """
    name = _class_name_fn(class_names)
    idx_by = {}  # 단일 패스: 라벨 카디널리티가 커도 O(n)
    for i, l in enumerate(labels):
        idx_by.setdefault(int(l), []).append(i)
    groups = sorted(idx_by)
    counts = {name(g): len(idx_by[g]) for g in groups}

    metrics = {}
    for mname, values in per_item_metrics.items():
        metrics[mname] = _sort_asc({
            name(g): round(float(np.mean([values[i] for i in idx_by[g]])), 4)
            for g in groups
        })
    for mname, (values, agg_fn) in special_metrics.items():
        metrics[mname] = _sort_asc({
            name(g): round(float(agg_fn([values[i] for i in idx_by[g]])), 4)
            for g in groups
        })
    return {'unit': 'class', 'groups': [name(g) for g in groups],
            'counts': counts, 'metrics': metrics}


# =====================================================================
# IMAGE
# =====================================================================

def image_map(images, labels, use_embeddings=True):
    """워커 1개 배치 → per-item 통계 + (선택)임베딩. JSON-safe dict 반환."""
    mask_ratios, size_keys, mean_intensities = [], [], []
    valids, sample_qualities, hashes = [], [], []

    try:
        import imagehash
        from PIL import Image
        _have_phash = True
    except ImportError:
        _have_phash = False

    for img in images:
        arr = _img._to_np_uint8(img)
        # completeness: 모든 채널이 0(black) 근처인 픽셀 비율
        is_mask = np.all(np.abs(arr.astype(int) - 0) <= 2, axis=-1)
        mask_ratios.append(float(is_mask.mean()))
        # consistency: (H,W,C) key
        c = arr.shape[2] if arr.ndim == 3 else 1
        size_keys.append(f'{arr.shape[0]}x{arr.shape[1]}x{c}')
        # outlier: mean intensity
        mean_intensities.append(float(arr.mean()))
        # validity: load 성공
        valids.append(bool(arr.size > 0 and arr.ndim >= 2))
        # sample_quality: blur(Laplacian var) + contrast(RMS), 원본 norm(200/50)
        gray = arr.mean(axis=-1).astype(np.uint8) if arr.ndim == 3 else arr
        lap_var = _img._laplacian_variance(gray)
        rms = float(gray.std())
        sample_qualities.append((min(1.0, lap_var / 200.0) + min(1.0, rms / 50.0)) / 2)
        # uniqueness: perceptual hash
        if _have_phash:
            pil = img if not isinstance(img, np.ndarray) else Image.fromarray(_img._to_np_uint8(img).squeeze())
            hashes.append(str(imagehash.phash(pil)))
        else:
            hashes.append(str(_img._phash_fallback(_img._to_np_uint8(img))))

    partial = {
        'modality': 'image',
        'n': len(images),
        'mask_ratios': mask_ratios,
        'size_keys': size_keys,
        'mean_intensities': mean_intensities,
        'valids': valids,
        'sample_qualities': sample_qualities,
        'hashes': hashes,
        'labels': [int(x) for x in np.asarray(labels).reshape(-1).tolist()],
        'feats': [],
    }
    if use_embeddings and len(images) > 0:
        feats, _ = _img._extract_features(images, sample_cap=None)
        partial['feats'] = feats.astype(float).tolist()
    return partial


def image_reduce(partials, weights=None, use_embeddings=True, random_state=1, class_names=None):
    """N개 배치 부분결과 → image cell 점수. compute_dsc_image와 동일 출력 구조.

    class_names가 주어지면 클래스별 분해(groupBreakdown)를 부가 산출(점수 불변).
    """
    w = weights or _img.DEFAULT_WEIGHTS_IMAGE
    mask_ratios, size_keys, mean_intensities = [], [], []
    valids, sample_qualities, hashes, labels, feats = [], [], [], [], []
    for p in partials:
        mask_ratios += p['mask_ratios']
        size_keys += p['size_keys']
        mean_intensities += p['mean_intensities']
        valids += p['valids']
        sample_qualities += p['sample_qualities']
        hashes += p['hashes']
        labels += p['labels']
        feats += p['feats']

    n = len(labels)
    metrics = {
        'completeness_image': 1.0 - float(np.mean(mask_ratios)) if mask_ratios else 1.0,
        'uniqueness': _dup_complement(hashes),
        'validity': float(np.mean(valids)) if valids else 1.0,
        'consistency': _entropy_consistency(size_keys),
        'outlier_ratio': _iqr_outlier_complement(mean_intensities),
        'class_balance': float(_img.calc_class_balance(np.asarray(labels))) if labels else 1.0,
        'sample_quality_image': float(np.mean(sample_qualities)) if sample_qualities else 1.0,
    }
    if use_embeddings and n >= 10 and len(feats) > 0:
        f, y = _subsample_feats(feats, labels, _IMG_EMBED_CAP, random_state)
        metrics['feature_correlation'] = _img._calc_feature_correlation_from_feats(f)
        metrics['label_consistency'] = (
            _img._calc_label_consistency_from_feats(f, y, k=5) if len(f) >= 6 else 1.0)
        metrics['feature_informativeness'] = _img._calc_feature_informativeness_from_feats(
            f, y, random_state=random_state)
    else:
        metrics['feature_correlation'] = 1.0
        metrics['label_consistency'] = 1.0
        metrics['feature_informativeness'] = 1.0

    breakdown = None
    if labels:
        breakdown = _group_breakdown(
            labels,
            per_item_metrics={
                'completeness_image': [1.0 - m for m in mask_ratios],
                'validity': [float(v) for v in valids],
                'sample_quality_image': sample_qualities,
            },
            special_metrics={
                'outlier_ratio': (mean_intensities, _iqr_outlier_complement),
                'consistency': (size_keys, _entropy_consistency),
            },
            class_names=class_names,
        )
    return _finalize(metrics, w, group_breakdown=breakdown)


# =====================================================================
# TEXT (classification)
# =====================================================================

def text_map(texts, labels, use_embeddings=True):
    """워커 1개 배치 → per-item 텍스트 통계 + (선택)임베딩. JSON-safe dict."""
    texts = _txt._ensure_text_list(texts)
    completeness_ratios, hashes, valids, token_counts, sample_qualities = [], [], [], [], []
    for t in texts:
        toks = _txt._tokenize_whitespace(t)
        # completeness: protected/빈 토큰 비율
        if not toks:
            completeness_ratios.append(1.0)
        else:
            bad = sum(1 for tok in toks if tok in _txt._PROTECTED or not tok.strip())
            completeness_ratios.append(bad / len(toks))
        # uniqueness hash
        hashes.append(hashlib.sha256(
            _txt._normalize(t).encode('utf-8', errors='replace')).hexdigest())
        # validity
        ok = False
        try:
            if t:
                t.encode('utf-8')
                ok = len(toks) >= 1
        except UnicodeEncodeError:
            ok = False
        valids.append(bool(ok))
        # outlier / consistency: token count
        token_counts.append(int(len(toks)))
        # sample_quality: TTR + length adequacy
        if not toks:
            sample_qualities.append(0.0)
        else:
            ttr = len(set(toks)) / len(toks)
            sample_qualities.append((min(1.0, ttr * 2.0) + min(1.0, len(toks) / 20.0)) / 2)

    partial = {
        'modality': 'text',
        'n': len(texts),
        'completeness_ratios': completeness_ratios,
        'hashes': hashes,
        'valids': valids,
        'token_counts': token_counts,
        'sample_qualities': sample_qualities,
        'labels': [int(x) for x in np.asarray(labels).reshape(-1).tolist()],
        'feats': [],
    }
    if use_embeddings and len(texts) > 0:
        feats, _ = _txt._extract_features(texts, sample_cap=None)
        partial['feats'] = feats.astype(float).tolist()
    return partial


def text_reduce(partials, weights=None, use_embeddings=True, random_state=1, class_names=None):
    """N개 배치 부분결과 → text cell 점수. compute_dsc_text와 동일 출력 구조.

    class_names가 주어지면 클래스별 분해(groupBreakdown)를 부가 산출(점수 불변).
    """
    w = weights or _txt.DEFAULT_WEIGHTS_TEXT
    completeness_ratios, hashes, valids, token_counts = [], [], [], []
    sample_qualities, labels, feats = [], [], []
    for p in partials:
        completeness_ratios += p['completeness_ratios']
        hashes += p['hashes']
        valids += p['valids']
        token_counts += p['token_counts']
        sample_qualities += p['sample_qualities']
        labels += p['labels']
        feats += p['feats']

    # consistency: token count 5-bucket entropy (원본 _LEN_BUCKETS 사용)
    buckets = _txt._LEN_BUCKETS
    counts = np.zeros(len(buckets) - 1, dtype=int)
    for tc in token_counts:
        for i in range(len(buckets) - 1):
            if buckets[i] <= tc < buckets[i + 1]:
                counts[i] += 1
                break
    nonzero = counts[counts > 0]
    if len(nonzero) <= 1:
        consistency = 1.0
    else:
        probs = nonzero / nonzero.sum()
        ent = float(-(probs * np.log(probs)).sum())
        max_ent = log(len(nonzero))
        consistency = float(1.0 - ent / max_ent) if max_ent > 0 else 1.0

    n = len(labels)
    metrics = {
        'completeness_text': 1.0 - float(np.mean(completeness_ratios)) if completeness_ratios else 1.0,
        'uniqueness': _dup_complement(hashes),
        'validity': float(np.mean(valids)) if valids else 1.0,
        'consistency': consistency,
        'outlier_ratio': _iqr_outlier_complement(token_counts),
        'class_balance': float(_txt.calc_class_balance(labels)) if labels else 1.0,
        'sample_quality_text': float(np.mean(sample_qualities)) if sample_qualities else 1.0,
    }
    if use_embeddings and n >= 10 and len(feats) > 0:
        f, y = _subsample_feats(feats, labels, _TXT_EMBED_CAP, random_state)
        metrics['feature_correlation'] = _txt._calc_feature_correlation_from_feats(f)
        metrics['label_consistency'] = (
            _txt._calc_label_consistency_from_feats(f, y, k=5) if len(f) >= 6 else 1.0)
        metrics['feature_informativeness'] = _txt._calc_feature_informativeness_from_feats(
            f, y, random_state=random_state)
    else:
        metrics['feature_correlation'] = 1.0
        metrics['label_consistency'] = 1.0
        metrics['feature_informativeness'] = 1.0

    breakdown = None
    if labels:
        # consistency: per-item 길이 버킷 key(원본 _LEN_BUCKETS) → 그룹별 entropy 보수.
        # _entropy_consistency(bucket_keys)는 위 전역 consistency의 5-슬롯 entropy와 정의상 동치
        # (둘 다 "등장 버킷 분포의 정규화 entropy 보수"). 한쪽만 고치면 정의가 어긋나니 주의.
        def _bucket_key(tc):
            for i in range(len(buckets) - 1):
                if buckets[i] <= tc < buckets[i + 1]:
                    return i
            return -1
        bucket_keys = [_bucket_key(tc) for tc in token_counts]
        breakdown = _group_breakdown(
            labels,
            per_item_metrics={
                'completeness_text': [1.0 - r for r in completeness_ratios],
                'validity': [float(v) for v in valids],
                'sample_quality_text': sample_qualities,
            },
            special_metrics={
                'outlier_ratio': (token_counts, _iqr_outlier_complement),
                'consistency': (bucket_keys, _entropy_consistency),
            },
            class_names=class_names,
        )
    return _finalize(metrics, w, group_breakdown=breakdown)
