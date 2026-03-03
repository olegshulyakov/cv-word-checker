# Spec 2: Inputs & Storage

## Input Format Support

Plain text, Markdown, and HTML are accepted in both textareas (CV and Job Description).

- The parser strips HTML tags and Markdown syntax before analysis so formatting doesn't pollute keyword extraction.
- No file upload in v1 — paste only.

Users can also **drag and drop** a `.txt`, `.md`, or `.html` file directly onto either textarea — the file content is read via the File API and populated into the field. No server involved.

## User Data Persistence

Only the following keys are written to `localStorage` — nothing else is persisted or transmitted:

| Key                  | Value                             | Purpose                                               |
| -------------------- | --------------------------------- | ----------------------------------------------------- |
| `cvwc_cv`            | string                            | CV textarea content — survives page refresh           |
| `cvwc_jd`            | string                            | Job description textarea content                      |
| `cvwc_lang`          | string (e.g. `"es"`)              | User's explicit language choice                       |
| `cvwc_theme`         | `"light"` / `"dark"` / `"system"` | Theme toggle state                                    |
| `cvwc_ai_agent`      | string (e.g. `"chatgpt"`)         | Last selected AI agent for the Rewrite feature        |
| `cvwc_ai_custom_url` | string                            | User-defined URL template for the Custom agent option |

Analysis results are never stored — they are derived from the CV + JD and recomputed in milliseconds. A **"Clear all data"** option in the footer wipes all keys.
