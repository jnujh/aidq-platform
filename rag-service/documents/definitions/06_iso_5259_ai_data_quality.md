# ISO/IEC 5259 — Data Quality for Analytics and ML

## Source
- ISO/IEC 5259 series "Artificial intelligence — Data quality for analytics and machine learning (ML)"
  - 5259-1: Overview, terminology, and examples
  - 5259-2: Data quality measures
  - 5259-3: Data quality management requirements and guidelines
  - 5259-4: Data quality process framework
  - 5259-5: Data quality governance framework (under the series)
- Complements ISO/IEC 25012 (general data quality model) with an ML/analytics-specific lens

## Overview
ISO/IEC 25012 describes data quality for any software/database use. ISO/IEC 5259 extends this
specifically to the **data used to train, validate, and operate AI/ML systems**, where quality is
defined relative to the learning task, not just to real-world correctness. It standardizes quality
measures, a management process, and governance across the data lifecycle (collection → preparation →
labeling → use).

## Why a Separate Standard for AI/ML Data
| Traditional (ISO 25012) focus | ISO 5259 added focus |
|-------------------------------|----------------------|
| Is each value correct/complete? | Is the dataset useful and representative for learning? |
| Static correctness | Label quality, annotation consistency, coverage of edge cases |
| One-off quality check | Lifecycle process + governance across collection/labeling/use |
| Generic dimensions | Task- and model-relevant quality measures |

## Data Quality Dimensions Emphasized by ISO 5259
| Dimension | Definition (analytics/ML context) | Maps to our platform metric |
|-----------|-----------------------------------|-----------------------------|
| Completeness | Required values present AND sufficient coverage of the input space | completeness, partially class_balance |
| Accuracy | Values and labels correctly represent the intended ground truth | value_accuracy, label_consistency |
| Consistency | Same labeling/encoding criteria applied uniformly throughout | consistency, label_consistency |
| Currentness | Data is up-to-date for the task (drift-aware) | — (needs production monitoring) |
| Representativeness | Dataset reflects the population/scenarios seen in deployment | partially class_balance |
| Balance | Class/group distribution adequate for the learning objective | class_balance |
| Identifiability / Traceability | Provenance of data and labels is tracked | — (process/governance) |

## What the Series Standardizes
| Part | Contribution |
|------|--------------|
| 5259-1 | Common vocabulary and worked examples of ML data quality |
| 5259-2 | Concrete **data quality measures** (how to quantify each dimension) |
| 5259-3 | **Management requirements** — roles, controls, and quality guidelines |
| 5259-4 | **Process framework** spanning the data lifecycle stages |
| Governance | Organization-level accountability for ongoing data quality |

## Relationship to Other Standards
- **ISO/IEC 25012** — general data quality model; 5259 specializes it for analytics/ML.
- **ISO/IEC 25024** — measurement of data quality; 5259-2 parallels this for ML measures.
- **ISO/IEC 5338 / 42001** — AI system lifecycle and AI management systems that consume 5259-quality data.

## Key Insight for Our Platform
ISO/IEC 5259 is the citable standard that legitimizes the platform's ML-specific metrics
(class_balance, label_consistency, feature_informativeness) which ISO 25012 does not cover. It frames
data quality as **fitness for the learning task** and as a **lifecycle process with governance**, not a
one-time validation — exactly the gap between "correct data" and "data that trains a good model" that
the platform's diagnosis is designed to measure.
