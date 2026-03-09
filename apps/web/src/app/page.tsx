import DashboardClient from "@/components/DashboardClient";
import DataSourceBadge from "@/components/DataSourceBadge";
import MethodologyPanel from "@/components/MethodologyPanel";
import { getAvailableYears } from "@/lib/metrics";

export default function Home() {
  const years = getAvailableYears();

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="motion-rise motion-delay-1 hover-lift rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
        <div className="space-y-4">
          <span className="hover-soft inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            Affordability Dashboard
          </span>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">The 30% Problem</h1>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">
                Are young adults spending more than 30% of monthly income on rent? Explore how metro-level rents and
                incomes shape that answer year by year.
              </p>
            </div>

            <DataSourceBadge />
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="hover-soft rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Compare metros in a single year snapshot.
            </div>
            <div className="hover-soft rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Click a bar to drill into a metro trend line and scenario calculator.
            </div>
            <div className="hover-soft rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Use the methodology panel to inspect assumptions before changing the metric.
            </div>
          </div>
        </div>
      </header>

      <MethodologyPanel contextLabel="dashboard" />

      <DashboardClient years={years} />
    </main>
  );
}
