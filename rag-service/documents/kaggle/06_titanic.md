# Titanic — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Titanic - Machine Learning from Disaster"
- Reference Notebooks:
  - "Titanic Data Science Solutions" by startupsci (10000+ votes)
  - "EDA To Prediction (DieTanic)" by ash316 (3000+ votes)

## Dataset Overview
- Rows: 891 (train) / Columns: 12
- Task: Binary/Multi-class classification (survived yes/no)
- Domain: General / Educational
- Target variable: Survived (Survived: 342/38.4%, Died: 549/61.6%)

## Data Quality Issues Found

### Completeness (Missing Values)
- Age: 177 missing (19.9%) — significant, cannot simply drop
  - Missing pattern: No clear MCAR/MAR — mixed across classes
  - Fix options: Median imputation by Pclass+Sex group (most common approach)
- Cabin: 687 missing (77.1%) — majority missing
  - Fix: Too many missing to impute. Extract deck letter (A-G) where available, rest as "Unknown"
  - Alternative: Create binary feature "has_cabin" (proxy for wealth/class)
- Embarked: 2 missing (0.2%) — negligible
  - Fix: Fill with mode ('S' — Southampton, 72% of passengers)

### Feature Correlation
- Pclass and Fare: correlation -0.55 (expected: higher class = higher fare)
- SibSp and Parch: correlation 0.41 (family members travel together)
- Age and Pclass: weak correlation -0.37 (younger passengers in lower class)
- Fix: These correlations are moderate — no multicollinearity issue for most models

### Validity (Data Types & Encoding)
- Sex: string ('male'/'female') — needs encoding
- Embarked: string ('S'/'C'/'Q') — needs encoding
- Name: contains title (Mr, Mrs, Miss, Master) — extract as feature
- Ticket: alphanumeric, mostly unique — limited predictive value
- Cabin: mixed format (letter + number) — extract deck letter

### Uniqueness
- PassengerId: unique identifier (no duplicates)
- Name: 891 unique values — no duplicates (but some family members share surnames)
- Ticket: 681 unique values — some passengers share tickets (group travel)

### Class Balance
- Survival rate 38.4% — moderate imbalance but manageable
- Strong class differences: 1st class 63% survived, 3rd class 24% survived
- Gender effect: Female 74% survived, Male 19% survived

## Key Insights
- 77% missing in Cabin shows that "too much missing" doesn't mean "drop the column" — extract what you can
- Imputation strategy should use domain knowledge (Age differs by class/gender)
- Feature engineering from messy columns (Name→Title, Cabin→Deck) often adds more value than perfect imputation
- Small dataset (891 rows) means every missing value matters more — can't afford to drop rows
