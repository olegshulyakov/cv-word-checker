# CV Word Checking — Project Specification

## Overview

A client-side web application that helps job seekers optimize their CVs for both Applicant Tracking Systems (ATS) and human reviewers. Users can match their resume against a job description to surface missing keywords and improve the overall language impact of their application.

All processing happens entirely in the browser — no data is ever sent to a server.

---

## Goals

- Help users pass ATS filters by identifying keyword gaps between their CV and a job description
- Improve resume language quality by suggesting stronger, more impactful word choices
- Be fully self-hostable with zero backend dependencies
- Support multiple languages via i18n

---

## Pages

### Home (`/`)

The primary interface. Contains:

- **CV textarea** — paste the full resume text
- **Job Description textarea** — paste the target job posting
- **Analyze button** — triggers client-side analysis
- **Results panel** — displays keyword matches, gaps, and word improvement suggestions, rendered inline below the inputs

The layout should feel like a focused tool — clean, minimal, with enough breathing room that pasting large blocks of text doesn't feel cramped.

### Privacy (`/privacy`)

A short, plain-language page explaining:

- All analysis runs locally in the user's browser using JavaScript
- No CV or job description text is transmitted, stored, or logged anywhere
- No analytics, tracking pixels, or third-party data collection
- The app works fully offline after the initial page load (if feasible with the chosen stack)

### 404

A minimal not-found page with a link back to Home.

---

## Features

### ATS Keyword Matching

Inspired by tools like CVWolf. Behavior:

- Parse both the CV and the job description for significant terms (nouns, skills, job titles, tools, certifications)
- Strip stop words and normalize casing/pluralization
- Highlight keywords found in the job description that are **present** in the CV (green) and those that are **missing** (red/amber)
- Show a match score (e.g. "74% keyword match") as a simple visual indicator
- Group results: _Skills_, _Tools & Technologies_, _Qualifications_, _Other Terms_

### Word Improvement

Inspired by tools like CV Word Checker. Behavior:

- Scan the CV for weak or overused words (e.g. "responsible for", "helped", "worked on", "good", "various")
- Suggest stronger alternatives with brief context (e.g. "responsible for → led, owned, drove")
- Flag passive constructions and suggest active rewrites
- Highlight the original weak phrase inline in the CV preview

### Multilingual Support (i18n)

- UI strings externalised into locale files (e.g. `locales/en.json`, `locales/es.json`)
- Language auto-detected from browser `navigator.language`, with a manual override selector in the header
- Initial launch languages: **English**, **Spanish**, **French**, **German**, **Portuguese**, **Chinese (Simplified)**, **Japanese**, **Arabic**, **Hindi**, **Russian** — architecture must make adding further languages trivial
- Keyword analysis and word improvement dictionaries are language-aware (each locale ships its own weak-word list)
- Locale files are fetched eager on first application use

---

## UI / UX

### General

- Single-page feel with smooth transitions between states (idle → analyzing → results)
- Responsive layout: works on desktop and mobile
- No external UI framework required — vanilla CSS or a lightweight utility library is fine

### Theme

- Respects the OS-level preference via `prefers-color-scheme` as the default
- Light and dark variants defined via CSS custom properties, not duplicated stylesheets
- Manual theme toggle in the header (sun/moon icon), persisted to `localStorage`; overrides the OS preference until reset

### Typography & Visual Style

- Clean, modern sans-serif (e.g. Inter or system font stack)
- Generous whitespace; the tool should feel calm, not cluttered
- Keyword highlights rendered as inline chips or underlines — not disruptive to reading flow
- Match score rendered as a progress bar or ring indicator

---

## Technical Requirements

### Stack

- **Svelte + Vite** — Svelte compiles to minimal vanilla JS (no runtime overhead), keeping the bundle well under budget. Vite provides fast local dev and a clean static build output for deployment.
- **Bits UI** — headless, accessible Svelte primitives (dropdown menu, toast, toggle, popover etc.). No styling opinions — all visual design is owned by the app's CSS. This is the same primitive layer that shadcn-svelte builds on, without the Tailwind dependency.
- **Plain CSS with custom properties** — no utility framework. Palette tokens defined as CSS variables on `:root` and `[data-theme="dark"]`, giving full control over the calm, desaturated aesthetic. Component styles scoped via Svelte's built-in `<style>` blocks.
- **Colour palette** — calm, desaturated tones inspired by Claude.ai: soft off-white/warm-grey backgrounds, muted slate text, subtle sand/cream card surfaces, with restrained use of a single accent colour for interactive elements and highlights. Avoid pure black/white or saturated primaries. Both light and dark themes derived from the same palette via CSS custom properties.

### Offline / PWA

- A **Service Worker** (via Vite PWA plugin) caches all app assets and locale files on first load
- Keyword dictionaries are fetched lazily per language on first use, then cached by the Service Worker
- The app must be fully functional offline after that initial load — no network requests required for analysis

### Deployment Targets

| Target         | Notes                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| GitHub Pages   | Static file hosting; must work from a subfolder path (e.g. `/cv-word-checking/`) |
| Nginx (local)  | `nginx.conf` example included in repo                                            |
| Any static CDN | Netlify, Vercel static, Cloudflare Pages — no special config needed              |

### Repository Structure (suggested)

```
/
├── index.html
├── public/
│   └── manifest.webmanifest   # PWA manifest
├── src/
│   ├── App.svelte
│   ├── lib/
│   │   ├── analyzer.js        # ATS keyword matching
│   │   ├── wordcheck.js       # Weak word detection + suggestions
│   │   ├── i18n.js            # Locale loading + string lookup
│   │   ├── formatter.js       # Plain text / Markdown / HTML input parser
│   │   ├── aiRewrite.js       # Prompt builder + AI agent redirect
│   │   ├── aiAgents.js        # Agent config list (name, url template, method)
│   │   └── storage.js         # localStorage read/write helpers
│   ├── components/
│   │   ├── TextareaPanel.svelte
│   │   ├── ResultsPanel.svelte
│   │   ├── KeywordChip.svelte
│   │   └── ThemeToggle.svelte
│   └── app.css                # CSS custom properties (palette tokens, base reset)
├── locales/
│   ├── en.json
│   ├── es.json
│   └── ...                    # One file per supported language
├── nginx.conf                 # Example self-hosted config
├── vite.config.js
└── README.md
```

### User Data Persistence

Only the following keys are written to `localStorage` — nothing else is persisted or transmitted:

| Key             | Value                             | Purpose                                        |
| --------------- | --------------------------------- | ---------------------------------------------- |
| `cvwc_cv`       | string                            | CV textarea content — survives page refresh    |
| `cvwc_jd`       | string                            | Job description textarea content               |
| `cvwc_lang`     | string (e.g. `"es"`)              | User's explicit language choice                |
| `cvwc_theme`    | `"light"` / `"dark"` / `"system"` | Theme toggle state                             |
| `cvwc_ai_agent` | string (e.g. `"chatgpt"`)         | Last selected AI agent for the Rewrite feature |

Analysis results are never stored — they are derived from the CV + JD and recomputed in milliseconds. A **"Clear all data"** option in the footer wipes all five keys.

### Input Format Support

Plain text, Markdown, and HTML are accepted in both textareas. The parser strips HTML tags and Markdown syntax before analysis so formatting doesn't pollute keyword extraction. No file upload in v1 — paste only.

Users can also **drag and drop** a `.txt`, `.md`, or `.html` file directly onto either textarea — the file content is read via the File API and populated into the field. No server involved.

### "Rewrite with AI" Feature

After analysis, a **Rewrite with AI** button with an attached agent selector dropdown opens the user's chosen AI agent with a pre-built prompt template in the user's active language.

The prompt encodes only the short, derived analysis data (keyword gaps and weak phrases flagged) and uses clearly labelled placeholders for the CV and job description themselves — keeping the URL well within browser limits while giving the agent full context. The user pastes their documents into the placeholders after being redirected.

**Template structure:**

```
I need help optimising my CV for a job application.

Keyword gaps (present in job description, missing from CV): [KEYWORD_GAPS]
Weak phrases to improve: [WEAK_PHRASES]

Please rewrite my CV using the job description as a reference.

--- JOB DESCRIPTION ---
[JOB_DESCRIPTION]

--- MY CV ---
[MY_CV]
```

`[KEYWORD_GAPS]` and `[WEAK_PHRASES]` are injected from the analysis results at redirect time. The template is defined per locale in the language files so it reads naturally in the user's chosen language.

**Prompt delivery:** The full prompt is **always copied to the clipboard first** (with a toast confirmation), giving the user an immediate backup copy. For agents that support a URL entry point, the app waits briefly and then opens the agent in a new tab — the user can paste the prompt directly into the agent's input. For clipboard-only agents, the copy is the sole delivery mechanism.

**Agent list (v1):**

| Agent      | URL template                            | Method    |
| ---------- | --------------------------------------- | --------- |
| ChatGPT    | `https://chatgpt.com/`                  | URL       |
| Claude     | `https://claude.ai/new`                 | URL       |
| Gemini     | `https://gemini.google.com/app`         | URL       |
| Perplexity | `https://www.perplexity.ai/`            | URL       |
| Groq       | —                                       | Clipboard |
| Qwen       | —                                       | Clipboard |
| DeepSeek   | `https://chat.deepseek.com/?q={prompt}` | URL       |

Agents are defined in a single config file (`src/lib/aiAgents.ts`) as a plain array of objects — adding a new agent requires only one line. Each entry has a `method: "url" | "clipboard"` flag so delivery behaviour can be updated independently of component logic. The dropdown renders directly from this list.

- Initial page load under 200 KB (uncompressed JS + CSS) — no heavy NLP libraries
- Analysis of a typical CV (800 words) + JD (500 words) should complete in under 500 ms

### Accessibility

- Semantic HTML (`<main>`, `<section>`, `<label>`, etc.)
- Keyboard navigable
- ARIA labels on interactive elements
- Color is never the sole differentiator (keyword highlights have both color and an icon/label)

---

## Header / Footer

**Header:** App name/logo + GitHub repository link (icon) + language selector

**Footer:** "All processing is local. Your data never leaves your browser." + link to Privacy page

---

## License

**MIT.** The project is open source and freely self-hostable. MIT imposes no restrictions on personal or commercial use, which lowers the barrier for contributions and lets anyone embed or fork the tool without legal friction. Since there is no SaaS revenue to protect, a copyleft license would only add friction with no benefit.

---

## Out of Scope (v1)

- User accounts or server-side saved sessions
- DOCX / PDF file upload (plain text, Markdown, and HTML paste only)
- Direct AI API integration (the "Rewrite with AI" feature generates a prompt and hands off to the user's chosen agent — no API keys)
- Export / download of optimized CV
- RTL language layout mirroring (Arabic etc. — deferred to v2)

---

## Open Questions

None at this time. The spec is ready for implementation.
