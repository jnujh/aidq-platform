# SST-2 (Stanford Sentiment Treebank) — EDA & Data Quality Analysis

## Source
- Dataset: SST-2, the binary sentence-level subset of the Stanford Sentiment Treebank (Socher, Perelygin, Wu, Chuang, Manning, Ng, Potts, "Recursive Deep Models for Semantic Compositionality over a Sentiment Treebank", EMNLP 2013)
- Distribution: the GLUE benchmark (Wang et al., "GLUE: A Multi-Task Benchmark…", ICLR 2019 / EMNLP-WS 2018); also HuggingFace `datasets` ("sst2", "glue/sst2")
- License: research use; sentences derived from Pang & Lee's movie-review corpus, annotated via Amazon Mechanical Turk
- Note: SST-2 uses sentence-level binary labels; the test set is unlabeled (GLUE leaderboard), so analysis uses train/validation

## Dataset Overview
- Rows: ~67,349 train / 872 validation / 1,821 test (GLUE split)
- Columns: sentence text, sentiment label
- Classes: 2 (positive, negative) — neutral phrases dropped for the binary task
- Task: Binary sentiment classification at the SENTENCE level
- Domain: NLP / Movie-review sentences / Short opinion text
- Length: SHORT — single sentences and phrases, often a handful of words (some entries are sub-sentence phrases from the treebank)

## Data Quality Issues Found

### Sample Quality (Text) — length adequacy, primary SST-2 concern
- Items are SHORT single sentences, and some are very short sub-sentence phrases ("a masterpiece", "boring and predictable"). Length adequacy is the binding term of sample_quality_text, NOT type-token ratio.
- Type-token ratio is high simply because the texts are short (few token repeats) — TTR is a weak/misleading signal here.
- Fix: rely on the length-adequacy floor (penalize sub-minimal-token phrases) rather than TTR; consider dropping or flagging ultra-short phrase fragments.

### Validity & Completeness (Text)
- Sentences were tokenized by the treebank pipeline: tokens are space-separated, contractions are split ("does n't", "it 's"), and some PTB-style tokenization artifacts remain.
- Movie titles, proper nouns, and occasional non-ASCII characters appear.
- Fix: be aware of pre-tokenized spacing when re-tokenizing (avoid double-tokenization); UTF-8 / non-empty / ≥1-token checks pass at ~100% after handling fragments.

### Consistency (Length Distribution)
- Lengths are tightly clustered at the short end (single sentences/phrases) → token-count bucket entropy is low-spread → consistency is HIGH by construction.

### Outlier Ratio
- Few long outliers — most items are short, so token-count IQR outliers are rare. outlier_ratio is high (clean).

### Label Consistency
- Mechanical-Turk sentence annotations are generally reliable, but short phrases can be context-dependent ("unpredictable" is positive for a thriller, negative for a paycheck) and the binary split forces near-neutral phrases to one side.
- Fix: audit k-NN DistilBERT disagreements; near-neutral phrases concentrate the noise.

### Uniqueness (Duplicates)
- Because items derive from a treebank, sub-phrases of the same sentence can recur, and short generic phrases ("very good", "not bad") repeat across entries.
- Fix: normalized-hash dedup for exact repeats; cross-split dedup (especially train↔validation) to avoid leakage.

### Class Balance
- Roughly balanced positive/negative after dropping neutrals → class_balance is high (near 1.0). Modest weight.

### Feature Informativeness / Correlation
- DistilBERT embeddings separate clear-polarity sentences well; very short phrases carry less context, slightly lowering mutual information for the shortest items. feature_correlation is informational.

## Weight Recommendation Guidance
- Inside `sample_quality_text`, prefer LENGTH ADEQUACY over type-token ratio — SST-2 is short-sentence/phrase data where TTR is misleading.
- Keep `consistency` and `outlier_ratio` LOW weight — they are ~1.0 by construction (tightly clustered short lengths).
- Keep `class_balance` LOW — near 1.0 after neutral removal.
- Keep `label_consistency` high (0.20) — short, context-dependent phrases near the neutral boundary carry the real noise.
- Watch `uniqueness` for treebank sub-phrase repetition and train↔validation leakage.

## Key Insights
- SST-2's signature trait is SHORT TEXT (sentence/phrase level), so LENGTH ADEQUACY — not type-token ratio — is the active sample_quality_text term; TTR is high but uninformative here.
- consistency, outlier_ratio, and class_balance are all ~1.0 by construction — give them low weight (the opposite emphasis from long-document sets like IMDB).
- Label noise concentrates on short, context-dependent phrases forced across the neutral-removed binary boundary.
- Treebank origin means sub-phrase duplication and train↔validation leakage are real uniqueness risks despite the small item size.
