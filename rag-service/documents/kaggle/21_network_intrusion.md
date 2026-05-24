# KDD Cup 99 / NSL-KDD Network Intrusion — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "KDD Cup 1999 Data" / "NSL-KDD Dataset"
- Reference Notebooks:
  - "Network Intrusion Detection EDA" by various contributors
  - "KDD Cup 99 Analysis" by top-voted notebooks

## Dataset Overview
- Rows: 4,898,431 (KDD99 full) / 125,973 (NSL-KDD train)
- Columns: 42 (41 features + 1 label)
- Task: Multi-class classification (normal vs 4 attack types) / Anomaly detection
- Domain: Cybersecurity / Network
- Target: label (normal, dos, probe, r2l, u2r)
- Attack categories: DOS (denial of service), Probe (surveillance), R2L (remote to local), U2R (user to root)

## Data Quality Issues Found

### Uniqueness (Severe Duplicates)
- KDD Cup 99 has approximately 78% DUPLICATE rows
  - ~3.8 million of 4.9 million rows are exact duplicates
  - This severely biases models toward majority patterns
- NSL-KDD was created specifically to remove these duplicates
  - NSL-KDD: 125,973 train rows (no duplicates)
- Fix: Use NSL-KDD instead of original KDD99, or deduplicate aggressively
- Impact of duplicates: Models memorize duplicated patterns, inflating accuracy to 99%+

### Class Balance (Extreme Multi-class Imbalance)
- KDD99 distribution:
  - normal: 19.7%
  - dos: 79.2% (dominates!)
  - probe: 0.8%
  - r2l: 0.2%
  - u2r: 0.01% (only 52 samples)
- DOS attacks dominate — model will predict DOS for everything and get 79% accuracy
- U2R has only 52 samples — nearly impossible to learn
- Fix: Stratified sampling, per-class evaluation, consider binary (normal vs attack) as simpler task

### Validity (Categorical Encoding)
- protocol_type: 3 values (tcp, udp, icmp) — one-hot encode
- service: 70 unique values (http, smtp, ftp, etc.) — high cardinality
- flag: 11 values (SF, S0, REJ, etc.) — connection status flags
- Fix: One-hot for protocol_type and flag; frequency or target encoding for service

### Feature Correlation
- src_bytes and dst_bytes: moderate correlation
- srv_count and count: correlation 0.85 (connection count variants)
- same_srv_rate and diff_srv_rate: negatively correlated by definition (sum ≈ 1)
- serror_rate and srv_serror_rate: correlation 0.92 (different aggregation of same metric)
- Fix: Remove one of highly correlated pairs; PCA on connection-count features

### Outlier Ratio
- src_bytes: ranges 0 to 1.3 billion (massive range)
  - DOS attacks send millions of bytes
  - Normal connections: typically <10,000 bytes
  - NOT outliers — these ARE the attack signatures
- duration: ranges 0 to 58,329 seconds
  - Most connections: 0 seconds (single packet)
  - Long connections: legitimate sessions or slow attacks
- Fix: Log transform for byte counts; DO NOT remove "outliers" — they are attack indicators

### Consistency (Feature Types)
- 6 categorical features + 35 numeric features
- Some "numeric" features are actually binary (0/1): logged_in, root_shell, su_attempted, is_host_login, is_guest_login
- Some numeric features have very limited range (percentages 0-1): same_srv_rate, diff_srv_rate, etc.
- Fix: Identify binary features separately; percentage features don't need scaling

### Value Accuracy
- Dataset is from 1999 — attack patterns are outdated
- Modern network traffic looks very different (HTTPS, cloud, IoT)
- Used primarily for benchmarking, not production intrusion detection
- Labels are synthetically generated (simulated attacks in controlled environment)

## Key Insights
- 78% duplicate rows in KDD99 is the most severe uniqueness issue in any common dataset
- Always check for duplicates BEFORE evaluating model performance — duplicates inflate metrics
- NSL-KDD (deduplicated version) is the standard benchmark — never use raw KDD99
- In anomaly detection, "outliers" in features (huge byte counts) ARE the signal — never remove them
- Multi-class with 52 samples in smallest class (U2R) requires special handling or binary reduction
- Categorical features with 70 values (service ports) need careful encoding strategy
- This dataset demonstrates why data quality (deduplication) affects reported accuracy by 10-20%
