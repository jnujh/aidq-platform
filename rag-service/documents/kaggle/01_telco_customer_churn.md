# Telco Customer Churn — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Telco Customer Churn" by BlastChar
- Reference Notebooks:
  - "Telco Customer Churn Prediction" by Rad (2223 votes)
  - "Churn Prediction I: EDA + Statistical Analysis" by Manicore (166 votes)

## Dataset Overview
- Rows: 7,043 / Columns: 21
- Task: Binary classification (churn yes/no)
- Domain: Telecom B2C
- Target variable: Churn (Yes: 1,869 / 26.6%, No: 5,174 / 73.4%) — based on full 7,043 rows

## Data Quality Issues Found

### Completeness (Missing Values)
- TotalCharges column has 11 missing values (0.16% of data)
- All 11 missing rows have tenure = 0 (brand new customers)
- Root cause: New customers haven't been charged yet, so TotalCharges is blank (stored as empty string, not NaN)
- The column is typed as object (string) instead of numeric due to these blank values
- Fix: Convert to numeric, fill missing with 0 (logical: new customer = no charges yet)
- Pattern: MNAR (Missing Not At Random) — missingness is explained by tenure value

### Class Balance
- Churn rate: 26.5% (1,869 churned) vs 73.5% (5,174 retained)
- Moderate imbalance — not extreme but significant enough to affect model performance
- Recommended approaches: class_weight adjustment, SMOTE, or stratified sampling
- Note: In real B2B SaaS scenarios, churn rate is much lower (1-5%), making imbalance more severe

### Consistency (Categorical Values)
- SeniorCitizen column uses 0/1 integer encoding while all other categorical columns use Yes/No strings
- This inconsistency can cause confusion in analysis and requires standardization
- Fix: Either convert SeniorCitizen to Yes/No or convert all others to 0/1

### Feature Correlation
- TotalCharges and tenure: correlation 0.83 (high)
- TotalCharges and MonthlyCharges: correlation 0.65 (moderate-high)
- TotalCharges ≈ tenure × MonthlyCharges (near-linear relationship)
- Risk: Multicollinearity can destabilize linear models
- Fix: Check VIF scores, consider dropping TotalCharges or creating ratio features

### Validity (Data Types)
- TotalCharges stored as string (object dtype) instead of float64
- Cause: The 11 empty string values prevent automatic numeric parsing
- Fix: pd.to_numeric(df['TotalCharges'], errors='coerce')

## Key Insights
- Small absolute missing count (11) can still indicate a systematic pattern (MNAR)
- Always check WHY values are missing, not just how many
- Type errors (string vs numeric) often hide behind missing value issues
- For churn prediction, class_balance is critical — 26.5% is manageable but lower rates (B2B) require more aggressive handling
