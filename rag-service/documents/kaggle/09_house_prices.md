# House Prices: Advanced Regression — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "House Prices: Advanced Regression Techniques"
- Reference Notebooks:
  - "Comprehensive data exploration with Python" by pmarcelino (12000+ votes)
  - "Stacked Regressions: Top 4% on LeaderBoard" by serigne (5000+ votes)

## Dataset Overview
- Rows: 1,460 (train) / Columns: 81
- Task: Regression (predict SalePrice)
- Domain: Real Estate
- Target variable: SalePrice (mean $180,921, range $34,900 - $755,000)

## Data Quality Issues Found

### Completeness (Missing Values — Complex Patterns)
- PoolQC: 1,453 missing (99.5%) — most houses don't have pools
- MiscFeature: 1,406 missing (96.3%) — most houses don't have misc features
- Alley: 1,369 missing (93.8%) — no alley access
- Fence: 1,179 missing (80.8%) — no fence
- FireplaceQu: 690 missing (47.3%) — no fireplace
- LotFrontage: 259 missing (17.7%) — genuine missing data
- GarageType/Finish/Qual/Cond: 81 missing (5.5%) — no garage
- BsmtQual/Cond/Exposure: 37-38 missing (2.5%) — no basement

Key insight: Most "missing" values are NOT random — they mean "feature doesn't exist"
- PoolQC = NaN means "no pool" (not "we don't know the pool quality")
- GarageType = NaN means "no garage"
- This is MNAR (Missing Not At Random) with a clear semantic meaning

Fix strategy:
- For categorical: Fill with "None" (meaning "doesn't have this feature")
- For numeric (GarageArea, BsmtFinSF): Fill with 0
- For LotFrontage: Impute by neighborhood median (true missing)

### Feature Correlation
- GarageArea and GarageCars: 0.88 (redundant — area determines car capacity)
- TotalBsmtSF and 1stFlrSF: 0.82 (basement usually = first floor footprint)
- GrLivArea and TotRmsAbvGrd: 0.83 (more area = more rooms)
- YearBuilt and GarageYrBlt: 0.83 (garage built when house built)
- Fix: Drop one of each pair, or create composite features

### Outlier Ratio
- GrLivArea: 2 extreme outliers (>4,000 sq ft) with low SalePrice — likely data errors or distressed sales
- LotArea: highly right-skewed (max 215,245 vs median 9,478)
- SalePrice: right-skewed (log-normal distribution)
- Fix: Remove the 2 GrLivArea outliers (confirmed anomalies), log-transform SalePrice

### Validity (Data Types)
- MSSubClass: numeric (20, 30, 60...) but actually categorical (dwelling type codes)
- MoSold: numeric (1-12) but categorical (month of sale)
- YrSold: numeric but should be treated as categorical or ordinal
- OverallQual/OverallCond: ordinal (1-10 scale)
- Fix: Convert MSSubClass and MoSold to categorical before modeling

### Value Accuracy (Target Distribution)
- SalePrice is right-skewed (skewness = 1.88)
- Log transformation makes it approximately normal (required for linear regression)
- Many numeric features also right-skewed — apply log1p to skewed features (skewness > 0.75)

## Key Insights
- "Missing" in real estate data usually means "doesn't have this feature" — MNAR with clear semantics
- The distinction between "missing because unknown" vs "missing because not applicable" is critical
- 99.5% missing doesn't mean drop the column — PoolQC presence strongly predicts high price
- Small dataset (1,460) + 81 features = risk of overfitting — feature selection is crucial
- Always check if numeric columns are truly numeric or coded categorical (MSSubClass trap)
