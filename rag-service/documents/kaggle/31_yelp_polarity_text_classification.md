# Yelp Review Polarity — EDA & Data Quality Analysis

## Source
- Dataset: Yelp Review Polarity (Zhang, Zhao, LeCun, "Character-level Convolutional Networks for Text Classification", NeurIPS 2015), derived from the Yelp Dataset Challenge corpus
- Distribution: HuggingFace `datasets` ("yelp_polarity"); also the Crepe/char-CNN release and Kaggle mirrors
- License: per the Yelp Dataset terms (academic/research use); reviews sourced from yelp.com
- Related: a 5-class variant (Yelp Review Full) exists; this document covers the 2-class polarity version

## Dataset Overview
- Rows: 598,000 (560,000 train / 38,000 test)
- Columns: review text, sentiment label
- Classes: 2 (negative = 1–2 stars, positive = 3–4 stars; 3-star reviews excluded) — balanced by construction
- Task: Binary sentiment classification
- Domain: NLP / Business & restaurant reviews / Consumer opinion text
- Length: medium-to-long documents (typically 100+ words); shorter on average than IMDB but longer than headlines/SMS

## Data Quality Issues Found

### Uniqueness (Duplicates) — primary Yelp concern
- Consumer-review platforms accumulate duplicates: copy-pasted reviews across a chain's locations, the same user reposting near-identical text for related businesses, and template/promotional reviews.
- Near-duplicates inflate apparent dataset size and, if split carelessly, leak between train and test.
- Fix: normalized-hash dedup (lowercase + whitespace-collapse) for exact/near repeats; MinHash+LSH (`datasketch`) for fuzzy near-duplicates at this scale; cross-split dedup before evaluation.

### Validity (Text Issues)
- Free-form user text contains newlines, emoji, non-ASCII punctuation (curly quotes, accented characters from multilingual reviewers), and occasional URLs.
- Some reviews are very short ("Great!", "Never again") — valid but low-information.
- Fix: UTF-8 / non-empty / ≥1-token filter at ingestion; normalize whitespace and Unicode punctuation; decide whether to keep or token-replace emoji/URLs.

### Consistency (Length Distribution)
- Lengths are moderately spread — terse one-liners alongside detailed multi-paragraph reviews — so token-count bucket entropy is high-spread (lower consistency than headline datasets, somewhat less extreme than IMDB).
- Fix: truncation/chunking policy for fixed-window models.

### Outlier Ratio
- A tail of exhaustive reviews (full meal-by-meal recaps, multi-visit logs) exceeds the token-count IQR fence.
- Fix: cap or trim token-count outliers; truncation mitigates modeling impact.

### Label Consistency
- The 1–2 vs 3–4 star mapping is a reasonable proxy but mixed reviews ("food great, service terrible") and 3-star-adjacent sentiment create boundary noise. Sarcasm appears as in all review text.
- Fix: audit k-NN DistilBERT disagreements and cleanlab-ranked suspects near the polarity boundary.

### Sample Quality (Text)
- Medium-to-long reviews → type-token ratio is informative; repetitive promotional/template reviews lower TTR. Length adequacy binds only for the very short "Great!" reviews.
- Fix: strip boilerplate; flag ultra-short reviews via the length-adequacy floor.

### Class Balance
- Balanced by construction (equal positive/negative) → class_balance ~1.0. Do not over-weight.

### Feature Informativeness / Correlation
- DistilBERT embeddings separate polar reviews well (3-star reviews excluded), giving high mutual information with the label. feature_correlation is informational.

## Weight Recommendation Guidance
- Raise `uniqueness` above its AG News level: duplicate/near-duplicate reviews (chain copy-paste, reposts) are Yelp's signature issue and a real leakage risk at 598K rows.
- Keep `validity` moderate — emoji, Unicode punctuation, and ultra-short reviews need an ingestion gate.
- Keep `consistency`/`outlier_ratio` non-trivial (medium length spread).
- Keep `label_consistency` high (0.20) for mixed-review boundary noise.
- Keep `class_balance` low — ~1.0 by construction.

## Key Insights
- Yelp's signature data-quality issue is UNIQUENESS: large-scale near-duplicate reviews (chain copy-paste, user reposts, templates) demand MinHash/LSH dedup and cross-split dedup to avoid leakage.
- Balance is artificial (~1.0); class_balance deserves low weight.
- Length spread is real but milder than IMDB — consistency/outlier_ratio still matter.
- Label noise concentrates on mixed reviews near the 2↔3-star boundary; Confident Learning / k-NN audit is the citable fix.
- For these medium-to-long reviews, type-token ratio is the active sample_quality_text term, with a length-adequacy floor catching ultra-short reviews.
