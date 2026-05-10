# Memento — My Life in Weeks

A mobile app that makes the passage of time tangible by showing your entire life as a grid of weekly dots — lived, current, and remaining.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string (not used in first build)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 + Expo Router (file-based)
- Storage: AsyncStorage (local-first, no backend required)
- Animations: react-native-reanimated v3
- Grid: react-native-svg
- Date math: date-fns
- API: Express 5 (not used in first build)

## Where things live

- `artifacts/memento/` — the Expo mobile app
- `artifacts/memento/app/` — Expo Router screens
- `artifacts/memento/app/(onboarding)/` — 3-step onboarding flow
- `artifacts/memento/app/(tabs)/` — main tab screens (grid, stats, profile)
- `artifacts/memento/app/modal/week-detail.tsx` — week tagging modal
- `artifacts/memento/contexts/AppContext.tsx` — global state (profile + entries)
- `artifacts/memento/lib/weekUtils.ts` — date/week calculations
- `artifacts/memento/lib/storage.ts` — AsyncStorage wrapper
- `artifacts/memento/components/grid/DotGrid.tsx` — SVG life grid
- `artifacts/memento/components/charts/WeekDonut.tsx` — animated donut chart
- `artifacts/memento/constants/colors.ts` — dark glassmorphism palette
- `artifacts/memento/constants/quotes.ts` — daily motivational quotes

## Architecture decisions

- Dark-only app (black glassmorphism) — both light and dark tokens point to the same dark palette
- AsyncStorage used for offline-first persistence (MMKV was specified but not Expo Go compatible)
- SVG dot grid with one row component per year to avoid hooks-in-loops issues with Reanimated
- Week number is a flat index (1 to totalWeeks), not week-of-year — simpler math
- No backend in first build — all data is local

## Product

- Life grid: 52 columns (weeks) × lifespan rows (years), each dot is one week
- Filled white = lived, outlined = future, pulsing = current week
- Tap any dot → tag it with emoji, note, and category (work/health/travel/learning/personal)
- Stats screen: animated donut, category breakdown, daily quote
- Profile screen: edit name/lifespan, view life summary, reset app

## User preferences

- Black & White glassmorphism design language
- Expo Go compatible libraries only

## Gotchas

- react-native-svg requires `onPress` directly on Circle — works in Expo Go
- useAnimatedStyle / useAnimatedProps must never be called in loops — use separate components per row
- Splash screen uses `#0A0A0A` background to match the app

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
