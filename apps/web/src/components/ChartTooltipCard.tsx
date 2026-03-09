"use client";

import type { DashboardMetric, TrendPoint } from "@/lib/metrics";

interface ChartTooltipCardProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    value?: number | string;
    payload?: DashboardMetric | TrendPoint;
  }>;
  variant: "dashboard" | "trend";
}

function formatCurrency(value: number | undefined) {
  if (value === undefined) {
    return "N/A";
  }

  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number | undefined) {
  if (value === undefined) {
    return "N/A";
  }

  return `${value.toFixed(2)}%`;
}

export default function ChartTooltipCard({ active, label, payload, variant }: ChartTooltipCardProps) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  if (variant === "dashboard") {
    const row = payload[0].payload as DashboardMetric;

    return (
      <div className="min-w-64 rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
        <p className="text-base font-semibold text-slate-900">{row.metro_name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Dashboard snapshot</p>
        <div className="mt-3 space-y-1.5">
          <p>Rent burden: <strong>{formatPercent(row.rent_burden_percent)}</strong></p>
          <p>Median monthly income: <strong>{formatCurrency(row.median_monthly_income)}</strong></p>
          <p>Median monthly rent: <strong>{formatCurrency(row.median_gross_rent)}</strong></p>
          <p>Years represented: <strong>{row.start_year}-{row.end_year}</strong></p>
        </div>
      </div>
    );
  }

  const row = payload[0].payload as TrendPoint;

  return (
    <div className="min-w-56 rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
      <p className="text-base font-semibold text-slate-900">Year {label}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Trend detail</p>
      <div className="mt-3 space-y-1.5">
        <p>Rent burden: <strong>{formatPercent(row.rent_burden_percent)}</strong></p>
        <p>Median monthly income: <strong>{formatCurrency(row.median_monthly_income)}</strong></p>
        <p>Median monthly rent: <strong>{formatCurrency(row.median_gross_rent)}</strong></p>
      </div>
    </div>
  );
}