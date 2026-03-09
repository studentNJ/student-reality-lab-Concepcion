"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardMetric } from "@/lib/metrics";

interface DashboardClientProps {
  years: number[];
}

export default function DashboardClient({ years }: DashboardClientProps) {
  const latestYear = years[years.length - 1] ?? 2025;
  const [selectedYear, setSelectedYear] = useState<number>(latestYear);
  const [data, setData] = useState<DashboardMetric[]>([]);
  const [error, setError] = useState<string>("");
  const [chartsReady, setChartsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    async function run() {
      try {
        setError("");
        const params = new URLSearchParams({ year: String(selectedYear) });
        const response = await fetch(`/api/metrics?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const json = (await response.json()) as DashboardMetric[];
        setData(json);
      } catch {
        setError("Could not load metrics.");
      }
    }

    run();
  }, [selectedYear]);

  const sorted = useMemo(() => [...data].sort((a, b) => b.rent_burden_percent - a.rent_burden_percent), [data]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1">
          <label htmlFor="dashboard-year" className="text-sm font-medium">Year</label>
          <select
            id="dashboard-year"
            className="rounded border px-2 py-1"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600">
          Showing the rent-burden snapshot for {selectedYear}.
        </p>
      </div>

      <p className="text-sm text-gray-600">
        {sorted.length} metros available in the selected year.
      </p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="h-[400px] w-full rounded border p-2">
        {chartsReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metro_name" angle={-15} textAnchor="end" interval={0} height={90} />
              <YAxis domain={[0, 50]} unit="%" />
              <Tooltip />
              <Bar
                dataKey="rent_burden_percent"
                onClick={(entry: unknown) => {
                  const selected = entry as DashboardMetric;
                  router.push(`/metro/${selected.metro_id}`);
                }}
              >
                {sorted.map((entry) => (
                  <Cell
                    key={`${entry.metro_id}-${entry.start_year}-${entry.end_year}`}
                    fill={entry.rent_burden_percent > 30 ? "#dc2626" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </section>
  );
}
