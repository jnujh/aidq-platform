# Otto Group Product Classification — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Otto Group Product Classification Challenge"
- Reference Notebooks:
  - "Otto - EDA + PCA + Classification" by various top notebooks
  - "Interactive Otto EDA" by top-voted analyses

## Dataset Overview
- Rows: 61,878 (train) / Columns: 95
- Task: Multi-class classification (9 product categories: Class_1 to Class_9)
- Domain: E-commerce / Retail
- Target variable: target (9 classes)
- Features: 93 anonymous numeric features (feat_1 to feat_93)

## Data Quality Issues Found

### Completeness
- Zero missing values across all 93 features
- All features are integer counts (non-negative)
- Dataset is pre-cleaned by Otto Group

### Class Balance (Multi-class)
- Class_1: 1,929 (3.1%)
- Class_2: 16,122 (26.1%) — largest class
- Class_3: 8,004 (12.9%)
- Class_4: 2,691 (4.3%)
- Class_5: 2,739 (4.4%)
- Class_6: 14,135 (22.8%)
- Class_7: 2,839 (4.6%)
- Class_8: 8,464 (13.7%)
- Class_9: 4,955 (8.0%)
- Imbalance ratio: Class_2 is ~8x larger than Class_1
- Moderate imbalance — not extreme but affects minority classes

### Feature Correlation
- Many features have very low variance (near-zero for most rows)
- Sparse count data: majority of values are 0, with occasional high counts
- Some feature pairs show moderate correlation (0.5-0.7)
- Fix: Tree-based models handle this well; for linear models, consider PCA

### Validity (Data Distribution)
- All features are non-negative integers (count data)
- Distributions are highly right-skewed (many zeros, few large values)
- log(1+x) transformation significantly improves model performance
- Fix: Apply np.log1p() to all features before training

### Outlier Ratio
- Some features have extreme values (e.g., feat_1 max = 61,218 while median = 0)
- These are not errors — they represent products with high counts in specific categories
- Removing outliers would lose important class-distinguishing information
- Fix: Use log transformation instead of outlier removal

### Uniqueness
- id column is unique (no duplicates)
- Some rows are near-duplicates (similar feature vectors) — expected for similar products
- No exact duplicate rows

## Key Insights
- Anonymous features require statistical analysis rather than domain-driven EDA
- Count data (non-negative integers) benefits strongly from log transformation
- Sparse data (many zeros) is not the same as missing data — zeros are valid
- 9-class classification with moderate imbalance — logloss is the right evaluation metric
- When all features are anonymous counts, distribution analysis (skewness, sparsity) is the main quality check
