# TREC Question Classification — EDA & Data Quality Analysis

## Source
- Dataset: TREC question classification (Li & Roth, "Learning Question Classifiers", COLING 2002), built on the UIUC/TREC QA question set
- Distribution: the UIUC CogComp release (`cogcomp.seas.upenn.edu`); also HuggingFace `datasets` ("trec") and `torchtext`
- License: research use, widely redistributed
- Two label granularities: 6 coarse classes and 50 fine-grained classes — this document focuses on the coarse 6-class task (the fine task is noted where relevant)

## Dataset Overview
- Rows: 5,952 questions (5,452 train / 500 test)
- Columns: question text, coarse label (and fine label)
- Coarse classes (6): ABBR (abbreviation), DESC (description/definition), ENTY (entity), HUM (human), LOC (location), NUM (numeric)
- Task: Question type / answer-type classification
- Domain: NLP / Question Answering / Very short interrogative text
- Length: VERY SHORT — single questions, typically ~10 words ("What is the capital of France?", "Who wrote Hamlet?")

## Data Quality Issues Found

### Sample Quality (Text) — extreme length adequacy, primary TREC concern
- Items are VERY SHORT single questions (often under a dozen tokens). Length adequacy is the dominant and binding term of sample_quality_text; type-token ratio is essentially uninformative (almost every token is unique in a 10-word question).
- Fix: rely entirely on the length-adequacy floor; do not interpret high TTR as quality here.

### Class Balance — genuine imbalance, secondary concern
- Unlike the balanced-by-construction sentiment benchmarks, TREC's coarse classes are uneven: ENTY, HUM, DESC, NUM, and LOC are sizable, but ABBR is very small (roughly 1% of the data — under a hundred train examples).
- This is REAL imbalance, not a curation artifact — class_balance genuinely matters here.
- Fix: class_weight for the rare ABBR class; back-translation/paraphrase augmentation (Sennrich et al. 2016) to oversample ABBR without raw duplication.

### Label Consistency
- The 6 coarse classes are fairly distinct, but the 50 fine-grained classes overlap (e.g. ENTY subtypes; NUM:date vs NUM:count) and question phrasing can be ambiguous ("What is X?" can be DESC:definition or ENTY depending on X).
- Fix: audit k-NN DistilBERT disagreements, focusing on the fine-grained subtype boundaries and DESC↔ENTY ambiguity.

### Consistency (Length Distribution)
- Lengths are tightly clustered (all short questions) → token-count bucket entropy is low-spread → consistency is HIGH by construction.

### Outlier Ratio
- Very few long outliers — questions are uniformly short, so token-count IQR outliers are rare. outlier_ratio is high (clean).

### Validity & Completeness (Text)
- Clean, curated English questions: UTF-8 / non-empty / ≥1-token checks pass at ~100%; almost no markup, [MASK]/[PAD], or encoding residue.
- Minor: some questions retain original-source capitalization/punctuation quirks. completeness_text is high.

### Uniqueness (Duplicates)
- Some near-duplicate question templates recur ("What is the ... of ...?"), but exact duplicates are few in this small curated set.
- Fix: normalized-hash dedup for exact repeats; cross-split dedup (train↔test) to avoid leakage given the tiny 500-row test set.

### Feature Informativeness / Correlation
- Question wh-words and structure (Who→HUM, Where→LOC, When/How many→NUM) make DistilBERT embeddings highly predictive of the coarse label → high mutual information. feature_correlation is informational.

## Weight Recommendation Guidance
- Inside `sample_quality_text`, use LENGTH ADEQUACY exclusively — TREC is the shortest text set here and TTR is meaningless.
- RAISE `class_balance` — unlike the sentiment benchmarks, TREC has genuine imbalance (ABBR ~1%); this is the one short-text set where class_balance earns real weight.
- Keep `consistency`, `outlier_ratio`, `completeness_text`, and `validity` LOW weight — they are ~1.0 (curated, uniformly short).
- Keep `label_consistency` high (0.20), especially for the 50-class fine task.
- Watch `uniqueness` for train↔test leakage given the tiny 500-row test set.

## Key Insights
- TREC is the EXTREME short-text case: very short questions, so LENGTH ADEQUACY is the only meaningful sample_quality_text term and type-token ratio is uninformative.
- Distinct from the sentiment benchmarks, TREC has GENUINE class imbalance (ABBR ~1%) — class_balance deserves real weight, and back-translation is the principled fix to avoid raw duplication.
- validity, completeness_text, consistency, and outlier_ratio are all ~1.0 (clean, curated, uniformly short) — give them low weight.
- Label noise lives mainly in the 50-class fine task and DESC↔ENTY phrasing ambiguity, not the 6 coarse classes.
- The tiny 500-row test set makes cross-split (uniqueness) dedup important to avoid inflated accuracy.
