# SMS Spam Detection — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "SMS Spam Collection Dataset"
- Reference Notebooks:
  - "SMS Spam Detection NLP" by various contributors
  - "Spam Classifier" by top-voted notebooks

## Dataset Overview
- Rows: 5,572 / Columns: 2 (label, message)
- Task: Binary classification (spam vs ham)
- Domain: Telecommunications / Email / NLP
- Target: label (spam: 747/13.4%, ham: 4,825/86.6%)

## Data Quality Issues Found

### Class Balance
- Spam: 747 (13.4%) vs Ham: 4,825 (86.6%)
- Moderate imbalance — 6.5:1 ratio
- Small minority class (747) — every spam example is valuable
- Fix: SMOTE on TF-IDF features, or class_weight='balanced'

### Uniqueness (Duplicates)
- 403 exact duplicate messages found
- Duplicates are mostly in ham class (legitimate messages like "Ok", "Yes", "Good night")
- Some spam messages repeated (same scam sent to multiple people)
- Fix: Remove exact duplicates — reduces to 5,169 unique messages

### Validity (Text Issues)
- SMS abbreviations: "u" (you), "ur" (your), "2" (to/too), "4" (for), "msg" (message)
  - These are valid SMS language, not errors
  - Fix: Either normalize ("u" → "you") or keep as features (spam uses more abbreviations)
- Special characters: £, $, !, CAPS — spam indicators
  - "FREE", "WINNER", "£1000" — typical spam patterns
  - Fix: Create features for caps_ratio, special_char_count, currency_symbols
- Phone numbers and URLs in spam messages
  - Fix: Replace with [PHONE] and [URL] tokens

### Consistency (Encoding)
- Some messages have trailing whitespace or newline characters
- Mixed encoding: some messages have non-ASCII characters (emojis before smartphone era)
- Label values: "ham"/"spam" — consistent, no typos
- Fix: strip() all messages, normalize whitespace

### Value Accuracy (Message Length)
- Spam messages are significantly longer (mean 139 chars) than ham (71 chars)
- Message length alone is a useful feature for classification
- Very short messages (<10 chars) are always ham ("Ok", "Yes", "K")
- Very long messages (>300 chars) are often spam (promotional content)

### Feature Engineering Opportunities (NLP-specific quality)
- Word count, character count, sentence count
- Presence of urgency words ("urgent", "immediately", "now")
- Presence of monetary symbols (£, $)
- Ratio of uppercase characters
- Number of exclamation marks
- Presence of phone numbers or URLs

## Key Insights
- SMS data is SHORT text — different quality challenges than long documents
- Abbreviations in SMS are valid language, not noise — handle carefully
- Message length is a surprisingly strong feature (spam is longer)
- 13.4% spam is moderate imbalance — not extreme but needs handling for small dataset
- Duplicates in text data are common for short messages ("Ok", "Thanks") — expected, safe to remove
- Feature engineering from text characteristics (length, caps, symbols) is as important as NLP features
