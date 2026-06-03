# IMDB Large Movie Review — EDA & Data Quality Analysis

## Source
- Dataset: IMDB Large Movie Review Dataset v1.0 (Maas, Daly, Pham, Huang, Ng, Potts, "Learning Word Vectors for Sentiment Analysis", ACL 2011)
- Distribution: Stanford AI Lab (`ai.stanford.edu/~amaas/data/sentiment/`); also HuggingFace `datasets` ("imdb") and Kaggle "IMDB Dataset of 50K Movie Reviews"
- License: research use as stated by the authors; reviews sourced from imdb.com
- Label-error reference: Northcutt et al., "Pervasive Label Errors in Test Sets" (NeurIPS 2021) audited IMDB among 10 benchmarks

## Dataset Overview
- Rows: 50,000 labeled reviews (25,000 train / 25,000 test), plus 50,000 unlabeled
- Columns: review text, sentiment label
- Classes: 2 (positive, negative) — balanced 25,000 / 25,000
- Task: Binary sentiment classification
- Domain: NLP / Movie reviews / Long-form opinion text
- Length: long documents — typically a few hundred words; mean ~230 words, with a long right tail of multi-paragraph reviews
- Construction: highly polar reviews only — star ratings ≤4 → negative, ≥7 → positive; neutral (5–6) excluded; capped at 30 reviews per movie to limit per-title correlation

## Data Quality Issues Found

### Validity (Text Issues) — primary IMDB concern
- Reviews were scraped from web pages and retain HTML residue: `<br />` line-break tags are pervasive, plus escaped entities (`&amp;`, `&quot;`, `&#39;`).
- Stray markup inflates token counts and pollutes the vocabulary if not stripped.
- Fix: HTML-unescape then strip markup (`<br />` → space) before tokenizing; after cleaning, UTF-8 validity and ≥1-token checks pass at ~100%.

### Consistency (Length Distribution)
- Token-count spread is WIDE: from one-line reviews to multi-paragraph essays. Token-count bucket entropy is high-spread, so consistency is lower than for short-text benchmarks (headlines, SMS).
- Fix: adopt a truncation/chunking policy (e.g. cap at a max token length) to standardize document length for fixed-window models.

### Outlier Ratio
- A minority of reviews are extremely long (full plot recaps, multi-film comparisons) and sit well above the token-count IQR upper fence.
- Fix: cap or trim token-count IQR outliers; for transformers, truncation already mitigates the modeling impact.

### Uniqueness (Duplicates)
- The per-movie cap (≤30 reviews) reduces but does not eliminate near-duplicates: the same reviewer reposts edited reviews, and boilerplate disclaimers recur.
- Fix: normalized-hash dedup (lowercase + whitespace-collapse) for exact/near repeats; MinHash+LSH for fuzzy duplicates at scale; cross-split dedup to prevent leakage.

### Label Consistency
- Labels derive from star ratings, a reliable but imperfect proxy. Sarcasm and mixed reviews ("I wanted to love it, but…") create genuine label noise near the decision boundary.
- Northcutt et al. (2021) surfaced real IMDB label errors via Confident Learning, confirming the noise is genuine and not only model confusion.
- Fix: audit k-NN DistilBERT disagreements and cleanlab-ranked suspects; relabel or drop the worst offenders.

### Sample Quality (Text)
- Because reviews are LONG, type-token ratio (lexical diversity) is the binding term of sample_quality_text — repetitive reviews that restate the plot lower TTR. Length adequacy is rarely the constraint here (the opposite of headline/SMS datasets).
- Fix: strip boilerplate/repeated disclaimers to raise TTR.

### Class Balance
- Balanced by construction (25,000 / 25,000) → class_balance ~1.0. Do not over-weight for IMDB.

### Feature Informativeness / Correlation
- DistilBERT embeddings separate polar reviews well (high mutual information with the label) because the dataset deliberately excludes neutral 5–6 ratings. feature_correlation is informational.

## Weight Recommendation Guidance
- Raise `validity` above its AG News level: HTML/`<br />` residue is the signature IMDB issue and degrades downstream tokenization if ignored.
- Keep `consistency` and `outlier_ratio` meaningful (non-trivial) — unlike short-text sets, IMDB has a genuinely wide length distribution.
- Keep `label_consistency` high (0.20) — sarcasm/mixed reviews are real boundary noise.
- For `sample_quality_text`, favor type-token ratio over length adequacy (long docs).
- Keep `class_balance` low — it is ~1.0 by construction.

## Key Insights
- IMDB's signature data-quality issue is VALIDITY: `<br />` tags and HTML entities from web scraping must be stripped before tokenizing.
- Unlike short-text benchmarks, IMDB has a genuinely WIDE length distribution — consistency and outlier_ratio matter, and truncation/chunking is a real decision.
- For long reviews, type-token ratio (not length adequacy) drives sample_quality_text.
- Label noise is real but moderate — Confident Learning (Northcutt et al. 2021) flagged genuine IMDB errors, mostly sarcastic/mixed reviews near the polarity boundary.
- Balance is artificial (~1.0); uniqueness still needs cross-split dedup despite the per-movie cap.
