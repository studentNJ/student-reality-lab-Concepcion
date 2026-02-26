import { describe, expect, it } from "vitest";
import { calculateAffordability, classifyRisk } from "../../apps/web/src/lib/metrics";

describe("calculator unit", () => {
  it("computes burden, disposable income, and risk for valid inputs", () => {
    const result = calculateAffordability(72000, 1800, 200);
    expect(result.rentBurdenPercent).toBe(30);
    expect(result.monthlyDisposableIncome).toBe(4000);
    expect(result.risk).toBe("Risky");
  });

  it("classifies boundaries correctly", () => {
    expect(classifyRisk(24.99)).toBe("Safe");
    expect(classifyRisk(25)).toBe("Risky");
    expect(classifyRisk(35)).toBe("Risky");
    expect(classifyRisk(35.01)).toBe("Cost-burdened");
  });

  it("throws on invalid annual salary", () => {
    expect(() => calculateAffordability(0, 1000, 0)).toThrow("annualSalary must be greater than 0");
  });

  it("throws on negative student loan", () => {
    expect(() => calculateAffordability(60000, 1000, -5)).toThrow("monthlyStudentLoan cannot be negative");
  });
});
