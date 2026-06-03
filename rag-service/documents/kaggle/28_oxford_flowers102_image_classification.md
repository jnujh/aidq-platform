# Oxford 102 Flowers Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: Oxford 102 Flowers (Nilsback, Zisserman, "Automated Flower Classification over a Large Number of Classes", ICVGIP 2008)
- Distribution: Oxford Visual Geometry Group (VGG); also `torchvision.datasets.Flowers102`
- License: research use (VGG flower datasets)
- Designed specifically as a FINE-GRAINED classification benchmark (flower species common to the UK)

## Dataset Overview
- Images: 8,189 total
- Size: VARIABLE resolution, color (RGB); images are not a fixed square
- Classes: 102 flower categories
- Task: Multi-class fine-grained image classification (species recognition)
- Domain: Computer Vision / Fine-Grained Recognition / Botany
- Balance: IMBALANCED — per-class counts range from 40 (minimum) to ~258 per class
- Splits: the official protocol uses a SMALL train (10 images/class = 1,020), a 1,020 validation set, and a LARGE 6,149 test set — train ≪ test, which is unusual

## Data Quality Issues Found

### Label Consistency (Most Important — fine-grained)
- Many species are visually near-identical (multiple petunia/pansy/iris/lily variants). Distinguishing them requires subtle petal/stamen cues → ResNet18 k-NN neighbors frequently land on the wrong species.
- This is a fine-grained problem: label_consistency will read low not because labels are wrong but because inter-class visual distance is tiny.
- Fix: k-NN audit within visually similar species clusters; use fine-grained features (higher-resolution crops, attention to petal structure) rather than generic 224×224 ResNet embeddings; cleanlab to rank genuine mislabels.

### Feature Informativeness / Correlation
- Generic ImageNet ResNet18 embeddings underperform on fine-grained species → embedding→label mutual information is moderate; many classes overlap in embedding space.
- feature_informativeness is genuinely diagnostic here: low MI signals that off-the-shelf features are too coarse for species separation.

### Class Balance
- Imbalanced (40 to ~258 per class) → class_balance is meaningfully below 1.0 (raw min-class ratio ~0.16). A real property, not curation artifact.
- NOTE: the official 10-per-class train split artificially balances training, but the FULL dataset and test set are imbalanced — diagnose on the actual distribution.

### Consistency
- Variable resolution and aspect ratio (no fixed size) → size-uniformity consistency is LOW; color mode is uniformly RGB.
- Fix: `transforms.Resize` to a common size before embedding.

### Sample Quality (Image)
- Mostly high-resolution, well-focused photographs → sample_quality is generally HIGH; occasional cluttered backgrounds or multiple blooms per image add intra-class noise.

### Validity, Completeness, Uniqueness
- Decode success ~1.0 (validity); few masked pixels (completeness ~1.0). Curated VGG dataset → near-duplicate rate is low; a light imagehash phash pass suffices.

## Weight Recommendation Guidance
- Keep `label_consistency` highest (~0.20) — fine-grained species similarity is the defining challenge.
- Raise `feature_informativeness` (~0.15) — generic embeddings are too coarse for species; low MI is real signal.
- Apply `class_balance` (~0.12) — genuine 40-to-258 imbalance (diagnose on full distribution, not the 10/class train split).
- Apply `consistency` (~0.12) — variable resolution fails size-uniformity.
- Down-weight `validity`, `completeness_image`, `uniqueness` — clean and curated.

## Key Insights
- FINE-GRAINED LABEL_CONSISTENCY dominates: 102 visually similar flower species mean generic ResNet18 embeddings blur the boundaries, so low label_consistency / feature_informativeness reflect task difficulty, not mislabeling per se.
- The unusual SPLIT (10/class train, 6,149 test) artificially balances training — always diagnose CLASS_BALANCE on the real full distribution (40 to ~258 per class).
- CONSISTENCY (variable resolution) needs resizing first, like Caltech-101 and unlike the fixed-size CIFAR/MNIST benchmarks.
- FEATURE_INFORMATIVENESS is a useful gauge of whether your embedding model is fine-grained enough for the species task.
