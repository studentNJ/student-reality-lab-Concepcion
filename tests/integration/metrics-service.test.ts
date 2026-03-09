import { describe, expect, it } from "vitest";
import { getAvailableYears, getMetricsByRange, getMetros, getMetricsByYear, getTrendByMetro } from "../../apps/web/src/lib/metrics";

describe("metrics integration", () => {
  it("returns metros from processed data", () => {
    const metros = getMetros();
    expect(metros.length).toBeGreaterThanOrEqual(10);
    expect(metros.some((metro) => metro.id === "35620")).toBe(true);
  });

  it("returns yearly metrics for valid year", () => {
    const rows = getMetricsByYear(2015);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.year === 2015)).toBe(true);
  });

  it("aggregates metrics across a selected timeframe", () => {
    const rows = getMetricsByRange(2018, 2022);
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows.every((row) => row.start_year === 2018)).toBe(true);
    expect(rows.every((row) => row.end_year === 2022)).toBe(true);
    expect(rows.every((row) => row.sample_size === 5)).toBe(true);
  });

  it("returns sorted trend for metro, supports year filters, and empty for missing metro", () => {
    const trend = getTrendByMetro("35620");
    expect(trend.length).toBeGreaterThan(0);
    const years = trend.map((item) => item.year);
    const sorted = [...years].sort((a, b) => a - b);
    expect(years).toEqual(sorted);

    const filteredTrend = getTrendByMetro("35620", 2018, 2020);
    expect(filteredTrend.map((item) => item.year)).toEqual([2018, 2019, 2020]);

    const missing = getTrendByMetro("00000");
    expect(missing).toEqual([]);
  });

  it("has available years list", () => {
    const years = getAvailableYears();
    expect(years[0]).toBe(2015);
    expect(years[years.length - 1]).toBe(2025);
  });
});
