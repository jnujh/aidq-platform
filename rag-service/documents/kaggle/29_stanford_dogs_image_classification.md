# Stanford Dogs Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: Stanford Dogs (Khosla, Jayadevaprakash, Yao, Fei-Fei, "Novel Dataset for Fine-Grained Image Categorization", CVPR 2011 Workshop on Fine-Grained Visual Categorization)
- Provenance: a SUBSET of ImageNet (images + bounding boxes for 120 dog breeds)
- Distribution: Stanford Vision Lab; also on Kaggle "Stanford Dogs Dataset"
- License: research use (ImageNet terms apply, as it is an ImageNet subset)
- Label-error reference: Northcutt et al. (2021) documented real label errors in ImageNet, the parent set

## Dataset Overview
- Images: 20,580 total
- Size: VARIABLE resolution, color (RGB); each image ships with a bounding-box annotation
- Classes: 120 dog breeds (e.g. Chihuahua, Maltese, Afghan hound, German shepherd)
- Task: Multi-class fine-grained image classification (breed recognition)
- Domain: Computer Vision / Fine-Grained Recognition
- Balance: Mildly imbalanced — ~148 to ~252 images per class (most breeds ~150–200)

## Data Quality Issues Found

### Label Consistency (Most Important — fine-grained, hardest)
- Breed recognition is among the hardest fine-grained tasks: visually near-identical breeds (Malamute↔Siberian husky, Whippet↔Italian greyhound, toy↔miniature poodle) overlap heavily in ResNet18 embedding space.
- As an ImageNet subset it inherits ImageNet's known label noise (Northcutt et al. 2021); some images contain MULTIPLE dogs or a dog plus a person, making the single breed label ambiguous.
- Fix: use the provided BOUNDING BOXES to crop to the single subject before embedding; k-NN audit within similar-breed clusters; cleanlab to rank suspects.

### Feature Informativeness / Correlation
- Generic ImageNet ResNet18 embeddings struggle to separate 120 breeds → embedding→label mutual information is moderate; sibling breeds collapse together.
- feature_informativeness is genuinely diagnostic: low MI signals the embedding is too coarse for breed-level distinction.

### Sample Quality (Image) / Subject Localization
- Photos are real-world: variable lighting, cluttered backgrounds, dogs at different scales/poses, sometimes occluded or far from camera.
- Without bounding-box cropping, the dog may occupy a small fraction of the frame → effective sample_quality (useful detail on the subject) is reduced even though the raw image is sharp.
- Fix: crop to the bounding box; this is the single highest-leverage preprocessing step.

### Consistency
- Variable resolution and aspect ratio (no fixed size) → size-uniformity consistency is LOW; color mode uniformly RGB.
- Fix: `transforms.Resize` to a common size (after bbox crop) before embedding.

### Class Balance
- Mild imbalance (~148 to ~252 per class) → class_balance ~0.6–0.8 raw min ratio. Real but not severe; less dominant than Caltech-101's imbalance.

### Validity, Completeness, Uniqueness
- Decode success ~1.0 (validity); few masked pixels. As an ImageNet subset, occasional near-duplicate web images exist → imagehash phash pass recommended.

## Weight Recommendation Guidance
- Keep `label_consistency` highest (~0.20) — breed-level fine-grained similarity plus inherited ImageNet noise make this the dominant issue.
- Raise `feature_informativeness` (~0.15) — generic embeddings are too coarse for breeds; low MI is real signal.
- Raise `sample_quality_image` (~0.15) — subject localization matters; recommend bbox cropping in the report.
- Apply `consistency` (~0.12) — variable resolution fails size-uniformity.
- Moderate `class_balance` (~0.10) — real but mild.
- Down-weight `validity`, `completeness_image`, `uniqueness`.

## Key Insights
- Breed recognition is the HARDEST fine-grained case here: near-identical sibling breeds (husky↔malamute, greyhound↔whippet) drive LABEL_CONSISTENCY and FEATURE_INFORMATIVENESS down — generic ImageNet embeddings are too coarse.
- The provided BOUNDING BOXES are the key asset: cropping to the single subject is the highest-leverage fix for both sample_quality and label ambiguity (multi-dog / dog+person frames).
- As an ImageNet subset it inherits ImageNet's documented label errors (Northcutt et al. 2021).
- Like other real-world fine-grained sets (Flowers-102, Caltech-101), CONSISTENCY needs resizing first; unlike Caltech-101, class imbalance is only mild.
