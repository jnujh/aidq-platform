# Text Dataset Quality Diagnosis — Data Quality Fix Guide

## Source
- Primary: cleanlab for text label errors — Northcutt, Jiang, Chuang, "Confident Learning: Estimating Uncertainty in Dataset Labels" (JAIR, 2021); Northcutt et al., "Pervasive Label Errors in Test Sets" (NeurIPS 2021) audited text sets (AG News, IMDB, Amazon)
- Secondary: `datasketch` MinHash/LSH and normalized-hash dedup; HuggingFace `datasets` quality practices; type-token ratio (lexical diversity, Templin 1957); back-translation augmentation (Sennrich et al., "Improving Neural Machine Translation Models with Monolingual Data", ACL 2016); `distilbert-base-uncased` mean-pooled embeddings (Sanh et al. 2019)

## When to Use
- Diagnosing a text classification dataset (text column + label column in a CSV)
- label_consistency, sample_quality_text, or completeness_text scores are low (< 0.8)

## Text Quality Metrics (DSC text cell, 10 metrics)

| Metric | Meaning | Low score implies |
|--------|---------|-------------------|
| completeness_text | 1 − protected/empty token ratio ([MASK]/[PAD]/empty) | Placeholder or empty tokens |
| uniqueness | 1 − normalized-hash duplicate ratio | Duplicated documents |
| validity | UTF-8 + non-empty + ≥1 token ratio | Empty/garbled rows |
| consistency | Token-count bucket entropy uniformity | Lengths scattered very short↔long |
| outlier_ratio | Token-count IQR non-outlier ratio | A few extremely long/short docs |
| class_balance | Min-class / ideal ratio | Some labels are rare |
| feature_correlation | DistilBERT embedding redundancy | — (informational) |
| label_consistency | k-NN DistilBERT label agreement (chance-corrected) | Mislabeled texts; classes overlap semantically |
| feature_informativeness | embedding→label MI / H(Y) | Text barely predicts the label |
| sample_quality_text | type-token ratio + length adequacy | Repetitive or too-short texts |

## Fix Techniques by Metric

### label_consistency — cleanlab / Confident Learning (highest weight, 0.20)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Confident Learning | Estimate label-error joint distribution from predicted probabilities; rank suspects | Cross-validated `predict_proba` from any text classifier |
| cleanlab `find_label_issues` | Library implementation; returns ranked suspect indices | sklearn / transformers classifier |
| k-NN embedding audit | Inspect texts whose DistilBERT k-NN neighbors disagree with the label | Focus on overlapping classes (Business↔Sci/Tech) |

- Northcutt et al. (2021) found real label errors in AG News, IMDB, and Amazon Reviews via this method.

### sample_quality_text — type-token ratio + length adequacy

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Type-token ratio (TTR) | unique tokens / total tokens; low ⇒ repetitive/boilerplate | Strong signal for LONG docs; weak for short headlines |
| Length adequacy | Penalize too-short docs (below a min-token floor) | Binding term for short texts (headlines, SMS, tweets) |
| Boilerplate removal | Strip repeated templates/signatures/footers | Raises TTR |

### uniqueness — normalized-hash / MinHash dedup

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Normalized-hash | Lowercase + collapse whitespace, then hash; drop collisions | Exact / trivially-near duplicates |
| MinHash + LSH (`datasketch`) | Approximate Jaccard for near-duplicate text at scale | Large corpora, fuzzy repeats (reprinted wire stories) |
| Cross-split dedup | Remove texts shared across train/test | Prevents leakage that inflates accuracy |

### validity & completeness_text — encoding + token checks

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| UTF-8 / non-empty / ≥1-token filter | Drop garbled or empty rows | Ingestion gate |
| HTML-unescape + strip markup | Remove `&amp;`, tags, backslash escapes (AG News/IMDB scrape residue) | Web-scraped corpora |
| Placeholder strip | Remove leftover [MASK]/[PAD]/empty tokens | Raises completeness_text |

### class_balance — back-translation / paraphrase augmentation

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Back-translation | Translate to a pivot language and back to paraphrase (Sennrich et al. 2016) | Minority-class oversampling without raw duplication |
| Paraphrase model | Generate semantic paraphrases of minority texts | Adds lexical diversity to minority class |
| class_weight | Penalize minority misclassification | When augmentation is impractical |

### consistency & outlier_ratio — length policy

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Truncation/chunking policy | Standardize document length | Wide token-count spread |
| Trim extreme docs | Cap or drop token-count IQR outliers | A few very long/short docs |

## Weighting Guidance
For text classification, keep `label_consistency` (0.20) and `sample_quality_text` (0.15) high. Raise
`class_balance` for skewed sentiment/intent datasets. On balanced benchmarks (AG News) class_balance,
validity, and consistency are ~1.0 by construction — give them low weight. For short texts (headlines,
SMS) prefer LENGTH ADEQUACY over type-token ratio inside sample_quality_text.

## Key Insight
cleanlab/Confident Learning is the citable backbone for text label_consistency — it surfaced real label
errors in AG News and IMDB. For short-text datasets, length adequacy (not TTR) drives sample_quality,
and back-translation is the principled way to fix class_balance without duplicating rows.
