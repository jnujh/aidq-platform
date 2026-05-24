# Google Rules of Machine Learning — Data Quality Essentials

## Source
- "Rules of Machine Learning: Best Practices for ML Engineering" by Martin Zinkevich (Google)
- Available at: developers.google.com → Machine Learning → Guides → Rules of ML
- Free, publicly accessible, full text available online

## Overview
Google's 43 rules for ML engineering. Below are the rules most relevant to DATA QUALITY, with practical implications for our platform.

## Data-Relevant Rules (Selected)

### Rule #1: Don't be afraid to launch a product without machine learning
**Implication**: Before worrying about data quality for ML, ensure the data is valuable at all. If simple heuristics work, complex ML (and thus strict data quality) may be unnecessary.

### Rule #4: Keep the first model simple and get the infrastructure right
**Implication**: Perfect data quality isn't needed for a first model. Start with the most obviously clean subset, prove value, THEN invest in quality improvement.

### Rule #14: Starting with an interpretable model makes debugging easier
**Implication**: When data quality is uncertain, use interpretable models (linear, decision trees) first. They make it easier to IDENTIFY data quality issues (e.g., unexpected coefficient signs reveal feature problems).

### Rule #16: Plan to launch and iterate
**Implication**: Data quality improvement is iterative. Don't aim for perfect quality before first model — launch, observe errors, improve data quality where it matters most.

### Rule #22: Measure the delta between models
**Implication**: When improving data quality, measure the MODEL PERFORMANCE difference. If cleaning the data doesn't improve the model, the "quality issue" may not be relevant for this task.

### Rule #23: You are not a typical end user
**Implication**: Your perception of data quality may differ from what matters for the model. Quantitative metrics (our 8 dimensions) are more reliable than subjective assessment.

### Rule #29: The best way to make sure that you train like you serve is to save features at serving time
**Implication**: Data quality in production must match training. If training data was cleaned but production data isn't, model will perform poorly. Consistency between environments matters.

### Rule #32: Re-use code between training and serving pipeline
**Implication**: Data preprocessing (cleaning, encoding) must be IDENTICAL between training and inference. Inconsistent preprocessing = inconsistent quality = model failure.

### Rule #35: Avoid feedback loops with positional features
**Implication**: Some data quality issues are self-reinforcing. A biased model creates biased data which trains a more biased model. Monitor for quality degradation over time.

### Rule #37: Measure training/serving skew
**Implication**: If your training data has different quality characteristics than production data (different missing rates, different distributions), the model won't generalize. This is a SYSTEMIC quality issue.

### Rule #38: Don't waste time on new features if unaligned objectives is the issue
**Implication**: Sometimes low model performance isn't a data quality problem — it's a problem definition problem. Before blaming data quality, verify the target variable is correctly defined.

## Summary Table: When Data Quality Matters Most

| Situation | Most Important Quality Dimension | Google Rule |
|-----------|--------------------------------|-------------|
| First model | Get ANY clean data working | Rule #4, #16 |
| Model debugging | Validity + Consistency | Rule #14 |
| Quality improvement | Measure impact on model | Rule #22 |
| Production deployment | Training-serving consistency | Rule #29, #37 |
| Long-running model | Monitor for data drift | Rule #35 |
| Low performance | Check if it's really a data problem | Rule #38 |

## Key Insights for Our Platform

1. **Quality improvement should be TARGETED**: Don't improve all 8 dimensions equally. Improve the one that most impacts model performance (Rule #22).

2. **Iterate, don't perfect**: A "good enough" dataset trained now beats a "perfect" dataset trained later (Rule #16).

3. **Consistency matters as much as quality**: Having consistently mediocre data is often better than having mostly great data with occasional garbage (Rule #32).

4. **Context determines importance**: Which quality dimension matters depends on the task, model type, and deployment context — not just the data itself (Rule #23).
