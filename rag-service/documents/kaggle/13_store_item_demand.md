# Store Item Demand Forecasting — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Store Item Demand Forecasting Challenge"
- Reference Notebooks:
  - "Store Item Demand EDA" by top-voted analyses
  - "Time Series Forecasting" by various contributors

## Dataset Overview
- Rows: 913,000 (train) / Columns: 4
- Task: Time series regression (predict daily sales per store-item combination)
- Domain: Retail
- Target variable: sales (daily item sales count)
- Features: date, store (1-10), item (1-50)
- Time period: 2013-01-01 to 2017-12-31 (5 years)

## Data Quality Issues Found

### Completeness
- Zero missing values — perfectly complete time series
- All 500 combinations (10 stores × 50 items) have full 5-year daily data
- 913,000 = 10 stores × 50 items × 1,826 days — perfectly balanced panel data

### Class Balance (Not Applicable)
- Regression task — class balance not relevant
- However, sales distribution matters: right-skewed with no zeros (minimum sales = 1)

### Outlier Ratio
- sales: ranges 1 to 231 (daily item sales)
- Mean ~52, Median ~47 — moderate right skew
- Higher sales during summer months and holidays
- No extreme outliers — all values within plausible range
- Fix: No outlier removal needed; consider log transform for models assuming normality

### Feature Correlation (Temporal Patterns)
- Strong weekly seasonality (7-day cycle)
- Strong yearly seasonality (365-day cycle)
- Slight upward trend over 5 years
- Store effect: some stores consistently sell more (store 2 highest, store 5 lowest)
- Item effect: some items more popular across all stores
- Fix: Extract time features (day_of_week, month, year) + store/item as categorical

### Validity (Minimal Features)
- Only 4 columns — feature engineering is essential:
  - date → day_of_week, month, year, day_of_month, week_of_year, is_weekend
  - store → categorical (10 levels)
  - item → categorical (50 levels)
  - Lag features: sales_yesterday, sales_last_week, sales_last_year
  - Rolling features: rolling_mean_7d, rolling_mean_30d
- Raw data is too sparse for good prediction without engineering

### Value Accuracy
- No zero sales days — every item sells at least 1 unit every day
- This is unusual and may indicate aggregation (returns subtracted? floor at 1?)
- December consistently higher, February consistently lower
- Weekend vs weekday patterns vary by item (some items weekend-heavy, others weekday-heavy)

## Key Insights
- Perfectly clean, complete time series — quality issues are about structure not cleanliness
- The main challenge is feature engineering from minimal columns (date, store, item)
- Lag features and rolling statistics are critical for time series forecasting
- Panel data structure (store × item × time) requires hierarchical modeling consideration
- No missing data means the focus shifts to temporal patterns and feature creation
- Evaluation must respect time ordering — no random train/test split, use last 3 months as test
