# Data Notes / Provenance

## Intended sources

- Rent reference endpoint: https://api.census.gov/data/2023/acs/acs5?get=group(B25064)&ucgid=pseudo(0100000US$31000M1)
- Income reference endpoint: https://api.census.gov/data/2023/acs/acs5?get=group(B20001)&ucgid=pseudo(0100000US$31000M1)
- Source family: U.S. Census Bureau ACS 5-year tables

## Current shipped dataset

- `data/processed/metro_metrics.csv` currently contains placeholder sample values so the app can exercise a larger dashboard and trend timeframe without a full raw ACS ingest pipeline.
- Coverage: 10 metro areas.
- Years included: 2015 through 2025.
- Each metro/year row includes derived `median_monthly_income` and `rent_burden_percent` values.

## Included metros

- 35620 — New York-Newark-Jersey City
- 31080 — Los Angeles-Long Beach-Anaheim
- 16980 — Chicago-Naperville-Elgin
- 47900 — Washington-Arlington-Alexandria
- 33100 — Miami-Fort Lauderdale-West Palm Beach
- 37980 — Philadelphia-Camden-Wilmington
- 19100 — Dallas-Fort Worth-Arlington
- 26420 — Houston-The Woodlands-Sugar Land
- 12060 — Atlanta-Sandy Springs-Roswell
- 38060 — Phoenix-Mesa-Chandler

## Transformation notes

- `median_monthly_income = median_annual_income / 12`
- `rent_burden_percent = (median_gross_rent / median_monthly_income) * 100`
- Placeholder series are monotonic by year to make dashboard range averages and metro trend filtering easy to verify in tests.

## Operational note

- If database mode is enabled, reseed after CSV changes with `npm run db:seed` or `npm run db:reset`.