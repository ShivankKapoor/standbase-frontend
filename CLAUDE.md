# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Commands

```bash
npm run dev      # Dev server at localhost:5173
npm run build    # Type-check + Vite build → dist/
npm run preview  # Preview the production build locally
```

## Container (Podman)

```bash
VITE_API_URL=https://standbase.shivankkapoor.com ./run.sh   # Build image and start on port 3000
PORT=8080 VITE_API_URL=https://standbase.shivankkapoor.com ./run.sh  # Custom port
./stop.sh   # Stop container and remove image
```

`VITE_API_URL` is baked in at build time by Vite — it cannot be changed at runtime. If you change the API URL you must rebuild the image. The default in `run.sh` is `https://standbase.shivankkapoor.com`.

nginx serves the built static files. All unknown routes fall back to `index.html` for SPA routing. Hashed assets are cached for 1 year; `index.html` is never cached.

## Stack

- **React 19 + Vite 8** — `@vitejs/plugin-react`
- **TypeScript 6** — `tsconfig.app.json` has `"ignoreDeprecations": "6.0"` and path alias `@/ → src/`
- **Tailwind CSS v4** — `@tailwindcss/vite` plugin, `@import "tailwindcss"` in `index.css` (no `tailwind.config.ts`)
- **shadcn/ui** — components in `src/components/ui/`. Do not edit these manually; use `shadcn add <component>`
- **React Router v7** — two protected routes: `/` (dashboard) and `/entry/:date` (full-page editor), plus `/login`
- **sonner** — toasts, `position="bottom-center"` everywhere
- **vaul** — mobile bottom drawer for day entries
- **date-fns** — date formatting
- **lucide-react** — icons

## Environment

Create a `.env` file (or `.env.local`) in the project root:

```env
VITE_API_URL=http://localhost:5554
```

## Theme / Colours

CSS variables in `src/index.css`. shadcn reads `--primary` / `--secondary` automatically.

| Mode  | Primary                      | Secondary |
|-------|------------------------------|-----------|
| Light | `#192c76` (dark navy blue)   | Gulf Orange `#FF6319` |
| Dark  | `#FF6319` (Gulf Orange)      | Gulf Blue `#7BB5DC` |

`ThemeToggle` adds/removes the `dark` class on `<html>` and persists to `localStorage`. The inline script in `index.html` applies the saved theme before first paint to prevent flash.

### Day type colours

| Type     | Badge colour | Calendar dot |
|----------|-------------|--------------|
| PTO      | sky          | `bg-sky-500` |
| PLANNING | violet       | `bg-violet-500` |
| SUPPORT  | red          | `bg-red-500` |
| None     | —            | `bg-[#FF6319]` (Gulf Orange) |

## File Structure

```
src/
├── api/
│   ├── client.ts        # apiFetch() — injects Bearer token, throws ApiError on non-2xx
│   ├── auth.ts          # login(), verifyTotp(), logout(), checkSession()
│   └── entries.ts       # getEntries(), getEntry(), createEntry(), deleteEntry()
├── components/
│   ├── ui/              # shadcn auto-generated — do not edit manually
│   ├── layout/
│   │   ├── Header.tsx       # Logo (cal.svg), username, theme toggle, logout
│   │   └── ThemeToggle.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── TotpForm.tsx     # 6-box OTP input with odometer slide animation
│   ├── calendar/
│   │   ├── MonthCalendar.tsx  # Sunday-first grid, prev/next/today nav
│   │   └── DayCell.tsx        # Day button with coloured dot if entry exists
│   └── entry/
│       ├── EntryPanel.tsx     # Sidebar panel — day type select, textarea, save/delete
│       └── DayTypeBadge.tsx   # Coloured pill badge; exports dotStyles
├── hooks/
│   ├── useAuth.ts       # Login/logout helpers wrapping AuthContext
│   ├── useEntries.ts    # Fetches month entries, optimistic save/delete
│   └── useIsMobile.ts   # window.matchMedia hook (breakpoint 768px)
├── context/
│   └── AuthContext.tsx  # token + username in state + localStorage. Calls checkSession() on load.
├── lib/
│   └── utils.ts         # shadcn cn() helper
├── types/
│   └── index.ts         # Entry, DayType, LoginResult, SessionCheck
├── pages/
│   ├── LoginPage.tsx        # LoginForm / TotpForm toggle. Toast on bad 2FA.
│   ├── DashboardPage.tsx    # Header + MonthCalendar + EntryPanel side panel / mobile drawer
│   └── EntryEditorPage.tsx  # Full-page entry editor at /entry/:date
└── index.css            # Tailwind directives, CSS variable theme tokens, custom keyframes
```

## Auth flow (frontend)

1. `LoginPage` shows `LoginForm`
2. On TOTP-required response, swaps to `TotpForm` (6-box animated OTP input)
3. Wrong 2FA code → row shakes → navigates back to login with a toast error
4. On success, token + username stored in `AuthContext` (also `localStorage`)
5. `ProtectedRoute` in `App.tsx` redirects to `/login` if no token
6. `AuthContext` calls `checkSession()` on load to validate stored token; clears if 401

## Dashboard layout

- **Desktop**: `MonthCalendar` + `EntryPanel` side panel (slide-in-from-right / slide-out-to-right animation)
- **Mobile**: `MonthCalendar` + vaul `Drawer` from bottom. Conditional render based on `useIsMobile()` — CSS `hidden` does not work because Drawer uses a portal.

### Side panel animation pattern

`panelDate` keeps content mounted during exit. `closing` boolean triggers the exit class. `onAnimationEnd` on the `<aside>` clears state after animation completes.

## Calendar

- Sunday-first (`firstDay.getDay()` as start offset)
- Weekend columns (Sun=0, Sat=6) have `bg-muted/20` tint on the wrapper `<div>`, not on the button
- Today's date number has `bg-primary text-primary-foreground` circle
- Entries show a coloured dot; null day type → Gulf Orange dot
- "Today" button in header snaps back to current month

## Entry panel / editor

- Day type: shadcn `Select` dropdown (one label shown at a time, not pill buttons)
- "Apply Template" button fills textarea with the standup template
- "Expand" button (Maximize2 icon) navigates to `/entry/:date` full-page editor
- Character counter shown; `maxLength={2000}`

## Assets

- `public/favicon.ico` — browser tab icon
- `public/cal.svg` — calendar logo used in `Header` and `LoginPage`

## Key gotchas

- Tailwind v4 uses `@import "tailwindcss"` — there is no `tailwind.config.ts`; all config is in `index.css`
- shadcn components were manually moved from a bad install path to `src/components/ui/` and `src/lib/`
- `useIsMobile()` must be used (not CSS) to conditionally render the Drawer — portals ignore CSS visibility
- `ApiError` has `status` as a class field declaration (not in constructor params) due to TypeScript `erasableSyntaxOnly`
