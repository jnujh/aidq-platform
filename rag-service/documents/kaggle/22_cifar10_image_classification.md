# CIFAR-10 Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: CIFAR-10 (Krizhevsky, "Learning Multiple Layers of Features from Tiny Images", 2009)
- Distribution: Kaggle "CIFAR-10 - Object Recognition in Images"; also `torchvision.datasets.CIFAR10`
- Label-noise reference: CIFAR-10N (Wei et al., "Learning with Noisy Labels Revisited", ICLR 2022) — real human re-annotations
- Label-error reference: Northcutt et al., "Pervasive Label Errors in Test Sets" (NeurIPS 2021) found ~0.5% errors even in CIFAR-10 test set

## Dataset Overview
- Images: 60,000 (50,000 train / 10,000 test)
- Size: 32×32 pixels, RGB (3 channels) — fixed, uniform
- Classes: 10 (airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck)
- Task: Multi-class image classification
- Domain: Computer Vision / Object Recognition
- Balance: Exactly 6,000 images per class — perfectly balanced by construction

## Data Quality Issues Found

### Label Consistency (Most Important)
- CIFAR-10 is curated but NOT error-free. The CIFAR-10N study collected real human re-labels and found a noticeable disagreement rate (worst-case rater set ~40% noise; aggregated ~9%).
- Northcutt et al. (2021) identified concrete mislabeled test images (e.g. frog labeled as cat).
- Semantically close pairs (cat↔dog, automobile↔truck, deer↔horse) overlap in ResNet18 embedding space → k-NN label-agreement drops for these classes.
- Fix: audit k-NN embedding disagreements; use Confident Learning (cleanlab) to rank likely label errors.

### Sample Quality (Image)
- 32×32 is extremely low resolution — many images are inherently blurry / low-detail.
- Laplacian-variance blur scores are low across the board; absolute thresholds tuned for high-res photos do not transfer. Compare blur RELATIVE to the dataset distribution, not a fixed cutoff (~100).
- Contrast (RMS) varies — some objects sit against washed-out or saturated backgrounds.

### Class Balance
- Perfectly balanced by design (6,000/class). class_balance score should be ~1.0.
- This is artificial; real-world image collections are rarely balanced. Do NOT over-weight class_balance for CIFAR-10.

### Uniqueness (Duplicates)
- Known near-duplicates exist BETWEEN train and test (documented overlap analyses on Tiny Images).
- Perceptual-hash (phash) dedup flags visually identical crops. Near-duplicate train/test pairs inflate reported accuracy → leakage.
- Fix: imagehash phash, remove near-duplicates before evaluation.

### Validity & Completeness
- As distributed (binary batches / torchvision), decode success is ~100% and there are no masked/black pixels — validity and completeness_image are near 1.0.
- These metrics matter more for scraped/user-uploaded image sets than for CIFAR-10.

### Consistency
- Uniform 32×32 RGB across the whole set → consistency ~1.0.
- Again, a property of curation, not a typical real-world dataset.

### Feature Informativeness / Correlation
- ResNet18 embeddings separate the 10 classes reasonably well → embedding→label mutual information is high (informative).
- feature_correlation (embedding redundancy) is mostly informational for a curated benchmark.

## Key Insights
- For CIFAR-10 the dominant quality dimension is LABEL_CONSISTENCY — curation guarantees completeness/validity/consistency/balance, so those carry little diagnostic signal.
- Blur/contrast thresholds must be RELATIVE because 32×32 is uniformly low-detail.
- Watch train/test near-duplicates (uniqueness) — they silently inflate benchmark accuracy.
- CIFAR-10N and Northcutt et al. prove that even a "clean" academic benchmark has real label errors, which is exactly what k-NN label_consistency and cleanlab are designed to surface.
