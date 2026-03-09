import { describe, expect, it } from "vitest";
import { calculateAffordability, classifyRisk } from "../../apps/web/src/lib/metrics";
import {
  annualIncomeToMonthlyIncome,
  calculateSalaryNeededForThirtyPercent,
  getEstimatedMonthlyIncome,
  getRoommateAdjustedRent,
} from "../../apps/web/src/lib/calculations";

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

  it("converts annual salary to monthly income", () => {
    expect(annualIncomeToMonthlyIncome(72000)).toBe(6000);
  });

  it("adjusts rent for roommates", () => {
    expect(getRoommateAdjustedRent(2400, 2)).toBe(800);
  });

  it("supports estimated after-tax income and salary target", () => {
    const result = calculateAffordability(72000, 1800, {
      monthlyStudentLoan: 200,
      roommates: 1,
      useEstimatedAfterTaxIncome: true,
    });

    expect(getEstimatedMonthlyIncome(72000, true)).toBe(4680);
    expect(result.effectiveMonthlyRent).toBe(900);
    expect(result.salaryNeededForThirtyPercent).toBe(36000);
    expect(result.incomeMode).toBe("estimated_after_tax");
  });

  it("computes the salary needed to hit the 30 percent rule", () => {
    expect(calculateSalaryNeededForThirtyPercent(1500)).toBe(60000);
  });
});
