# Mall Customer Segmentation — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Mall Customer Segmentation Data"
- Reference Notebooks:
  - "Customer Segmentation - KMeans" by vjchoudhary7 (2000+ votes)
  - "Mall Customer Segmentation" by various EDA contributors

## Dataset Overview
- Rows: 200 / Columns: 5
- Task: Clustering / Customer Segmentation
- Domain: Marketing / Retail
- Features: CustomerID, Gender, Age, Annual Income (k$), Spending Score (1-100)
- No target variable (unsupervised learning)

## Data Quality Issues Found

### Completeness
- Zero missing values — dataset is small and perfectly clean
- Only 200 rows — very small sample size

### Outlier Ratio
- Age: ranges 18-70 — no outliers, reasonable distribution
- Annual Income: ranges $15k-$137k — slight right skew but no extreme outliers
- Spending Score: ranges 1-99 — covers full range, uniform-ish distribution
- With only 200 samples, outlier removal would significantly reduce already small dataset
- Fix: Do NOT remove outliers — keep all 200 samples

### Feature Correlation
- Annual Income and Spending Score: correlation ~0.01 (nearly zero)
  - This is actually interesting: income doesn't predict spending behavior
  - This is why clustering is needed — to find non-obvious patterns
- Age and Spending Score: weak negative correlation (-0.33)
  - Younger customers tend to spend more
- Age and Annual Income: weak positive correlation (0.16)

### Validity (Scaling)
- Annual Income in thousands (15-137) vs Spending Score (1-100) vs Age (18-70)
- Different scales — KMeans is distance-based, requires standardization
- Without scaling, Annual Income dominates the distance calculation
- Fix: StandardScaler before clustering (critical for KMeans, DBSCAN)

### Value Accuracy
- Spending Score: appears to be a proprietary metric (1-100 scale)
  - Assigned by mall based on customer behavior and spending
  - Not raw spending amount — it's already normalized
- Annual Income: self-reported or estimated — may not be perfectly accurate
- Gender: balanced (112 Female, 88 Male) — no severe imbalance

### Uniqueness
- CustomerID is unique (no duplicates)
- Some customers have identical (Income, Score) pairs — natural, not errors
- Very small dataset — every row is important

## Key Insights
- For clustering, feature SCALING is the most critical data quality step (not missing values)
- Small dataset (200) means no room for outlier removal or aggressive filtering
- Low correlation between Income and Spending Score is the key insight — justifies clustering approach
- KMeans typically finds 5 segments in this data (High Income/High Spend, etc.)
- Gender can be used as a validation variable (check if clusters have meaningful gender distribution)
- This dataset teaches: quality issues in clustering are about SCALE and DISTANCE, not missingness
