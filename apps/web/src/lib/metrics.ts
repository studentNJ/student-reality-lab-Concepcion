import fs from "node:fs";
import path from "node:path";
import {
  calculateAffordability as calculateAffordabilityValue,
  classifyRisk as classifyRiskValue,
  type Risk,
} from "./calculations";

export type DataSource = "database" | "csv_fallback";
export type DatasetType = "sample" | "production";

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

interface DataStatusMetadata {
  datasetType?: DatasetType;
  displayName?: string;
  source?: string;
  metroCount?: number;
  startYear?: number;
  endYear?: number;
  lastRefreshed?: string;
}

export interface DataSourceStatus {
  configuredMode: "database" | "csv";
  activeSource: DataSource;
  datasetType: DatasetType;
  datasetLabel: string;
  sourceDescription: string | null;
  metroCount: number;
  startYear: number | null;
  endYear: number | null;
  lastRefreshed: string | null;
}

let cached: MetroMetric[] | null = null;
let prismaClient: unknown | null = null;

const fileCandidates = [
  path.resolve(process.cwd(), "data", "processed", "metro_metrics.csv"),
  path.resolve(process.cwd(), "..", "..", "data", "processed", "metro_metrics.csv"),
];

const metadataCandidates = [
  path.resolve(process.cwd(), "data", "processed", "source-metadata.json"),
  path.resolve(process.cwd(), "..", "..", "data", "processed", "source-metadata.json"),
];

function resolveMetricsFilePath() {
  const file = fileCandidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    throw new Error("Could not locate data/processed/metro_metrics.csv");
  }
  return file;
}

function resolveMetadataFilePath() {
  return metadataCandidates.find((candidate) => fs.existsSync(candidate)) ?? null;
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

function formatDateString(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
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
  return classifyRiskValue(rentBurdenPercent);
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

function readDataStatusMetadata(): DataStatusMetadata | null {
  const metadataPath = resolveMetadataFilePath();
  if (!metadataPath) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(metadataPath, "utf8")) as DataStatusMetadata;
  } catch {
    return null;
  }
}

function getDerivedDataStatus() {
  const rows = getAllMetrics();
  const years = getAvailableYears();
  const metricsPath = resolveMetricsFilePath();
  const stats = fs.statSync(metricsPath);

  return {
    datasetType: "sample" as DatasetType,
    datasetLabel: "Sample Dataset",
    sourceDescription: "Bundled placeholder data stored in data/processed/metro_metrics.csv",
    metroCount: getMetros().length,
    startYear: years[0] ?? null,
    endYear: years[years.length - 1] ?? null,
    lastRefreshed: stats.mtime.toISOString().slice(0, 10),
    rowCount: rows.length,
  };
}

export function getDataStatusSummary() {
  const metadata = readDataStatusMetadata();
  const derived = getDerivedDataStatus();

  return {
    datasetType: metadata?.datasetType ?? derived.datasetType,
    datasetLabel:
      metadata?.displayName ??
      (metadata?.datasetType === "production" ? "Production Dataset" : derived.datasetLabel),
    sourceDescription: metadata?.source ?? derived.sourceDescription,
    metroCount: metadata?.metroCount ?? derived.metroCount,
    startYear: metadata?.startYear ?? derived.startYear,
    endYear: metadata?.endYear ?? derived.endYear,
    lastRefreshed: formatDateString(metadata?.lastRefreshed) ?? derived.lastRefreshed,
  };
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

export async function getDataSourceStatus(): Promise<DataSourceStatus> {
  const configuredMode = shouldUseDatabase() ? "database" : "csv";
  const prisma = await getPrismaClient();
  const summary = getDataStatusSummary();

  if (!prisma) {
    return {
      configuredMode,
      activeSource: "csv_fallback" as DataSource,
      ...summary,
    };
  }

  try {
    await prisma.metro.findMany({ take: 1 });
    return {
      configuredMode,
      activeSource: "database" as DataSource,
      ...summary,
    };
  } catch {
    return {
      configuredMode,
      activeSource: "csv_fallback" as DataSource,
      ...summary,
    };
  }
}

export const calculateAffordability = calculateAffordabilityValue;
