export type RiskLevel = "Safe" | "Risky" | "Cost-burdened";

export interface Metro {
  id: string;
  name: string;
}

export interface MetroMetric {
  metro_id: string;
  metro_name: string;
  year: number;
  median_annual_income: number;
  median_monthly_income: number;
  median_gross_rent: number;
  rent_burden_percent: number;
}

export interface TrendPoint {
  year: number;
  median_monthly_income: number;
  median_gross_rent: number;
  rent_burden_percent: number;
}

export interface CalculatorInput {
  annualSalary: number;
  metroId: string;
  monthlyStudentLoan?: number;
}

export interface CalculatorOutput {
  rentBurdenPercent: number;
  monthlyDisposableIncome: number;
  risk: RiskLevel;
}
