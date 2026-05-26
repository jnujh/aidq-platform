# Santander Customer Satisfaction — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Santander Customer Satisfaction"
- Reference Notebooks:
  - "Santander - EDA and Prediction" by sharmasanthosh (400+ votes)
  - "Exploratory Analysis Santander" by arthurtok (300+ votes)

## Dataset Overview
- Rows: 76,020 (train) / Columns: 371
- Task: Binary classification (satisfied vs unsatisfied)
- Domain: Finance / Banking
- Target variable: TARGET (unsatisfied: 3.95%, satisfied: 96.05%)

## Data Quality Issues Found

### Class Balance
- Unsatisfied customers: 3.95% — severe imbalance
- Even worse than bank marketing (11.7%)
- With 76K rows, minority class has ~3,000 samples — enough for SMOTE
- Fix: SMOTE + evaluation with PR-AUC, not accuracy

### Feature Correlation (High Dimensionality)
- 370 anonymous features — no feature names, only var3, var15, var36, etc.
- Many features are constant (zero variance): ~34 columns have identical values for all rows
- Many features are highly correlated (redundant copies or linear combinations)
- Fix steps:
  1. Remove zero-variance features (columns where std = 0)
  2. Remove features with >99.9% identical values
  3. Remove one of each highly correlated pair (threshold > 0.95)
- Result: ~370 features reduce to ~200-250 useful features

### Completeness (Sparse Data)
- No traditional NaN missing values
- However, many features are extremely sparse (>95% zeros)
- These sparse features may represent rare events or binary flags
- Sparsity is not the same as missing — zeros are valid values here
- Fix: Do NOT impute zeros. Consider feature selection based on information gain.

### Outlier Ratio
- var3 has value -999999 appearing for 116 rows — clearly a placeholder for missing/error
- Several features have extreme values far from the distribution
- Fix for var3: Replace -999999 with NaN, then impute with mode (most common value is 2)
- General: Use Isolation Forest to detect multivariate outliers

### Validity (Placeholder Values)
- var3 = -999999 is a sentinel value (not a real measurement)
- var36 has only 3 unique values (0, 1, 2) — might be categorical despite numeric type
- var15 ranges from 5 to 105 — likely represents age
- Without feature documentation, identifying validity issues requires statistical analysis

### Uniqueness
- Some rows might be near-duplicates due to the high dimensionality
- ID column should be excluded from model training
- No exact duplicates found, but similar profiles exist (expected in banking data)

## Key Insights
- Anonymous features require extra EDA effort — check for sentinel values (-999999, 9999999)
- High-dimensional sparse data: removing zero-variance and highly correlated features is essential
- In banking, 4% dissatisfaction rate is actually high — class balance still matters
- Constant features waste computation and can cause issues with some models (tree splits on constant = error)
- When you can't understand features by name, use statistical properties (variance, correlation, distribution shape)
