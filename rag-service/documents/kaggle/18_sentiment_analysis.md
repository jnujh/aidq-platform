# Sentiment Analysis (Twitter/IMDB) — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Twitter Sentiment Analysis" / "IMDB Dataset of 50K Movie Reviews"
- Reference Notebooks:
  - "NLP - Twitter Sentiment Analysis" by various top-voted
  - "IMDB Sentiment Classification" by EDA-focused notebooks

## Dataset Overview
- IMDB: 50,000 reviews / Columns: 2 (review text, sentiment)
- Twitter: ~1.6 million tweets / Columns: 6 (text, sentiment, user, date, etc.)
- Task: Binary classification (positive/negative sentiment)
- Domain: Social Media / Entertainment / NLP
- Target: sentiment (positive/negative)

## Data Quality Issues Found

### Completeness
- IMDB: Zero missing values — curated dataset
- Twitter: Some missing user fields, but text column is always present
- NLP datasets rarely have structural missing values — quality issues are in the TEXT itself

### Uniqueness (Text Duplicates)
- IMDB: Some near-duplicate reviews (same reviewer, slightly different wording)
  - Exact duplicates: ~400 rows
  - Fix: Remove exact duplicates; near-duplicates harder to detect
- Twitter: Higher duplication rate (retweets, copy-paste tweets)
  - RT prefix indicates retweet — may want to remove or flag
  - Same tweet posted by multiple accounts (bots)
  - Fix: Remove RTs, deduplicate by text similarity (Jaccard > 0.9)

### Validity (Text Quality Issues)
- HTML tags in IMDB reviews: `<br>`, `<p>`, `&amp;`
  - Fix: BeautifulSoup or regex to strip HTML
- URLs in Twitter data: `http://t.co/...`
  - Fix: Regex removal or replacement with [URL] token
- @mentions and #hashtags in Twitter
  - Fix: Remove or replace with special tokens
- Emojis and special characters
  - Fix: Decide — remove (loses signal) or encode (adds complexity)
- Non-English text mixed in (especially Twitter)
  - Fix: Language detection, filter to target language

### Consistency (Encoding Issues)
- Unicode characters: curly quotes, em-dashes, non-ASCII
  - Fix: Normalize to ASCII or handle in tokenizer
- Case inconsistency: "GREAT", "great", "Great" — same word
  - Fix: Lowercase all (standard for most NLP tasks)
- Contractions: "don't", "doesn't", "won't" — affect tokenization
  - Fix: Expand contractions before tokenization

### Class Balance
- IMDB: Perfectly balanced (25,000 positive, 25,000 negative) — curated
- Twitter: Often imbalanced (more negative tweets in some datasets)
  - Depends on collection method and topic
  - Fix: Check distribution, apply SMOTE or class_weight if needed

### Value Accuracy (Label Quality)
- Sentiment is subjective — some reviews are ambiguous or sarcastic
- IMDB uses star ratings as proxy (≥7 = positive, ≤4 = negative, 5-6 excluded)
- Twitter sentiment often labeled by automated tools — noisy labels
- Sarcasm, irony: "Oh great, another delay" labeled positive by keyword matching
- Fix: Accept label noise for large datasets; manual review for small datasets

## Key Insights
- Text data quality is fundamentally different from tabular — it's about NOISE IN TEXT, not missing cells
- Main quality dimensions for NLP: duplicates, encoding, HTML/URL noise, label accuracy
- Preprocessing pipeline order matters: lowercase → remove HTML → remove URLs → handle contractions
- Label noise (sarcasm, ambiguity) is the hardest NLP quality issue — no perfect fix
- Balanced vs imbalanced depends on curation — IMDB is artificially balanced, real data rarely is
- For sentiment: keeping negation words ("not good") is critical — aggressive stopword removal hurts
