"use client";

import { useEffect, useState } from "react";

type HealthPayload = {
  status: "ok";
  configuredMode: "database" | "csv";
  activeSource: "database" | "csv_fallback";
  datasetType: "sample" | "production";
  datasetLabel: string;
  sourceDescription: string | null;
  metroCount: number;
  startYear: number | null;
  endYear: number | null;
  lastRefreshed: string | null;
  checkedAt: string;
};

export default function DataSourceBadge() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Health endpoint failed");
        }
        const payload = (await response.json()) as HealthPayload;
        if (mounted) {
          setHealth(payload);
          setError(false);
        }
      } catch {
        if (mounted) {
          setError(true);
        }
      }
    }

    run();
    const timer = setInterval(run, 15_000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (error) {
    return (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">
        Data source unavailable
      </span>
    );
  }

  if (!health) {
    return (
      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
        Checking data source...
      </span>
    );
  }

  const isDatabase = health.activeSource === "database";
  const yearRange = health.startYear && health.endYear ? `${health.startYear}-${health.endYear}` : "Year range unavailable";
  const tooltipText = [
    "Data status legend:",
    `- dataset: ${health.datasetLabel}`,
    "- database: live PostgreSQL reads succeeded",
    "- csv_fallback: app is using data/processed/metro_metrics.csv",
    health.sourceDescription ? `- source notes: ${health.sourceDescription}` : null,
    health.lastRefreshed ? `- last refreshed: ${health.lastRefreshed}` : null,
    "",
    "How to switch to database mode:",
    "1) Set USE_DATABASE=\"true\" in .env",
    "2) Run: npm run db:dev",
    "3) Ensure Docker/WSL integration is enabled",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span className="group relative inline-flex flex-wrap items-center gap-2">
      <span
        className={`hover-soft rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${
          isDatabase
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-amber-200 bg-amber-50 text-amber-700"
        }`}
        title={`configured: ${health.configuredMode}, checked: ${health.checkedAt}`}
      >
        {health.datasetLabel} · {health.metroCount} metros · {yearRange}
      </span>
      {health.lastRefreshed ? (
        <span className="hover-soft rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
          Updated {health.lastRefreshed}
        </span>
      ) : null}
      <span
        className={`hover-soft rounded-full px-3 py-1.5 text-xs shadow-sm ${
          isDatabase ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-amber-100 bg-amber-50 text-amber-700"
        }`}
      >
        Live source: {health.activeSource}
      </span>
      <span
        className="hover-soft cursor-help rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm"
        aria-label="Data source legend"
      >
        ?
      </span>
      <span className="invisible absolute left-0 top-full z-20 mt-2 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 text-xs leading-5 text-slate-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] group-hover:visible whitespace-pre-line backdrop-blur">
        {tooltipText}
      </span>
    </span>
  );
}
