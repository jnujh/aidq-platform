# Task-Specific Data Quality Requirements

## Source
- Based on general ML best practices and academic consensus
- Synthesized from multiple ML engineering textbooks and practitioner guides

## Overview
Different ML tasks have fundamentally different data quality priorities. What's critical for classification may be irrelevant for clustering. This guide maps each task type to its quality priorities.

## Quality Priority Matrix

### Priority Scale: ★★★ Critical | ★★ Important | ★ Nice-to-have | — Not relevant

| Quality Dimension | Binary Classification | Regression | Time Series | Clustering | Recommendation | NLP | Anomaly Detection |
|-------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| completeness | ★★ | ★★ | ★★★ | ★★ | ★★ | ★ | ★★ |
| uniqueness | ★★ | ★★ | ★ | ★★★ | ★★★ | ★★ | ★★★ |
| validity | ★★ | ★★ | ★★ | ★★ | ★ | ★★★ | ★★ |
| consistency | ★★ | ★★ | ★★ | ★★★ | ★★ | ★★★ | ★★ |
| outlier_ratio | ★★ | ★★★ | ★★ | ★★★ | ★ | ★ | — |
| class_balance | ★★★ | — | — | — | — | ★★ | ★★★ |
| feature_correlation | ★★ | ★★★ | ★ | ★★ | ★ | ★ | ★★ |
| value_accuracy | ★★ | ★★★ | ★★ | ★★★ | ★ | ★ | ★★ |

## Detailed Explanations by Task

### Binary Classification (Churn, Fraud, Spam, Disease)
**Top priorities**: class_balance, completeness
- Class imbalance is almost always present (churn: 5-30%, fraud: 0.1-5%)
- Missing values in key features reduce effective training data
- Outliers are less problematic for tree-based models (most common for classification)
- Feature correlation matters for interpretability but less for accuracy

**Weight recommendation tendency**: class_balance HIGH, completeness HIGH, others MODERATE

### Regression (Price, Demand, Revenue prediction)
**Top priorities**: outlier_ratio, feature_correlation, value_accuracy
- Outliers have HUGE impact on linear regression (single point can shift entire line)
- Feature correlation causes multicollinearity (unstable coefficients)
- Target distribution should be approximately normal (or log-transformed)
- Class balance not applicable (continuous target)

**Weight recommendation tendency**: outlier_ratio HIGH, feature_correlation HIGH, value_accuracy HIGH

### Time Series (Forecasting, Trend analysis)
**Top priorities**: completeness, consistency
- Missing values break temporal continuity (can't skip days in daily data)
- Consistency in measurement intervals is critical (irregular timestamps)
- Outliers may be valid events (holidays, promotions) — context-dependent
- Duplicates less relevant (same value on different dates is valid)

**Weight recommendation tendency**: completeness VERY HIGH, consistency HIGH, others MODERATE

### Clustering (Customer segmentation, Grouping)
**Top priorities**: value_accuracy (scaling), uniqueness, consistency
- Feature scaling is MANDATORY (KMeans is distance-based)
- Duplicates create artificial density (fake cluster centers)
- Consistency: same entity must look the same across features
- Class balance not applicable (no target variable)
- Outliers create singleton clusters (distort centroid calculation)

**Weight recommendation tendency**: value_accuracy HIGH, uniqueness HIGH, outlier_ratio HIGH

### Recommendation (Collaborative filtering, Content-based)
**Top priorities**: uniqueness, completeness (sparsity)
- Duplicates (same user-item-rating) bias recommendations heavily
- Sparsity (93%+ empty in rating matrix) is inherent — not "missing"
- Feature quality of item/user metadata matters for cold-start
- Outliers less relevant (ratings are bounded 1-5)

**Weight recommendation tendency**: uniqueness HIGH, completeness MODERATE (sparsity-aware)

### NLP (Text classification, Sentiment, NER)
**Top priorities**: validity (text cleanliness), consistency (labeling)
- Text validity: HTML tags, URLs, encoding errors corrupt features
- Label consistency: Same type of text should get same label (inter-annotator agreement)
- Duplicates matter (same text in train and test = leakage)
- Outliers less meaningful for text data
- Class balance matters for sentiment (but often artificially balanced)

**Weight recommendation tendency**: validity HIGH, consistency HIGH, uniqueness MODERATE

### Anomaly Detection (Fraud, Intrusion, Defect detection)
**Top priorities**: class_balance (extreme), uniqueness
- Class imbalance is DEFINING (anomalies are <1% by nature)
- Uniqueness: duplicates inflate "normal" pattern, harder to detect anomalies
- Outliers are NOT a problem — they ARE what you're detecting
- Feature correlation helps (correlated behavior patterns are normal, violations are anomalies)

**Weight recommendation tendency**: class_balance VERY HIGH, uniqueness HIGH, outlier_ratio set to 0 (disable)

## Weight Recommendation Examples

### Example 1: "Customer churn prediction for telecom company"
→ Task: Binary Classification, Domain: Telecom
```
class_balance: 25 (churn rate typically 15-30%, moderate imbalance)
completeness: 20 (missing customer data reduces training quality)
consistency: 15 (same customer status should be consistently encoded)
validity: 15 (data types and formats must be correct)
outlier_ratio: 10 (less critical for tree-based models)
feature_correlation: 10 (moderate concern for interpretation)
uniqueness: 5 (unlikely to have duplicates in billing data)
value_accuracy: 0 (distribution shape less relevant for tree models)
```

### Example 2: "House price prediction"
→ Task: Regression, Domain: Real Estate
```
outlier_ratio: 25 (luxury homes distort regression line)
feature_correlation: 20 (GarageArea/GarageCars type redundancy common)
value_accuracy: 20 (log-normal price distribution needs attention)
completeness: 15 (many features with "None" meaning "doesn't exist")
validity: 10 (MSSubClass numeric-but-categorical trap)
consistency: 5 (relatively standardized data)
class_balance: 0 (regression, not applicable)
uniqueness: 5 (unlikely issue in property data)
```

## Key Insight
The TASK TYPE should drive weight recommendations more than the dataset characteristics alone. A dataset with 20% missing values might get completeness=25 for time series but completeness=10 for classification (where tree models handle NaN natively).
