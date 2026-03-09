"use client";

import { FormEvent, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { TrendPoint } from "@/lib/metrics";

interface MetroDetailClientProps {
  metroId: string;
  years: number[];
}

interface CalcResult {
  rentBurdenPercent: number;
  monthlyDisposableIncome: number;
  risk: "Safe" | "Risky" | "Cost-burdened";
}

export default function MetroDetailClient({ metroId, years }: MetroDetailClientProps) {
  const earliestYear = years[0] ?? 2015;
  const latestYear = years[years.length - 1] ?? earliestYear;
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [salary, setSalary] = useState("70000");
  const [loan, setLoan] = useState("0");
  const [error, setError] = useState("");
  const [calcError, setCalcError] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [chartsReady, setChartsReady] = useState(false);
  const [startYear, setStartYear] = useState(earliestYear);
  const [endYear, setEndYear] = useState(latestYear);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    async function run() {
      try {
        setError("");
        const params = new URLSearchParams({
          metro_id: metroId,
          start_year: String(startYear),
          end_year: String(endYear),
        });
        const response = await fetch(`/api/trend?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Trend request failed");
        }
        const json = (await response.json()) as TrendPoint[];
        setTrend(json);
      } catch {
        setError("Unable to load trend data for this metro.");
      }
    }

    run();
  }, [endYear, metroId, startYear]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCalcError("");
      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          annualSalary: Number(salary),
          metroId,
          monthlyStudentLoan: Number(loan || "0"),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Calculation failed");
      }

      setResult((await response.json()) as CalcResult);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : "Calculation failed");
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Metro {metroId}</h2>
        <p className="text-sm text-gray-600">Trend line from API for {startYear} to {endYear}.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1">
          <label htmlFor="metro-start-year" className="text-sm font-medium">Start year</label>
          <select
            id="metro-start-year"
            className="rounded border px-2 py-1"
            value={startYear}
            onChange={(event) => {
              const nextStartYear = Number(event.target.value);
              setStartYear(nextStartYear);
              if (nextStartYear > endYear) {
                setEndYear(nextStartYear);
              }
            }}
          >
            {years.map((item) => (
              <option key={`metro-start-${item}`} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="metro-end-year" className="text-sm font-medium">End year</label>
          <select
            id="metro-end-year"
            className="rounded border px-2 py-1"
            value={endYear}
            onChange={(event) => {
              const nextEndYear = Number(event.target.value);
              setEndYear(nextEndYear);
              if (nextEndYear < startYear) {
                setStartYear(nextEndYear);
              }
            }}
          >
            {years.map((item) => (
              <option key={`metro-end-${item}`} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600">{trend.length} yearly points in the selected window.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="h-[360px] w-full rounded border p-2">
        {chartsReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 50]} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="rent_burden_percent" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      <form className="space-y-3 rounded border p-4" onSubmit={onSubmit}>
        <h3 className="text-lg font-semibold">Affordability Calculator</h3>
        <div className="grid gap-1">
          <label htmlFor="salary" className="text-sm">Annual salary</label>
          <input
            id="salary"
            className="rounded border px-2 py-1"
            type="number"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            min={1}
            required
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="loan" className="text-sm">Monthly student loan (optional)</label>
          <input
            id="loan"
            className="rounded border px-2 py-1"
            type="number"
            value={loan}
            onChange={(event) => setLoan(event.target.value)}
            min={0}
          />
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Calculate</button>
        {calcError ? <p className="text-sm text-red-600">{calcError}</p> : null}

        {result ? (
          <div className="space-y-1 rounded bg-gray-50 p-3 text-sm">
            <p>Rent burden: <strong>{result.rentBurdenPercent}%</strong></p>
            <p>Monthly disposable income: <strong>${result.monthlyDisposableIncome}</strong></p>
            <p>Risk: <strong>{result.risk}</strong></p>
          </div>
        ) : null}
      </form>
    </section>
  );
}
