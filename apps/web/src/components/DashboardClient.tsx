"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetroMetric } from "@/lib/metrics";

interface DashboardClientProps {
  years: number[];
}

export default function DashboardClient({ years }: DashboardClientProps) {
  const [year, setYear] = useState<number>(years[years.length - 1] ?? 2023);
  const [data, setData] = useState<MetroMetric[]>([]);
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
        const response = await fetch(`/api/metrics?year=${year}`);
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const json = (await response.json()) as MetroMetric[];
        setData(json);
      } catch {
        setError("Could not load metrics.");
      }
    }

    run();
  }, [year]);

  const sorted = useMemo(() => [...data].sort((a, b) => b.rent_burden_percent - a.rent_burden_percent), [data]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="year" className="text-sm font-medium">Year</label>
        <select
          id="year"
          className="rounded border px-2 py-1"
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
        >
          {years.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

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
                  const selected = entry as MetroMetric;
                  router.push(`/metro/${selected.metro_id}`);
                }}
              >
                {sorted.map((entry) => (
                  <Cell key={`${entry.metro_id}-${entry.year}`} fill={entry.rent_burden_percent > 30 ? "#dc2626" : "#2563eb"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </section>
  );
}
