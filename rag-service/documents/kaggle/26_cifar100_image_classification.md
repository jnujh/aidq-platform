# CIFAR-100 Image Classification — EDA & Data Quality Analysis

## Source
- Dataset: CIFAR-100 (Krizhevsky, "Learning Multiple Layers of Features from Tiny Images", 2009) — sibling of CIFAR-10, drawn from the same Tiny Images collection
- Distribution: Kaggle; also `torchvision.datasets.CIFAR100`
- License: open for research (MIT / Tiny Images provenance)
- Label-noise reference: CIFAR-100N (Wei et al., "Learning with Noisy Labels Revisited", ICLR 2022) provides real human re-annotations; aggregated noise ~25%, far higher than CIFAR-10N
- Label-error reference: Northcutt et al. (2021) report a higher estimated test-set error rate than CIFAR-10

## Dataset Overview
- Images: 60,000 (50,000 train / 10,000 test)
- Size: 32×32 pixels, RGB (3 channels) — fixed, uniform
- Classes: 100 fine classes grouped into 20 coarse superclasses (e.g. superclass "aquatic mammals" = {beaver, dolphin, otter, seal, whale})
- Task: Multi-class image classification (fine-grained, two-level hierarchy)
- Domain: Computer Vision / Object Recognition
- Balance: Exactly 600 images per fine class — perfectly balanced by construction

## Data Quality Issues Found

### Label Consistency (Most Important)
- With 100 classes and only 600 images each at 32×32, fine distinctions are extremely hard. CIFAR-100N measured ~25% aggregated human-relabel noise — much worse than CIFAR-10N (~9%).
- Confusion concentrates WITHIN superclasses: boy↔girl↔man↔woman (people), maple↔oak↔willow (trees), the aquatic-mammal cluster. ResNet18 k-NN neighbors frequently belong to a sibling class.
- Fix: audit k-NN disagreements within each superclass; cleanlab Confident Learning to rank suspects; consider evaluating at the coarse (20-class) level when fine labels are unreliable.

### Feature Informativeness / Correlation
- 600 samples per class at 32×32 is sparse for 100-way separation → ResNet18 embeddings overlap heavily across sibling classes; embedding→label mutual information is LOWER than CIFAR-10 (more classes, less per-class signal).
- feature_informativeness is a genuinely informative metric here (unlike CIFAR-10) — low scores reflect real fine-grained difficulty, not a pipeline bug.

### Sample Quality (Image)
- Same 32×32 low resolution as CIFAR-10 — uniformly low detail. Blur thresholds must be RELATIVE.
- Fine-grained classes suffer most: at 32×32 the visual cues distinguishing oak from maple are nearly gone.

### Class Balance
- Perfectly balanced (600/class by design) → class_balance ~1.0. Artificial; do NOT over-weight.

### Uniqueness (Duplicates)
- Like CIFAR-10, drawn from Tiny Images, which has documented near-duplicates; train/test overlap can inflate accuracy.
- Fix: imagehash phash dedup before evaluation.

### Validity, Completeness, Consistency
- As distributed (binary batches / torchvision), decode is ~100%, no masked pixels, uniform 32×32 RGB → validity, completeness_image, consistency all ~1.0 by curation. Low diagnostic value.

## Weight Recommendation Guidance
- Keep `label_consistency` highest (~0.20) — CIFAR-100 is the noisiest of the curated CIFAR benchmarks (~25% per CIFAR-100N).
- Raise `feature_informativeness` (~0.15) — fine-grained, sparse-per-class structure makes this metric genuinely diagnostic here.
- Keep `sample_quality_image` moderate (~0.12) with RELATIVE blur thresholds.
- Watch `uniqueness` (~0.10) for Tiny-Images near-duplicate leakage.
- Down-weight `class_balance`, `validity`, `consistency`, `completeness_image` — ~1.0 by construction.

## Key Insights
- CIFAR-100 is CIFAR-10's harder sibling: same curation guarantees (balance/validity/consistency) but FAR more LABEL_CONSISTENCY noise (~25% vs ~9%), concentrated within the 20 superclasses.
- FEATURE_INFORMATIVENESS becomes a real signal here — 100 classes × 600 images × 32×32 leaves little per-class separability, so low MI is expected, not a bug.
- The superclass hierarchy is a practical fallback: when fine labels are too noisy, diagnose/evaluate at the coarse 20-class level.
- Tiny-Images near-duplicates (uniqueness) still silently inflate benchmark accuracy.
