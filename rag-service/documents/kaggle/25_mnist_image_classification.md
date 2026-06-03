# MNIST Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: MNIST (LeCun, Bottou, Bengio, Haffner, "Gradient-Based Learning Applied to Document Recognition", Proc. IEEE, 1998)
- Derived from NIST Special Database 1 and 3 (handwritten digits from Census Bureau employees and high-school students)
- Distribution: Yann LeCun's MNIST page; Kaggle "Digit Recognizer"; also `torchvision.datasets.MNIST`
- License: open / freely redistributable for research; canonical 60k/10k split fixed since 1998
- Label-error reference: Northcutt et al., "Pervasive Label Errors in Test Sets" (NeurIPS 2021) found a small but real error rate (~0.15%) even in the MNIST test set

## Dataset Overview
- Images: 70,000 (60,000 train / 10,000 test)
- Size: 28×28 pixels, GRAYSCALE (1 channel) — fixed, uniform
- Classes: 10 (digits 0–9)
- Task: Multi-class image classification (handwritten digit recognition)
- Domain: Computer Vision / OCR
- Balance: Near-balanced but NOT exactly equal — counts range roughly 5,400–6,700 per class in train (e.g. digit "1" is most frequent, "5" least)

## Data Quality Issues Found

### Class Balance
- Unlike CIFAR-10 / Fashion-MNIST, MNIST is NOT perfectly balanced. Train counts differ by digit (~6,742 for "1" vs ~5,421 for "5").
- The skew is mild (min/max ratio ~0.80), so class_balance scores ~0.8–0.9 — meaningful but not severe.
- Fix: if a downstream task is sensitive to the minority digit, oversample + augment (but NEVER horizontal-flip digits — it changes the label, e.g. nothing maps cleanly but rotations confuse 6↔9).

### Label Consistency
- Curated and clean, but real errors exist: Northcutt et al. (2021) flagged concrete mislabeled MNIST images. The confusable pairs are 4↔9, 3↔5, 7↔1, and 3↔8 in ResNet18 / k-NN embedding space.
- Some hand-drawn digits are genuinely ambiguous (a sloppy "4" with a closed top looks like "9").
- Fix: k-NN embedding audit focused on the 4/9 and 3/5/8 clusters; cleanlab Confident Learning to rank suspects.

### Sample Quality (Image)
- 28×28 grayscale strokes are low-detail; blur thresholds must be RELATIVE (an absolute Laplacian-variance cut tuned for high-res photos does not transfer).
- Contrast is high by design — white strokes on a clean black canvas — so RMS-contrast rarely flags; sample_quality is driven by the detail/blur term.

### Completeness (Image)
- Background is a zero (black) field, so the black-pixel ratio is high BY DESIGN. A naive completeness_image (black-pixel) heuristic will misfire — the black region is the canvas, not corruption.
- Fix: calibrate completeness_image for grayscale-on-black, or exclude it from weighting.

### Uniqueness, Validity, Consistency
- Curated, de-duplicated, uniform 28×28 grayscale → uniqueness, validity (decode), and consistency are all ~1.0.
- These carry little diagnostic signal here; they matter more for scraped sets.

### Feature Informativeness / Correlation
- Digits are highly separable even with simple features → embedding→label mutual information is very high; feature_informativeness ~1.0.
- feature_correlation is informational for this benchmark.

## Weight Recommendation Guidance
- Raise `label_consistency` (~0.20) — it is the only metric with real diagnostic value, concentrated in the 4/9 and 3/5/8 clusters.
- Give `class_balance` a moderate weight (~0.10–0.12) — unlike CIFAR-10, MNIST has a genuine (mild) imbalance worth surfacing.
- Keep `sample_quality_image` moderate (~0.12) with RELATIVE blur thresholds.
- Down-weight `completeness_image`, `validity`, `uniqueness`, `consistency` — ~1.0 by curation (and completeness misfires on black canvas).

## Key Insights
- MNIST is the cleanest classic benchmark, so LABEL_CONSISTENCY (4↔9, 3↔5↔8) is the dominant real signal; Northcutt et al. proved even MNIST has genuine label errors.
- It is the rare curated benchmark with a real (mild) CLASS_BALANCE skew — do not assume "balanced" the way you would for CIFAR-10 / Fashion-MNIST.
- The clean black background means a black-pixel completeness heuristic must not treat the canvas as "missing".
- Never use horizontal-flip augmentation on digits — it corrupts label semantics.
