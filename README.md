# The 30% Problem: Can Young Adults Afford to Move Out?

## Essential Question

Are young adults (ages 25–34) in major U.S. cities spending more than the recommended 30% of their income on rent?

## Claim (Hypothesis)

In most major U.S. metro areas, young adults now spend more than 30% of their income on rent, making independent living financially unstable.

## Audience

This project is for:

- College students and recent graduates deciding whether they can afford to move out
- Young professionals evaluating relocation options
- Policymakers and housing researchers interested in affordability trends

## STAR Draft

### S — Situation

Young adults are increasingly delaying moving out or returning to live with parents. Housing costs have risen rapidly in the past five years, while wage growth has been slower. Financial advisors recommend spending no more than 30% of gross income on housing, but it is unclear whether this guideline is realistic in today’s rental market.

### T — Task

The viewer should be able to:

- Determine whether the 30% rent rule is realistic for young adults.
- Compare rent burden across major metro areas.
- Understand how rent burden has changed over time.
- Evaluate whether moving out is financially viable in a specific city.

### A — Action

I will build:

#### Bar Chart

- Rent-to-income ratio (%) for ages 25–34 across selected U.S. metro areas.
- Cities exceeding 30% will be highlighted in red.

#### Trend Line Chart (2015–2025)

- Rent burden over time to show whether affordability has worsened.

#### Interactive Calculator (Planned Extension)

User inputs:

- Annual salary
- City
- Optional student loan payment

Output:

- Rent burden %
- Monthly disposable income remaining

Risk classification:

- Safe (<25%)
- Risky (25–35%)
- Cost-burdened (>35%)

### R — Result

I expect the data to show:

- Most large metro areas exceed the 30% affordability threshold.
- Rent burden has increased significantly since 2019.
- In high-cost cities, rent burden may exceed 40–50%.

Primary metric reported:

**Rent Burden (%)**

$$
\text{Rent Burden (\%)} = 
\frac{\text{Median Monthly Rent}}{\text{Median Monthly Income}} \times 100
$$

Additional metric:

- Percentage of analyzed metro areas above 30%.

## Dataset & Provenance

### Income Data

- **Source:** U.S. Bureau of Labor Statistics (BLS)
- **Dataset:** Median weekly earnings by age group (25–34)
- **Accessed via:** https://www.bls.gov
- **Retrieval Date:** [INSERT DATE]
- **License:** U.S. Government public domain data

### Rent Data

- **Source:** U.S. Census Bureau — American Community Survey (ACS)
- **Dataset:** Median gross rent by metropolitan statistical area
- **Accessed via:** https://data.census.gov
- **Retrieval Date:** [INSERT DATE]
- **License:** U.S. Government public domain data

### Optional Supplemental Dataset (Extension)

- Zillow Observed Rent Index (ZORI)
- Federal Reserve Economic Data (FRED) CPI index

## Data Dictionary

| Column | Meaning | Units |
| --- | --- | --- |
| metro_area | Name of metropolitan statistical area | Text |
| year | Calendar year of observation | Year |
| median_weekly_earnings | Median weekly earnings for ages 25–34 | USD |
| median_annual_income | Converted annual income (weekly × 52) | USD |
| median_monthly_income | Annual income ÷ 12 | USD |
| median_gross_rent | Median monthly rent | USD |
| rent_burden_percent | Rent as % of monthly income | Percent |

## Data Viability Audit

### Missing Values + Weird Fields

- Income data reported weekly; rent reported monthly → requires unit alignment.
- Some metros may not have complete age-specific income data.
- “Median gross rent” may include utilities, depending on dataset definition.
- Household vs individual income differences may affect interpretation.

### Cleaning Plan

- Convert weekly income to annual income (weekly × 52).
- Convert annual income to monthly income (÷ 12).
- Filter to age group 25–34 only.
- Remove metros with incomplete rent or income data.
- Align datasets by year (e.g., use 2022 for both sources).
- Standardize metro names for proper joins.

### What This Dataset Cannot Prove (Limits & Bias)

It does not account for:

- Roommates
- Dual-income households
- Savings or wealth
- Student debt payments
- Taxes (uses gross income)

Additional limitations:

- It assumes median income earners pay median rent.
- It does not reflect housing quality differences.
- It does not capture informal rental markets.

## Draft Chart Screenshot

_Insert Excel or Google Sheets bar chart image here._

## Why This Chart Answers the Question

- It directly compares rent burden percentages against the 30% affordability threshold.
- It highlights which metro areas exceed the recommended housing cost limit.

## /data Folder Contents

### raw.csv

Contains merged rent and income data for selected metro areas.

### notes.md

Includes:

- Source URLs
- Retrieval dates
- Notes on cleaning and transformation
- Any assumptions made during preprocessing


