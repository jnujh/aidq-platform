# IEEE-CIS Fraud Detection — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "IEEE-CIS Fraud Detection"
- Reference Notebooks:
  - "IEEE Fraud Detection - EDA" by top-voted analyses
  - "EDA and Models" by various contributors

## Dataset Overview
- Rows: 590,540 (train) / Columns: 434 (transaction + identity tables)
- Task: Binary classification (fraud yes/no)
- Domain: Finance / E-commerce Payments
- Target: isFraud (Fraud: 3.5%, Non-fraud: 96.5%)
- Two tables: transaction (590K rows, 394 cols) + identity (144K rows, 41 cols)

## Data Quality Issues Found

### Completeness (Massive Missing Values)
- Many columns have >90% missing values:
  - dist1: 60% missing
  - dist2: 93% missing
  - D1-D15 (timedelta features): 40-90% missing
  - id_01 to id_38: only available for 24% of transactions (identity table)
  - V1-V339: varying missingness (0-85%)
- This is the most missing-value-heavy dataset in common Kaggle competitions
- Missing patterns:
  - Identity features missing = no identity verification performed
  - Dist features missing = distance not calculable (new device/location)
  - V features have block patterns (groups of V columns missing together)
- Fix: Do NOT drop columns with high missing — missingness itself is a feature!
  - Create binary "is_missing" flags for high-missing columns
  - Group V-columns by missing pattern, impute within groups
  - NaN in tree-based models can be handled natively (LightGBM, XGBoost)

### Class Balance
- Fraud: 3.5% (20,663) vs Non-fraud: 96.5% (569,877)
- More balanced than credit card fraud (0.17%) but still significant
- Fix: class_weight, threshold tuning, or evaluation with PR-AUC

### Validity (Categorical Cardinality)
- card1: 13,553 unique values (high cardinality)
- card2: 500 unique values
- P_emaildomain: 59 unique values (gmail.com, yahoo.com, etc.)
- R_emaildomain: 60 unique values
- DeviceInfo: 1,786 unique values (device model strings)
- High cardinality categoricals cannot be one-hot encoded (would create 13,553 columns for card1)
- Fix: Target encoding, frequency encoding, or hash encoding for high-cardinality features

### Feature Correlation
- V-features (V1-V339) are anonymized and many are correlated
  - Groups of V-features have correlation >0.95 (likely derived from same source)
  - V1-V11 are one group, V12-V34 another, etc.
- TransactionAmt and some V-features show moderate correlation
- Fix: Group V-features by correlation pattern, keep one representative per group

### Consistency (Multi-table Join)
- Transaction and Identity tables join on TransactionID
- Only 24% of transactions have identity information (LEFT JOIN leaves NaN)
- Identity features are more available for fraudulent transactions (verification triggered)
- This creates a bias: having identity info correlates with fraud risk
- Fix: Handle join-induced NaN as separate category, not generic missing

### Outlier Ratio
- TransactionAmt: ranges $0.251 to $31,937 (extreme right skew)
  - Fraudulent transactions: mean $123 (lower than legitimate!)
  - Fix: Log transform, create binned features
- TransactionDT: seconds from reference date — monotonically increasing
  - Useful for temporal features (hour, day, weekend)

## Key Insights
- Massive missingness (90%+) doesn't mean bad data — it means "event didn't occur"
- Missingness IS a feature in fraud detection (missing identity = suspicious)
- High cardinality categoricals (13K+ values) require special encoding strategies
- Multi-table joins create "join-induced NaN" which is semantically different from "data missing"
- Anonymized features (V1-V339) grouped by correlation pattern can be reduced significantly
- In fraud detection, the PATTERN of missing values often predicts fraud better than the values themselves
