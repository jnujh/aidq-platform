# MovieLens 100K — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "MovieLens 100K Dataset" (GroupLens Research)
- Reference Notebooks:
  - "MovieLens EDA and Recommendation" by various contributors
  - "Collaborative Filtering" by top-voted analyses

## Dataset Overview
- Rows: 100,000 ratings / Users: 943 / Movies: 1,682
- Task: Recommendation / Collaborative Filtering
- Domain: Entertainment / Media
- Features: userId, movieId, rating (1-5), timestamp
- Rating matrix density: 100,000 / (943 × 1,682) = 6.3% filled

## Data Quality Issues Found

### Completeness (Extreme Sparsity)
- Rating matrix is 93.7% empty (not rated = not missing in traditional sense)
- This sparsity is INHERENT to recommendation data — not a quality issue
- Each user rates only ~106 movies out of 1,682 available
- Each movie has ~60 ratings on average
- Cold start: Some movies have very few ratings (<5) — hard to recommend
- Cold start: Some users have very few ratings (<20) — hard to personalize
- Fix: NOT imputation. Use collaborative filtering algorithms designed for sparse data

### Class Balance (Rating Distribution)
- Rating 1: 6,110 (6.1%)
- Rating 2: 11,370 (11.4%)
- Rating 3: 27,145 (27.1%)
- Rating 4: 34,174 (34.2%)
- Rating 5: 21,201 (21.2%)
- Skewed toward positive ratings (mean 3.53) — users tend to rate movies they liked
- Selection bias: Users choose to rate movies they watched → inherently biased sample
- Fix: Acknowledge bias in evaluation; consider implicit feedback signals

### Validity (Timestamp)
- Timestamps are Unix epochs — need conversion to datetime
- Ratings span from 1997-09-20 to 1998-04-22 (7 months)
- Some users rate many movies in short bursts (batch rating behavior)
- Fix: Time-based train/test split (not random) for realistic evaluation

### Feature Correlation (User-Item Interactions)
- Popular movies get more ratings (popularity bias)
  - Top 10% of movies receive 50%+ of all ratings
  - Long tail: many movies with <10 ratings
- Active users rate more movies (activity bias)
  - Top 10% of users contribute 30%+ of ratings
- These biases affect recommendation fairness
- Fix: Normalize by user mean, or use popularity-debiasing techniques

### Consistency
- Ratings are integers 1-5 — consistent scale
- No half-ratings or decimals
- userId and movieId are consistent integers (no format issues)
- Genre information available in separate file (movies.csv) — pipe-separated multi-label

### Value Accuracy
- Self-reported ratings are subjective — same movie gets 1 and 5 from different users (valid)
- No "wrong" ratings possible — all are user preferences
- Possible issue: users who rate everything 5 (non-discriminating) — 23 users rate >4.5 average
- Fix: Consider removing non-discriminating users or down-weighting their ratings

## Key Insights
- Sparsity (93.7% empty) in recommendation data is normal, not a quality problem
- The real quality issues are BIASES: popularity bias, selection bias, activity bias
- Cold start (few ratings) is the practical data quality challenge for recommendations
- Time-based evaluation is critical — using future ratings to predict past is temporal leakage
- Rating distribution skew (positive bias) means MAE/RMSE should be evaluated per rating level
- "Missing" ratings are NOT missing data — they're unobserved preferences (fundamentally different)
