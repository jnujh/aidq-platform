# AI/ML Data Quality Requirements — Beyond Traditional Quality

## Source
- ISO/IEC 5259 series (2024) "Artificial intelligence — Data quality for analytics and ML"
- General ML engineering best practices

## Overview
Traditional data quality (ISO 25012) focuses on data correctness and completeness. AI/ML training data has ADDITIONAL requirements that standard quality frameworks don't address.

## What Makes AI/ML Data Quality Different?

| Traditional Quality | AI/ML Quality |
|--------------------|---------------|
| "Is the data correct?" | "Is the data USEFUL for learning?" |
| Completeness = no missing | Completeness = sufficient coverage of edge cases |
| Accuracy = matches real world | Accuracy = labels are correct + consistent |
| Consistency = follows rules | Consistency = same labeling criteria applied throughout |

## AI/ML-Specific Quality Dimensions

### 1. Label Quality (Supervised Learning)
- Are labels correct? (Human labeling errors: typically 5-10% in real datasets)
- Are labels consistent? (Same criteria applied by all annotators)
- Label confidence: How certain are we about each label?
- Not measured by our platform directly, but affects model performance

### 2. Representativeness
- Does training data cover the full input space the model will see in production?
- Example: Training on summer data → model fails in winter
- Related to our metrics: class_balance partially captures this

### 3. Timeliness / Data Drift
- Is training data still relevant to current patterns?
- Example: Pre-COVID purchasing patterns → model fails post-COVID
- Not directly measured by our platform (would need production monitoring)

### 4. Bias and Fairness
- Does data over/under-represent certain groups?
- Example: Training data is 90% male → model biased against female users
- Partially captured by: class_balance (if protected attributes are features)

### 5. Sufficiency (Volume)
- Is there enough data to learn the pattern reliably?
- Rule of thumb: 10x features × classes minimum samples
- Small dataset (e.g., 200 rows for 50 features) = high overfitting risk

### 6. Feature Relevance
- Do features actually have predictive power for the target?
- Irrelevant features add noise, slow training, risk overfitting
- Partially captured by: feature_correlation (redundant features)

## How Each Platform Metric Maps to ML Quality

| Platform Metric | ML Impact | Why It Matters for Learning |
|----------------|-----------|----------------------------|
| completeness | Missing inputs → model can't learn from that sample | Reduces effective training size |
| uniqueness | Duplicates → overweighted patterns in training | Inflates metrics, doesn't improve generalization |
| validity | Wrong types → feature engineering fails | Garbage in, garbage out |
| consistency | Inconsistent encoding → same thing looks different to model | Splits learning signal across variants |
| outlier_ratio | Extreme values → model fits to noise | Especially harmful for linear models |
| class_balance | Imbalanced target → model ignores minority | Predicts majority class always |
| feature_correlation | Redundant features → unstable coefficients, split importance | Wastes model capacity, harms interpretation |
| value_accuracy | Skewed distributions → model assumptions violated | Linear models assume normality |

## Practical Thresholds for ML

| Metric | Good (≥) | Acceptable | Poor (<) | ML Impact |
|--------|:--------:|:----------:|:--------:|-----------|
| completeness | 0.95 | 0.80-0.95 | 0.80 | Below 80% → significant information loss |
| uniqueness | 0.99 | 0.90-0.99 | 0.90 | Below 90% → biased training |
| validity | 0.95 | 0.85-0.95 | 0.85 | Below 85% → parsing errors cascade |
| consistency | 0.90 | 0.80-0.90 | 0.80 | Below 80% → category confusion |
| outlier_ratio | 0.95 | 0.85-0.95 | 0.85 | Below 85% → model distortion |
| class_balance | 0.80 | 0.50-0.80 | 0.50 | Below 50% → need resampling |
| feature_correlation | 0.85 | 0.70-0.85 | 0.70 | Below 70% → severe multicollinearity |
| value_accuracy | 0.90 | 0.75-0.90 | 0.75 | Below 75% → distribution issues |

## Key Insight
A dataset can score perfectly on traditional quality (no missing, no duplicates, correct types) and still be TERRIBLE for ML if it has severe class imbalance, irrelevant features, or biased sampling. ML data quality is a SUPERSET of traditional data quality.
