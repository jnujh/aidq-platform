# Missing Value Handling — Data Quality Fix Guide

## Source
- Primary: scikit-learn official documentation "Imputation of missing values"
- Secondary: pandas documentation "Working with missing data"

## When to Use
- Completeness score is low (< 0.8)
- Dataset has NaN, None, empty strings, or sentinel values (-999, 9999)
- Missing rate varies significantly across columns

## Missing Value Types (Critical to Identify First)

### MCAR (Missing Completely At Random)
- Missingness has no relationship with any variable
- Example: Random sensor failures, random survey non-responses
- Test: Little's MCAR test
- Safe to: Drop rows (if <5%) or impute with mean/median

### MAR (Missing At Random)
- Missingness depends on OBSERVED variables
- Example: Income missing more for younger respondents (age is observed)
- Test: Compare missing vs non-missing groups on other variables
- Safe to: Impute using correlated observed variables (KNN, MICE)

### MNAR (Missing Not At Random)
- Missingness depends on the MISSING VALUE ITSELF
- Example: High-income people don't report income; sick patients miss appointments
- Most dangerous type — imputation may introduce bias
- Safe to: Create "is_missing" indicator feature + careful imputation

## Techniques Comparison

| Technique | When to Use | Pros | Cons |
|-----------|-------------|------|------|
| Drop rows (listwise) | <5% missing, MCAR | Simple, no bias introduced | Loses data, doesn't work for MAR/MNAR |
| Mean/Median | Numeric, MCAR, quick baseline | Fast, simple | Reduces variance, ignores relationships |
| Mode | Categorical features | Simple for categories | Over-represents majority category |
| KNN Imputer | MAR, mixed feature types | Captures local patterns | Slow for large datasets, sensitive to K |
| MICE (IterativeImputer) | MAR, complex relationships | Most accurate, handles multivariate | Slow, may not converge, complex to tune |
| Forward/Backward fill | Time series data | Preserves temporal order | Doesn't work for large gaps |
| Interpolation | Time series, regular intervals | Smooth imputation | Assumes linearity between points |

## Task-Specific Recommendations

| ML Task | Recommended Approach | Reason |
|---------|---------------------|--------|
| Classification | KNN Imputer | Preserves class-specific distributions |
| Regression | MICE (IterativeImputer) | Preserves relationships with target |
| Time Series | Interpolation + Forward fill | Must preserve temporal order |
| Clustering | KNN Imputer or Median | KMeans can't handle NaN natively |
| Tree-based models | Leave as NaN (native handling) | XGBoost/LightGBM handle NaN internally |

## Decision Flowchart

```
Missing rate < 5%?
├── Yes → Drop rows (if MCAR) or Simple imputation
└── No → Missing rate < 30%?
    ├── Yes → KNN or MICE (identify MCAR/MAR/MNAR first)
    └── No → Missing rate > 30%?
        ├── Consider dropping the COLUMN
        ├── OR create binary "is_missing" feature
        └── OR domain-specific fill (e.g., "None" = feature doesn't exist)
```

## Code Patterns

```python
# Simple imputation
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy='median')  # or 'mean', 'most_frequent'

# KNN imputation
from sklearn.impute import KNNImputer
imputer = KNNImputer(n_neighbors=5)

# MICE (Iterative)
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
imputer = IterativeImputer(max_iter=10, random_state=42)

# Create missing indicator
df['feature_is_missing'] = df['feature'].isnull().astype(int)
```

## Key Insight
The MOST IMPORTANT step is identifying WHY values are missing (MCAR/MAR/MNAR) BEFORE choosing a technique. Wrong imputation on MNAR data can introduce systematic bias that's worse than the original missing values.
