---
slug: eeg-signal-classification
title: "AI-Based EEG Signal Classification"
summary: "A leakage-free ML pipeline detecting reward-related neural patterns across 32 subjects (DEAP dataset)."
featured: true
roleRank: { ds: 1, da: 4 }
stack: ["Python", "MNE-Python", "XGBoost", "Scikit-learn", "SMOTE", "Streamlit"]
repo: https://github.com/varadkamtikar/MSc-Dissertation
live: "https://msc-dissertation-varadkamtikar.streamlit.app"
metrics: []
pipeline: ["DEAP EEG (32 subjects)", "MNE-Python preprocessing", "Cross-subject split", "SMOTE (train only)", "XGBoost", "Streamlit dashboard"]
---
## Problem
A leakage-free ML pipeline detecting reward-related neural patterns across 32 subjects (DEAP dataset).

## Approach
Cross-subject validation, SMOTE for class imbalance, and a Streamlit dashboard for exploring results.
