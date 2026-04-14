# Project Guidelines

When you're working on this codebase, please always respond in Italian.

## Architecture
- This workspace is a single-page React + Vite + TypeScript app. Most product logic, persistence, and UI currently live in `src/App.tsx`.
- Keep small and medium changes aligned with the existing structure unless the task explicitly calls for a refactor.
- When touching persistence, preserve the `benza-tracker.entries` localStorage key, the `FuelEntry` shape, and the runtime validation used when reading stored data.

## Build and Test
- Install dependencies with `npm install`.
- Verify changes with `npm run build`. This runs TypeScript build checks and the Vite production build.
- Run `npm run lint` when editing TypeScript, React, or hook logic.
- Use `npm run dev` for local UI checks when needed.

## Conventions
- Keep user-facing copy, locale-sensitive formatting, and document language in Italian. Prices use EUR formatting with `it-IT` conventions.
- Photos are intentionally stored as compressed base64 data URLs in localStorage. Preserve the current file-type checks, 12 MB upload cap, 1280 px resize limit, and JPEG output compression unless requirements change.
- This repo uses strict TypeScript settings, including `noUnusedLocals` and `noUnusedParameters`. Avoid leaving unused code behind.
- Reuse the existing visual system in `src/index.css` and `src/App.css`: CSS custom properties, the current font pair, and the dark gradient theme.

## References
- See `README.md` for the basic Vite project setup.
- Use `src/App.tsx`, `src/index.css`, and `src/App.css` as the primary examples for application behavior and styling patterns.