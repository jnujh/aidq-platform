# Web Traffic Time Series Forecasting — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Web Traffic Time Series Forecasting"
- Reference Notebooks:
  - "Web Traffic EDA and Forecasting" by top-voted analyses
  - "Exploration of Wikipedia page views" by various contributors

## Dataset Overview
- Rows: ~145,000 Wikipedia pages / Columns: ~803 (dates as columns)
- Task: Time series regression (predict future daily page views)
- Domain: Web / IT / Content
- Target variable: daily page views per Wikipedia article
- Time period: July 2015 to December 2016 (~550 days)
- Format: Wide format (each row = one page, each column = one date)

## Data Quality Issues Found

### Completeness (Significant Missing Values)
- ~7.5% of all values are missing (NaN)
- Missing patterns:
  - Some pages didn't exist at the start of the period (created later)
  - Some pages were deleted during the period
  - Some days have server outages (all pages missing for a day)
- Missing is NOT random — it correlates with page creation/deletion dates
- Fix strategies:
  - Forward-fill for short gaps (1-2 days) — likely server issues
  - Fill with 0 for pages that didn't exist yet (before creation date)
  - Interpolation for medium gaps within a page's lifetime

### Outlier Ratio (Extreme Spikes)
- Page views are extremely right-skewed (power law distribution)
  - Median: ~50 views/day
  - Some pages: >10 million views/day (viral events)
  - Ratio of max to median: >200,000x
- Spikes correspond to news events (celebrity deaths, elections, disasters)
- These are real events, not data errors — but they dominate training if not handled
- Fix: Log1p transformation essential; consider median-based features instead of mean

### Validity (Page Name Parsing)
- Page names contain metadata: language, access type, agent type
- Format: "PageName_language.wikipedia.org_access_agent"
- Example: "Barack_Obama_en.wikipedia.org_all-access_all-agents"
- Features extractable: language (en, fr, de, ja, zh, etc.), access (mobile/desktop), agent (spider/user)
- Fix: Parse page names to extract language, access, agent as features

### Feature Correlation (Temporal)
- Strong weekly seasonality (weekday > weekend for most pages)
- Some pages have opposite pattern (entertainment pages peak on weekends)
- Autocorrelation: yesterday's views strongly predict today's views
- Language-specific patterns: Japanese/Chinese pages have different weekly cycles

### Consistency (Data Format)
- Wide format (dates as columns) is unusual — needs reshaping to long format for modeling
- Date column names as strings — need parsing
- Some page names contain special characters, commas, quotes — need careful string handling
- Mixed languages in page names — encoding issues possible

### Value Accuracy
- Zero views: valid (unpopular pages on quiet days)
- Negative values: none (page views are counts)
- Very large values (>1M): valid but rare (viral events)
- Some pages show sudden permanent drops to 0 — likely page deletion or renaming

## Key Insights
- 7.5% missing in time series requires careful analysis of WHY values are missing (page lifecycle)
- Extreme skewness (power law) means median-based approaches outperform mean-based
- Page name parsing is critical feature engineering — language and access type strongly predict behavior
- Wide-to-long format conversion is a data engineering prerequisite
- Viral spikes are real but rare — models must handle both normal and extreme patterns
- Missing data pattern correlates with page lifecycle — not MCAR
