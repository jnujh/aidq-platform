# Fashion-MNIST Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: Fashion-MNIST (Xiao, Rasul, Vollgraf, "Fashion-MNIST: a Novel Image Dataset for Benchmarking Machine Learning Algorithms", arXiv:1708.07747, 2017), released by Zalando Research
- Distribution: Kaggle "Fashion MNIST"; also `torchvision.datasets.FashionMNIST`
- Intended as a drop-in, harder replacement for the original MNIST digits

## Dataset Overview
- Images: 70,000 (60,000 train / 10,000 test)
- Size: 28×28 pixels, GRAYSCALE (1 channel) — fixed, uniform
- Classes: 10 (T-shirt/top, Trouser, Pullover, Dress, Coat, Sandal, Shirt, Sneaker, Bag, Ankle boot)
- Task: Multi-class image classification
- Domain: Computer Vision / Fashion / Retail
- Balance: Exactly 7,000 images per class — perfectly balanced by construction

## Data Quality Issues Found

### Label Consistency (Most Important)
- The hardest, most-confused classes are the upper-body garments: Shirt vs T-shirt/top vs Pullover vs Coat. These overlap heavily in ResNet18 embedding space.
- Published baselines consistently show the lowest per-class accuracy on "Shirt" — a structural label-ambiguity problem, not a model defect.
- k-NN embedding label-agreement drops specifically for these confusable classes; cleanlab/Confident Learning will concentrate flagged errors there.
- Fix: audit the Shirt/T-shirt/Pullover/Coat cluster; relabel or merge ambiguous samples.

### Consistency (Color Mode)
- Native Fashion-MNIST is single-channel grayscale. If a pipeline mixes grayscale originals with RGB-converted copies, the color-mode uniformity check fails.
- ResNet18 expects 3-channel input → grayscale must be replicated to 3 channels consistently. Inconsistent conversion is a real, common pipeline bug.
- Fix: convert ALL images to a single canonical mode (grayscale→3-channel replicate) before embedding.

### Sample Quality (Image)
- 28×28 grayscale silhouettes are low-detail; like CIFAR-10, blur thresholds must be RELATIVE.
- Contrast is generally high (objects are centered on a clean black background), so RMS-contrast rarely flags — sample_quality is driven mostly by the blur/TTR-style detail term.

### Class Balance
- Perfectly balanced (7,000/class) → class_balance ~1.0. Do not over-weight it for this benchmark.

### Uniqueness, Validity, Completeness
- Curated and de-duplicated → uniqueness, validity (decode), and completeness_image are all near 1.0.
- Background is a clean zero (black) field; the black-pixel ratio is high BY DESIGN, so a naive completeness_image (black-pixel) heuristic can misfire — the black region is the canvas, not corruption.

### Feature Informativeness / Correlation
- ResNet18 embeddings separate footwear (Sandal/Sneaker/Ankle boot) and Bag very cleanly → high mutual information for those classes; lower separability inside the shirt cluster.
- feature_correlation is informational here.

## Key Insights
- LABEL_CONSISTENCY dominates, and the confusion is concentrated in the upper-garment cluster (Shirt is the canonical hard class).
- CONSISTENCY (color mode) is a real trap: grayscale-vs-RGB mixing breaks ResNet18 embeddings — convert to one canonical channel layout first.
- The clean black background means a black-pixel completeness heuristic must not treat the canvas as "missing"; calibrate completeness_image for grayscale-on-black datasets.
- Balance/validity/uniqueness are ~1.0 by curation — low diagnostic value, low recommended weight.
