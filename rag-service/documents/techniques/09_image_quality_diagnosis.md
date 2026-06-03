# Image Dataset Quality Diagnosis — Data Quality Fix Guide

## Source
- Primary: cleanlab / Confident Learning — Northcutt, Jiang, Chuang, "Confident Learning: Estimating Uncertainty in Dataset Labels" (JAIR, 2021); Northcutt, Athalye, Mueller, "Pervasive Label Errors in Test Sets Destabilize ML Benchmarks" (NeurIPS 2021 Datasets & Benchmarks)
- Secondary: `imagehash` (perceptual hashing); Pech-Pacheco et al., "Diatom autofocusing in brightfield microscopy: a comparative study" (ICPR 2000) — Laplacian-variance focus measure; `torchvision.transforms` data augmentation; PIL/Pillow decode validation; `torchvision.models.resnet18` embeddings

## When to Use
- Diagnosing an image classification dataset (folder-per-class layout, integer labels)
- label_consistency, sample_quality_image, or class_balance scores are low (< 0.8)

## Image Quality Metrics (DSC image cell, 10 metrics)

| Metric | Meaning | Low score implies |
|--------|---------|-------------------|
| completeness_image | 1 − black/masked pixel ratio | Partially blacked-out / corrupted crops |
| uniqueness | 1 − perceptual-hash duplicate ratio | Near-duplicate images inflate the set |
| validity | Decode/load success ratio | Truncated or unreadable image files |
| consistency | Color-mode + size uniformity | Mixed grayscale/RGB or varying resolutions |
| outlier_ratio | Mean-intensity IQR non-outlier ratio | Over/under-exposed images |
| class_balance | Min-class / ideal ratio | Some classes have far fewer images |
| feature_correlation | ResNet18 embedding redundancy | — (informational) |
| label_consistency | k-NN ResNet18 label agreement (chance-corrected) | Mislabeled images; classes overlap |
| feature_informativeness | embedding→label MI / H(Y) | Features barely predict the label |
| sample_quality_image | blur (Laplacian var) + contrast (RMS) | Blurry or low-contrast images |

## Fix Techniques by Metric

### label_consistency — Confident Learning / cleanlab (highest weight, 0.20)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Confident Learning | Use predicted class probabilities to estimate the label-error joint distribution and rank likely mislabeled samples | Need out-of-sample predicted probabilities (cross-validated) |
| cleanlab `find_label_issues` | Library implementation of Confident Learning; returns a ranked list of suspect indices | scikit-learn / PyTorch classifier with `predict_proba` |
| k-NN embedding audit | Inspect samples whose ResNet18 k-NN neighbors disagree with the given label | Concentrate on confusable class pairs (cat↔dog) |

- Northcutt et al. (2021) found real label errors even in curated test sets (ImageNet, CIFAR-10) using exactly this method.
- Fix: relabel or remove the top-ranked suspects; re-train and re-check.

### sample_quality_image — Laplacian-variance blur + RMS contrast

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Laplacian variance | `cv2.Laplacian(gray, CV2_64F).var()` — low variance ⇒ blurry (Pech-Pacheco et al. 2000) | Threshold is RELATIVE; ~100 is a rough cut for high-res, NOT for 32×32 |
| RMS contrast | Standard deviation of pixel intensities; low ⇒ washed-out | Pair with blur as a blended score |
| Histogram equalization | Redistribute intensities to recover contrast | When low contrast, not low focus |

### uniqueness — perceptual hashing (imagehash)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| phash / dhash | `imagehash.phash(img)` → compare Hamming distance | Near-duplicate detection (resize/recompress-robust) |
| Hash-bucket dedup | Group by hash, keep one per bucket | Remove train/test near-duplicates to stop leakage |

### class_balance — torchvision augmentation (not duplication)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| RandomHorizontalFlip | Mirror images | Most natural-object classes (NOT text/digits) |
| RandomCrop / RandomResizedCrop | Crop + resize variants | Adds positional diversity |
| ColorJitter | Perturb brightness/contrast/saturation/hue | Lighting robustness |
| Oversample minority class | Sample minority more often + augment | Preferred over raw duplication (avoids overfitting) |

### validity & completeness_image — PIL decode validation

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| `Image.open(...).verify()` | Catch truncated/corrupt files at load | Run as an ingestion filter |
| `ImageFile.LOAD_TRUNCATED_IMAGES` | Optionally tolerate partial decode | Only if partial images are acceptable |
| Black/masked-pixel check | Flag crops with high black-pixel ratio | Re-export from source or drop |

### consistency — canonical mode + size

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Resize to common resolution | `transforms.Resize` to a fixed size | Mixed resolutions |
| Convert to canonical channels | grayscale→3-channel replicate for ResNet18 | Mixed grayscale/RGB |

## Weighting Guidance
For classification where label correctness drives model quality, keep `label_consistency` (0.20) and
`sample_quality_image` (0.15) high. Raise `class_balance` when the minority class matters (defect
detection). On curated benchmarks (CIFAR-10, Fashion-MNIST) validity/consistency/completeness are ~1.0
by construction — give them low weight. Treat `feature_correlation` as mostly informational for images.

## Key Insight
Confident Learning (cleanlab) is the rigorous, citable basis for label_consistency: it proved that even
"clean" benchmarks contain real label errors. Pair it with embedding-based k-NN auditing to localize
which class pairs are noisy, and use augmentation — not duplication — to fix class_balance.
