# Class Imbalance Solutions — Data Quality Fix Guide

## Source
- Primary: imbalanced-learn official documentation
- Secondary: scikit-learn "class_weight" parameter documentation

## When to Use
- Class_balance score is low (< 0.8)
- Minority class is < 20% of total samples
- Model predicts majority class for everything (high accuracy, low recall)

## Imbalance Severity Levels

| Ratio (Minority:Majority) | Severity | Examples |
|---------------------------|----------|----------|
| 1:2 to 1:5 | Mild | Customer churn (26%), employee attrition (16%) |
| 1:5 to 1:20 | Moderate | Bank marketing (12%), disease prediction |
| 1:20 to 1:100 | Severe | Santander satisfaction (4%), rare diseases |
| 1:100+ | Extreme | Credit card fraud (0.17%), network intrusion (U2R class) |

## Solution Categories

### 1. Data-Level Solutions (Change the Data)

#### Over-sampling (Increase minority)
| Method | How | Best For | Risk |
|--------|-----|----------|------|
| Random Over-sampling | Duplicate minority samples | Quick baseline | Overfitting on duplicates |
| SMOTE | Create synthetic samples between neighbors | Moderate imbalance | Can create noisy samples in overlapping regions |
| ADASYN | Like SMOTE but focuses on hard-to-learn samples | Severe imbalance | Amplifies noise near decision boundary |
| BorderlineSMOTE | Only synthesizes near decision boundary | When boundary matters | Ignores core minority patterns |

#### Under-sampling (Decrease majority)
| Method | How | Best For | Risk |
|--------|-----|----------|------|
| Random Under-sampling | Remove random majority samples | Large datasets (>100K) | Loses information |
| NearMiss | Keep majority samples closest to minority | When boundary matters | Slow, sensitive to K |
| Tomek Links | Remove majority samples that are nearest neighbors of minority | Cleaning boundary | Only removes near-boundary |

#### Combination
| Method | How | Best For |
|--------|-----|----------|
| SMOTETomek | SMOTE + Tomek Links cleanup | Cleaner synthetic boundary |
| SMOTEENN | SMOTE + Edited Nearest Neighbors | Remove noisy synthetic samples |

### 2. Algorithm-Level Solutions (Change the Model)

| Method | How | Implementation |
|--------|-----|---------------|
| class_weight='balanced' | Penalize mistakes on minority more | sklearn: most classifiers support this |
| Custom threshold | Move decision threshold from 0.5 | predict_proba() + threshold tuning |
| Cost-sensitive learning | Different misclassification costs | Custom loss function |

### 3. Ensemble Solutions

| Method | How | When |
|--------|-----|------|
| BalancedRandomForest | Under-sample per tree in ensemble | Large datasets |
| EasyEnsemble | Multiple AdaBoost on balanced subsets | Severe imbalance |
| BalancedBagging | Bagging with balanced bootstraps | General purpose |

## Task-Specific Recommendations

| Scenario | Recommended | Reason |
|----------|-------------|--------|
| Mild (1:2~1:5) | class_weight='balanced' | Simplest, no synthetic data needed |
| Moderate (1:5~1:20) | SMOTE + class_weight | Synthetic samples help, weight fine-tunes |
| Severe (1:20~1:100) | ADASYN + BalancedRandomForest | Need aggressive oversampling + ensemble |
| Extreme (1:100+) | Anomaly detection approach | Treat as one-class problem, not classification |
| Small dataset (<1000) | class_weight only (no SMOTE) | SMOTE needs enough neighbors, small data can't support synthesis |
| Large dataset (>100K) | RandomUnderSampling + Ensemble | Enough majority samples to discard safely |

## Evaluation Metrics (Critical!)

**NEVER use accuracy for imbalanced data.**

| Metric | When to Use | Why |
|--------|-------------|-----|
| Precision-Recall AUC | Primary metric for imbalanced | Ignores true negatives (dominated by majority) |
| F1 Score | Balanced precision/recall needed | Harmonic mean punishes poor recall |
| Recall (Sensitivity) | Missing positives is costly (fraud, disease) | Ensures minority is found |
| Precision | False alarms are costly (spam filter) | Ensures predictions are accurate |
| Matthews Correlation Coefficient | Balanced evaluation | Works well even with extreme imbalance |
| ROC-AUC | Only for mild imbalance | Can be misleading for severe imbalance |

## Code Patterns

```python
# SMOTE
from imblearn.over_sampling import SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

# class_weight
from sklearn.ensemble import RandomForestClassifier
clf = RandomForestClassifier(class_weight='balanced')

# Threshold tuning
from sklearn.metrics import precision_recall_curve
y_proba = clf.predict_proba(X_test)[:, 1]
precisions, recalls, thresholds = precision_recall_curve(y_test, y_proba)
# Choose threshold where recall > 0.8

# BalancedRandomForest
from imblearn.ensemble import BalancedRandomForestClassifier
clf = BalancedRandomForestClassifier(n_estimators=100)
```

## Key Insight
The severity of imbalance determines the strategy. Mild imbalance (26% like Telco Churn) needs class_weight only. Extreme imbalance (0.17% like credit fraud) requires a fundamentally different approach — treat it as anomaly detection, not classification.
