# Outlier Detection & Treatment — Data Quality Fix Guide

## Source
- Primary: scikit-learn official documentation "Novelty and Outlier Detection"
- Secondary: scipy.stats documentation (zscore, IQR methods)

## When to Use
- Outlier_ratio score is low (< 0.8)
- Distribution has extreme values far from center
- Linear models or distance-based models are planned

## Detection Methods

### Statistical Methods

| Method | Formula | Best For | Threshold |
|--------|---------|----------|-----------|
| Z-score | (x - mean) / std | Normal distributions | \|z\| > 3 |
| Modified Z-score | 0.6745 * (x - median) / MAD | Skewed distributions | \|z\| > 3.5 |
| IQR | Q1 - 1.5*IQR to Q3 + 1.5*IQR | Any distribution | Outside bounds |
| Percentile | Below 1st or above 99th percentile | Quick check | Configurable |

### Model-Based Methods

| Method | How it Works | Best For |
|--------|-------------|----------|
| Isolation Forest | Isolates observations using random splits | High-dimensional, large datasets |
| Local Outlier Factor (LOF) | Compares local density to neighbors | Clusters with varying density |
| One-Class SVM | Learns boundary around normal data | When "normal" is well-defined |
| DBSCAN | Points not in any cluster = outliers | Spatial/clustered data |

## Critical Decision: Remove or Keep?

### REMOVE outliers when:
- They are clearly data entry errors (age = 999, price = -1)
- They are measurement instrument failures (sensor malfunction)
- Using linear models (OLS regression) that are sensitive to outliers
- They represent impossible values (negative age, future dates)

### KEEP outliers when:
- They represent rare but valid events (fraud transactions, viral posts)
- Using tree-based models (Random Forest, XGBoost — robust to outliers)
- In anomaly detection tasks (outliers ARE the target)
- Domain expert confirms they are real (luxury home prices, large bank transfers)

### TRANSFORM instead of removing:
- Log transformation: Reduces impact while keeping data
- Winsorization: Cap at percentile bounds (e.g., clip at 1st/99th percentile)
- RobustScaler: Scale using median/IQR instead of mean/std

## Task-Specific Recommendations

| ML Task | Approach | Reason |
|---------|----------|--------|
| Linear Regression | Remove or Winsorize | Linear models heavily influenced by outliers |
| Classification (tree-based) | Keep | Trees split on values, outliers don't destabilize |
| Clustering (KMeans) | Remove or Transform | Distance-based, outliers create singleton clusters |
| Time Series | Transform (Winsorize) | Removing creates gaps in series |
| Anomaly Detection | NEVER remove | Outliers are what you're trying to find |
| Fraud Detection | NEVER remove | Fraud IS the outlier |

## Code Patterns

```python
# IQR method
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers = df[(df['col'] < lower) | (df['col'] > upper)]

# Isolation Forest
from sklearn.ensemble import IsolationForest
iso = IsolationForest(contamination=0.05, random_state=42)
outlier_labels = iso.fit_predict(df[numeric_cols])  # -1 = outlier

# Winsorization (cap at percentiles)
from scipy.stats import mstats
df['col_winsorized'] = mstats.winsorize(df['col'], limits=[0.01, 0.01])

# Log transformation
import numpy as np
df['col_log'] = np.log1p(df['col'])  # log(1+x) handles zeros
```

## Key Insight
The question is never "are there outliers?" (there always are) but "are these outliers ERRORS or SIGNAL?" Domain knowledge is essential — a $60,000 medical bill is an outlier but is real for a smoker with high BMI.
