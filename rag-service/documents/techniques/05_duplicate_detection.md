# Duplicate Detection & Removal — Data Quality Fix Guide

## Source
- Primary: pandas official documentation "DataFrame.duplicated()" / "DataFrame.drop_duplicates()"
- Secondary: recordlinkage library documentation (fuzzy matching)

## When to Use
- Uniqueness score is low (< 0.9)
- Dataset has repeated rows or near-identical records
- Data was collected from multiple sources (merge artifacts)

## Types of Duplicates

### 1. Exact Duplicates
- All columns have identical values
- Easiest to detect and remove
- Common cause: Data pipeline re-runs, ETL errors

### 2. Partial Duplicates (Key-based)
- Same entity appears multiple times with slight differences
- Example: Same customer, different phone numbers
- Need to define which columns constitute a "key"

### 3. Near-Duplicates (Fuzzy)
- Similar but not identical values (typos, format differences)
- Example: "John Smith" vs "john smith" vs "J. Smith"
- Requires similarity matching (Levenshtein distance, Jaccard)

### 4. Semantic Duplicates
- Different representations of the same thing
- Example: "NYC" vs "New York City" vs "New York, NY"
- Hardest to detect automatically

## Detection Methods

| Method | Type | Tool | Complexity |
|--------|------|------|:----------:|
| df.duplicated() | Exact | pandas | Low |
| df.duplicated(subset=[cols]) | Partial | pandas | Low |
| Levenshtein distance | Near-duplicate (strings) | fuzzywuzzy/rapidfuzz | Medium |
| Record linkage | Near-duplicate (records) | recordlinkage library | High |
| Hash-based | Exact (large scale) | hashlib | Low |
| MinHash/LSH | Near-duplicate (large scale) | datasketch | High |

## When to Remove vs Keep

### REMOVE when:
- Exact duplicates from ETL errors (data pipeline ran twice)
- Test data leaked into training data
- Web scraping collected same page multiple times

### KEEP when:
- Legitimate repeated events (customer bought same item twice — valid transaction)
- Time-series: same values on different dates (stock price unchanged)
- Survey: same answer from different respondents

### INVESTIGATE when:
- Partial duplicates (same person, different records — which is correct?)
- Near-duplicates in text data (retweets vs original tweets)

## Task-Specific Considerations

| ML Task | Duplicate Impact | Recommendation |
|---------|-----------------|----------------|
| Classification | Inflates accuracy for duplicated class | Remove before split |
| Regression | Overweights duplicated patterns | Remove |
| Time Series | Same values ≠ duplicates (price stayed same) | Don't remove based on value alone |
| Recommendation | Same user-item interaction logged twice | Deduplicate by (user, item, timestamp) |
| NLP | Same text in train and test = data leakage | Remove exact matches across splits |
| Clustering | Duplicates create artificial density | Remove before clustering |

## Code Patterns

```python
# Check for exact duplicates
n_duplicates = df.duplicated().sum()
print(f"Exact duplicates: {n_duplicates} ({n_duplicates/len(df)*100:.1f}%)")

# View duplicates
df[df.duplicated(keep=False)].sort_values(by=df.columns.tolist())

# Remove exact duplicates (keep first occurrence)
df_clean = df.drop_duplicates(keep='first')

# Remove duplicates based on key columns
df_clean = df.drop_duplicates(subset=['customer_id', 'transaction_date'], keep='last')

# Fuzzy matching for near-duplicates
from rapidfuzz import fuzz
def find_similar(name, names_list, threshold=85):
    return [n for n in names_list if fuzz.ratio(name, n) >= threshold]

# Check for duplicates between train and test (leakage!)
common = set(train['id']).intersection(set(test['id']))
print(f"Leakage: {len(common)} IDs appear in both train and test")
```

## KDD Cup 99 Case Study

The KDD Cup 99 network intrusion dataset has ~78% exact duplicates.
- Original: 4,898,431 rows → After dedup: ~1,074,992 rows
- Models trained on duplicated data reported 99%+ accuracy (inflated)
- NSL-KDD (deduplicated version) is the standard benchmark
- Lesson: ALWAYS check duplicates before reporting model metrics

## Key Insight
Duplicates don't just waste storage — they BIAS your model. A duplicated row gets more weight during training, inflating metrics for the patterns in those rows. In KDD99, removing 78% duplicates changed the "state of the art" accuracy from 99.9% to ~85%.
