"use client";

import { FormEvent, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartTooltipCard from "@/components/ChartTooltipCard";
import type { TrendPoint } from "@/lib/metrics";

interface MetroDetailClientProps {
  metroId: string;
  years: number[];
}

interface CalcResult {
  rentBurdenPercent: number;
  monthlyDisposableIncome: number;
  risk: "Safe" | "Risky" | "Cost-burdened";
  effectiveMonthlyRent: number;
  monthlyIncomeBasis: number;
  salaryNeededForThirtyPercent: number;
  householdSize: number;
  incomeMode: "gross" | "estimated_after_tax";
}

export default function MetroDetailClient({ metroId, years }: MetroDetailClientProps) {
  const earliestYear = years[0] ?? 2015;
  const latestYear = years[years.length - 1] ?? earliestYear;
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [salary, setSalary] = useState("70000");
  const [loan, setLoan] = useState("0");
  const [roommates, setRoommates] = useState("0");
  const [useEstimatedAfterTaxIncome, setUseEstimatedAfterTaxIncome] = useState(false);
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
          roommates: Number(roommates || "0"),
          useEstimatedAfterTaxIncome,
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
      <section className="motion-rise motion-delay-3 hover-lift space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Metro {metroId}</h2>
          <p className="text-sm text-slate-600">Trend line from API for {startYear} to {endYear}.</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-1">
              <label htmlFor="metro-start-year" className="text-sm font-medium text-slate-700">Start year</label>
              <select
                id="metro-start-year"
                className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
              <label htmlFor="metro-end-year" className="text-sm font-medium text-slate-700">End year</label>
              <select
                id="metro-end-year"
                className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
          </div>

          <span className="hover-soft rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
            {trend.length} yearly points in the selected window
          </span>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="hover-soft h-[360px] w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
          {chartsReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 50]} unit="%" />
                <Tooltip content={<ChartTooltipCard variant="trend" />} />
                <Line type="monotone" dataKey="rent_burden_percent" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </section>

      <form className="motion-rise motion-delay-3 hover-lift space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6" onSubmit={onSubmit}>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Affordability Calculator</h3>
          <p className="text-sm text-slate-600">
            Test how salary, debt, roommates, and a simplified after-tax estimate change the 30% rule.
          </p>
        </div>
        <div className="grid gap-1">
          <label htmlFor="salary" className="text-sm text-slate-700">Annual salary</label>
          <input
            id="salary"
            className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2"
            type="number"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            min={1}
            required
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="loan" className="text-sm text-slate-700">Monthly student loan (optional)</label>
          <input
            id="loan"
            className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2"
            type="number"
            value={loan}
            onChange={(event) => setLoan(event.target.value)}
            min={0}
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="roommates" className="text-sm text-slate-700">Number of roommates (optional)</label>
          <input
            id="roommates"
            className="hover-soft rounded-xl border border-slate-300 bg-white px-3 py-2"
            type="number"
            value={roommates}
            onChange={(event) => setRoommates(event.target.value)}
            min={0}
            step={1}
          />
          <p className="text-xs text-gray-500">
            Shared-rent mode assumes the listed metro rent is split evenly across you and your roommates.
          </p>
        </div>

        <label className="hover-soft flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={useEstimatedAfterTaxIncome}
            onChange={(event) => setUseEstimatedAfterTaxIncome(event.target.checked)}
          />
          Use estimated after-tax income (flat 22% reduction for teaching purposes)
        </label>

        <button className="hover-soft rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800" type="submit">Calculate</button>
        {calcError ? <p className="text-sm text-red-600">{calcError}</p> : null}

        {result ? (
          <div className="motion-rise hover-soft space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>Rent burden: <strong>{result.rentBurdenPercent}%</strong></p>
            <p>Monthly rent used in calculation: <strong>${result.effectiveMonthlyRent}</strong></p>
            <p>Monthly income basis: <strong>${result.monthlyIncomeBasis}</strong> ({result.incomeMode === "gross" ? "gross income" : "estimated after-tax income"})</p>
            <p>Monthly disposable income: <strong>${result.monthlyDisposableIncome}</strong></p>
            <p>Risk: <strong>{result.risk}</strong></p>
            <p>Suggested salary for the 30% rule: <strong>${result.salaryNeededForThirtyPercent}</strong></p>
            {Number(roommates) > 0 ? <p>Household size assumption: <strong>{result.householdSize}</strong> people share the rent.</p> : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}
