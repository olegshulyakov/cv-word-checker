# Spec 1: Project Scaffold & Theme

## Overview & Goals

A client-side web application that helps job seekers optimize their CVs for both Applicant Tracking Systems (ATS) and human reviewers.

- Be fully self-hostable with zero backend dependencies.
- All processing happens entirely in the browser — no data is ever sent to a server.

## Tech Stack

- **Svelte + Vite** — Svelte compiles to minimal vanilla JS (no runtime overhead), keeping the bundle well under budget. Vite provides fast local dev and a clean static build output for deployment.
- **Bits UI** — headless, accessible Svelte primitives (dropdown menu, toast, toggle, popover etc.). No styling opinions — all visual design is owned by the app's CSS. This is the same primitive layer that shadcn-svelte builds on, without the Tailwind dependency.
- **Plain CSS with custom properties** — no utility framework. Palette tokens defined as CSS variables on `:root` and `[data-theme="dark"]`, giving full control over the calm, desaturated aesthetic. Component styles scoped via Svelte's built-in `<style>` blocks.
- **Colour palette** — calm, desaturated tones inspired by Claude.ai: soft off-white/warm-grey backgrounds, muted slate text, subtle sand/cream card surfaces, with restrained use of a single accent colour for interactive elements and highlights. Avoid pure black/white or saturated primaries. Both light and dark themes derived from the same palette via CSS custom properties.

## Pages

### Home (`/`)

The primary interface. Contains:

- CV textarea — paste the full resume text
- Job Description textarea — paste the target job posting
- Analyze button — triggers client-side analysis
- Results panel — displays keyword matches, gaps, and word improvement suggestions, rendered inline below the inputs

The layout should feel like a focused tool — clean, minimal, with enough breathing room that pasting large blocks of text doesn't feel cramped.

### Privacy (`/privacy`)

A short, plain-language page explaining:

- All analysis runs locally in the user's browser using JavaScript
- No CV or job description text is transmitted, stored, or logged anywhere
- No analytics, tracking pixels, or third-party data collection
- The app works fully offline after the initial page load (if feasible with the chosen stack)

### 404

A minimal not-found page with a link back to Home.

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

### Accessibility

- Semantic HTML (`<main>`, `<section>`, `<label>`, etc.)
- Keyboard navigable
- ARIA labels on interactive elements
- Color is never the sole differentiator (keyword highlights have both color and an icon/label)

## Header / Footer

**Header:** App name/logo + GitHub repository link (icon) + language selector
**Footer:** "All processing is local. Your data never leaves your browser." + link to Privacy page
