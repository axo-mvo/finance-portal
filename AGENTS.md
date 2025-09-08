# Repository Guidelines

## Project Structure & Module Organization

- `index.html`: Single‑page app shell and UI markup.
- `css/style.css`: Global styles, CSS variables, and animations.
- `js/script.js`: All client logic (step flow, validation, API call).
- `images/`: Static assets referenced by the page.
- `axo-form.html`: Auxiliary page (legacy/demo form).
- `Github/`: Project meta (e.g., org/repo assets). See `README.md` and `CLAUDE.md` for context.

## Build, Test, and Development Commands

- Run locally: `python3 -m http.server 5173` then open `http://localhost:5173`.
- Quick open (macOS): `open index.html` (no server features).
- Deploy: Static hosting (e.g., Vercel/GitHub Pages). No build step required.
- Formatting: `npm run check` (verify) and `npm run format` (apply). Install once with `npm i`.

## Coding Style & Naming Conventions

- Indentation: 4 spaces; max line length ~120 chars.
- HTML: Semantic tags where possible; class names in kebab‑case (e.g., `chat-step`).
- CSS: Keep variables under `:root`; class names kebab‑case; avoid inline styles.
- JS: Vanilla ES6; camelCase variables/functions; end statements with semicolons; prefer `const`/`let` over `var`.
- Filenames: lowercase with hyphens (HTML/CSS) or lowercase/camel (JS) to match existing pattern.
- Formatting: Prettier enforced via `.prettierrc.json` and `.editorconfig`.

## Testing Guidelines

- Framework: None. Use manual testing in the browser.
- Scenarios: Step navigation (1 → 10), field validation (email, amounts, SSN), preset buttons, dynamically generated lists (countries/years), and final submission.
- Network: Verify POST to `https://integration.axo-test.io/v1/loan-application/` returns expected status. Use DevTools → Network.
- Regressions: Test on Chrome + Safari; check responsive layout and animations.

## Commit & Pull Request Guidelines

- Commits: Short, imperative, present tense (e.g., “Fix validation error”, “Add live demo link”). Group related changes.
- Branches: `feature/short-topic` or `fix/short-topic`.
- PRs: Clear description, linked issue, before/after screenshots for UI, steps to test locally, and notes on risks/rollout.
- Keep diffs focused; avoid unrelated formatting churn.

## Security & Configuration Tips

- Do not embed secrets; endpoint lives client‑side and must assume untrusted clients.
- Validate/escape all user input; never inject raw HTML.
- Centralize external URLs in `js/script.js` and document changes in PRs.
- Handle network errors gracefully; avoid blocking UI without feedback.
