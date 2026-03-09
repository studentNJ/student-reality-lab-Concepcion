"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltipCard from "@/components/ChartTooltipCard";
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
    <section className="motion-rise motion-delay-3 hover-lift space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1">
            <label htmlFor="dashboard-year" className="text-sm font-medium text-slate-700">Year</label>
            <select
              id="dashboard-year"
              className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-slate-600">
            Showing the rent-burden snapshot for {selectedYear}.
          </p>
        </div>

        <span className="hover-soft rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
          {sorted.length} metros available
        </span>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="hover-soft h-[400px] w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        {chartsReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metro_name" angle={-15} textAnchor="end" interval={0} height={90} />
              <YAxis domain={[0, 50]} unit="%" />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} content={<ChartTooltipCard variant="dashboard" />} />
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
