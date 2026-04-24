# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run build:dev    # Development build (with sourcemaps)
npm run lint         # ESLint on all .ts/.tsx files
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Vitest in watch mode
npm run preview      # Preview production build
```

## Architecture

**DisciplineOS** is a client-only React SPA — no backend, all state persisted to localStorage under the key `"disciplineos-v2"` via Zustand.

### State & Data Flow

All application state lives in `/src/lib/store.ts` (Zustand). The store contains:
- `categories` (SubCategory[]) — seeded with 7 defaults (Deep Work, Learning, Admin, Workout, Meal, Social Media, Doom Scrolling)
- `blocks` (TimeBlock[]) — planned and logged hourly blocks keyed by date string (YYYY-MM-DD)
- `namaz` (NamazLog[]) — Islamic prayer completion records
- `reflections` (Reflection[]) — daily reflection entries
- `templates` (Template[]) — reusable day plans
- `settings` (Settings) — configurable scoring rules
- `startedDays` (string[]) — dates the user pressed "Start Day"

Core derived logic also lives in the store: `blocksForDay`, `useDayScore`, `computeDayScore`.

### Scoring System

`computeDayScore` (in `store.ts`) calculates a day's score:
- Productive hours × `pointsPerHour` × (2× multiplier if `isDeepWork`)
- Routine hours × `pointsPerHour`
- Wasted hours × `pointsPerHour` (negative)
- Namaz completions × `namazBonus`
- Penalties: missed prayers (`-namazPenalty` each), unmet `targetProductiveHours` (`-dailyTargetPenalty`)

All scoring parameters are user-configurable via Settings.

### Routing & Pages

7 pages via React Router v6:

| Route | Page | Purpose |
|---|---|---|
| `/` | Planner | Create planned time blocks, load templates |
| `/log` | LogScreen | Log actual time spent |
| `/dashboard` | Dashboard | Daily score ring + stats |
| `/analytics` | Analytics | Multi-day breakdowns and trends |
| `/reflect` | Reflect | Daily reflection entry |
| `/settings` | SettingsPage | Scoring rules, name, rank |
| `*` | NotFound | 404 |

`App.tsx` wraps all routes with: `QueryClientProvider` → `ThemeProvider` (next-themes, dark default) → `TooltipProvider` → toast providers → `BrowserRouter`.

### Key Types (`/src/lib/types.ts`)

- **TimeBlock**: `{ id, date (YYYY-MM-DD), subCategoryId, startMin, endMin, kind ("planned"|"logged"), note }`
- **SubCategory**: `{ id, name, type ("productive"|"routine"|"wasted"), pointsPerHour, isDeepWork }`
- **NamazLog**: `{ date, prayer ("Fajr"|"Zuhr"|"Asr"|"Maghrib"|"Isha"), completed }`
- **Reflection**: `{ id, date, wentWell, wasted, tomorrow, score, productiveHours, namazCompleted, createdAt }`

### Utility Modules

- `/src/lib/utils.ts` — Date helpers (`todayISO`, `parseISODateLocal`, `isoFromDate`), time formatting, `uid()`
- `/src/lib/namaz.ts` — Prayer window logic: `getDuePrayers`, `getPrayerStatus`, `getMissedPrayers`
- `/src/lib/reporting.ts` — `buildAggregateReport` for Analytics page; date range presets

### UI Stack

- **shadcn/ui** primitives in `/src/components/ui/` (Radix UI based)
- **Tailwind CSS** with custom color tokens for `productive` / `routine` / `wasted` categories (defined in `tailwind.config.ts`)
- **Recharts** for charts in Analytics
- **jsPDF** for report export
- Path alias `@/` resolves to `src/`

### Tests

Vitest + jsdom + React Testing Library. Currently only a placeholder test exists at `/src/test/example.test.ts`. The setup file `/src/test/setup.ts` mocks `window.matchMedia`.

## Responsiveness Fixes (High Priority)

All pages are broken on mobile view. Fix ALL pages to be fully responsive.

### Reference Screenshots
Check `/screenshot/` folder for broken UI screenshots:
- `screenshot/analytics.png` → Analytics page mobile issues
- `screenshot/dashboard2.png` → Dashboard (second view) mobile issues
- `screenshot/dashboard.png` → Dashboard main mobile issues
- `screenshot/logs.png` → Log Screen mobile issues
- `screenshot/planner.png` → Planner page mobile issues
- `screenshot/settings.png` → Settings page mobile issues

### Pages to Fix

| Page | File | Priority |
|---|---|---|
| Dashboard | `src/pages/Dashboard.tsx` | 🔴 High |
| Analytics | `src/pages/Analytics.tsx` | 🔴 High |
| LogScreen | `src/pages/LogScreen.tsx` | 🔴 High |
| Planner | `src/pages/Planner.tsx` | 🔴 High |
| Settings | `src/pages/SettingsPage.tsx` | 🟡 Medium |

### Responsiveness Rules
- Mobile first: fix for 375px–768px screens
- Use Tailwind responsive prefixes: `sm:` `md:` `lg:`
- No horizontal scrolling allowed on mobile
- All charts (Recharts) must use `ResponsiveContainer` — never fixed width
- Tables must collapse into cards or scroll on mobile
- Navigation must work on mobile (hamburger or bottom nav)
- Touch targets minimum 44px height
- Font sizes must not overflow containers
- DO NOT break existing desktop layout while fixing mobile

### Fix Order (One Page at a Time)
1. Look at screenshot in `screenshot/` folder
2. Fix that specific page only
3. Test at 375px width in browser devtools
4. Move to next page — do not fix multiple pages in one go

## Scoring Rules (Important)

- A day's score should ONLY be calculated if that date exists in `startedDays[]`
- If a day is NOT in `startedDays[]`, it must show as **Neutral** (no positive or negative points)
- This applies to:
  - Past days (before today) that were never started → Neutral
  - Future days with no blocks or no "Start Day" → Neutral
  - Only started days with actual blocks should show real scores
- In Analytics and Dashboard, un-started days should be visually distinct (grey/neutral, not scored)