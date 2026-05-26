# Credit Card Fraud Detection — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle "Credit Card Fraud Detection" by Machine Learning Group - ULB
- Reference Notebooks:
  - "Credit Fraud || Dealing with Imbalanced Datasets" by janiobachmann (5000+ votes)
  - "Anomaly Detection - Credit Card Fraud Analysis" by georgezoto (1200+ votes)

## Dataset Overview
- Rows: 284,807 / Columns: 31
- Task: Binary classification (fraud yes/no)
- Domain: Finance / Banking
- Target variable: Class (Fraud: 0.172%, Non-fraud: 99.828%)
- Features: V1-V28 (PCA-transformed), Time, Amount

## Data Quality Issues Found

### Class Balance (Extreme Imbalance)
- Fraud transactions: 492 out of 284,807 (0.172%)
- This is one of the most extreme imbalance ratios in ML datasets
- Standard accuracy metric is meaningless (99.8% accuracy by predicting all non-fraud)
- Required approaches:
  - Undersampling majority class (random or NearMiss)
  - Oversampling minority class (SMOTE, ADASYN)
  - Anomaly detection methods (Isolation Forest, Local Outlier Factor)
  - Evaluation with Precision-Recall AUC, not ROC AUC

### Feature Correlation (PCA Features)
- V1-V28 are already PCA-transformed — by definition they should be uncorrelated
- However, Time and Amount are NOT PCA-transformed
- Amount has very different scale (0 to 25,691) vs PCA features (centered around 0)
- Fix: StandardScaler on Amount and Time before combining with PCA features

### Outlier Ratio
- Amount column has extreme outliers: mean $88, max $25,691
- Fraudulent transactions tend to have lower amounts (median $9.25 vs $22 for non-fraud)
- Some legitimate transactions have very high amounts that could be misclassified
- IQR-based removal would lose important fraud signals
- Fix: Use RobustScaler instead of StandardScaler (robust to outliers)

### Completeness
- Zero missing values — dataset is complete
- This is unusual and worth noting: PCA-transformed data from banks tends to be pre-cleaned
- However, the Time feature represents seconds elapsed from first transaction, which has no missing values by construction

### Value Accuracy (Distribution)
- Amount distribution is heavily right-skewed (skewness > 16)
- Log transformation recommended: np.log1p(Amount)
- PCA features V1-V28 are approximately normally distributed (expected from PCA)
- Time feature shows two peaks — suggests data collected over two days with lower activity at night

## Key Insights
- Extreme class imbalance (0.17%) requires specialized evaluation metrics — accuracy is useless
- When features are PCA-transformed, correlation is already handled but scaling is not
- For fraud detection, false negatives (missing fraud) are far more costly than false positives
- Amount outliers are not noise — they carry signal about transaction patterns
- Always check if "no missing values" is genuine or if the data was pre-processed
