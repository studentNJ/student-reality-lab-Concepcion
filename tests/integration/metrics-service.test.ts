import { describe, expect, it } from "vitest";
import { getAvailableYears, getMetros, getMetricsByYear, getTrendByMetro } from "../../apps/web/src/lib/metrics";

describe("metrics integration", () => {
  it("returns metros from processed data", () => {
    const metros = getMetros();
    expect(metros.length).toBeGreaterThan(0);
    expect(metros.some((metro) => metro.id === "35620")).toBe(true);
  });

  it("returns yearly metrics for valid year", () => {
    const rows = getMetricsByYear(2023);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.year === 2023)).toBe(true);
  });

  it("returns empty list for year with no data", () => {
    const rows = getMetricsByYear(2015);
    expect(rows).toEqual([]);
  });

  it("returns sorted trend for metro and empty for missing metro", () => {
    const trend = getTrendByMetro("35620");
    expect(trend.length).toBeGreaterThan(0);
    const years = trend.map((item) => item.year);
    const sorted = [...years].sort((a, b) => a - b);
    expect(years).toEqual(sorted);

    const missing = getTrendByMetro("00000");
    expect(missing).toEqual([]);
  });

  it("has available years list", () => {
    const years = getAvailableYears();
    expect(years[0]).toBeLessThan(years[years.length - 1]);
  });
});
