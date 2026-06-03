# Embedding-Based Outlier & OOD Detection — Data Quality Fix Guide

## Source
- Primary: cleanlab outlier detection documentation (`OutOfDistribution`, k-NN-distance scoring on embeddings); scikit-learn `IsolationForest` and `LocalOutlierFactor` documentation
- Secondary: Liu, Ting, Zhou, "Isolation Forest" (ICDM 2008); Lee, Lee, Lee, Shin, "A Simple Unified Framework for Detecting Out-of-Distribution Samples and Adversarial Attacks" (NeurIPS 2018 — Mahalanobis OOD score); McInnes, Healy, Melville, "UMAP: Uniform Manifold Approximation and Projection" (2018); van der Maaten & Hinton, "Visualizing Data using t-SNE" (JMLR 2008)

## When to Use
- Diagnosing image or text datasets via their embeddings (ResNet18 / DistilBERT feature vectors)
- outlier_ratio is low (< 0.8) — some samples sit far from the data manifold
- label_consistency is low and you suspect off-distribution or corrupted samples driving the disagreement
- You need to surface mislabeled, corrupted, or out-of-domain samples before training

## Detection Techniques (operate on embedding vectors)

### 1. Distance / Density Methods

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| k-NN distance | Score each sample by mean distance to its k nearest embedding neighbors; large ⇒ outlier | General default; cleanlab uses this for outlier scoring |
| Mahalanobis distance (Lee et al. 2018) | Distance to class-conditional Gaussian (shared covariance) in embedding space | Strong OOD score when class structure is reliable; needs enough per-class samples |
| Local Outlier Factor | Compare a sample's local density to its neighbors' density | Detects local outliers in varying-density regions |

### 2. Model-Based Methods

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Isolation Forest (Liu et al. 2008) | Random partitioning; samples isolated in few splits are anomalies | Scales to many embeddings; no distance metric assumptions |
| cleanlab `OutOfDistribution` | Wraps k-NN-distance OOD scoring on features or predicted probabilities | When you already produce embeddings or `predict_proba` |
| One-Class SVM | Learn a boundary around the dense region | Smaller datasets; sensitive to kernel/nu tuning |

### 3. Visualization & Triage

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| UMAP (McInnes et al. 2018) | 2-D projection preserving global+local structure | Inspect clusters and detached outlier points |
| t-SNE (van der Maaten & Hinton 2008) | 2-D projection emphasizing local neighborhoods | Visualize class overlap; do NOT read distances/sizes literally |
| Color-by-label overlay | Plot embeddings colored by label to spot misplaced points | Localizes likely mislabels near wrong-class clusters |

## Triage Workflow
1. Compute embeddings (ResNet18 for images, DistilBERT mean-pooled for text).
2. Rank samples by an outlier score (k-NN distance or Isolation Forest).
3. Cross-reference high-outlier samples with cleanlab label-issue suspects — overlap ⇒ likely corrupt or mislabeled.
4. Project with UMAP/t-SNE, color by label, and inspect the top-ranked points.
5. Fix: drop true corruptions/OOD, relabel genuine mislabels, keep legitimate rare-but-valid samples.

## Weighting Guidance
Raise `outlier_ratio` weight for datasets aggregated from heterogeneous sources or scraped at scale,
where off-distribution and corrupted samples are common. Keep it low for tightly curated benchmarks.
Treat outlier scores as a ranking, not a hard verdict — a high score can mean "rare but valid," so pair
it with label-issue evidence before removing anything.

## Key Insight
Embeddings turn unstructured data into vectors where classical anomaly detectors (k-NN distance,
Mahalanobis, Isolation Forest) apply directly. The strongest signal comes from the intersection of
outlier scores and cleanlab label-issue rankings: samples flagged by both are the most likely to be
corrupt or mislabeled, while UMAP/t-SNE overlays make that triage visual and explainable.
