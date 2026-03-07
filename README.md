# CV Word Checker

A client-side web application that helps job seekers optimise their CVs for Applicant Tracking Systems (ATS) and human reviewers. Paste your resume and a job description — the app identifies missing keywords and suggests stronger language, entirely in your browser.

**All processing is local. No data ever leaves your device.**

---

## Features

- **ATS Keyword Matching** — Compares your CV against a job description and highlights present and missing keywords, grouped into _Skills & Technologies_, _Abilities_, _Title & Degree_, and _Other Terms_. Shows a match-score ring indicator.
- **Word Improvement** — Scans your CV for weak or passive phrases (e.g. "responsible for", "helped") and suggests stronger alternatives, highlighted inline with tooltips.
- **Rewrite with AI** — Builds a structured rewrite prompt from the analysis results, copies it to your clipboard, and optionally opens your chosen AI agent (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Groq, Qwen).
- **Multilingual** — 9 languages: English, German, Spanish, French, Hindi, Japanese, Portuguese, Russian, Chinese (Simplified). Auto-detected from the browser; manually overridable.
- **Offline Ready** — Progressive Web App (PWA) via Vite PWA. Works fully offline after the first load.
- **Privacy First** — Only CV text, job description text, language preference, theme preference, and selected AI agent are saved to `localStorage`. Analysis results are never stored.

---

## Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Framework | SvelteKit (Svelte 5)                                    |
| Language  | TypeScript                                              |
| Bundler   | Vite                                                    |
| Styling   | Plain CSS with custom properties (no utility framework) |
| Icons     | Lucide Svelte                                           |
| PWA       | `@vite-pwa/sveltekit` + Workbox                         |
| Testing   | Vitest (unit) + Playwright (browser)                    |

---

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm start
```

---

## Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm start`            | Start the local dev server               |
| `npm run build`        | Create a production build                |
| `npm run test`         | Run all tests (unit + browser)           |
| `npm run lint`         | Check formatting and linting             |
| `npm run format`       | Auto-fix formatting with Prettier        |

---

## Deployment

The app builds to a static output compatible with any static host:

- **GitHub Pages** — works from a subfolder path (see `svelte.config.js`)
- **Nginx** — see `nginx.conf` in the repo root for an example config
- **Netlify / Vercel / Cloudflare Pages** — no special config needed

---

## License

[MIT](LICENSE)
