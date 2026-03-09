export type Risk = "Safe" | "Risky" | "Cost-burdened";

export interface AffordabilityOptions {
  monthlyStudentLoan?: number;
  roommates?: number;
  useEstimatedAfterTaxIncome?: boolean;
}

export interface AffordabilityResult {
  rentBurdenPercent: number;
  monthlyDisposableIncome: number;
  risk: Risk;
  effectiveMonthlyRent: number;
  monthlyIncomeBasis: number;
  salaryNeededForThirtyPercent: number;
  householdSize: number;
  incomeMode: "gross" | "estimated_after_tax";
}

const ESTIMATED_TAKE_HOME_RATE = 0.78;

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

function normalizeOptions(input?: number | AffordabilityOptions): Required<AffordabilityOptions> {
  if (typeof input === "number") {
    return {
      monthlyStudentLoan: input,
      roommates: 0,
      useEstimatedAfterTaxIncome: false,
    };
  }

  return {
    monthlyStudentLoan: input?.monthlyStudentLoan ?? 0,
    roommates: input?.roommates ?? 0,
    useEstimatedAfterTaxIncome: input?.useEstimatedAfterTaxIncome ?? false,
  };
}

export function annualIncomeToMonthlyIncome(annualSalary: number) {
  return roundToTwo(annualSalary / 12);
}

export function classifyRisk(rentBurdenPercent: number): Risk {
  if (rentBurdenPercent < 25) {
    return "Safe";
  }
  if (rentBurdenPercent <= 35) {
    return "Risky";
  }
  return "Cost-burdened";
}

export function getRoommateAdjustedRent(medianGrossRent: number, roommates = 0) {
  if (!Number.isInteger(roommates) || roommates < 0) {
    throw new Error("roommates must be a non-negative whole number");
  }

  return roundToTwo(medianGrossRent / (roommates + 1));
}

export function getEstimatedMonthlyIncome(annualSalary: number, useEstimatedAfterTaxIncome = false) {
  const grossMonthlyIncome = annualIncomeToMonthlyIncome(annualSalary);

  if (!useEstimatedAfterTaxIncome) {
    return grossMonthlyIncome;
  }

  return roundToTwo(grossMonthlyIncome * ESTIMATED_TAKE_HOME_RATE);
}

export function calculateSalaryNeededForThirtyPercent(monthlyRent: number) {
  return roundToTwo((monthlyRent * 12) / 0.3);
}

export function calculateAffordability(
  annualSalary: number,
  medianGrossRent: number,
  input?: number | AffordabilityOptions,
): AffordabilityResult {
  if (annualSalary <= 0) {
    throw new Error("annualSalary must be greater than 0");
  }
  if (medianGrossRent < 0) {
    throw new Error("medianGrossRent cannot be negative");
  }

  const options = normalizeOptions(input);

  if (options.monthlyStudentLoan < 0) {
    throw new Error("monthlyStudentLoan cannot be negative");
  }

  const monthlyIncomeBasis = getEstimatedMonthlyIncome(annualSalary, options.useEstimatedAfterTaxIncome);
  const effectiveMonthlyRent = getRoommateAdjustedRent(medianGrossRent, options.roommates);
  const rentBurdenPercent = roundToTwo((effectiveMonthlyRent / monthlyIncomeBasis) * 100);
  const monthlyDisposableIncome = roundToTwo(monthlyIncomeBasis - effectiveMonthlyRent - options.monthlyStudentLoan);

  return {
    rentBurdenPercent,
    monthlyDisposableIncome,
    risk: classifyRisk(rentBurdenPercent),
    effectiveMonthlyRent,
    monthlyIncomeBasis,
    salaryNeededForThirtyPercent: calculateSalaryNeededForThirtyPercent(effectiveMonthlyRent),
    householdSize: options.roommates + 1,
    incomeMode: options.useEstimatedAfterTaxIncome ? "estimated_after_tax" : "gross",
  };
}