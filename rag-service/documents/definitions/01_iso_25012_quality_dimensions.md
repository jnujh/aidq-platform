# ISO/IEC 25012 — Data Quality Dimensions Reference

## Source
- ISO/IEC 25012:2008 "Software engineering — SQuaRE — Data quality model"
- Publicly referenced dimension definitions from academic literature

## Overview
ISO 25012 defines 15 data quality characteristics organized into inherent and system-dependent categories. Our platform maps 8 of these to measurable metrics.

## The 15 Quality Dimensions

### Inherent Quality Characteristics (Data itself)

| Dimension | Definition | Our Platform Metric |
|-----------|-----------|:-------------------:|
| **Accuracy** | Data correctly represents real-world values | value_accuracy |
| **Completeness** | All required data values are present | completeness |
| **Consistency** | Data is free from contradiction, follows defined rules | consistency |
| **Credibility** | Data is regarded as true and believable | — |
| **Currentness** | Data is up-to-date for the task at hand | — |

### System-Dependent Quality Characteristics

| Dimension | Definition | Our Platform Metric |
|-----------|-----------|:-------------------:|
| Availability | Data is accessible when needed | — |
| Portability | Data can be transferred between systems | — |
| Recoverability | Data can be restored after failure | — |

### Both Inherent and System-Dependent

| Dimension | Definition | Our Platform Metric |
|-----------|-----------|:-------------------:|
| Accessibility | Data can be accessed by authorized users | — |
| Compliance | Data adheres to standards and regulations | — |
| Confidentiality | Data is protected from unauthorized access | — |
| Efficiency | Data can be processed with minimal resources | — |
| Precision | Data has sufficient detail/granularity | — |
| Traceability | Data origin and changes can be tracked | — |
| Understandability | Data can be comprehended by users | — |

## Mapping to Our 8 Platform Metrics

| Our Metric | ISO 25012 Dimension(s) | What We Measure |
|-----------|----------------------|-----------------|
| completeness | Completeness | Ratio of non-null values to expected values |
| uniqueness | (Not explicitly in ISO) | Ratio of unique rows to total rows |
| validity | Accuracy + Compliance | Ratio of values matching expected type/format |
| consistency | Consistency | Uniformity of categorical representations |
| outlier_ratio | Accuracy | Ratio of values within expected statistical bounds |
| class_balance | (Not in ISO — ML-specific) | Distribution evenness of target variable |
| feature_correlation | (Not in ISO — ML-specific) | Proportion of features without excessive correlation |
| value_accuracy | Accuracy + Precision | Distribution normality and range appropriateness |

## Key Insight for Our Platform
ISO 25012 covers general data quality for any purpose. Our platform adds ML-SPECIFIC dimensions (class_balance, feature_correlation) that ISO doesn't address. This is because data that's "high quality" for a database may still be "low quality" for ML training — a perfectly complete, accurate dataset with 99.9% one class is terrible for classification.

## Why This Matters for Weight Recommendation
When recommending weights, the LLM should understand that:
- completeness, uniqueness, validity, consistency → traditional data quality (ISO-aligned)
- class_balance, feature_correlation, outlier_ratio → ML-specific quality (beyond ISO)
- For ML tasks, the ML-specific dimensions are often MORE important than traditional ones
