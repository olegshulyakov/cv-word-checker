# Spec 6: Progressive Web App (PWA) & Offline

## Offline Support

- A **Service Worker** (via Vite PWA plugin) caches all app assets and locale files on first load
- Keyword dictionaries are fetched lazily per language on first use, then cached by the Service Worker
- The app must be fully functional offline after that initial load — no network requests required for analysis

## Performance Targets

- Initial page load under 200 KB (uncompressed JS + CSS) — no heavy NLP libraries

## Deployment Targets

| Target         | Notes                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| GitHub Pages   | Static file hosting; must work from a subfolder path (e.g. `/cv-word-checking/`) |
| Nginx (local)  | `nginx.conf` example included in repo                                            |
| Any static CDN | Netlify, Vercel static, Cloudflare Pages — no special config needed              |
