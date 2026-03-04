# Spec 7: "Rewrite with AI" Feature

## Overview

After analysis, a **Rewrite with AI** button with an attached agent selector dropdown opens the user's chosen AI agent with a pre-built prompt template in the user's active language.

The prompt encodes only the short, derived analysis data (keyword gaps and weak phrases flagged) and uses clearly labelled placeholders for the CV and job description themselves — keeping the URL well within browser limits while giving the agent full context. The user pastes their documents into the placeholders after being redirected.

## Template structure:

```text
I need help optimising my CV for a job application.

Keyword gaps (present in job description, missing from CV): [KEYWORD_GAPS]
Weak phrases to improve: [WEAK_PHRASES]

Please rewrite my CV using the job description as a reference.

--- JOB DESCRIPTION ---
[Paste job description here]

--- MY CV ---
[Paste CV here]
```

`[KEYWORD_GAPS]` and `[WEAK_PHRASES]` are injected from the analysis results at redirect time. The template is defined per locale in the language files so it reads naturally in the user's chosen language.

The prompt is delivered via deep-link URL (`?q=` or equivalent) where the agent supports it, otherwise copied to clipboard with a toast confirmation.

## Agent list (v1):

| Agent      | Method                                     |
| ---------- | ------------------------------------------ |
| ChatGPT    | `https://chatgpt.com/?q={prompt}`          |
| Claude     | `https://claude.ai/new?q={prompt}`         |
| Gemini     | `https://gemini.google.com/app?q={prompt}` |
| Perplexity | `https://www.perplexity.ai/?q={prompt}`    |
| DeepSeek   | `https://chat.deepseek.com/?q={prompt}`    |

Agents are defined in a single config file (`src/lib/aiAgents.js`) as a plain array of objects — adding a new agent requires only one line. Each entry has a `method: "url" | "clipboard"` flag so delivery behaviour can be updated independently of component logic. The dropdown renders directly from this list.
