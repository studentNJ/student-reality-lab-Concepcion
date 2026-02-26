import fs from "node:fs";
import path from "node:path";

export type Risk = "Safe" | "Risky" | "Cost-burdened";
export type DataSource = "database" | "csv_fallback";

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

let cached: MetroMetric[] | null = null;
let prismaClient: unknown | null = null;

const fileCandidates = [
  path.resolve(process.cwd(), "data", "processed", "metro_metrics.csv"),
  path.resolve(process.cwd(), "..", "..", "data", "processed", "metro_metrics.csv"),
];

function resolveMetricsFilePath() {
  const file = fileCandidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    throw new Error("Could not locate data/processed/metro_metrics.csv");
  }
  return file;
}

function parseNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }
  return parsed;
}

function shouldUseDatabase() {
  return process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
}

async function getPrismaClient() {
  if (!shouldUseDatabase()) {
    return null;
  }

  if (prismaClient) {
    return prismaClient as {
      metro: {
        findMany: (args?: unknown) => Promise<Array<{ id: string; name: string }>>;
      };
      metroMetric: {
        findMany: (args?: unknown) => Promise<Array<{
          metro_id: string;
          year: number;
          median_annual_income: number;
          median_monthly_income: number;
          median_gross_rent: number;
          rent_burden_percent: number;
          metro?: { id: string; name: string };
        }>>;
      };
    };
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const globalStore = globalThis as unknown as {
      __srPrisma?: InstanceType<typeof PrismaClient>;
    };

    if (!globalStore.__srPrisma) {
      globalStore.__srPrisma = new PrismaClient();
    }

    prismaClient = globalStore.__srPrisma;
    return prismaClient as {
      metro: {
        findMany: (args?: unknown) => Promise<Array<{ id: string; name: string }>>;
      };
      metroMetric: {
        findMany: (args?: unknown) => Promise<Array<{
          metro_id: string;
          year: number;
          median_annual_income: number;
          median_monthly_income: number;
          median_gross_rent: number;
          rent_burden_percent: number;
          metro?: { id: string; name: string };
        }>>;
      };
    };
  } catch {
    return null;
  }
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

export function calculateAffordability(
  annualSalary: number,
  medianGrossRent: number,
  monthlyStudentLoan = 0,
) {
  if (annualSalary <= 0) {
    throw new Error("annualSalary must be greater than 0");
  }
  if (monthlyStudentLoan < 0) {
    throw new Error("monthlyStudentLoan cannot be negative");
  }

  const monthlyIncome = annualSalary / 12;
  const rentBurdenPercent = (medianGrossRent / monthlyIncome) * 100;
  const monthlyDisposableIncome = monthlyIncome - medianGrossRent - monthlyStudentLoan;

  return {
    rentBurdenPercent: Number(rentBurdenPercent.toFixed(2)),
    monthlyDisposableIncome: Number(monthlyDisposableIncome.toFixed(2)),
    risk: classifyRisk(rentBurdenPercent),
  };
}

export function getAllMetrics(): MetroMetric[] {
  if (cached) {
    return cached;
  }

  const raw = fs.readFileSync(resolveMetricsFilePath(), "utf8").trim();
  const [header, ...lines] = raw.split(/\r?\n/);
  if (!header || lines.length === 0) {
    cached = [];
    return cached;
  }

  cached = lines.map((line) => {
    const [metro_id, metro_name, year, annual, monthly, rent, burden] = line.split(",");

    return {
      metro_id,
      metro_name,
      year: parseNumber(year),
      median_annual_income: parseNumber(annual),
      median_monthly_income: parseNumber(monthly),
      median_gross_rent: parseNumber(rent),
      rent_burden_percent: parseNumber(burden),
    };
  });

  return cached;
}

export function getMetros() {
  const metros = new Map<string, string>();
  for (const row of getAllMetrics()) {
    metros.set(row.metro_id, row.metro_name);
  }
  return Array.from(metros.entries()).map(([id, name]) => ({ id, name }));
}

export function getMetricsByYear(year: number) {
  return getAllMetrics().filter((row) => row.year === year);
}

export function getTrendByMetro(metroId: string): TrendPoint[] {
  return getAllMetrics()
    .filter((row) => row.metro_id === metroId)
    .sort((a, b) => a.year - b.year)
    .map((row) => ({
      year: row.year,
      median_monthly_income: row.median_monthly_income,
      median_gross_rent: row.median_gross_rent,
      rent_burden_percent: row.rent_burden_percent,
    }));
}

export function getLatestRentByMetro(metroId: string) {
  const trend = getTrendByMetro(metroId);
  if (trend.length === 0) {
    return null;
  }
  return trend[trend.length - 1].median_gross_rent;
}

export function getAvailableYears(): number[] {
  return Array.from(new Set(getAllMetrics().map((row) => row.year))).sort((a, b) => a - b);
}

export async function getMetrosData() {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return getMetros();
  }

  try {
    const rows = await prisma.metro.findMany({ orderBy: { name: "asc" } });
    return rows.map((item) => ({ id: item.id, name: item.name }));
  } catch {
    return getMetros();
  }
}

export async function getMetricsByYearData(year: number): Promise<MetroMetric[]> {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return getMetricsByYear(year);
  }

  try {
    const rows = await prisma.metroMetric.findMany({
      where: { year },
      include: { metro: true },
      orderBy: { rent_burden_percent: "desc" },
    });

    return rows.map((row) => ({
      metro_id: row.metro_id,
      metro_name: row.metro?.name ?? row.metro_id,
      year: row.year,
      median_annual_income: row.median_annual_income,
      median_monthly_income: row.median_monthly_income,
      median_gross_rent: row.median_gross_rent,
      rent_burden_percent: row.rent_burden_percent,
    }));
  } catch {
    return getMetricsByYear(year);
  }
}

export async function getTrendByMetroData(metroId: string): Promise<TrendPoint[]> {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return getTrendByMetro(metroId);
  }

  try {
    const rows = await prisma.metroMetric.findMany({
      where: { metro_id: metroId },
      orderBy: { year: "asc" },
    });

    return rows.map((row) => ({
      year: row.year,
      median_monthly_income: row.median_monthly_income,
      median_gross_rent: row.median_gross_rent,
      rent_burden_percent: row.rent_burden_percent,
    }));
  } catch {
    return getTrendByMetro(metroId);
  }
}

export async function getLatestRentByMetroData(metroId: string) {
  const trend = await getTrendByMetroData(metroId);
  if (trend.length === 0) {
    return null;
  }
  return trend[trend.length - 1].median_gross_rent;
}

export async function getDataSourceStatus() {
  const configuredMode = shouldUseDatabase() ? "database" : "csv";
  const prisma = await getPrismaClient();

  if (!prisma) {
    return {
      configuredMode,
      activeSource: "csv_fallback" as DataSource,
    };
  }

  try {
    await prisma.metro.findMany({ take: 1 });
    return {
      configuredMode,
      activeSource: "database" as DataSource,
    };
  } catch {
    return {
      configuredMode,
      activeSource: "csv_fallback" as DataSource,
    };
  }
}
