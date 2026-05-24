# Data Type Validation & Encoding — Data Quality Fix Guide

## Source
- Primary: scikit-learn official documentation "Encoding categorical features"
- Secondary: pandas documentation "Categorical data", "astype()", "to_numeric()"

## When to Use
- Validity score is low (< 0.8)
- Columns have wrong dtypes (numeric stored as string)
- Categorical columns need encoding for ML models
- Date/time columns stored as strings

## Common Validity Issues

### 1. Numeric Stored as String
- Cause: Blank values, currency symbols, commas, special characters
- Example: TotalCharges = "" (empty string prevents numeric parsing)
- Example: Price = "$1,234.56" (symbols prevent parsing)
- Detection: df.dtypes shows 'object' for supposedly numeric columns

### 2. Categorical Stored as Numeric
- Cause: Encoded as integers but actually categories
- Example: MSSubClass = 20, 30, 60 (housing type CODES, not quantities)
- Example: ZipCode = 10001 (location code, not number)
- Risk: Model treats zip code 90210 as "larger" than 10001

### 3. Date Stored as String
- Cause: Various date formats not auto-detected
- Example: "2023-01-15", "01/15/2023", "Jan 15 2023", "15-Jan-23"
- Risk: Can't extract temporal features (month, day_of_week, etc.)

### 4. Mixed Types in Column
- Cause: Data entry errors, merged sources
- Example: Age column has "25", "thirty", "N/A", 26
- Risk: Entire column forced to 'object' type

## Encoding Methods for Categorical Features

| Method | When to Use | Output | Example |
|--------|-------------|--------|---------|
| OrdinalEncoder | Ordered categories (low/medium/high) | Single integer column | Education: 1,2,3,4,5 |
| OneHotEncoder | Unordered, low cardinality (<10) | N binary columns | Color: [1,0,0], [0,1,0] |
| TargetEncoder | High cardinality (>20 unique) | Single float column | City → mean(target) per city |
| BinaryEncoder | Medium cardinality (10-50) | log2(N) columns | Category → binary representation |
| FrequencyEncoder | When count matters | Single float column | Category → frequency in dataset |
| HashEncoder | Very high cardinality (>100) | Fixed number of columns | Product ID → hashed features |

## When to Use Which Encoding

| Scenario | Encoding | Reason |
|----------|----------|--------|
| Gender (M/F) | OneHot or Binary (0/1) | Only 2 values |
| Education (None→PhD) | Ordinal | Clear natural order |
| Country (200 values) | Target or Frequency | Too many for OneHot |
| Product ID (10,000+) | Hash | Unmanageable for other methods |
| Day of week (Mon-Sun) | Cyclical (sin/cos) | Monday is close to Sunday |
| Month (1-12) | Cyclical (sin/cos) | December is close to January |
| Tree-based models | Ordinal (any) | Trees don't assume order |
| Linear models | OneHot | Avoid imposing false order |

## Type Conversion Patterns

```python
# String to numeric (handling errors)
df['price'] = pd.to_numeric(df['price'], errors='coerce')  # invalid → NaN

# Remove currency/comma before converting
df['price'] = df['price'].str.replace('[$,]', '', regex=True).astype(float)

# String to datetime
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d', errors='coerce')

# Extract datetime features
df['hour'] = df['date'].dt.hour
df['day_of_week'] = df['date'].dt.dayofweek
df['month'] = df['date'].dt.month

# Identify numeric coded as category
suspect_categorical = [col for col in df.select_dtypes('number').columns 
                       if df[col].nunique() < 10]

# Cyclical encoding for periodic features
import numpy as np
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

# scikit-learn encoding
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
encoded = ohe.fit_transform(df[['category_col']])
```

## Validation Checks

```python
# Check for mixed types
for col in df.columns:
    types = df[col].apply(type).value_counts()
    if len(types) > 1:
        print(f"{col}: mixed types - {types.to_dict()}")

# Check numeric columns for non-numeric values
for col in expected_numeric_cols:
    non_numeric = pd.to_numeric(df[col], errors='coerce').isna() & df[col].notna()
    if non_numeric.any():
        print(f"{col}: {non_numeric.sum()} non-numeric values")
```

## Key Insight
Type validation is often the FIRST step in any data pipeline — if types are wrong, all subsequent analysis (statistics, missing value counts, correlations) will be incorrect. A "numeric" column stored as string won't show up in df.describe() and its NaN won't be counted by df.isnull().
