# Consistency Standardization — Data Quality Fix Guide

## Source
- Primary: pandas official documentation "Working with text data" (str accessor)
- Secondary: pandas "Categorical data", "replace()", "map()"

## When to Use
- Consistency score is low (< 0.8)
- Same entity has multiple representations (typos, abbreviations, case differences)
- Merged data from different sources with different conventions

## Types of Inconsistency

### 1. Case Inconsistency
- "Male", "male", "MALE", "M" — all mean the same thing
- Detection: df['col'].str.lower().nunique() < df['col'].nunique()

### 2. Whitespace/Formatting
- "  New York ", "New York", "New York  " — leading/trailing spaces
- "John  Smith" — extra internal spaces
- Detection: df['col'] != df['col'].str.strip()

### 3. Abbreviations and Synonyms
- "NY", "New York", "N.Y.", "new york city"
- "Dr.", "Doctor", "Dr"
- "USA", "United States", "US", "U.S.A."

### 4. Unit Inconsistency
- Weight: mix of kg and lbs in same column
- Temperature: Celsius and Fahrenheit
- Currency: USD and EUR without clear indication

### 5. Date Format Inconsistency
- "2023-01-15", "01/15/2023", "15 Jan 2023" in same column
- American (MM/DD) vs European (DD/MM) confusion

### 6. Encoding Inconsistency
- SeniorCitizen: 0/1 while other columns use Yes/No
- Boolean: True/False vs 1/0 vs "Y"/"N"

## Fix Strategies

| Issue | Fix | Code |
|-------|-----|------|
| Case | Lowercase all | df['col'] = df['col'].str.lower() |
| Whitespace | Strip + collapse | df['col'] = df['col'].str.strip().str.replace(r'\s+', ' ', regex=True) |
| Abbreviations | Mapping dictionary | df['col'] = df['col'].map(mapping_dict) |
| Units | Convert to single unit | Manual conversion with multiplier |
| Dates | Parse to datetime | pd.to_datetime(df['col'], infer_datetime_format=True) |
| Boolean encoding | Standardize to one format | df['col'] = df['col'].map({'Yes': 1, 'No': 0}) |

## Standardization Workflow

```
1. Profile unique values: df['col'].value_counts()
2. Identify groups that should be the same value
3. Create mapping dictionary
4. Apply mapping
5. Verify: check nunique() decreased
```

## Code Patterns

```python
# Case + whitespace standardization
df['city'] = df['city'].str.strip().str.lower().str.title()

# Abbreviation mapping
state_mapping = {
    'NY': 'New York', 'N.Y.': 'New York', 'new york': 'New York',
    'CA': 'California', 'Calif.': 'California',
}
df['state'] = df['state'].replace(state_mapping)

# Boolean standardization
bool_mapping = {'Yes': 1, 'No': 0, 'Y': 1, 'N': 0, 'True': 1, 'False': 0}
df['flag'] = df['flag'].map(bool_mapping)

# Detect inconsistent categories
def find_similar_categories(series, threshold=0.8):
    """Find category values that might be the same thing"""
    from rapidfuzz import fuzz
    unique_vals = series.dropna().unique()
    similar_pairs = []
    for i, v1 in enumerate(unique_vals):
        for v2 in unique_vals[i+1:]:
            if fuzz.ratio(str(v1).lower(), str(v2).lower()) > threshold * 100:
                similar_pairs.append((v1, v2))
    return similar_pairs

# Unit conversion example
def convert_to_kg(value, unit):
    if unit == 'lbs':
        return value * 0.453592
    return value  # already kg

# Standardize categorical with pandas Categorical
df['size'] = pd.Categorical(df['size'], categories=['S', 'M', 'L', 'XL'], ordered=True)
```

## Task-Specific Impact

| ML Task | Impact of Inconsistency | Example |
|---------|------------------------|---------|
| Classification | Same class split into multiple labels | "spam" vs "Spam" = 2 different classes |
| Clustering | Same entity in different clusters | "NY" and "New York" in separate clusters |
| Feature importance | Splits importance across variants | "Male" and "male" each get half the weight |
| Join/Merge | Failed joins due to mismatched keys | Customer "John Smith" ≠ "john smith" |

## Prevention Checklist

```python
# Quick consistency audit
for col in df.select_dtypes('object').columns:
    print(f"\n{col} ({df[col].nunique()} unique):")
    # Check for case variants
    if df[col].str.lower().nunique() < df[col].nunique():
        print(f"  ⚠️ Case inconsistency detected")
    # Check for whitespace
    if (df[col] != df[col].str.strip()).any():
        print(f"  ⚠️ Whitespace inconsistency detected")
    # Show top values
    print(f"  Top 5: {df[col].value_counts().head().to_dict()}")
```

## Key Insight
Inconsistency is the most HUMAN error in data — it comes from manual data entry, different conventions across teams, merged datasets from acquisitions. A model trained on "NY" and "New York" as separate categories will never generalize properly. Always run a consistency audit before training.
