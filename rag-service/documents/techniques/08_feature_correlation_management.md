# Feature Correlation Management — Data Quality Fix Guide

## Source
- Primary: scikit-learn official documentation "Feature selection" (section 1.13)
- Secondary: statsmodels VIF (Variance Inflation Factor) documentation

## When to Use
- Feature_correlation score is low (< 0.8)
- Multiple features carry redundant information
- Linear models show unstable coefficients
- PCA explained variance shows first few components capture >90%

## Why High Correlation is a Problem

### For Linear Models (Regression, Logistic)
- Multicollinearity: Coefficients become unstable and uninterpretable
- Small data changes → large coefficient swings
- Standard errors inflate → significance tests unreliable

### For Tree-Based Models
- Less problematic (trees split on one feature at a time)
- But: Feature importance is split across correlated features
- Interpretation becomes harder ("which feature is really important?")

### For Distance-Based Models (KNN, KMeans)
- Correlated features effectively count the same information twice
- Doubles the weight of that information in distance calculation
- Clusters/neighbors biased toward redundant feature direction

## Detection Methods

| Method | What it Measures | Threshold | Best For |
|--------|-----------------|-----------|----------|
| Pearson correlation | Linear relationship | \|r\| > 0.8 | Numeric pairs |
| Spearman correlation | Monotonic relationship | \|ρ\| > 0.8 | Ordinal/non-linear |
| VIF | How well one feature is predicted by others | VIF > 10 | Multiple correlation |
| PCA explained variance | How much info in few dimensions | 1st component > 50% | High-dimensional |
| Condition number | Matrix ill-conditioning | > 30 | Linear regression |

## Handling Strategies

### 1. Drop One of Correlated Pair
- Simplest approach
- Keep the one with higher correlation to target
- Or keep the one easier to interpret/collect

### 2. PCA (Principal Component Analysis)
- Transforms correlated features into uncorrelated components
- Loses interpretability but removes ALL correlation
- Best for: High-dimensional data with many correlations

### 3. Create Composite Feature
- Combine correlated features into one meaningful feature
- Example: TotalCharges and tenure → "average monthly charge" = TotalCharges/tenure
- Preserves information while reducing redundancy

### 4. Regularization
- L1 (Lasso): Automatically zeros out redundant features
- L2 (Ridge): Shrinks correlated feature coefficients
- ElasticNet: Combination of L1 and L2
- Best for: Linear models where you want automatic selection

### 5. Feature Selection Algorithms
- Recursive Feature Elimination (RFE): Iteratively removes least important
- SelectKBest: Statistical test per feature vs target
- Mutual Information: Captures non-linear dependencies too

## Decision Guide

| Scenario | Strategy | Reason |
|----------|----------|--------|
| 2 features, r > 0.95 | Drop one | Nearly identical, redundant |
| 5+ features correlated | PCA on the group | Captures shared variance |
| Need interpretability | Drop + explain why | Transparent model |
| Linear model, many features | Lasso (L1) | Automatic feature selection |
| Tree model | Keep all | Trees handle correlation naturally |
| Feature importance analysis | Drop or PCA first | Otherwise importance is split |

## VIF Analysis Workflow

```
1. Compute VIF for all numeric features
2. Remove feature with highest VIF (if > 10)
3. Recompute VIF
4. Repeat until all VIF < 10 (or < 5 for strict)
```

## Code Patterns

```python
# Correlation matrix
import seaborn as sns
corr_matrix = df.corr().abs()

# Find highly correlated pairs
upper_tri = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
high_corr_pairs = [(col, row) for col in upper_tri.columns 
                   for row in upper_tri.index 
                   if upper_tri.loc[row, col] > 0.8]

# Drop one of each correlated pair (keep the one more correlated with target)
to_drop = set()
for feat1, feat2 in high_corr_pairs:
    corr_with_target_1 = abs(df[feat1].corr(df[target]))
    corr_with_target_2 = abs(df[feat2].corr(df[target]))
    if corr_with_target_1 < corr_with_target_2:
        to_drop.add(feat1)
    else:
        to_drop.add(feat2)

# VIF calculation
from statsmodels.stats.outliers_influence import variance_inflation_factor
vif_data = pd.DataFrame()
vif_data['Feature'] = X.columns
vif_data['VIF'] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
vif_data.sort_values('VIF', ascending=False)

# PCA for correlated group
from sklearn.decomposition import PCA
pca = PCA(n_components=0.95)  # Keep 95% variance
X_pca = pca.fit_transform(X_scaled)

# Lasso for automatic selection
from sklearn.linear_model import LassoCV
lasso = LassoCV(cv=5)
lasso.fit(X_scaled, y)
selected = X.columns[lasso.coef_ != 0]  # Non-zero coefficients = selected

# RFE
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier
rfe = RFE(RandomForestClassifier(), n_features_to_select=10)
rfe.fit(X, y)
selected = X.columns[rfe.support_]
```

## Real-World Examples

| Dataset | Correlated Pair | Correlation | Action |
|---------|----------------|:-----------:|--------|
| Telco Churn | TotalCharges & tenure | 0.83 | Create "avg_monthly_charge" |
| House Prices | GarageArea & GarageCars | 0.88 | Drop GarageArea (Cars is simpler) |
| Employee Attrition | MonthlyIncome & JobLevel | 0.95 | Drop one (same information) |
| Bike Sharing | temp & atemp | 0.98 | Drop atemp (redundant) |

## Key Insight
Correlation between features is not inherently bad — it depends on your model type. Tree-based models handle it gracefully, while linear models struggle. The key question is: "Does this redundancy affect my MODEL'S performance or INTERPRETABILITY?" If neither, leave it alone.
