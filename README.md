# Standbase — Frontend

The frontend for [Standbase](https://standbase.shivankkapoor.com), a personal standup journal. Write and review daily standups on a calendar interface, keep per-day todos, track writing stats, and present entries full-screen — behind a TOTP-protected login.

> **Backend repo:** [standbase-backend](https://github.com/ShivankKapoor/standbase-backend)

## Tech Stack

- **React 19** + **Vite 8** — `@vitejs/plugin-react`
- **TypeScript 6** — strict mode with path alias `@/ → src/`
- **Tailwind CSS v4** — configured entirely in `index.css`, no `tailwind.config.ts`
- **shadcn/ui** — component library in `src/components/ui/`
- **React Router v8** — client-side routing with protected routes
- **dnd-kit** — drag-to-reorder todos
- **vaul** — mobile bottom drawer for day entries
- **react-day-picker** — date picker (moving a todo to a custom date)
- **sonner** — toast notifications
- **date-fns** — date formatting
- **lucide-react** — icons

## Features

- Monthly calendar view with colour-coded day types (PTO, Planning, Support) and a per-day todo
  completion indicator
- Inline side panel on desktop; bottom drawer on mobile
- Full-page entry editor at `/entry/:date` with unsaved-changes prompt and Ctrl/Cmd+S to save
- Present mode at `/entry/:date/present` — full-screen entry with adjustable text size
  (`+` / `-`), an OpenDyslexic font toggle, and `Esc` to exit; both preferences persist in
  `localStorage`
- Todos per day: add, edit, complete, cancel, delete, drag to reorder, and move to the previous
  day, next day, or a chosen date via the right-click menu (full-page editor at `/todos/:date`)
- Statistics page at `/stats`: a one-year writing heatmap, average/longest/total words, this
  week's average, busiest weekday, and current and longest weekday streaks (weekends don't break
  a streak)
- TOTP two-factor authentication with an animated 6-box OTP input
- Light/dark theme toggle persisted to `localStorage` with no flash on load (falls back to the
  system preference)
- Todo changes update optimistically and roll back on error; entry saves and deletes update the
  calendar after the server confirms, with toast feedback

## Local Development

**Prerequisites:** Node.js 20+

```bash
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_API_URL=http://localhost:5554
```

If `VITE_API_URL` is unset the app falls back to `http://localhost:5554`. The backend must list
the dev server's origin in `CORS_ALLOWED_ORIGINS` (Vite serves on `http://localhost:5173`).

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Type-check + production build → dist/
npm run lint     # ESLint
npm run preview  # Preview the production build
```

## Container (Docker)

`VITE_API_URL` is baked in at build time — rebuild the image if it changes.

```bash
docker compose up -d --build                 # Build and start on port 5555
PORT=8080 docker compose up -d --build       # Custom port
docker compose down                          # Stop and remove the container
```

The API URL defaults to `https://standapi.shivankkapoor.com`; override it with `API_URL=... docker compose up -d --build` (`.env` is not used). The container restarts automatically (`unless-stopped`), and logs are kept by Docker's `local` driver (`docker logs -f standbase-frontend`).

nginx (listening on port 8080 inside the container) serves the built static files. All unknown routes fall back to `index.html` for SPA routing. Static assets are cached for 1 year (`immutable`); `index.html` is never cached. nginx also sends security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) and gzips text responses.

## Project Structure

```
src/
├── api/
│   ├── client.ts        # apiFetch() — injects Bearer token, clears auth and redirects to
│   │                    # /login on 401, throws ApiError on non-2xx
│   ├── auth.ts          # login(), verifyTotp(), checkSession(), logout()
│   ├── entries.ts       # getEntries(), getEntry(), createEntry(), deleteEntry()
│   ├── todos.ts         # getTodos(), createTodo(), updateTodo(), deleteTodo(),
│   │                    # reorderTodos(), getTodoSummary()
│   └── heatmap.ts       # getHeatMap()
├── components/
│   ├── ui/              # shadcn/ui components — do not edit manually
│   ├── layout/          # Header, ThemeToggle
│   ├── auth/            # LoginForm, TotpForm
│   ├── calendar/        # MonthCalendar, DayCell
│   ├── entry/           # EntryPanel, DayTypeBadge, TodoList
│   └── stats/           # HeatmapCalendar, StatTile, StreakCard
├── context/
│   └── AuthContext.tsx  # Token + username in state and localStorage
├── hooks/
│   ├── useAuth.ts          # Login/logout helpers
│   ├── useEntries.ts       # Month entry fetching and local updates
│   ├── useTodos.ts         # Per-day todos with optimistic updates
│   ├── useTodoSummary.ts   # Month todo-completion summary for the calendar
│   ├── useHeatMap.ts       # One-year word-count history
│   └── useIsMobile.ts      # window.matchMedia hook (breakpoint 768px)
├── lib/
│   ├── heatmap.ts       # Heatmap layout, quartile buckets, streak and stat calculations
│   └── utils.ts         # cn() class helper
├── pages/
│   ├── LoginPage.tsx        # LoginForm / TotpForm toggle
│   ├── DashboardPage.tsx    # Calendar + entry panel
│   ├── EntryEditorPage.tsx  # Full-page editor at /entry/:date
│   ├── PresentEntryPage.tsx # Full-screen reader at /entry/:date/present
│   ├── TodoEditorPage.tsx   # Full-page todos at /todos/:date
│   └── StatsPage.tsx        # Heatmap and stats at /stats
├── types/
│   └── index.ts         # Entry, DayType, Todo, TodoSummary, HeatMapResponse, LoginResult,
│                        # SessionCheck
└── index.css            # Tailwind directives, theme tokens, custom keyframes
```

## Auth Flow

1. POST credentials → `/auth/login`
2. If TOTP is enabled, receive `totp_required` and a short-lived pre-auth token
3. Submit OTP → `/auth/totp/verify` → receive session token
4. Token stored in `AuthContext` and `localStorage`; validated on page load via `GET /session/check`
5. `ProtectedRoute` in `App.tsx` redirects unauthenticated users to `/login`
6. Any `401` from the API clears the stored token and sends the user back to `/login`
