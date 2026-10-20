# Fable

A Pinterest-style image-sharing single-page app built with React 19 + Vite. Frontend-only with a mock data layer — no real backend required.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/`.

### Seeded account

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | `jenischristan@email.com` |
| Password | `password123`            |

You can also sign up for a new account at `/signup`.

## Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run lint`    | Run ESLint                           |
| `npm run build`   | Production build to `dist/`          |
| `npm run preview` | Preview the production build         |

No tests or typecheck are configured.

## Features

- **Feed** — masonry home feed with responsive column widths
- **Explore** — search posts and creators, trending tags
- **Post view** — likes, comments (with sorting), bookmark, follow, share/download/report
- **Bookmarks** — saved posts, persisted to the mock store
- **Profile** — own and other users' profiles, follow/unfollow, follow requests for private accounts, block/unblock
- **Notifications** — follow requests with accept/decline, mark-all-read, clear-all
- **Create** — new post form
- **Settings** — edit profile, account visibility, change password, deactivate/delete account
- **Auth** — login, signup, logout, route guards, session persisted in `localStorage`

## Architecture

```
src/
├── app/AppRoutes.jsx        # All routes + auth guards + 404
├── layouts/AppLayout.jsx    # SideNavBar + TopBar + Outlet
├── pages/<Name>/            # One folder per page (JSX + CSS)
├── components/
│   ├── layout/              # TopBar, SideNavBar
│   └── ui/                  # Toast, Modal, ConfirmDialog, Grainient
├── mocks/
│   ├── api.js               # All data reads/writes (single source of truth)
│   ├── store.js             # Pub/sub store over fixture arrays
│   ├── auth.js              # Session (localStorage), login/signup/logout
│   └── data/                # Static fixtures: users, posts, comments, ...
├── hooks/                   # useMockData, useClickOutside, useMasonryColumnWidth
└── utils/                   # date/time/count formatters, shareActions
```

- **Data**: every page reads through `src/mocks/api.js`. Mutations go through the same module and notify subscribers; components re-render via `useMockData()` (a `useSyncExternalStore` wrapper).
- **Session**: current user id is stored in `localStorage` under `fable_session_user_id`. Passwords live only in the mock credentials fixture.
- **Routing**: all routes live in `src/app/AppRoutes.jsx`. `/login` and `/signup` are standalone; everything else nests under `AppLayout` behind `RequireAuth`.

## Notes

- `server/` is a separate Express stub (port 5000) not wired to the frontend — ignore it.
- Mock images come from `picsum.photos`.
- Two router packages are installed (`react-router` v8, `react-router-dom` v7). All imports use `react-router-dom`.
