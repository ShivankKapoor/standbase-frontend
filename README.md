# Standbase — Frontend

The frontend for [Standbase](https://standbase.shivankkapoor.com), a personal standup journal. Write and review daily standups on a calendar interface, with full-page editing, day-type classification, and TOTP-protected login.

> **Backend repo:** [standbase-backend](https://github.com/ShivankKapoor/standbase-backend)

## Tech Stack

- **React 19** + **Vite 8** — `@vitejs/plugin-react`
- **TypeScript 6** — strict mode with path alias `@/ → src/`
- **Tailwind CSS v4** — configured entirely in `index.css`, no `tailwind.config.ts`
- **shadcn/ui** — component library in `src/components/ui/`
- **React Router v7** — client-side routing with protected routes
- **vaul** — mobile bottom drawer for day entries
- **sonner** — toast notifications
- **date-fns** — date formatting

## Features

- Monthly calendar view with colour-coded day types (PTO, Planning, Support)
- Inline side panel on desktop; bottom drawer on mobile
- Full-page entry editor at `/entry/:date`
- TOTP two-factor authentication with an animated 6-box OTP input
- Light/dark theme toggle persisted to `localStorage` with no flash on load
- Optimistic save and delete with error rollback

## Local Development

**Prerequisites:** Node.js 20+

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5554
```

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Type-check + production build → dist/
npm run preview  # Preview the production build
```

## Container (Podman / Docker)

`VITE_API_URL` is baked in at build time — rebuild the image if it changes.

```bash
VITE_API_URL=https://standbase.shivankkapoor.com ./run.sh   # Build and start on port 3000
PORT=8080 VITE_API_URL=https://standbase.shivankkapoor.com ./run.sh  # Custom port
./stop.sh   # Stop and remove the container
```

nginx serves the built static files. All unknown routes fall back to `index.html` for SPA routing. Hashed assets are cached for 1 year; `index.html` is never cached.

## Project Structure

```
src/
├── api/
│   ├── client.ts        # apiFetch() — injects Bearer token, throws ApiError on non-2xx
│   ├── auth.ts          # login(), verifyTotp(), logout(), checkSession()
│   └── entries.ts       # getEntries(), getEntry(), createEntry(), deleteEntry()
├── components/
│   ├── ui/              # shadcn/ui components — do not edit manually
│   ├── layout/          # Header, ThemeToggle
│   ├── auth/            # LoginForm, TotpForm
│   ├── calendar/        # MonthCalendar, DayCell
│   └── entry/           # EntryPanel, DayTypeBadge
├── context/
│   └── AuthContext.tsx  # Token + username in state and localStorage
├── hooks/
│   ├── useAuth.ts       # Login/logout helpers
│   ├── useEntries.ts    # Month entry fetching with optimistic updates
│   └── useIsMobile.ts   # window.matchMedia hook (breakpoint 768px)
├── pages/
│   ├── LoginPage.tsx        # LoginForm / TotpForm toggle
│   ├── DashboardPage.tsx    # Calendar + entry panel
│   └── EntryEditorPage.tsx  # Full-page editor at /entry/:date
├── types/
│   └── index.ts         # Entry, DayType, LoginResult, SessionCheck
└── index.css            # Tailwind directives, theme tokens, custom keyframes
```

## Auth Flow

1. POST credentials → `/auth/login`
2. If TOTP is enabled, receive `totp_required` and a short-lived pre-auth token
3. Submit OTP → `/auth/totp/verify` → receive session token
4. Token stored in `AuthContext` and `localStorage`; validated on page load via `GET /session/check`
5. `ProtectedRoute` in `App.tsx` redirects unauthenticated users to `/login`
