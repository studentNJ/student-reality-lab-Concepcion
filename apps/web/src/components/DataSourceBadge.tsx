"use client";

import { useEffect, useState } from "react";

type HealthPayload = {
  status: "ok";
  configuredMode: "database" | "csv";
  activeSource: "database" | "csv_fallback";
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
  const tooltipText = [
    "Data source legend:",
    "- database: live PostgreSQL reads succeeded",
    "- csv_fallback: app is using data/processed/metro_metrics.csv",
    "",
    "How to switch to database mode:",
    "1) Set USE_DATABASE=\"true\" in .env",
    "2) Run: npm run db:dev",
    "3) Ensure Docker/WSL integration is enabled",
  ].join("\n");

  return (
    <span className="group relative inline-flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isDatabase
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-amber-200 bg-amber-50 text-amber-700"
        }`}
        title={`configured: ${health.configuredMode}, checked: ${health.checkedAt}`}
      >
        Source: {health.activeSource}
      </span>
      <span
        className="cursor-help rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700"
        aria-label="Data source legend"
      >
        ?
      </span>
      <span className="invisible absolute left-0 top-full z-20 mt-2 w-80 rounded border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-sm group-hover:visible whitespace-pre-line">
        {tooltipText}
      </span>
    </span>
  );
}
