interface MethodologyPanelProps {
  contextLabel: string;
}

export default function MethodologyPanel({ contextLabel }: MethodologyPanelProps) {
  return (
    <details className="group motion-rise motion-delay-2 hover-lift rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-sm text-slate-700 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-800">
            How this works
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">Methodology and teaching notes</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Open this panel to inspect the rent-burden formula, assumptions, transformations, and limits before you
              interpret or extend the app.
            </p>
          </div>
        </div>

        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-500 transition-transform duration-200 group-hover:scale-[1.04] group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
        <p className="max-w-3xl leading-6 text-slate-700">
          This project estimates whether adults ages 25 to 34 in major U.S. metros are spending more than the
          recommended 30% of monthly income on rent.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-white shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">Main formula</p>
          <p className="mt-2 font-mono text-sm text-slate-100">
            Rent Burden (%) = (Median Monthly Rent / Median Monthly Income) x 100
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="hover-soft rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="font-medium text-slate-900">What this page is measuring</p>
            <p className="mt-2 leading-6 text-slate-700">
              The {contextLabel} uses metro-level median income and median rent to estimate how financially difficult it may
              be for a typical young adult to live independently.
            </p>
          </section>

          <section className="hover-soft rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="font-medium text-slate-900">Current data status</p>
            <p className="mt-2 leading-6 text-slate-700">
              The app can run with placeholder sample data or with refreshed data loaded from the local database. Check the
              dataset badge above to see which dataset you are currently viewing.
            </p>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="hover-soft rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">Major assumptions</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-6 text-slate-700">
              <li>The median earner pays the median rent.</li>
              <li>Gross income is used unless the calculator switches to an estimated after-tax mode.</li>
              <li>Roommates, dual-income households, wealth, taxes, and housing quality are not fully modeled.</li>
            </ul>
          </section>

          <section className="hover-soft rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">Basic transformation steps</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 leading-6 text-slate-700">
              <li>Convert annual income to monthly income.</li>
              <li>Match rent and income by metro and year.</li>
              <li>Compute rent burden as a share of monthly income.</li>
            </ol>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="hover-soft rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="font-medium text-emerald-950">Why this is useful</p>
            <p className="mt-2 leading-6 text-emerald-900">
              It gives students a simple, inspectable affordability benchmark that is easy to explain, compare across
              metros, and extend in later assignments.
            </p>
          </section>

          <section className="hover-soft rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <p className="font-medium text-rose-950">What it cannot prove</p>
            <p className="mt-2 leading-6 text-rose-900">
              It does not model taxes precisely, household structure, neighborhood variation, savings, debt beyond the
              optional calculator input, or differences in housing quality.
            </p>
          </section>
        </div>
      </div>
    </details>
  );
}