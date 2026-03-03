# Spec 4: Results UI

## Overview

The **Results panel** displays keyword matches, gaps, and word improvement suggestions, rendered inline below the inputs.

## Highlighting & Layout

- **Keyword Matching:** Highlight keywords found in the job description that are **present** in the CV (green) and those that are **missing** (red/amber)
- **Word Improvement:** Highlight the original weak phrase inline in the CV preview
- Keyword highlights rendered as inline chips or underlines — not disruptive to reading flow
- Group results: _Skills_, _Tools & Technologies_, _Qualifications_, _Other Terms_
- Show a match score (e.g. "74% keyword match") as a simple visual indicator (e.g., rendered as a progress bar or ring indicator)
- Color is never the sole differentiator (keyword highlights have both color and an icon/label)
