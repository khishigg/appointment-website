# Codex Instructions

## Project

React + Vite frontend for a healthcare/dental appointment booking product.

Frontend source lives in `src/`.
This is not a monorepo; there is no local backend folder.

## Stack

- React 19
- Vite
- React Router
- Zustand
- Bootstrap / React Bootstrap
- Tailwind CSS utilities
- Global CSS in `src/index.css`
- Framer Motion
- React Icons
- Some MUI packages

## Main folders

- `src/pages`: route-level pages
- `src/components`: shared UI sections
- `src/components/booking`: clinic, branch, doctor, time slot, and booking flow UI
- `src/components/ui`: small reusable UI primitives
- `src/api`: backend request wrappers and endpoint functions
- `src/store`: Zustand stores
- `src/assets`: static images and logos
- `src/data`: mock/static data

## Frontend / Backend boundary

- Do not implement backend behavior in the frontend.
- Use existing API clients in `src/api` before adding new fetch calls.
- Do not change API request/response contracts unless explicitly requested.
- Admin clinic APIs use Bearer auth and must not send `X-Tenant-Id` unless explicitly requested.
- Keep mock user flow and admin API-driven flow separate.
- Admin API-driven UI must use backend data only.
- Do not show fake/mock clinic, branch, doctor, or availability facts in admin API-driven UI.
- Do not expose tenant connection details or backend-only metadata in frontend UI.

## Editing rules

- Keep changes scoped to the requested behavior.
- Do not modify `dist/`, `node_modules/`, generated build output, or environment files unless explicitly requested.
- Avoid changing `package-lock.json` unless dependency changes are requested.
- Prefer existing component, store, API, and styling patterns over new abstractions.
- Reuse existing booking components where possible.
- Do not add new dependencies unless explicitly approved.
- Avoid large refactors unless requested.

## UI rules

Follow `docs/ui-design-brief.md` for product UI direction.

For UI work:
- Keep healthcare/dental UI clean, calm, trustworthy, practical, and mobile-first.
- Use clear hierarchy, consistent spacing, readable typography, and accessible controls.
- Reuse existing visual patterns unless the task explicitly asks for redesign.
- Empty, loading, error, and retry states must be clear and user-facing.
- Avoid decorative fake data and generic template-looking UI.

## Commands

Use these commands only when relevant:

- Install dependencies: `npm ci`
- Development server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Preview build: `npm run preview`

## Verification

Default:
- Run `npm run build` after implementation.

Optional:
- Run `npm run lint` only when code structure, imports, hooks, or shared components changed.
- Do not run `npm ci` unless dependency installation is required.
- Do not run `npm run dev` or `npm run preview` unless explicitly requested.