# Feature Scaling & Normalization — Data Quality Fix Guide

## Source
- Primary: scikit-learn official documentation "Preprocessing data" (section 6.3)
- Secondary: scikit-learn "Compare the effect of different scalers"

## When to Use
- Value_accuracy score is low due to distribution issues
- Features have vastly different scales (age: 0-100, income: 0-1,000,000)
- Using distance-based or gradient-based models

## Why Scaling Matters

Models that ARE affected by feature scale:
- KNN, SVM, KMeans (distance-based)
- Linear/Logistic Regression (gradient-based)
- Neural Networks (gradient-based)
- PCA (variance-based)

Models that are NOT affected:
- Decision Trees, Random Forest, XGBoost, LightGBM (split-based)
- Naive Bayes (probability-based)

## Scaling Methods Comparison

| Method | Formula | Range | Best For | Sensitive to Outliers? |
|--------|---------|-------|----------|:---------------------:|
| StandardScaler | (x - mean) / std | ~(-3, 3) | Normal-ish distributions | Yes |
| MinMaxScaler | (x - min) / (max - min) | [0, 1] | Bounded features, neural networks | Very yes |
| RobustScaler | (x - median) / IQR | Variable | Data with outliers | No |
| MaxAbsScaler | x / max(\|x\|) | [-1, 1] | Sparse data | Yes |
| Normalizer | x / \|\|x\|\| (row-wise) | Unit norm | Text data (TF-IDF) | No |

## When to Use Which

| Scenario | Scaler | Reason |
|----------|--------|--------|
| Normal distribution, no outliers | StandardScaler | Preserves Gaussian properties |
| Need bounded [0,1] range | MinMaxScaler | Neural networks, image pixels |
| Data has outliers | RobustScaler | Uses median/IQR, outliers don't affect |
| Sparse features (many zeros) | MaxAbsScaler | Doesn't shift zeros |
| Comparing row-wise similarity | Normalizer | Unit vector for cosine similarity |
| Tree-based model | No scaling needed | Trees are scale-invariant |

## Distribution Transformations (Beyond Scaling)

| Transformation | When | Effect |
|---------------|------|--------|
| np.log1p(x) | Right-skewed, positive values | Reduces skewness, compresses large values |
| np.sqrt(x) | Moderate right skew, positive | Milder than log |
| Box-Cox | Any skewed distribution (positive only) | Finds optimal power transform |
| Yeo-Johnson | Any skewed (allows negative) | Generalization of Box-Cox |
| QuantileTransformer | Force any distribution to uniform/normal | Non-parametric, may distort relationships |

## Task-Specific Recommendations

| ML Task | Recommended | Reason |
|---------|-------------|--------|
| Linear Regression | StandardScaler + log-transform target | Coefficients interpretable, target should be normal |
| Logistic Regression | StandardScaler | Gradient convergence |
| SVM | StandardScaler or MinMaxScaler | Kernel functions are distance-based |
| KNN | MinMaxScaler or StandardScaler | Distance must be fair across features |
| KMeans Clustering | StandardScaler | Equal weight to all features in distance |
| Neural Networks | MinMaxScaler [0,1] | Bounded activations work best |
| Random Forest / XGBoost | No scaling | Split-based, scale-invariant |
| PCA | StandardScaler (required) | PCA maximizes variance — scale determines importance |

## Code Patterns

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.preprocessing import PowerTransformer

# Standard scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use train's mean/std!

# Robust scaling (outlier-safe)
scaler = RobustScaler()
X_scaled = scaler.fit_transform(X_train)

# Log transform for skewed features
import numpy as np
skewed_features = df.select_dtypes(include='number').skew()
skewed_cols = skewed_features[skewed_features.abs() > 0.75].index
df[skewed_cols] = np.log1p(df[skewed_cols])

# Power transform (automatic best transform)
pt = PowerTransformer(method='yeo-johnson')
X_transformed = pt.fit_transform(X)
```

## Common Mistakes

1. **Fitting scaler on test data** — Always fit on train, transform on test
2. **Scaling the target** — Only scale features, not y (exception: log-transform y for regression)
3. **Scaling binary/categorical features** — Don't scale 0/1 encoded features
4. **Scaling before train/test split** — Causes data leakage (test info in scaler)

## Key Insight
Scaling is a PREREQUISITE for many models, not an optional enhancement. Without scaling, a feature with range [0, 1000000] will dominate over one with range [0, 1] in any distance or gradient calculation — even if the smaller feature is more important.
