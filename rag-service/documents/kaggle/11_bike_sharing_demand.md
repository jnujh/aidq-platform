# Bike Sharing Demand — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Bike Sharing Demand"
- Reference Notebooks:
  - "Bike Sharing Demand - EDA" by viveksrinivasan (top-voted)
  - "Bike Sharing Demand Analysis" by various contributors

## Dataset Overview
- Rows: 10,886 (train) / Columns: 12
- Task: Regression (predict hourly bike rental count)
- Domain: Transportation / Urban Mobility
- Target variable: count (range 1 to 977, mean ~191)
- Time period: 2011-01-01 to 2012-12-19

## Data Quality Issues Found

### Completeness
- Zero missing values in training set
- datetime column provides full hourly coverage
- However: some hours may have zero rentals (valid, not missing)

### Validity (Datetime Parsing)
- datetime stored as string — needs parsing to extract features:
  - hour (0-23): strongest predictor (rush hours vs night)
  - day_of_week (0-6): weekday vs weekend patterns differ
  - month (1-12): seasonal patterns
  - year (2011/2012): growth trend
- Fix: pd.to_datetime() then extract components

### Outlier Ratio
- count (target): right-skewed (skewness ~1.24)
  - Median 142, Mean 191, Max 977
  - Peak hours (8am, 5-6pm) have much higher counts
  - Not outliers — these are real rush hour patterns
- windspeed: contains many exact zeros (may be missing/not-recorded rather than actual zero wind)
  - 1,313 rows with windspeed = 0 (12%)
  - Suspicious: unlikely to have truly zero wind that often
  - Fix: Consider imputing zero windspeed using random forest on other weather features
- humidity: ranges 0 to 100 — one value of 0 is suspicious (sensor error?)

### Feature Correlation
- temp and atemp (actual temp and "feels like" temp): correlation 0.98 (nearly identical)
  - Fix: Drop atemp (redundant with temp)
- casual + registered = count (by definition — data leakage!)
  - casual and registered are component parts of the target
  - Fix: MUST remove casual and registered from features
- hour extracted from datetime will be the strongest feature

### Consistency (Target Decomposition)
- count = casual + registered (always true)
- casual: unregistered riders / registered: subscription riders
- These are NOT available at prediction time — they ARE the prediction
- Including them would be severe data leakage (model achieves perfect score trivially)

### Value Accuracy (Distribution)
- count is right-skewed → log1p transformation recommended
- After log transform, distribution becomes approximately normal
- Seasonal patterns: summer > winter, clear monthly cycle
- Weekly patterns: weekday commute peaks, weekend midday peaks

## Key Insights
- Data leakage (casual + registered = count) is the biggest trap in this dataset
- Time features extracted from datetime are more predictive than weather features
- Zero windspeed values likely indicate missing measurements, not actual calm conditions
- Temperature features (temp vs atemp) with 0.98 correlation — drop one immediately
- Right-skewed count data should be log-transformed (RMSLE is the competition metric)
- Cyclical features (hour, month) benefit from sin/cos encoding for linear models
