# Bank Marketing — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Bank Marketing Dataset" (Portuguese banking institution)
- Reference Notebooks:
  - "Bank Marketing EDA" by rashmiranu (300+ votes)
  - "Bank Marketing - Classification" by henriqueyamahata (200+ votes)

## Dataset Overview
- Rows: 45,211 / Columns: 17
- Task: Binary classification (term deposit subscription yes/no)
- Domain: Finance / Marketing
- Target variable: deposit (yes: 11.7%, no: 88.3%)

## Data Quality Issues Found

### Class Balance
- Positive class (subscribed): 11.7% — moderate-to-severe imbalance
- Worse than Telco Churn (26.5%) but better than fraud (0.17%)
- Marketing campaigns have inherently low conversion rates
- Fix: Stratified split + class_weight='balanced' or SMOTE

### Consistency (Unknown Values)
- Multiple columns contain "unknown" as a category:
  - job: 288 unknown (0.6%)
  - education: 1,857 unknown (4.1%)
  - contact: 13,020 unknown (28.8%) — very high
  - poutcome (previous outcome): 36,959 unknown (81.7%) — majority unknown
- These are NOT missing values (NaN) — they are explicitly coded as "unknown"
- Decision needed: Treat as a separate category vs. impute vs. drop
- Fix for contact: Keep "unknown" as category (28.8% is too high to impute)
- Fix for poutcome: "unknown" means first-time contact — meaningful category, keep it

### Validity (Encoding Issues)
- month column stored as abbreviated string (jan, feb, ...) instead of numeric
- day_of_week stored as string (mon, tue, ...)
- These need encoding for ML models: ordinal (time-based) or one-hot
- Cyclical encoding (sin/cos) recommended for month to preserve Jan-Dec proximity

### Outlier Ratio
- duration (call duration in seconds): mean 258, max 4,918
- balance (account balance): ranges from -8,019 to 102,127
- campaign (contacts in this campaign): mean 2.7, max 63
- Extremely long calls (>2000s) likely result in subscription — leakage risk
- Note: duration is known only after call ends — should be excluded from prediction model (data leakage)

### Feature Correlation
- duration strongly correlates with target (longer call = more likely to subscribe)
- BUT this is target leakage — duration is not known before the call
- emp.var.rate, euribor3m, nr.employed are highly correlated (>0.9) — macroeconomic indicators
- Fix: Remove duration from features, consider PCA or dropping redundant macro features

## Key Insights
- "Unknown" values should not always be treated as missing — they can be meaningful categories
- Data leakage (duration feature) can inflate model performance unrealistically
- When >80% of a column is "unknown" (poutcome), it likely means "not applicable" rather than truly missing
- Marketing datasets have inherently low positive rates — class balance is always a concern
- Macroeconomic features tend to be highly correlated — dimension reduction helps
