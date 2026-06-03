# Image Augmentation & Class Balancing — Data Quality Fix Guide

## Source
- Primary: `torchvision.transforms` official documentation (data augmentation, including `RandAugment` and `AutoAugment`)
- Secondary: Cubuk, Zoph, Shlens, Le, "RandAugment: Practical Automated Data Augmentation with a Reduced Search Space" (NeurIPS 2020 / CVPR Workshops 2020); Zhang, Cisse, Dauphin, Lopez-Paz, "mixup: Beyond Empirical Risk Minimization" (ICLR 2018); Yun, Han, Oh, Chun, Choe, Yoo, "CutMix: Regularization Strategy to Train Strong Classifiers with Localizable Features" (ICCV 2019); imbalanced-learn / `WeightedRandomSampler` (PyTorch) oversampling

## When to Use
- Diagnosing an image classification dataset (folder-per-class layout, integer labels)
- class_balance is low (< 0.8) — some classes have far fewer images than others
- feature_informativeness or label_consistency is low partly because minority classes lack diverse examples
- The model overfits the majority class or fails to generalize across lighting/pose variation

## Augmentation & Balancing Techniques

### 1. Geometric & Photometric Transforms (torchvision)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| RandomHorizontalFlip | Mirror images left/right | Most natural objects; NOT digits/text/medical-laterality |
| RandomResizedCrop | Crop a random region then resize to target | Adds scale + position diversity for natural scenes |
| RandomRotation / RandomAffine | Rotate, translate, shear within a small range | Pose-robust tasks; keep angles small for upright objects |
| ColorJitter | Perturb brightness/contrast/saturation/hue | Lighting and camera robustness |
| RandomErasing | Mask out a random rectangle | Occlusion robustness; complements CutMix |

### 2. Automated Augmentation Policies

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| RandAugment (Cubuk et al. 2020) | Apply N random transforms at magnitude M; only 2 hyperparameters (N, M), no expensive policy search | Strong default when you lack a tuned policy; scales from CIFAR to ImageNet |
| AutoAugment | Learned per-dataset augmentation policy (CIFAR-10/SVHN/ImageNet presets in torchvision) | Reuse a preset matching your domain; full search is costly |
| TrivialAugment | Single random transform at random magnitude, parameter-free | Lightweight baseline competitive with RandAugment |

### 3. Mixing-Based Regularizers (label-mixing)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| MixUp (Zhang et al. ICLR 2018) | Linearly blend two images and their one-hot labels by λ ~ Beta(α, α) | Improves calibration and robustness; α≈0.2–0.4 typical |
| CutMix (Yun et al. ICCV 2019) | Paste a rectangular patch from image B into image A; mix labels by patch-area ratio | Preserves local features better than MixUp; strong for ImageNet-scale CNNs |
| Note | Both require a soft-label-aware loss (e.g., cross-entropy on mixed targets) | Cannot be combined with hard-label-only pipelines unchanged |

### 4. Class Balancing (resampling, not raw duplication)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| WeightedRandomSampler | Sample minority-class images more frequently per epoch | Preferred over static duplication; pair with on-the-fly augmentation |
| Minority-only augmentation | Generate extra augmented variants for rare classes | Adds diversity instead of identical copies (avoids overfitting) |
| class_weight in the loss | Penalize minority misclassification more heavily | When resampling is impractical or memory-bound |
| Random oversampling (baseline) | Duplicate minority images | Quick baseline only; risks memorization without augmentation |

## Weighting Guidance
Raise `class_balance` weight when the minority class is the class of interest (defect detection, rare
disease). Augmentation primarily lifts generalization, so it also indirectly supports
`label_consistency` and `feature_informativeness` by giving minority classes more separable examples.
On already-balanced curated benchmarks (CIFAR-10, Fashion-MNIST), keep `class_balance` weight low and
treat augmentation as a training-time choice rather than a data-quality fix.

## Key Insight
Fix image class imbalance with diversity, not duplication: oversample with a `WeightedRandomSampler`
and apply strong augmentation (RandAugment as a tuning-free default; MixUp/CutMix as label-mixing
regularizers). Duplicating minority images raises the count but teaches the model to memorize, whereas
augmented variants add the variation the model actually needs to generalize.
