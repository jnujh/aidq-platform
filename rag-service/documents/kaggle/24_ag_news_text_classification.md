# AG News Text Classification — EDA & Data Quality Analysis

## Source
- Dataset: AG News (Zhang, Zhao, LeCun, "Character-level Convolutional Networks for Text Classification", NeurIPS 2015), constructed from the AG's corpus of news articles
- Distribution: Kaggle "AG News Classification Dataset"; also `torchtext`/HuggingFace `datasets` ("ag_news")
- Label-error reference: Northcutt et al., "Pervasive Label Errors in Test Sets" (NeurIPS 2021) audited AG News among 10 benchmarks

## Dataset Overview
- Rows: 127,600 (120,000 train / 7,600 test)
- Columns: title, description (often concatenated), class label
- Classes: 4 (World, Sports, Business, Sci/Tech)
- Task: Multi-class text (topic) classification
- Domain: NLP / News
- Balance: 30,000 train rows per class — balanced by construction

## Data Quality Issues Found

### Label Consistency (Most Important)
- Topic boundaries blur: Business vs Sci/Tech (e.g. a tech-company earnings story), World vs Business (international trade). These overlap in DistilBERT embedding space.
- Northcutt et al. (2021) flagged real AG News label errors, confirming the boundary ambiguity is genuine noise, not just model confusion.
- k-NN DistilBERT label-agreement drops at the Business↔Sci/Tech boundary; cleanlab concentrates flagged errors there.
- Fix: audit k-NN disagreements on the Business/Sci-Tech overlap; relabel or define a tie-breaking rule.

### Sample Quality (Text)
- Items are SHORT (a headline + one-sentence description, typically tens of tokens). Length-adequacy is the binding term of sample_quality_text, not lexical diversity.
- Type-token ratio is high simply because texts are short (few repeats) — TTR is a weak signal here; rely on length adequacy.

### Validity & Completeness
- Originally HTML-scraped: escaped entities (`&amp;`, `&lt;`), literal `\` backslash-escapes, and stray markup appear in raw dumps.
- Fix: HTML-unescape and strip markup; after cleaning, UTF-8 validity and ≥1-token checks pass at ~100%.
- completeness_text ([MASK]/[PAD]/empty ratio) is high (clean) once empty/markup-only rows are removed.

### Consistency (Length Distribution)
- Lengths are tightly clustered (headline-scale) → token-count bucket entropy is low-spread → consistency is high.
- A few rows concatenate multiple sentences → minor outlier_ratio on token count, but not severe.

### Class Balance
- Balanced by construction (30,000/class) → class_balance ~1.0. Do not over-weight for AG News.

### Uniqueness (Duplicates)
- Wire-service stories get reprinted across outlets → near-duplicate descriptions exist.
- Normalized-hash dedup (lowercase + whitespace-collapse) catches exact/near repeats; cross-split duplicates cause leakage.
- Fix: normalized-hash dedup before train/test split.

### Feature Informativeness / Correlation
- DistilBERT embeddings separate Sports and World cleanly (high mutual information); Business/Sci-Tech share vocabulary → lower local separability.
- feature_correlation is informational.

## Key Insights
- LABEL_CONSISTENCY dominates and the noise concentrates at the Business↔Sci/Tech topic boundary (confirmed by Northcutt et al. 2021).
- Texts are short headlines, so LENGTH ADEQUACY — not type-token ratio — drives sample_quality_text.
- Real validity issues come from HTML-scrape residue (entities, backslash escapes); clean before tokenizing.
- Balance is artificial (~1.0) and uniqueness needs cross-split dedup to avoid leakage from reprinted wire stories.
