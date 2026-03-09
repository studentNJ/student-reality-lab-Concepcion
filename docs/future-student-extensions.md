# Future Student Extensions

Use these prompts as starting points for small, well-scoped project extensions.

## Suggested extension ideas

1. Replace the bundled sample data with ingested ACS data and document the exact source links you used.
2. Add a compare-two-metros mode so users can view rent burden and trends side by side.
3. Add an inflation-adjusted rent toggle and explain the limits of nominal vs real dollars.
4. Let users download a metro-level CSV from the detail page.
5. Add chart annotations for major housing events, such as the 2020 pandemic shock or rate spikes.
6. Add a reflection section that explains when the 30% rule is useful and when it may be misleading.
7. Export a short methodology citation block that students can paste into class reports or presentations.

## Good extension habits

- Keep calculation logic outside UI components when possible.
- Add or update tests before changing a metric definition.
- Update `docs/data-refresh.md` or the frontend README if your change affects student workflows.
- Explain any new assumptions directly in the UI, not only in code comments.

## First places to edit

- Dashboard behavior starts in `apps/web/src/app/page.tsx` and `apps/web/src/components/DashboardClient.tsx`.
- Metro detail behavior starts in `apps/web/src/app/metro/[id]/page.tsx` and `apps/web/src/components/MetroDetailClient.tsx`.
- Shared metric and calculator logic lives in `apps/web/src/lib/`.
- Data pipeline work starts in `scripts/ingest/` and `data/processed/`.