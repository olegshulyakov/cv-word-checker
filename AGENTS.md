# CV Word Checker

## Project Overview

**CV Word Checker** is a client-side web application designed to help job seekers optimise their CVs for Applicant Tracking Systems (ATS) and human reviewers. Users paste their resume and a target job description; the app identifies missing keywords and flags weak language — entirely in the browser, with no server involved.

A core tenet of this project is privacy: **all processing happens entirely locally in the browser**. The project is fully self-hostable, supports multiple languages (i18n), and offers offline capabilities via a Service Worker (PWA).

## Tech Stack & Architecture

The architecture is explicitly designed for a minimal bundle size and fast client-side execution, avoiding heavy NLP libraries in favour of optimised local dictionaries.

## Building and Running

The project uses `npm` as its package manager.

## Development Conventions

- **Styling:** Plain CSS with CSS variables only. Keep the aesthetic calm, desaturated, and minimal.
- **State Management:** Svelte 5 reactive primitives.
- **Types:** TypeScript everywhere.
- **i18n:** All user-facing strings live in locale JSON files. Never hardcode UI text outside locale files.
