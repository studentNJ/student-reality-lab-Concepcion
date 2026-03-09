import { describe, expect, it } from "vitest";
import { calculateAffordability, getLatestRentByMetro, getMetricsByRange, getMetricsByYear, getTrendByMetro } from "../../apps/web/src/lib/metrics";

describe("application flow e2e", () => {
  it("supports dashboard year selection and metro drill-down", () => {
    const dashboardRows = getMetricsByYear(2023);
    expect(dashboardRows.length).toBeGreaterThan(0);

    const multiYearRows = getMetricsByRange(2020, 2025);
    expect(multiYearRows.length).toBeGreaterThanOrEqual(10);

    const selectedMetro = dashboardRows[0].metro_id;
    const trend = getTrendByMetro(selectedMetro, 2020, 2025);
    expect(trend.length).toBeGreaterThan(0);
  });

  it("supports calculator flow with optional student loan", () => {
    const rent = getLatestRentByMetro("35620");
    expect(rent).not.toBeNull();

    const resultNoLoan = calculateAffordability(90000, rent!, 0);
    const resultWithLoan = calculateAffordability(90000, rent!, {
      monthlyStudentLoan: 300,
      roommates: 1,
      useEstimatedAfterTaxIncome: true,
    });

    expect(resultWithLoan.monthlyDisposableIncome).toBeLessThan(resultNoLoan.monthlyDisposableIncome);
    expect(resultWithLoan.effectiveMonthlyRent).toBeLessThan(rent!);
    expect(resultWithLoan.salaryNeededForThirtyPercent).toBeGreaterThan(0);
    expect(["Safe", "Risky", "Cost-burdened"]).toContain(resultNoLoan.risk);
  });

  it("handles missing metro in trend and calculator preconditions", () => {
    const trend = getTrendByMetro("missing");
    expect(trend).toEqual([]);

    const rent = getLatestRentByMetro("missing");
    expect(rent).toBeNull();
  });
});
