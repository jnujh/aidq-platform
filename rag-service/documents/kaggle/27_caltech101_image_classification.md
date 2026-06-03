# Caltech-101 Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: Caltech-101 (Fei-Fei, Fergus, Perona, "Learning Generative Visual Models from Few Training Examples", CVPR 2004 Workshop on Generative-Model Based Vision)
- Distribution: Caltech Vision archive; also `torchvision.datasets.Caltech101`
- License: research use (CC BY 4.0 on the modern Caltech mirror)
- Known for being the dataset that surfaced "category bias" / dataset-bias concerns (Ponce et al., 2006) due to centered, stereotyped object poses

## Dataset Overview
- Images: ~9,144 across 101 object categories + 1 background/clutter category (102 total)
- Size: VARIABLE — most images roughly 300×200 pixels, mixed aspect ratios; mostly color (RGB) but some grayscale
- Classes: 101 object categories (e.g. airplanes, faces, motorbikes, accordion, anchor)
- Task: Multi-class image classification (object recognition)
- Domain: Computer Vision / Object Recognition
- Balance: SEVERELY imbalanced — per-class counts range from ~31 (lowest) to ~800 (airplanes, motorbikes, faces) per class

## Data Quality Issues Found

### Class Balance (Most Important)
- Caltech-101 is the textbook example of a strongly IMBALANCED benchmark: a handful of categories ("airplanes" ~800, "motorbikes" ~798, "faces" ~435) dominate while the median class has only ~50 images and the smallest (~31).
- min/ideal class_balance score is LOW (~0.04 raw min-class ratio). This is a real, dataset-defining property.
- Fix: report per-class metrics; oversample + augment minority classes; the standard protocol fixes train size (15 or 30 per class) precisely to neutralize this imbalance.

### Consistency
- Image SIZE and aspect ratio vary widely (no fixed resolution), and color mode is mixed (mostly RGB, some grayscale) → consistency is genuinely LOW, unlike the curated 32×32/28×28 benchmarks.
- Fix: `transforms.Resize` to a common size and convert all to a canonical 3-channel mode before ResNet18 embedding.

### Sample Quality (Image) / Dataset Bias
- Objects are typically centered, well-lit, and in stereotyped canonical poses (Ponce et al. 2006 critique) — sample_quality is generally HIGH, but this very cleanliness is a bias: low intra-class pose variance.
- A small number of grayscale or low-resolution images pull the blur/contrast distribution.

### Label Consistency
- Categories are fairly distinct (airplane vs accordion), so label_consistency is moderate-to-high — easier than fine-grained sets. The main ambiguity is the "BACKGROUND_Google" clutter class, which by design contains heterogeneous non-object images.
- Fix: treat the background/clutter class separately; it will read as label-inconsistent because it is not a coherent visual category.

### Validity, Completeness, Uniqueness
- Decode success is high (validity ~1.0); few masked pixels. Some near-duplicate or web-sourced repeats exist → run imagehash phash dedup.

### Feature Informativeness / Correlation
- Distinct categories + canonical poses → ResNet18 embeddings separate the majority classes well; feature_informativeness is high for well-represented classes but unreliable for the ~31-image tail.

## Weight Recommendation Guidance
- Raise `class_balance` to the TOP weight (~0.20) — severe imbalance is the dataset's defining quality issue.
- Raise `consistency` (~0.15) — variable size + mixed color mode genuinely fails uniformity (unlike CIFAR/MNIST).
- Keep `label_consistency` moderate (~0.12); flag the background/clutter class separately.
- Apply `uniqueness` (~0.10) for web-sourced near-duplicates.
- Down-weight `validity`, `completeness_image` — generally clean.

## Key Insights
- CLASS_BALANCE dominates: Caltech-101 is the canonical imbalanced benchmark (~31 to ~800 per class), which is exactly why its standard protocol fixes 15/30 training images per class.
- CONSISTENCY is a real issue here (variable resolution + mixed grayscale/RGB) — the opposite of the uniform 32×32/28×28 benchmarks; resize + canonicalize channels first.
- The "centered canonical pose" cleanliness is a famous dataset BIAS: high sample_quality but low intra-class variance.
- The background/clutter category is intentionally incoherent — expect it to read as label-inconsistent and handle it separately.
