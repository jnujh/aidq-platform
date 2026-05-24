# Forest Cover Type — EDA & Data Quality Analysis

## Source
- Dataset: Kaggle Competition "Forest Cover Type Prediction"
- Reference Notebooks:
  - "Forest Cover Type EDA" by uciml/covertype dataset analyses
  - "Forest Cover Type Classification" by various top-voted notebooks

## Dataset Overview
- Rows: 581,012 / Columns: 55
- Task: Multi-class classification (7 forest cover types)
- Domain: Environmental / Forestry
- Target variable: Cover_Type (1-7, representing Spruce/Fir, Lodgepole Pine, etc.)

## Data Quality Issues Found

### Completeness
- Zero missing values — dataset is complete
- All 581,012 rows have all 55 features filled
- This is expected: data comes from US Forest Service cartographic data (automated collection)

### Class Balance (Multi-class)
- Cover Type 1 (Spruce/Fir): 211,840 (36.5%)
- Cover Type 2 (Lodgepole Pine): 283,301 (48.8%)
- Cover Type 3 (Ponderosa Pine): 35,754 (6.2%)
- Cover Type 4 (Cottonwood/Willow): 2,747 (0.5%)
- Cover Type 5 (Aspen): 9,493 (1.6%)
- Cover Type 6 (Douglas-fir): 17,367 (3.0%)
- Cover Type 7 (Krummholz): 20,510 (3.5%)
- Severe imbalance: Type 2 is 100x more frequent than Type 4
- Fix: Stratified sampling, class_weight, or separate binary classifiers per type

### Feature Correlation
- Hillshade_9am and Hillshade_3pm: correlation -0.78 (one goes up, other goes down — sun position)
- Horizontal_Distance_To_Hydrology and Vertical_Distance_To_Hydrology: 0.65
- Elevation highly predictive of cover type (different trees at different altitudes)
- Fix: Consider dropping one of the hillshade pair, or use PCA on correlated groups

### Validity (Binary Encoding)
- 40 columns are binary (0/1) representing Wilderness_Area (4) and Soil_Type (40)
- These are already one-hot encoded from categorical features
- Soil_Type7 and Soil_Type15 have zero or near-zero variance (almost never appear)
- Fix: Remove near-zero variance binary columns (no information gain)

### Outlier Ratio
- Elevation: ranges 1,859 to 3,858 meters — no outliers (physical constraint)
- Aspect: 0-360 degrees (circular feature) — no outliers possible
- Slope: 0-66 degrees — some steep slopes but physically valid
- Horizontal distances: some extreme values but geographically plausible
- Conclusion: No data entry errors — all values within physical bounds

## Key Insights
- Multi-class with 7 classes and severe imbalance (0.5% to 48.8%) requires per-class strategies
- Binary one-hot columns with near-zero variance should be removed (Soil_Type7, Soil_Type15)
- Circular features (Aspect: 0-360°) need special encoding (sin/cos transformation)
- Large dataset (581K) means even rare class (Type 4: 2,747) has enough samples for learning
- No missing values ≠ no quality issues — imbalance and correlation are the key problems here
