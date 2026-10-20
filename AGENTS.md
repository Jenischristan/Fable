# AGENTS.md

## What this is
Fable — a Pinterest-style image-sharing SPA. React 19 + Vite, plain JSX (no TypeScript), mock data only. Frontend is the priority; backend is a stub.

## Commands
- `npm run dev` — Vite dev server (frontend only; `server/` is NOT started by this)
- `npm run lint` — ESLint (`eslint .`). Run this before finishing any change
- `npm run build` — production build to `dist/`
- No tests, no typecheck. Do not add them without permission.

## Rules (from the owner)
- Finish the frontend; do not change the existing UI style
- No new dependencies, packages, or downloads without explicit permission
- Only touch UI code to fix bugs — otherwise leave it as-is
- Follow the existing UI patterns when adding or completing anything

## Architecture
- Entry: `src/main.jsx` → `src/app/App.jsx` → `src/app/AppRoutes.jsx`
- Routes live only in `AppRoutes.jsx`. `/login` and `/signup` are standalone; everything else nests under `AppLayout` (SideNavBar + TopBar + `<Outlet/>`)
- Pages: `src/pages/<Name>/<Name>.jsx` + colocated `<Name>.css`. Same pattern for `src/components/**`
- Shared UI: `src/components/ui/` (Grainient, Toast), layout: `src/components/layout/`
- Data: all reads go through `src/mocks/api.js`, which reads static fixtures in `src/mocks/data/` (`users.js`, `posts.js`, `comments.js`, ...). Add new fields there, not inline in components
- Utilities: `src/utils/` (date/time/count formatters), hooks: `src/hooks/`

## Gotchas
- Two router packages are installed (`react-router` v8, `react-router-dom` v7). All code imports from `react-router-dom` — keep it that way; do not "migrate" imports
- `src/mocks/auth.js` is empty and `src/context/` is empty. No auth exists: `getCurrentUser()` in `mocks/api.js` hardcodes `user_001`, and routes have no guards
- `server/` is a separate Express 5 app (port 5000) with its own `package.json`. It is not wired to the frontend — ignore unless explicitly asked
- `src/styles/index.css` loads Poppins from Google Fonts CDN and sets the black background — don't remove
- Mock images come from `picsum.photos` URLs in the data files
- `dist/` is gitignored build output — never edit it
