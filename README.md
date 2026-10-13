# Dean · school hub prototype (V0)

Playful, gamified school dashboard with **Dean**, the auto-scheduler / study-coach personality.
It can read one person's Canvas account, and it falls back to the built-in demo when Canvas isn't configured.

## Run

```bash
npm install
cp .env.example .env.local
# optional: fill in CANVAS_BASE_URL and CANVAS_TOKEN
npm run dev
# open http://localhost:3000
```

Without those two variables, every page uses the demo school (Jacob, week 8 of Fall 2026). A small **Demo** or **Live** mark in the sidebar says which one you're looking at.

## Canvas access token

This is a personal prototype: one token, no OAuth, no accounts, no database. The token stays in `.env.local` on the server. Route handlers and server components are the only code that sees it, and it is not sent to the browser.

1. Sign in to Canvas in a browser.
2. Open **Account**, then **Settings**.
3. Scroll to **Approved Integrations**.
4. Click **New Access Token**.
5. Give it a purpose such as "Dean" and an expiration if you want one. Canvas shows the token once — copy it.
6. In `.env.local`:

```bash
CANVAS_BASE_URL=https://your-school.instructure.com
CANVAS_TOKEN=the-token-you-just-copied
```

`CANVAS_BASE_URL` is the school host only, for example `https://canvas.instructure.com`. Restart `npm run dev` after saving.

Dean then loads:

- active courses
- assignments, with due dates, points, and whether each one is submitted, late, or missing
- scores, the current course grade, and assignment-group weights (the Grades what-if uses those weights; courses that don't weight groups use each group's share of the points)
- calendar events for the schedule, and planner to-dos for Home and Schedule
- announcements and modules on the course page

Requests follow Canvas `Link` pagination and are reused for about a minute. If the token is missing, rejected, or Canvas can't be reached, the demo data comes back on its own.

Level, streak, quests, and focus time are still local. Canvas doesn't have them. The Dean tab is still only a tab.

## What's here

- `app/page.tsx` — the dashboard (Dean card, level/XP, stats, today's classes, upcoming work, Dean's plan, grades, quests)
- `components/Sidebar.tsx` — Home / Schedule / Courses / Grades / Dean (the Dean tab is visual-only for now)
- `components/DeanAvatar.tsx` — Dean, pure SVG
- `components/UpcomingList.tsx` — check off work, earn XP (client-side only)
- `lib/demo-data.ts` — the fallback school, used whenever Canvas isn't available
- `lib/canvas/` — the typed Canvas client, pagination, and mappers
- `app/globals.css` — design tokens, 3D buttons, everything visual

Stack: Next.js (App Router) + React + TypeScript + plain CSS.

```bash
npm run test
npm run lint
npm run build
```
