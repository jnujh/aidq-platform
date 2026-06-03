# 20 Newsgroups — EDA & Data Quality Analysis

## Source
- Dataset: 20 Newsgroups (Lang, "NewsWeeder: Learning to Filter Netnews", ICML 1995); the "bydate" version is the standard train/test split
- Distribution: `scikit-learn` `fetch_20newsgroups`; also the Jason Rennie cleaned release (`qwone.com/~jason/20Newsgroups/`) and HuggingFace mirrors
- License: public, widely redistributed for research
- Note: scikit-learn exposes `remove=('headers','footers','quotes')` precisely because those segments cause leakage — directly relevant to the issues below

## Dataset Overview
- Rows: ~18,846 documents (~11,314 train / ~7,532 test, bydate split)
- Columns: document text, newsgroup label
- Classes: 20 Usenet newsgroups, grouped into related topics (e.g. `comp.*`, `rec.*`, `sci.*`, `talk.politics.*`, `talk.religion.*`, `soc.religion.christian`)
- Task: Multi-class topic classification
- Domain: NLP / Usenet discussion posts / Long-form forum text
- Balance: roughly even per class (~600–1,000 docs each) — mild, not perfect
- Length: long, free-form posts with email-style structure (headers, quoted replies, signatures)

## Data Quality Issues Found

### Completeness (Text) — header/quote/signature noise, primary 20NG concern
- Each post carries Usenet/email metadata: `From:`, `Subject:`, `Organization:`, `Lines:` headers; quoted text from replied-to messages (`> ...` prefixes, "In article <…> writes:"); and footers/signatures.
- These segments are not the actual document content and act as label-leaking artifacts: header fields (organization, newsgroup-correlated domains) and quoted text let a model "cheat." The scikit-learn `remove=` option exists for exactly this reason.
- In the text-completeness sense, raw posts are full of structural-but-non-content tokens that distort the signal-to-content ratio.
- Fix: strip headers, footers, and quoted-reply blocks before tokenizing (mirror scikit-learn's `remove=('headers','footers','quotes')`).

### Label Consistency — semantic overlap between newsgroups
- Several newsgroups overlap semantically: `comp.sys.ibm.pc.hardware` ↔ `comp.sys.mac.hardware`, `talk.religion.misc` ↔ `soc.religion.christian` ↔ `alt.atheism`, `rec.sport.baseball` ↔ `rec.sport.hockey`. Cross-posted messages can legitimately belong to two groups.
- In DistilBERT embedding space these classes overlap, and k-NN label agreement drops at those boundaries — genuine label ambiguity, not just model confusion.
- Fix: audit k-NN disagreements on the overlapping group pairs; treat cross-posts explicitly (multi-label or tie-break rule).

### Validity (Text Issues)
- Posts contain ASCII art, raw email addresses, URLs, and occasional encoding artifacts from early Usenet clients.
- Fix: UTF-8 / non-empty / ≥1-token filter; normalize whitespace; token-replace emails/URLs if they leak identity.

### Consistency & Outlier Ratio (Length Distribution)
- Lengths are widely spread — short one-line replies up to long quoted threads and code dumps. Token-count bucket entropy is high-spread (low consistency); long quoted threads exceed the IQR fence (outliers).
- Fix: strip quotes first (removes much of the length inflation), then apply truncation/chunking and trim remaining outliers.

### Uniqueness (Duplicates)
- Quoting and cross-posting create near-duplicate content across documents (a reply embeds most of the parent message); the same post appears in multiple cross-posted groups.
- Fix: normalized-hash / MinHash dedup; quote-stripping itself removes most embedded duplication; cross-split dedup to avoid leakage.

### Sample Quality (Text)
- Long posts → type-token ratio is informative; quoted/boilerplate-heavy posts have low TTR until quotes/signatures are stripped.
- Fix: boilerplate/quote removal raises TTR; length adequacy is rarely the binding term here.

### Class Balance
- Mildly uneven (~600–1,000 per class) → class_balance is high but not exactly 1.0. Modest weight only.

### Feature Informativeness / Correlation
- After header/quote removal, DistilBERT embeddings separate distinct topics (`rec.sport.*` vs `sci.space`) cleanly; overlapping groups share vocabulary and reduce local separability. feature_correlation is informational.

## Weight Recommendation Guidance
- Raise `completeness_text` above its usual level: header/footer/quote noise is 20NG's signature issue and a documented label-leakage source (scikit-learn `remove=`).
- Keep `label_consistency` high (0.20) — multiple newsgroup pairs overlap semantically and cross-posts are genuinely multi-label.
- Keep `consistency`/`outlier_ratio` non-trivial (wide length spread from quoted threads).
- Keep `uniqueness` meaningful (quoting/cross-posting duplication).
- Keep `class_balance` low-to-modest (mildly uneven, near 1.0).

## Key Insights
- 20NG's signature data-quality issue is COMPLETENESS_TEXT/leakage: headers, footers, and quoted replies are non-content artifacts that leak the label — strip them (scikit-learn `remove=('headers','footers','quotes')`) before any analysis.
- LABEL_CONSISTENCY is high-stakes because several newsgroups overlap semantically (hardware pairs, religion/atheism cluster, sports pair) and cross-posts are legitimately multi-label.
- Length spread is wide (quoted threads) — consistency/outlier_ratio matter; quote-stripping fixes much of it at once.
- Balance is mild, not artificial — give class_balance modest weight.
- For long forum posts, type-token ratio drives sample_quality_text, and boilerplate/quote removal is what raises it.
