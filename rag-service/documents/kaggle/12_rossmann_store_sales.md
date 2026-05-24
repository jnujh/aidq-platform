# Rossmann Store Sales — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Rossmann Store Sales"
- Reference Notebooks:
  - "Rossmann EDA" by various top-voted analyses
  - "Exploring Rossmann Store Sales Data" by top contributors

## Dataset Overview
- Rows: 1,017,209 (train) / Columns: 9 (+ store.csv with 10 additional columns)
- Task: Time series regression (predict daily sales)
- Domain: Retail / Grocery
- Target variable: Sales (daily store sales)
- Additional file: store.csv (store metadata — competition distance, promo info)

## Data Quality Issues Found

### Completeness (Missing Values)
- train.csv: No missing values in main features
- store.csv has missing values:
  - CompetitionDistance: 3 missing — nearest competitor distance unknown
  - CompetitionOpenSinceMonth/Year: 354 missing (31%) — competition opening date unknown
  - Promo2SinceWeek/Year: 544 missing (48%) — no promo2 participation
  - PromoInterval: 544 missing (48%) — no promo2 participation
- The Promo2 missing values are NOT random — they mean "store doesn't participate in Promo2"
- Fix: CompetitionDistance → impute with median; Promo2 fields → fill with 0/"None"

### Validity (Closed Store Days)
- 172,817 rows where Open = 0 (store closed) and Sales = 0
- These are valid data points but should be EXCLUDED from training
- If included, model learns "sometimes sales are 0" which is misleading
- Fix: Filter to Open == 1 for training; predict only for open days

### Outlier Ratio
- Sales: ranges 0 to 41,551 (when open)
  - Some stores consistently high (store type/size effect)
  - December sales spike (Christmas shopping)
  - Not outliers — seasonal and store-type effects
- Customers: ranges 0 to 7,388
  - Strong correlation with Sales (expected)
  - Customers is NOT available at prediction time — potential leakage
  - Fix: Do NOT use Customers as a feature

### Feature Correlation
- Sales and Customers: very high correlation (~0.90)
  - BUT Customers is not known at prediction time (same-day information)
  - This is temporal leakage — cannot use future information
- Sales and Promo: promotions increase sales significantly (~20-30%)
- DayOfWeek patterns: Sunday (7) always closed for most stores

### Consistency (Date Handling)
- Date column as string — needs parsing
- StateHoliday: mixed types ('0', 'a', 'b', 'c') — '0' means no holiday
  - '0' as string, not integer — type inconsistency
  - Fix: Keep as categorical, don't convert to numeric
- SchoolHoliday: binary (0/1) — consistent

### Value Accuracy (Temporal Patterns)
- Strong day-of-week effect: Monday/Sunday low, mid-week higher
- Monthly seasonality: December peak, January drop
- Year-over-year growth trend (2013 < 2014 < 2015)
- Promotional periods create 20-30% sales lift

## Key Insights
- Time series data requires temporal awareness — don't randomly shuffle for train/test split
- "Missing" in store metadata often means "not applicable" (no Promo2 = store doesn't participate)
- Closed store days (Sales=0) must be filtered out — they're not prediction targets
- Customer count is same-day information — using it is temporal leakage
- Joining store metadata (store.csv) is essential for good predictions
- Promotional effects and seasonality are the key drivers, not data quality issues per se
