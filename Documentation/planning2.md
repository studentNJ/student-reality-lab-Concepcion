Hi Copilot,

Please help me improve this project so future students can understand it faster, trust the data more easily, and extend it without breaking core functionality.

Project context
This project is a full-stack website called “The 30% Problem: Can Young Adults Afford to Move Out?” It analyzes whether young adults ages 25–34 in major U.S. metro areas are spending more than 30% of their income on rent.

Current state of the project
The repo now has a stronger structure than before:

* Monorepo/workspace setup
* Next.js app in apps/web
* Recharts in the frontend
* Dockerized Postgres setup
* Database scripts
* Unit, integration, and E2E test commands
* Placeholder metro dataset for 10 metros from 2015–2025
* Dashboard/year selector and metro detail structure documented in the README

Main goal of this task
Improve the project so it becomes a reusable teaching tool for future students, not just a one-time class submission.

High-level improvement priorities
Please implement the following in this order:

1. In-app methodology and provenance panel
2. Sample-data vs production-data status badge
3. Guided data refresh/import workflow
4. Calculator enhancements for learning and scenario testing
5. Core metric and API/UI tests
6. Replace leftover default frontend documentation
7. Add assignment-style extension prompts for future students

Step-by-step implementation instructions

Step 1 — Add an in-app methodology and provenance panel

Purpose
Future students should be able to understand how the app works without reading the full repo first.

What to build
Add a visible “How this works” or “Methodology” section in the UI.

Requirements
On the dashboard page and metro detail page, add a button, drawer, modal, or collapsible panel that explains:

* The main formula:
  Rent Burden (%) = (Median Monthly Rent / Median Monthly Income) × 100
* What the project is trying to measure
* That current data may be placeholder/sample data unless replaced by ingested ACS data
* The major assumptions:

  * Median earner pays median rent
  * Gross income is used
  * Roommates, dual-income households, wealth, taxes, and housing quality are not modeled
* The basic transformation steps:

  * Convert annual income to monthly income
  * Match metro + year
  * Compute rent burden
* A short note explaining why this is useful and what it cannot prove

Implementation guidance
Create a reusable MethodologyPanel component and place it in:

* Dashboard page
* Metro detail page

Also create a dedicated page if useful:

* /methodology

Step 2 — Add a sample-data vs production-data badge

Purpose
Future students need to know whether they are looking at placeholder/demo data or real ingested data.

What to build
Add a visible status badge near the top of the dashboard and metro pages.

Requirements
The badge should display one of these states:

* Sample Dataset
* Production Dataset

It should also optionally show:

* Number of metros
* Year coverage
* Last refreshed date

Implementation guidance
Create a small data-status utility that reads from:

* Environment variable
* Small metadata JSON file
* Or a database table / source record

Recommended output example

* Sample Dataset · 10 metros · 2015–2025
* Production Dataset · 42 metros · Updated 2026-03-09

Create a reusable DataStatusBadge component.

Step 3 — Build a guided data refresh/import workflow

Purpose
Future students should be able to refresh the data without guessing how the pipeline works.

What to build
Create a clear, documented workflow for:

* placing raw files
* processing them
* loading them into the database

Requirements
Organize the data workflow like this:

* data/raw/ for unmodified source data
* data/processed/ for cleaned outputs
* scripts/ingest/ for processing scripts

Create or improve these scripts:

1. A processing script that:

   * Reads raw rent and income data
   * Standardizes metro identifiers
   * Aligns data by year
   * Computes median_monthly_income
   * Computes rent_burden_percent
   * Writes processed CSV output

2. A load script that:

   * Reads the processed CSV
   * Inserts or updates rows in the database

3. A single high-level command that runs the full workflow

Documentation requirement
Create a student-friendly guide named something like:

* docs/data-refresh.md

That file should explain:

* where raw files go
* what command to run
* what output files are generated
* how the app picks up the updated data
* what to check if something breaks

Step 4 — Upgrade the calculator into a teaching tool

Purpose
The calculator should help students test real-life scenarios, not just perform one formula.

What to build
Expand the calculator on the metro detail page.

Required inputs

* Annual salary
* Optional monthly student loan payment
* Optional number of roommates
* Optional toggle for gross income vs estimated after-tax income

Required outputs

* Rent burden %
* Monthly disposable income
* Risk category
* Suggested salary needed to hit the 30% rule

Risk categories

* Safe: under 25%
* Risky: 25% to 35%
* Cost-burdened: above 35%

Additional behavior
If roommates are entered:

* Divide monthly rent by household size assumption or roommate count rule you define
* Clearly explain the assumption in the UI

If after-tax mode is enabled:

* Use a simple estimated tax reduction approach
* Clearly label it as an estimate, not a true tax calculation

Implementation guidance
Create a dedicated calculator component with clean internal logic and helper functions.
Separate display logic from calculation logic so it is easy to test.

Step 5 — Add tests for the core educational logic

Purpose
Future students should be able to modify the project confidently.

What to test

Unit tests

* Annual income to monthly income conversion
* Rent burden calculation
* Risk classification
* Salary needed for 30% rule
* Roommate-adjusted rent logic if implemented

API/integration tests

* GET /api/metros returns expected structure
* GET /api/metrics returns expected year-filtered data
* GET /api/trend returns sorted yearly data
* Calculator endpoint or calculator logic returns valid results

UI/E2E tests

* Dashboard renders chart data
* Bars over 30% are visually distinguished
* Metro page loads trend data
* Calculator updates output when inputs change
* Methodology panel opens correctly
* Data status badge is visible

Implementation guidance
Use the project’s existing test setup and expand it rather than replacing it.

Step 6 — Replace default frontend documentation

Purpose
Future students should not open project folders and see generic starter text.

What to update
Replace any leftover default Next.js README content inside apps/web with project-specific documentation.

The frontend README should explain:

* what the frontend does
* what routes exist
* where charts live
* where shared UI components live
* how data is fetched
* how to run the frontend locally
* what future students are expected to edit first

Step 7 — Add extension prompts for future students

Purpose
Turn the project into a reusable teaching scaffold.

What to create
Add a file such as:

* docs/future-student-extensions.md

Include prompts like:

* Replace placeholder data with ingested ACS data
* Add compare-two-metros mode
* Add inflation-adjusted rent toggle
* Add downloadable CSV for a metro
* Add chart annotations for years with major housing changes
* Add a reflection section on the limits of the 30% rule
* Add a methodology citation export for presentations/reports

This file should be written in plain language so future students can pick an extension and start immediately.

Suggested file/component additions

Frontend components

* components/MethodologyPanel.tsx
* components/DataStatusBadge.tsx
* components/RentBurdenCalculator.tsx

Docs

* docs/data-refresh.md
* docs/future-student-extensions.md

Utilities

* lib/calculations.ts
* lib/dataStatus.ts

Expected outcome
After these changes, the project should:

* teach users how the metric works
* clearly identify whether data is sample or production
* make data refreshes reproducible
* provide a more useful calculator
* be safer for future students to modify
* contain project-specific documentation instead of starter boilerplate
* provide built-in directions for future class extensions

Please implement these changes in a clean, maintainable way with reusable components, readable docs, and tests for all critical logic.

Thank you,
Zack Smith
