Hi Copilot,

Please help me build a full-stack web app based on this project: “The 30% Problem: Can Young Adults Afford to Move Out?”

Goal
Build a data-driven website that shows whether young adults (ages 25–34) in major U.S. metro areas spend more than 30% of income on rent.

Primary Metric
Rent Burden (%) = (Median Monthly Rent / Median Monthly Income) × 100

Required Features (MVP)

1. Bar Chart

* Rent-to-income ratio (%) for ages 25–34 across selected U.S. metro areas.
* Metros exceeding 30% must be highlighted in red.

2. Trend Line Chart (2015–2025)

* Rent burden over time per metro area.

3. Interactive Calculator (Extension)

Inputs:

* Annual salary
* City (metro)
* Optional student loan payment

Outputs:

* Rent burden %
* Monthly disposable income remaining

Risk Classification:

* Safe (<25%)
* Risky (25–35%)
* Cost-burdened (>35%)

Important Data Alignment Decision
Do NOT mix BLS age earnings with ACS rent data.
Use ACS for BOTH income and rent to ensure geographic and yearly consistency.

Recommended Tech Stack

Frontend:

* Next.js (TypeScript)
* Tailwind CSS
* Recharts (for bar and line charts)

Backend/API:

* Use Next.js API routes inside the same project (simplest architecture)

Database:

* PostgreSQL
* Prisma ORM

Data Ingestion:

* Python + pandas (for cleaning, joining, and computing derived metrics)

Project Structure (Monorepo)

student-reality-lab/
apps/
web/                     # Next.js frontend + API routes
packages/
db/                      # Prisma schema + migrations
shared/                  # Shared TypeScript types
data/
notes.md                 # Provenance and assumptions
raw/                     # Raw downloaded datasets (never modified)
processed/               # Cleaned outputs used by the app
scripts/
ingest/                  # Data ingestion and transformation scripts
README.md

Database Schema (PostgreSQL via Prisma)

Create these tables:

metros

* id (string, stable metro identifier — preferably CBSA code)
* name (string)

metro_metrics

* metro_id (foreign key to metros.id)
* year (integer)
* median_annual_income (number)
* median_monthly_income (number)
* median_gross_rent (number)
* rent_burden_percent (number)

sources (optional but recommended)

* dataset_name
* source_url
* retrieved_at
* notes

API Endpoints to Implement

GET /api/metros
Returns a list of metros.

GET /api/metrics?year=YYYY
Returns bar chart data:
[
{
metro_id,
metro_name,
year,
rent_burden_percent,
median_gross_rent,
median_monthly_income
}
]

GET /api/trend?metro_id=ID
Returns time series for line chart:
[
{
year,
rent_burden_percent,
median_gross_rent,
median_monthly_income
}
]

POST /api/calculator

Input JSON:
{
"annualSalary": number,
"metroId": string,
"monthlyStudentLoan": number
}

Output JSON:
{
"rentBurdenPercent": number,
"monthlyDisposableIncome": number,
"risk": "Safe" | "Risky" | "Cost-burdened"
}

Step-by-Step Build Instructions

Step 1 — Initialize the Project

1. Create the folder structure shown above.
2. Initialize a Next.js TypeScript project inside apps/web.
3. Install Tailwind CSS.
4. Install Recharts.
5. Create basic pages:

   * / (dashboard)
   * /metro/[id] (metro detail page)

Step 2 — Setup Database and Prisma

1. Install PostgreSQL locally.
2. In packages/db:

   * Initialize Prisma.
   * Create schema.prisma with the tables defined above.
   * Run migrations.
3. Generate Prisma client.
4. Create a seed script:

   * Insert 10 example metros.
   * Insert small placeholder metro_metrics records for testing.

Step 3 — Create Data Ingestion Scripts

In scripts/ingest:

1. Create a Python script that:

   * Reads income and rent data from data/raw.
   * Standardizes metro identifiers.
   * Aligns datasets by year.
   * Computes:
     median_monthly_income = median_annual_income / 12
     rent_burden_percent = (median_gross_rent / median_monthly_income) * 100
   * Writes cleaned output to:
     data/processed/metro_metrics.csv

2. Create a loader script that:

   * Reads metro_metrics.csv
   * Inserts or updates records in the metro_metrics table.

Step 4 — Implement API Routes

Inside the Next.js project:

1. Create GET /api/metros
   Query metros table and return list.

2. Create GET /api/metrics
   Accept year parameter.
   Query metro_metrics filtered by year.
   Join with metros to return names.

3. Create GET /api/trend
   Accept metro_id.
   Return all yearly records sorted by year.

4. Create POST /api/calculator
   Steps:

   * Retrieve latest median_gross_rent for metro.
   * Compute:
     monthlyIncome = annualSalary / 12
     rentBurdenPercent = (median_gross_rent / monthlyIncome) * 100
     monthlyDisposable = monthlyIncome - median_gross_rent - monthlyStudentLoan
   * Apply risk classification:
     <25 → Safe
     25–35 → Risky

     > 35 → Cost-burdened
   * Return computed JSON response.

Step 5 — Build Frontend Features

Dashboard Page (/):

1. Add year dropdown selector.
2. Fetch /api/metrics?year=YYYY.
3. Render bar chart using Recharts.
4. Bars above 30% should be red.
5. Clicking a bar navigates to /metro/[id].

Metro Detail Page (/metro/[id]):

1. Fetch /api/trend?metro_id=ID.
2. Render line chart (2015–2025).
3. Add calculator panel:

   * Salary input
   * Student loan input
   * Display rent burden %, disposable income, and risk classification.

Step 6 — Update data/notes.md

Include:

# Data Notes / Provenance

## Datasets

Rent:

* Source: ACS
* Table: B25064 (Median Gross Rent)
* Geography: MSA
* Years used:
* URL:
* Retrieved:

Income (Ages 25–34):

* Source: ACS
* Table:
* Geography:
* Years used:
* URL:
* Retrieved:

## Transformations

* Standardize metro identifiers.
* Align datasets by year.
* Convert income to monthly.
* Compute rent burden.

## Filtering

* Remove metros with missing data.
* Document exclusions.

## Assumptions

* Median earner pays median rent.
* Gross income (no taxes).
* Does not account for roommates, dual income, or wealth.

Deliverables

* Next.js app with:

  * Bar chart
  * Trend line chart
  * Interactive calculator
* Prisma schema + migrations
* Data ingestion scripts
* data/processed/metro_metrics.csv
* Completed data/notes.md

Thank you,
Zack Smith
