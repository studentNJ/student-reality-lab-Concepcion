# Test Specifications by Sprint (Positive + Negative)

This file contains the test inventory that should be implemented in the `tests/` workspace.

## Directory Convention
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

---

## Sprint 1 Test Inventory

### Unit
- Positive: valid shared payload shapes parse and map correctly.
- Positive: risk enum accepts only allowed labels.
- Negative: missing `metro_id` fails validation.
- Negative: invalid `year` type fails validation.

### Integration
- Positive: shared contracts import into `apps/web` successfully.
- Positive: dashboard and metro route modules compile.
- Negative: contract mismatch causes compile/test failure.
- Negative: broken alias path fails module resolution tests.

### E2E
- Positive: `/` renders dashboard shell.
- Positive: `/metro/sample` renders metro shell.
- Negative: unknown route returns not-found.
- Negative: malformed metro ID does not crash page.

---

## Sprint 2 Test Inventory

### Unit
- Positive: year/rent/income schema validator passes valid rows.
- Positive: seed mapper outputs valid Prisma input.
- Negative: negative rent/income rejected.
- Negative: invalid year range rejected.

### Integration
- Positive: migrations create `metros`, `metro_metrics`, `sources`.
- Positive: seed inserts required metro + metric records.
- Negative: FK violation fails on missing `metro_id`.
- Negative: duplicate ID handling fails without upsert path.

### E2E
- Positive: DB init → migrate → seed → app startup succeeds.
- Positive: seeded data appears in API response.
- Negative: invalid DB connection string returns controlled failure.
- Negative: DB down shows resilient API error behavior.

---

## Sprint 3 Test Inventory

### Unit
- Positive: monthly income formula is correct.
- Positive: rent burden formula is correct.
- Negative: divide-by-zero salary handled explicitly.
- Negative: non-numeric input rows rejected.

### Integration
- Positive: ingest converts raw fixtures into processed CSV schema.
- Positive: loader upserts CSV rows into database.
- Negative: missing join keys are filtered out.
- Negative: schema mismatch triggers explicit loader error.

### E2E
- Positive: full ingest + load pipeline succeeds from fixture data.
- Positive: loaded computed rows visible in API.
- Negative: corrupted raw file produces actionable failure.
- Negative: empty source file handled without crash.

---

## Sprint 4 Test Inventory

### Unit
- Positive: calculator computes burden/disposable correctly.
- Positive: risk classification boundary logic correct.
- Negative: zero/negative salary rejected.
- Negative: invalid query params rejected.

### Integration
- Positive: `GET /api/metros` returns list.
- Positive: `GET /api/metrics?year=` returns joined and filtered rows.
- Positive: `GET /api/trend?metro_id=` returns sorted time series.
- Positive: `POST /api/calculator` returns full expected payload.
- Negative: unknown metro returns 404.
- Negative: malformed request body returns 400.

### E2E
- Positive: UI loads data from all API endpoints.
- Positive: calculator UI and API produce consistent result.
- Negative: API 500 path handled in UI.
- Negative: year with no rows returns empty-state UX, no crash.

---

## Sprint 5 Test Inventory

### Unit
- Positive: color rule marks >30% as red.
- Positive: trend data mapping to chart points works.
- Negative: null/NaN burden values use fallback behavior.
- Negative: malformed trend rows are rejected/skipped.

### Integration
- Positive: dashboard year selector re-fetches metrics.
- Positive: metro detail fetches and plots trend points.
- Negative: failed fetch renders error state.
- Negative: empty dataset renders no-data state.

### E2E
- Positive: year switch updates bars and colors.
- Positive: bar click navigates to matching metro detail page.
- Negative: invalid metro path handled gracefully.
- Negative: simulated API failure shows friendly message.

---

## Sprint 6 Test Inventory

### Unit
- Positive: calculator input parser accepts valid numeric text.
- Positive: optional loan defaults to zero.
- Negative: non-numeric salary blocked.
- Negative: negative loan blocked.

### Integration
- Positive: calculator form submits and renders response fields.
- Positive: repeated recalculation updates values correctly.
- Negative: invalid payload surfaces validation messages.
- Negative: server error does not clear prior successful result unexpectedly.

### E2E
- Positive: user calculates risk/disposable successfully end-to-end.
- Positive: changing salary recalculates outputs.
- Negative: invalid form input prevents submit and shows inline error.
- Negative: server-side calculator failure allows retry UX.

---

## Separation Requirement
All automated tests must remain under `tests/` and not inside application folders such as `apps/web`.
