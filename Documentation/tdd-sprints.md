# TDD Sprint Plan — The 30% Problem

This sprint plan is derived from the specs in `Documentation/planning.md` and is designed for iterative TDD delivery.

## Sprint 1 — Monorepo + App Skeleton + Contracts

### Scope
- Create monorepo structure from the spec (`apps/web`, `packages/db`, `packages/shared`, `scripts/ingest`, `data/raw`, `data/processed`, `tests/`).
- Initialize Next.js TypeScript app in `apps/web`.
- Add Tailwind + Recharts dependencies.
- Create routes/pages:
  - `/` dashboard
  - `/metro/[id]` metro detail
- Define shared API contracts/types in `packages/shared`.

### Acceptance Criteria
- Required folders exist and match the planning spec.
- `apps/web` runs and serves both pages without runtime errors.
- Shared TypeScript types exist for metro, metric, trend, and calculator request/response payloads.
- No application test files are stored under `apps/web` (tests remain in `tests/`).

### TDD Test Set
#### Unit Tests
- Positive:
  - Shared types validate valid metro and metric objects.
  - Utility to map risk labels accepts only `Safe`, `Risky`, `Cost-burdened`.
- Negative:
  - Type guards reject malformed metric payloads (missing `metro_id`, non-numeric `year`).
  - Type guards reject invalid risk strings.

#### Integration Tests
- Positive:
  - App bootstraps with shared package imported successfully.
  - Route module loading for `/` and `/metro/[id]` succeeds.
- Negative:
  - Build fails when contract field names diverge from spec (guard test).
  - Route import test fails when shared package path alias is broken.

#### E2E Tests
- Positive:
  - User opens `/` and sees dashboard shell.
  - User opens `/metro/test-id` and sees metro detail shell.
- Negative:
  - Unknown route returns expected not-found behavior.
  - Invalid dynamic id does not crash page rendering.

---

## Sprint 2 — Prisma Schema + PostgreSQL + Seed Data

### Scope
- Implement Prisma schema in `packages/db` with tables:
  - `metros`
  - `metro_metrics`
  - `sources` (recommended)
- Add migration and Prisma client generation.
- Add seed script with at least 10 metros and sample metrics.

### Acceptance Criteria
- Prisma schema compiles and migration runs cleanly.
- Foreign key from `metro_metrics.metro_id` to `metros.id` is enforced.
- Seed inserts expected records and can be re-run safely (idempotent upsert behavior preferred).
- Database read from app/API layer works locally.

### TDD Test Set
#### Unit Tests
- Positive:
  - Schema validation helper accepts valid year/income/rent values.
  - Seed transformation maps seed fixtures into Prisma create inputs.
- Negative:
  - Validator rejects negative rent/income values.
  - Validator rejects out-of-range years (outside planned window).

#### Integration Tests
- Positive:
  - Migration creates all required tables and indexes.
  - Seed inserts 10+ metros and linked metric rows.
- Negative:
  - Inserting `metro_metrics` with missing metro FK fails.
  - Duplicate metro id insertion without upsert path fails as expected.

#### E2E Tests
- Positive:
  - End-to-end startup path (DB up, migrate, seed, app start) succeeds.
  - App can fetch at least one metro-backed record through API stub.
- Negative:
  - App startup with invalid `DATABASE_URL` reports controlled error.
  - DB unavailable state surfaces non-200 API response, no crash loop.

---

## Sprint 3 — Data Ingestion Pipeline (Python + pandas)

### Scope
- Build ingest script(s) in `scripts/ingest` to:
  - Read ACS income + rent raw files from `data/raw`.
  - Standardize metro identifiers.
  - Align by year.
  - Compute:
    - `median_monthly_income = median_annual_income / 12`
    - `rent_burden_percent = (median_gross_rent / median_monthly_income) * 100`
  - Write `data/processed/metro_metrics.csv`.
- Build loader script to upsert processed metrics into DB.

### Acceptance Criteria
- Processed CSV is generated with required schema columns.
- Missing/inconsistent records are filtered and logged.
- Loader inserts/updates processed rows in database.
- ACS-only alignment is preserved (no mixed incompatible source logic).

### TDD Test Set
#### Unit Tests
- Positive:
  - Formula tests validate monthly income and rent burden math.
  - Metro identifier normalizer maps known variants to canonical IDs.
- Negative:
  - Formula function handles divide-by-zero with explicit failure/skip policy.
  - Parser rejects rows with non-numeric rent/income values.

#### Integration Tests
- Positive:
  - Ingest reads sample raw fixtures and produces expected processed rows.
  - Loader upserts processed rows into `metro_metrics` correctly.
- Negative:
  - Ingest excludes records missing required join keys.
  - Loader fails gracefully on schema mismatch (extra/missing columns).

#### E2E Tests
- Positive:
  - Full pipeline: raw fixtures → ingest → processed CSV → DB load succeeds.
  - Post-load API query returns computed rent burden values from processed dataset.
- Negative:
  - Corrupted raw input file causes controlled pipeline failure with actionable message.
  - Empty input dataset produces empty processed output without unhandled exception.

---

## Sprint 4 — API Routes

### Scope
Implement Next.js API routes:
- `GET /api/metros`
- `GET /api/metrics?year=YYYY`
- `GET /api/trend?metro_id=ID`
- `POST /api/calculator`

### Acceptance Criteria
- Each endpoint returns response shape exactly as spec.
- `metrics` filters by year and includes metro names.
- `trend` is sorted by year ascending.
- `calculator` computes rent burden, disposable income, and risk class correctly.
- Input validation returns proper 4xx errors for invalid payloads.

### TDD Test Set
#### Unit Tests
- Positive:
  - Calculator math returns expected values for valid salary/rent/loan.
  - Risk classification boundaries map correctly (<25 safe, 25–35 risky, >35 cost-burdened).
- Negative:
  - Calculator rejects zero/negative salary.
  - Query validator rejects invalid year and missing `metro_id`.

#### Integration Tests
- Positive:
  - `GET /api/metros` returns seeded metros.
  - `GET /api/metrics` joins metros + metrics and returns year-filtered payload.
  - `GET /api/trend` returns sorted time-series rows.
  - `POST /api/calculator` uses latest metro rent record.
- Negative:
  - Unknown metro id returns 404 for trend/calculator.
  - Missing/invalid body fields return 400 with error details.

#### E2E Tests
- Positive:
  - Browser flow calls each API endpoint and renders valid JSON/UI without errors.
  - Calculator request from UI produces matching displayed risk result.
- Negative:
  - API timeout/DB failure path shows resilient error response in UI.
  - Year with no data returns empty dataset (not server error).

---

## Sprint 5 — Dashboard + Metro Detail Visualizations

### Scope
- Dashboard (`/`): year dropdown + bar chart.
- Bar chart behavior: metros above 30% highlighted red.
- Click bar navigates to `/metro/[id]`.
- Metro detail page: trend line chart for selected metro (2015–2025 target range).

### Acceptance Criteria
- Year selector updates bar chart via `GET /api/metrics`.
- Bar colors correctly encode threshold >30%.
- Clicking a bar routes to correct metro detail page.
- Metro detail renders trend data from API and handles missing data state.

### TDD Test Set
#### Unit Tests
- Positive:
  - Bar color function returns red when rent burden >30.
  - Trend formatter maps API rows to chart points.
- Negative:
  - Color function handles null/NaN values with fallback style.
  - Trend formatter rejects malformed year/value rows.

#### Integration Tests
- Positive:
  - Dashboard component fetches and renders metrics for selected year.
  - Metro detail component fetches trend and renders line chart points.
- Negative:
  - Failed fetch displays non-blocking error state.
  - Empty trend dataset renders explicit “no data” state.

#### E2E Tests
- Positive:
  - User selects year, chart updates, bars render threshold coloring.
  - User clicks metro bar and lands on matching detail page with line chart.
- Negative:
  - Invalid metro URL shows recoverable not-found/error UI.
  - Simulated API 500 displays friendly error and no blank screen.

---

## Sprint 6 — Calculator UX + Data Notes Completion + Release Hardening

### Scope
- Add calculator panel on metro detail page:
  - Inputs: annual salary, monthly student loan (optional).
  - Output: rent burden %, monthly disposable income, risk label.
- Complete and standardize `data/notes.md` provenance sections.
- Add release-quality checks for test coverage and basic CI gating.

### Acceptance Criteria
- Calculator accepts user input and displays computed outputs accurately.
- Optional student loan defaults to 0 when omitted.
- Risk classes displayed exactly as spec labels.
- `data/notes.md` documents sources, years, transformations, filtering, assumptions.
- Test commands run from `tests/` workflows and pass minimum quality gate.

### TDD Test Set
#### Unit Tests
- Positive:
  - Input parser coerces valid numeric strings.
  - Disposable income formula correct with/without student loan.
- Negative:
  - Parser rejects non-numeric salary and negative loan values.
  - Risk boundary tests for exactly 25 and 35 confirm classification policy.

#### Integration Tests
- Positive:
  - Metro detail form submits to calculator API and renders response values.
  - Notes metadata loader (if implemented) reads standardized provenance sections.
- Negative:
  - Invalid calculator payload surfaces inline validation errors.
  - API validation errors do not clear previous successful result unexpectedly.

#### E2E Tests
- Positive:
  - User completes calculator form and receives correct risk/disposable outputs.
  - User edits salary and sees recalculated result.
- Negative:
  - User enters invalid data and sees blocked submit with validation feedback.
  - Server-side calculator failure shows retry-friendly UI message.

---

## Definition of Done Across All Sprints
- All sprint acceptance criteria met.
- Positive + negative tests exist for unit, integration, and E2E levels.
- Tests are stored under `tests/` (separate from app code).
- No unresolved P1 defects in formula correctness, API contract integrity, or core UI flows.
