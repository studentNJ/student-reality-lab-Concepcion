import Link from "next/link";
import MethodologyPanel from "@/components/MethodologyPanel";

export default function MethodologyPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="motion-rise motion-delay-1 hover-lift rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
        <div className="space-y-4">
          <Link className="hover-soft text-sm font-medium text-blue-700 underline underline-offset-2" href="/">
            Back to dashboard
          </Link>
          <span className="hover-soft inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Teaching Notes
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-950">Methodology</h1>
            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              This page explains the rent-burden metric, the current data status, and the assumptions future students
              should understand before changing the project.
            </p>
          </div>
        </div>
      </header>

      <MethodologyPanel contextLabel="dedicated methodology page" />

      <section className="motion-rise motion-delay-3 hover-lift rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-sm text-slate-700 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-semibold text-slate-900">What to edit first</h2>
        <div className="mt-3 space-y-2">
          <p>For UI changes, start with the dashboard or metro detail components.</p>
          <p>For formula changes, edit the calculation helpers before changing page code.</p>
          <p>For dataset changes, update the processed files and metadata together so the badge stays accurate.</p>
        </div>
      </section>
    </main>
  );
}