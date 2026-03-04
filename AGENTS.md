# CV Word Checker

## Project Overview

**CV Word Checker** is a client-side web application designed to help job seekers optimise their CVs for Applicant Tracking Systems (ATS) and human reviewers. Users paste their resume and a target job description; the app identifies missing keywords and flags weak language — entirely in the browser, with no server involved.

A core tenet of this project is privacy: **all processing happens entirely locally in the browser**. No data is transmitted to or stored on a server. The project is fully self-hostable, supports multiple languages (i18n), and offers offline capabilities via a Service Worker (PWA).

### Key Features

- **ATS Keyword Matching:** Compares CV and job description; highlights present and missing keywords grouped into **Skills & Technologies**, **Abilities**, **Title & Degree**, and **Other Terms**. Shows a match-score ring indicator.
- **Result Table View:** Detailed keyword-frequency comparison between CV and job description, with ✓/✗ status icons per keyword.
- **Word Improvement:** Scans for weak or passive phrases and suggests stronger, active alternatives, highlighted inline with hover/focus tooltips.
- **Multilingual Support:** 9 languages (EN, DE, ES, FR, HI, JA, PT, RU, ZH). Auto-detected from `navigator.language`; manually selectable. Locale files are eagerly fetched on first application use.
- **Rewrite with AI:** Builds a structured prompt from analysis results, copies it to the clipboard, and optionally opens the chosen AI agent in a new tab (ChatGPT, Claude, Gemini, Perplexity, DeepSeek) or keeps it clipboard-only (Groq, Qwen).
- **Offline Ready:** Progressive Web App (PWA) via `@vite-pwa/sveltekit`. Fully functional offline after the initial load.
- **Local Storage:** Five keys only — CV text, job description text, language, theme, and selected AI agent. Analysis results are derived on the fly and never persisted.

## Tech Stack & Architecture

| Layer     | Technology                                                      |
| --------- | --------------------------------------------------------------- |
| Framework | SvelteKit (Svelte 5)                                            |
| Language  | TypeScript                                                      |
| Bundler   | Vite                                                            |
| Styling   | Plain CSS with custom properties (Light / Dark / System themes) |
| Icons     | Lucide Svelte                                                   |
| PWA       | `@vite-pwa/sveltekit` + Workbox                                 |
| Testing   | Vitest (unit, Node) + Playwright (browser)                      |

The architecture is explicitly designed for a minimal bundle size and fast client-side execution, avoiding heavy NLP libraries in favour of optimised local dictionaries.

### Source Layout

```
src/
├── app.css                    # CSS custom properties — palette tokens, base reset
├── app.html                   # HTML shell
├── routes/
│   ├── +layout.svelte         # App shell: header, footer, i18n + PWA init
│   ├── +page.svelte           # Home page — CV/JD inputs, analyze button, results
│   ├── +error.svelte          # 404 / error page
│   └── privacy/+page.svelte   # Privacy policy page
└── lib/
    ├── aiAgents.ts            # AI agent config list (name, urlTemplate, method)
    ├── i18n.svelte.ts         # Locale loading + string lookup
    ├── state.svelte.ts        # localStorage read/write helpers + STORAGE_KEYS
    ├── theme.svelte.ts        # Theme state (system / light / dark)
    ├── components/
    │   ├── Header.svelte      # Logo, language selector, theme toggle, GitHub link
    │   ├── Footer.svelte      # Privacy note, clear-all-data, privacy page link
    │   ├── ResultsPanel.svelte# Match score, keyword tables, AI rewrite controls
    │   └── HighlightedCv.svelte# Inline CV preview with weak-word highlighting
    ├── locales/               # One JSON file per supported language
    │   └── en.json            # ui strings, stopWords, weakWords, keyword dicts, aliases
    └── utils/
        ├── analyzer.ts        # ATS keyword extraction + matching logic
        ├── engine.ts          # Analysis orchestrator (calls analyzer + wordcheck)
        ├── parser.ts          # HTML / Markdown stripping before analysis
        └── wordcheck.ts       # Weak-word regex detection
```

## Building and Running

The project uses `npm` as its package manager.

### Development

```sh
npm start

# open in browser automatically:
npm start -- --open
```

### Production Build

```sh
npm run build

# preview the build locally:
npm run preview
```

### Testing

```sh
npm run test          # Run all tests (unit + browser) once
npm run test:unit     # Vitest unit tests in Node environment
npm run test:browser  # Vitest browser tests via Playwright / Chromium
```

### Type Checking

```sh
npm run check         # svelte-check + TypeScript
npm run check:watch   # Watch mode
```

### Linting and Formatting

```sh
npm run lint          # Check for linting / formatting issues
npm run format        # Auto-fix with Prettier
```

## Development Conventions

- **Styling:** Plain CSS with CSS variables only. No utility frameworks. Keep the aesthetic calm, desaturated, and minimal (Claude.ai-inspired palette).
- **State Management:** Svelte 5 reactive primitives (`$state`, `$derived`). Keep analysis logic derived, never stored.
- **Performance:** Target initial load under 200 KB (uncompressed JS + CSS). Language dictionaries are fetched eagerly on first use and cached by the Service Worker.
- **Types:** TypeScript everywhere. Run `npm run check` before committing.
- **i18n:** All user-facing strings live in locale JSON files (`src/lib/locales/*.json`). Never hardcode UI text outside locale files (except the Privacy page, which is English-only).
- **AI Agents:** Defined exclusively in `src/lib/aiAgents.ts`. Adding a new agent is a single array entry — no other files need changing.
- **localStorage:** Only the five keys defined in `STORAGE_KEYS` (`state.svelte.ts`) may be written. Do not persist anything else.
