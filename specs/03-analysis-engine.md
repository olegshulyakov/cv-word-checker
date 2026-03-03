# Spec 3: Analysis Engine

## Overview

Triggered by the **Analyze button**. Analysis of a typical CV (800 words) + JD (500 words) should complete in under 500 ms.

## ATS Keyword Matching

Inspired by tools like [CVWolf](https://cvwolf.com/index.php). Behavior:

- Parse both the CV and the job description for significant terms (nouns, skills, job titles, tools, certifications)
- Strip stop words and normalize casing/pluralization
- Identify keywords found in the job description that are **present** in the CV, and those that are **missing**
- Calculate a match score (e.g. "74% keyword match")
- Group results: _Skills_, _Tools & Technologies_, _Qualifications_, _Other Terms_

## Word Improvement

Inspired by tools like [CV Word Checker](https://cvwordchecker.com/). Behavior:

- Scan the CV for weak or overused words (e.g. "responsible for", "helped", "worked on", "good", "various")
- Suggest stronger alternatives with brief context (e.g. "responsible for → led, owned, drove")
- Flag passive constructions and suggest active rewrites
- Highlight the original weak phrase inline in the CV preview (see Results UI spec)
