# Frontend Guide

This app renders the teaching dashboard for The 30% Problem. It shows rent-burden comparisons across metros,
metro-level trends, and an affordability calculator that students can extend safely.

## What the frontend does

- Renders the dashboard at `/` with a year selector and metro comparison bar chart.
- Renders metro detail pages at `/metro/[id]` with a trend chart and affordability calculator.
- Shows a methodology panel so users can understand the metric without reading the full repository.
- Shows a dataset badge that distinguishes sample data from production-style refreshed data.

## Main routes

- `/`: dashboard view.
- `/metro/[id]`: metro detail and calculator.
- `/methodology`: full explanation of the metric, assumptions, and data caveats.
- `/api/health`: dataset status and source metadata.
- `/api/metrics`: dashboard metrics for a year or year range.
- `/api/metros`: metro lookup list.
- `/api/trend`: yearly trend data for a single metro.
- `/api/calculator`: calculator API for metro-level affordability scenarios.

## Where the code lives

- `src/app/`: route files and layout.
- `src/components/`: reusable UI pieces such as charts, status badges, methodology content, and calculator screens.
- `src/lib/metrics.ts`: metric loading, source selection, and API-facing data helpers.
- `src/lib/calculations.ts`: calculator logic and risk rules.

## How data is fetched

- Dashboard data is fetched client-side from `/api/metrics`.
- Metro detail data is fetched client-side from `/api/trend`.
- Calculator results are posted to `/api/calculator`.
- Dataset status is fetched from `/api/health`.

## Local run commands

From the repository root:

```bash
npm run dev
```

If you want database-backed reads instead of CSV fallback:

```bash
cp .env.example .env
npm run db:dev
npm run dev
```

## What future students should edit first

1. Edit `src/components/DashboardClient.tsx` if you want to change the dashboard interaction model.
2. Edit `src/components/MetroDetailClient.tsx` if you want to extend the calculator or detail page behavior.
3. Edit `src/lib/calculations.ts` before changing how affordability is computed.
4. Edit `src/lib/metrics.ts` before changing data source logic, metadata, or API payload shape.
5. Read `../../docs/data-refresh.md` before replacing the sample dataset.
