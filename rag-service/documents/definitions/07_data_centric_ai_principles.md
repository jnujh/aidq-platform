# Data-Centric AI — Principles and Practices

## Source
- Primary: Andrew Ng, "A Chat with Andrew on MLOps: From Model-centric to Data-centric AI" / the Data-Centric AI movement (DeepLearning.AI, 2021); NeurIPS 2021 Data-Centric AI Workshop
- Secondary: Northcutt, Jiang, Chuang, "Confident Learning: Estimating Uncertainty in Dataset Labels" (JAIR, 2021); Northcutt, Athalye, Mueller, "Pervasive Label Errors in Test Sets Destabilize ML Benchmarks" (NeurIPS 2021 Datasets & Benchmarks); Sambasivan et al., "Everyone wants to do the model work, not the data work: Data Cascades in High-Stakes AI" (CHI 2021)

## Overview
Data-centric AI (Andrew Ng) shifts the engineering focus from iterating on the **model** (holding data
fixed) to systematically **improving the data** (holding the model fixed). The premise: for most
applied problems, the largest, cheapest gains come from cleaner, more consistent, better-labeled data
rather than from a fancier architecture.

## Core Principles
| Principle | Meaning | Implication for diagnosis |
|-----------|---------|---------------------------|
| Good data > more data | Consistent, clean, well-labeled data beats simply scaling volume | Prioritize fixing label/consistency issues over collecting more rows |
| Label quality is first-class | Real datasets carry 5–10%+ label errors; errors cap achievable accuracy | label_consistency is a primary metric, not an afterthought |
| Labeling consistency | Different annotators must apply the SAME criteria | Inconsistent labels split the learning signal (covered by consistency) |
| Systematic, iterative data work | Treat data improvement as a repeatable engineering loop | Diagnose → fix → re-diagnose, like the platform's flow |
| Cover the edge cases | Representativeness and balance matter more than raw count | class_balance + coverage over sheer size |

## Model-Centric vs Data-Centric
| Aspect | Model-centric | Data-centric |
|--------|---------------|--------------|
| What you change | Architecture, hyperparameters, loss | Labels, cleaning, consistency, coverage |
| Data treated as | Fixed benchmark | The primary lever to improve |
| Typical payoff | Diminishing on mature tasks | Often large on real-world tasks |
| Failure mode | Overfitting the benchmark | Data cascades (Sambasivan et al. 2021) |

## Connection to Confident Learning
Confident Learning (Northcutt et al.) is the operational backbone of data-centric AI: it uses a model's
out-of-sample predicted probabilities to **estimate the joint distribution of given vs true labels**,
then ranks the most likely mislabeled samples for review. Northcutt et al. (2021) used it to find real
label errors even in "gold-standard" benchmarks (ImageNet, CIFAR-10, AG News, IMDB), proving the
data-centric thesis: the data — not the model — was the bottleneck. The `cleanlab` library implements
this, and it underpins the platform's `label_consistency` metric.

## Practical Loop (data-centric workflow)
1. Train a baseline model and obtain cross-validated predicted probabilities.
2. Run Confident Learning (cleanlab) to rank likely label errors.
3. Audit/relabel the top suspects; standardize annotation guidelines for inconsistent cases.
4. Re-measure quality (labels, consistency, balance) and re-train.
5. Repeat until label/consistency metrics plateau — usually before the model needs changing.

## Key Insight
Data-centric AI reframes the platform's purpose: the diagnosis is not a passive report card but the
first step of an improvement loop where **fixing the data is the highest-leverage action**. Confident
Learning makes "improve the labels" concrete and measurable, and the evidence (real errors in famous
benchmarks) is why label_consistency carries the highest weight in the platform's scoring.
