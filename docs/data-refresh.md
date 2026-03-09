# Data Refresh Guide

This project keeps the data workflow intentionally simple so future students can replace the sample dataset without
rewriting the app.

## Folder layout

- `data/raw/`: unmodified source CSV files that you downloaded or exported.
- `data/processed/metro_metrics.csv`: cleaned output used by the app and tests.
- `data/processed/source-metadata.json`: dataset label, year coverage, and refresh date shown in the UI.
- `scripts/ingest/build_metrics.py`: transforms raw CSV inputs into the processed dataset.
- `scripts/ingest/load_metrics_to_db.mjs`: reseeds the database from the processed dataset.

## Supported raw inputs

The processing script supports either of these inputs inside `data/raw/`:

1. `metro_metrics_raw.csv`
2. `income.csv` and `rent.csv`

### Required columns for `metro_metrics_raw.csv`

- `metro_id`
- `metro_name`
- `year`
- `median_annual_income`
- `median_gross_rent`

### Required columns for `income.csv`

- `metro_id`
- `metro_name`
- `year`
- `median_annual_income`

### Required columns for `rent.csv`

- `metro_id`
- `year`
- `median_gross_rent`

## Main command

From the repo root, run:

```bash
npm run data:refresh
```

That command:

1. Reads the raw data files.
2. Computes `median_monthly_income`.
3. Computes `rent_burden_percent`.
4. Writes `data/processed/metro_metrics.csv`.
5. Updates `data/processed/source-metadata.json`.
6. Reseeds the local database if your database environment is already running.

## How the app picks up updated data

- CSV mode reads directly from `data/processed/metro_metrics.csv`.
- Database mode uses the same processed data after reseeding.
- The badge in the app header reads `source-metadata.json` to show whether the current dataset is sample or production.

## If something breaks

Check these items in order:

1. Confirm the raw files are in `data/raw/` and the required column names match the guide.
2. Run `npm run data:build` first to isolate transformation errors before loading the database.
3. If database mode is enabled, make sure PostgreSQL is running with `npm run db:up` or `npm run db:dev`.
4. If the app still shows old data in database mode, run `npm run db:load` again.
5. If the badge still shows sample data, inspect `data/processed/source-metadata.json` and confirm `datasetType` was updated.