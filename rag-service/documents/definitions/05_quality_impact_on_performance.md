# Data Quality Impact on Model Performance

## Source
- Based on research literature and empirical ML engineering practices
- Key reference: "Data Quality for Machine Learning Tasks" (Budach et al., 2022)
- General practitioner consensus from ML engineering community

## Overview
This document maps specific data quality problems to their quantified impact on model performance. Used by the RAG system to explain WHY a quality issue needs fixing and HOW MUCH improvement to expect.

## Impact Matrix

### Completeness (Missing Values)

| Missing Rate | Impact on Model Performance | Severity |
|:------------:|:---------------------------:|:--------:|
| < 5% | Negligible impact if handled properly | Low |
| 5-15% | 2-5% accuracy drop if ignored; recoverable with imputation | Moderate |
| 15-30% | 5-10% accuracy drop; imputation quality becomes critical | High |
| 30-50% | 10-20% drop; consider dropping feature or using missingness as feature | Severe |
| > 50% | Feature likely not useful; better to create binary "has value" indicator | Critical |

**Key finding**: The PATTERN of missingness matters more than the RATE. MNAR (systematically missing) causes bias that imputation can't fully fix.

### Uniqueness (Duplicates)

| Duplicate Rate | Impact | Example |
|:--------------:|:------:|---------|
| < 1% | Negligible | Normal data collection noise |
| 1-10% | Inflates reported metrics by 1-5% | Slight bias toward duplicated patterns |
| 10-30% | Inflates metrics by 5-15%; cross-validation becomes unreliable | Serious evaluation bias |
| > 30% | Model memorizes duplicates; generalization severely impacted | KDD99 case: 78% duplicates |

**Key finding**: Duplicates between train/test is DATA LEAKAGE — even 0.1% leakage can inflate accuracy by 5-10%.

### Class Balance

| Minority Class % | Impact on Minority Recall | Recommended Action |
|:----------------:|:------------------------:|-------------------|
| 30-50% | Mild impact (2-5% recall drop) | class_weight='balanced' |
| 10-30% | Moderate (10-20% recall drop) | SMOTE + class_weight |
| 1-10% | Severe (30-50% recall drop) | ADASYN + Ensemble |
| < 1% | Near-zero recall without intervention | Anomaly detection approach |

**Key finding**: A model trained on 1% minority class will achieve 99% accuracy while finding ZERO actual positives. Accuracy is meaningless under imbalance.

### Outlier Ratio

| Model Type | Outlier Impact | Example |
|-----------|:--------------:|---------|
| Linear Regression | EXTREME — single outlier can shift entire fit | One $10M house in $200K neighborhood |
| Logistic Regression | High — shifts decision boundary | One extreme feature value |
| Decision Tree | Low — just creates one extra split | Tree isolates outlier naturally |
| KMeans | High — outlier becomes its own cluster | Centroid pulled toward outlier |
| Random Forest / XGBoost | Very Low — ensemble averages out | Individual trees may overfit outlier |

**Key finding**: Impact depends almost entirely on model type. Don't remove outliers if using tree-based models — you're throwing away information for no reason.

### Feature Correlation

| Correlation Level | Impact on Linear Models | Impact on Tree Models |
|:-----------------:|:-----------------------:|:---------------------:|
| r < 0.5 | None | None |
| 0.5 < r < 0.8 | Coefficients less reliable | Feature importance split but accuracy OK |
| 0.8 < r < 0.95 | Coefficients unstable; interpretation unreliable | Minimal accuracy impact |
| r > 0.95 | Severe multicollinearity; model may fail to converge | No accuracy impact, interpretation only |

**Key finding**: Correlation is primarily an INTERPRETABILITY problem, not an ACCURACY problem (for tree models). Only address it if interpretation matters or using linear models.

### Validity (Type Errors)

| Issue | Impact | How it Manifests |
|-------|:------:|-----------------|
| Numeric as string | Feature excluded from analysis | df.describe() misses it |
| Categorical as numeric | False ordinal relationship assumed | Model thinks zip 90210 > 10001 |
| Date as string | Temporal patterns unextractable | Can't create time features |
| Mixed types in column | Entire column cast to object | All analysis breaks |

**Key finding**: Type errors are SILENT — they don't throw errors but produce subtly wrong results. A single invalid type can cascade through the entire pipeline.

### Consistency

| Inconsistency Type | Impact | Example |
|-------------------|:------:|---------|
| Case variants | Splits category in two | "Male" and "male" as different classes |
| Abbreviations | False cardinality increase | "NY" and "New York" as different locations |
| Encoding mix | Confuses model | SeniorCitizen: 0/1 while others use Yes/No |
| Unit mix | Values incomparable | Weight: 70 (kg? lbs?) |

**Key finding**: Consistency issues multiply — 5 inconsistent columns with 3 variants each = 3^5 = 243 possible false combinations.

## Improvement ROI (Return on Investment)

Which quality fixes give the MOST model improvement for the LEAST effort?

| Fix | Effort | Expected Improvement | ROI |
|-----|:------:|:-------------------:|:---:|
| Remove duplicates | Low (1 line of code) | 5-15% metric correction | ★★★ |
| Fix type errors | Low (type casting) | Enables proper analysis | ★★★ |
| Handle class imbalance | Medium (SMOTE/weight) | 10-30% recall improvement | ★★★ |
| Impute missing values | Medium (choose strategy) | 2-10% accuracy gain | ★★ |
| Remove/transform outliers | Medium (identify + decide) | 5-15% for linear models | ★★ |
| Resolve consistency | Medium (mapping dicts) | 3-8% accuracy gain | ★★ |
| Reduce feature correlation | Low-Medium (drop/PCA) | Interpretability gain, <5% accuracy | ★ |
| Fix value distributions | Low (log transform) | 2-5% for linear models | ★ |

## Key Insight
Data quality investment should follow the Pareto principle: **80% of model improvement comes from 20% of quality fixes.** The top 3 ROI fixes are almost always: (1) remove duplicates, (2) handle class imbalance, (3) fix type errors. These are cheap, high-impact, and universally applicable.
