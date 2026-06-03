# Text Cleaning & Deduplication — Data Quality Fix Guide

## Source
- Primary: HuggingFace `datasets` documentation (text processing, filtering, and deduplication practices)
- Secondary: `datasketch` MinHash/LSH documentation (Broder, "On the resemblance and containment of documents", SEQUENCES 1997 — MinHash; Indyk & Motwani, "Approximate nearest neighbors", STOC 1998 — LSH); Python `unicodedata` NFKC normalization; `langdetect` / `fastText` language identification (Joulin et al., "Bag of Tricks for Efficient Text Classification", EACL 2017); Lee et al., "Deduplicating Training Data Makes Language Models Better" (ACL 2022)

## When to Use
- Diagnosing a text dataset (text column, optionally with a label column)
- uniqueness is low (< 0.8) — exact or near-duplicate documents inflate the corpus
- validity or completeness_text is low — garbled encoding, HTML residue, or empty/placeholder rows
- consistency is low — mixed languages or wildly varying document lengths

## Cleaning & Dedup Techniques

### 1. Normalization (run before any dedup or hashing)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Unicode NFKC | `unicodedata.normalize("NFKC", t)` folds compatibility variants and full-width forms | All corpora; makes downstream hashing/dedup deterministic |
| HTML unescape + strip markup | Remove `&amp;`, tags, and backslash escapes (web-scrape residue) | Web-scraped sets (AG News, IMDB) |
| Whitespace collapse + case fold | Lowercase and collapse runs of whitespace | Needed for stable exact-dup hashing |
| Control/zero-width removal | Strip control chars and zero-width joiners | Copy-pasted or OCR'd text |

### 2. Language Detection & Filtering

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| `langdetect` / `fastText` lid | Detect document language, keep only target language(s) | Multilingual scrapes where the task is monolingual |
| Confidence threshold | Drop low-confidence detections (often garbled/short) | Doubles as a garbage filter |
| Script/charset filter | Keep documents whose script matches the target | Fast pre-filter before model-based LID |

### 3. Exact Deduplication

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Normalized-hash | Hash the normalized text (e.g., SHA-1/MD5), drop collisions | Exact and trivially-near duplicates; O(n) |
| Cross-split dedup | Remove documents shared across train/test | Prevents leakage that inflates reported accuracy |

### 4. Near-Duplicate Deduplication (MinHash + LSH)

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Shingling | Convert each doc to k-gram token shingles | Captures local overlap for Jaccard estimation |
| MinHash (`datasketch`) | Estimate Jaccard similarity from min-hash signatures | Scales to large corpora; tune num_perm for accuracy/cost |
| MinHashLSH | Bucket similar signatures so only candidates are compared | Avoids O(n²); set threshold ≈ 0.7–0.9 for "near-dup" |
| Lee et al. 2022 | Showed dedup reduces memorization and improves LM quality | Justifies near-dup removal for large training corpora |

### 5. Quality Filters

| 기법 | 설명 | 적용 조건 |
|------|------|-----------|
| Length filter | Drop docs below a min-token floor or above a max cap | Removes empty/stub rows and runaway outliers |
| Stopword/symbol ratio filter | Drop docs that are mostly stopwords, punctuation, or digits | Removes boilerplate and junk |
| Placeholder strip | Remove leftover [MASK]/[PAD]/empty tokens | Raises completeness_text |

## Weighting Guidance
Raise `uniqueness` weight when the corpus is web-scraped or aggregated from multiple sources, where
reprinted articles and templated pages are common. Keep `validity`/`completeness_text` weight high for
raw scrapes (HTML residue, encoding errors) and low for already-clean curated benchmarks. Apply
normalization first — exact and MinHash dedup are only reliable on consistently normalized text.

## Key Insight
Order matters: normalize (NFKC + HTML/whitespace) first, then exact-hash dedup for cheap wins, then
MinHash+LSH for near-duplicates at scale. Deduplication is not just hygiene — Lee et al. (2022) showed
that removing duplicates reduces memorization and measurably improves model quality, and cross-split
dedup is the single most effective guard against leakage-inflated accuracy.
