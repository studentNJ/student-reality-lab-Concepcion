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

export interface DashboardMetric {
  metro_id: string;
  metro_name: string;
  start_year: number;
  end_year: number;
  median_monthly_income: number;
  median_gross_rent: number;
  rent_burden_percent: number;
  sample_size: number;
}

interface PrismaMetricRow {
  metro_id: string;
  year: number;
  median_annual_income: number;
  median_monthly_income: number;
  median_gross_rent: number;
  rent_burden_percent: number;
  metro?: { id: string; name: string };
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

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

function isYearInRange(year: number, startYear: number, endYear: number) {
  return year >= startYear && year <= endYear;
}

function toMetroMetric(row: PrismaMetricRow): MetroMetric {
  return {
    metro_id: row.metro_id,
    metro_name: row.metro?.name ?? row.metro_id,
    year: row.year,
    median_annual_income: row.median_annual_income,
    median_monthly_income: row.median_monthly_income,
    median_gross_rent: row.median_gross_rent,
    rent_burden_percent: row.rent_burden_percent,
  };
}

function summarizeMetrics(rows: MetroMetric[]): DashboardMetric[] {
  const grouped = new Map<string, {
    metro_name: string;
    sample_size: number;
    start_year: number;
    end_year: number;
    total_monthly_income: number;
    total_rent: number;
    total_rent_burden: number;
  }>();

  for (const row of rows) {
    const existing = grouped.get(row.metro_id);
    if (existing) {
      existing.sample_size += 1;
      existing.start_year = Math.min(existing.start_year, row.year);
      existing.end_year = Math.max(existing.end_year, row.year);
      existing.total_monthly_income += row.median_monthly_income;
      existing.total_rent += row.median_gross_rent;
      existing.total_rent_burden += row.rent_burden_percent;
      continue;
    }

    grouped.set(row.metro_id, {
      metro_name: row.metro_name,
      sample_size: 1,
      start_year: row.year,
      end_year: row.year,
      total_monthly_income: row.median_monthly_income,
      total_rent: row.median_gross_rent,
      total_rent_burden: row.rent_burden_percent,
    });
  }

  return Array.from(grouped.entries())
    .map(([metro_id, summary]) => ({
      metro_id,
      metro_name: summary.metro_name,
      start_year: summary.start_year,
      end_year: summary.end_year,
      median_monthly_income: roundToTwo(summary.total_monthly_income / summary.sample_size),
      median_gross_rent: roundToTwo(summary.total_rent / summary.sample_size),
      rent_burden_percent: roundToTwo(summary.total_rent_burden / summary.sample_size),
      sample_size: summary.sample_size,
    }))
    .sort((a, b) => b.rent_burden_percent - a.rent_burden_percent);
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

export function getMetricsByRange(startYear: number, endYear: number): DashboardMetric[] {
  return summarizeMetrics(getAllMetrics().filter((row) => isYearInRange(row.year, startYear, endYear)));
}

export function getTrendByMetro(metroId: string, startYear?: number, endYear?: number): TrendPoint[] {
  return getAllMetrics()
    .filter((row) => {
      if (row.metro_id !== metroId) {
        return false;
      }

      if (startYear === undefined || endYear === undefined) {
        return true;
      }

      return isYearInRange(row.year, startYear, endYear);
    })
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

    return rows.map((row) => toMetroMetric(row as PrismaMetricRow));
  } catch {
    return getMetricsByYear(year);
  }
}

export async function getMetricsByRangeData(startYear: number, endYear: number): Promise<DashboardMetric[]> {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return getMetricsByRange(startYear, endYear);
  }

  try {
    const rows = await prisma.metroMetric.findMany({
      where: {
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
      include: { metro: true },
    });

    return summarizeMetrics(rows.map((row) => toMetroMetric(row as PrismaMetricRow)));
  } catch {
    return getMetricsByRange(startYear, endYear);
  }
}

export async function getTrendByMetroData(metroId: string, startYear?: number, endYear?: number): Promise<TrendPoint[]> {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return getTrendByMetro(metroId, startYear, endYear);
  }

  try {
    const rows = await prisma.metroMetric.findMany({
      where: {
        metro_id: metroId,
        ...(startYear !== undefined && endYear !== undefined
          ? {
              year: {
                gte: startYear,
                lte: endYear,
              },
            }
          : {}),
      },
      orderBy: { year: "asc" },
    });

    return rows.map((row) => ({
      year: row.year,
      median_monthly_income: row.median_monthly_income,
      median_gross_rent: row.median_gross_rent,
      rent_burden_percent: row.rent_burden_percent,
    }));
  } catch {
    return getTrendByMetro(metroId, startYear, endYear);
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
