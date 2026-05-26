# Medical Cost Personal — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Medical Cost Personal Datasets" (Insurance charges)
- Reference Notebooks:
  - "Medical Cost EDA and Regression" by top-voted analyses
  - "Insurance Charges Prediction" by various contributors

## Dataset Overview
- Rows: 1,338 / Columns: 7
- Task: Regression (predict insurance charges)
- Domain: Healthcare / Insurance
- Target variable: charges (mean $13,270, range $1,122 - $63,770)
- Features: age, sex, bmi, children, smoker, region

## Data Quality Issues Found

### Completeness
- Zero missing values — dataset is small and clean
- Only 7 columns — minimal feature set

### Outlier Ratio (Critical Issue)
- charges: extremely right-skewed (skewness ~1.5)
  - Median: $9,382 vs Mean: $13,270 (mean pulled up by outliers)
  - High-cost cluster: smokers with high BMI can reach $60,000+
  - These are NOT errors — they represent real high-cost patients
- bmi: ranges 15.96 to 53.13
  - BMI > 40 is "morbidly obese" but medically valid
  - No data entry errors detected
- age: ranges 18 to 64 — no outliers

Key insight: Outliers in medical data are usually real (not errors) — don't remove them
- Fix: Log-transform charges for linear models, or use tree-based models (robust to outliers)

### Feature Correlation
- smoker and charges: very strong relationship (smokers pay 3-4x more)
- bmi and charges: moderate correlation, amplified by smoking status
- age and charges: moderate positive correlation
- smoker × bmi interaction: strongest predictor (obese smokers = highest charges)
- Fix: Create interaction feature smoker × bmi for linear models

### Validity (Data Types & Encoding)
- sex: binary string ('male'/'female') — encode as 0/1
- smoker: binary string ('yes'/'no') — encode as 0/1
- region: 4 categories ('northeast','northwest','southeast','southwest') — one-hot encode
- children: integer 0-5 — can be treated as numeric or categorical

### Value Accuracy (Distribution Patterns)
- charges shows clear multi-modal distribution:
  - Mode 1: Non-smokers (~$5,000-$15,000)
  - Mode 2: Smokers with low BMI (~$20,000-$25,000)
  - Mode 3: Smokers with high BMI (~$35,000-$50,000)
- This multi-modality suggests interaction effects are critical
- Simple linear regression will underperform without interaction terms

### Uniqueness
- No duplicate rows
- Some individuals have identical features except charges (possible due to other unmeasured factors)
- Small dataset means duplicates would significantly bias results

## Key Insights
- Medical cost data is inherently multi-modal — standard regression assumptions break down
- Smoker status creates two separate populations with different charge distributions
- Outliers in healthcare are typically valid extreme cases, not data errors
- Interaction features (smoker × bmi) can be more predictive than individual features
- Small feature set (7 columns) means feature engineering is more important than feature selection
