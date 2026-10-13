# Dean · school hub prototype (V0)

Playful, gamified school dashboard with **Dean**, the auto-scheduler / study-coach personality.
Demo data only — no Canvas or real APIs yet.

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

## What's here

- `app/page.tsx` — the dashboard (Dean card, level/XP, stats, today's classes, upcoming work, Dean's plan, grades, quests)
- `components/Sidebar.tsx` — Home / Schedule / Courses / Grades / Dean (visual-only for now)
- `components/DeanAvatar.tsx` — Dean, pure SVG
- `components/UpcomingList.tsx` — check off work, earn XP (client-side only)
- `lib/demo-data.ts` — all fake school data, edit freely
- `app/globals.css` — design tokens, 3D buttons, everything visual

Stack: Next.js (App Router) + React + TypeScript + plain CSS. No other dependencies.
