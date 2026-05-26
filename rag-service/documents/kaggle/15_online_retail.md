# Online Retail — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Online Retail Dataset" (UCI ML Repository origin)
- Reference Notebooks:
  - "Online Retail EDA and Customer Segmentation" by top-voted analyses
  - "RFM Analysis" by various contributors

## Dataset Overview
- Rows: 541,909 / Columns: 8
- Task: Clustering / Customer Segmentation / Recommendation
- Domain: E-commerce / Retail
- Features: InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country
- Time period: Dec 2010 to Dec 2011 (UK-based online retailer)

## Data Quality Issues Found

### Completeness (Missing Values)
- CustomerID: 135,080 missing (24.9%) — critical for customer-level analysis
  - Cannot do customer segmentation without CustomerID
  - Fix: Drop rows without CustomerID for customer-level tasks; keep for product-level analysis
- Description: 1,454 missing (0.3%) — minor, can join from StockCode

### Uniqueness (Duplicates)
- 5,268 exact duplicate rows (same invoice, same item, same quantity)
- These may be:
  - Data entry errors (entered twice)
  - Legitimate (bought same item multiple times on same invoice)
- Fix: Investigate sample of duplicates; likely safe to remove exact duplicates
- After dedup: ~536,641 rows

### Outlier Ratio (Critical)
- Quantity: ranges -80,995 to 80,995
  - Negative quantities = returns/cancellations
  - Extremely large negatives (e.g., -80,995) are bulk returns
  - Fix: Separate returns (negative) from purchases (positive) for different analyses
- UnitPrice: ranges 0 to 38,970
  - UnitPrice = 0: free items, samples, or data errors (1,186 rows)
  - UnitPrice > 1,000: likely bulk/wholesale items
  - Fix: Remove UnitPrice = 0 for revenue analysis; keep for volume analysis

### Validity (Cancelled Orders)
- InvoiceNo starting with 'C' = cancelled order (9,288 invoices)
- These have negative Quantity (items returned to stock)
- Mix of cancellations and normal orders in same dataset
- Fix: Create flag column is_cancelled; filter based on analysis goal

### Consistency (Product Descriptions)
- Same StockCode sometimes has different Descriptions (typos, updates)
- Example: StockCode 22423 → "REGENCY CAKESTAND 3 TIER" and "REGENCY CAKE STAND 3 TIER"
- 3,684 unique StockCodes but 3,877 unique descriptions
- Fix: Standardize by using most common description per StockCode

### Value Accuracy
- Country: 91.4% from United Kingdom — heavily UK-biased
- Some countries have very few transactions (1-2 orders) — unreliable for country-level analysis
- InvoiceDate: proper datetime, no future dates, chronologically consistent

## Key Insights
- 25% missing CustomerID is the biggest challenge for customer segmentation
- Negative quantities are returns, not errors — separate them, don't remove them
- Cancelled orders (Invoice starting with 'C') need explicit handling
- Product description inconsistency is common in retail data — standardize by code
- For RFM analysis: need CustomerID (drop 25% missing) + filter cancellations + remove zero-price
- Duplicates in transaction data need careful judgment — not always errors
