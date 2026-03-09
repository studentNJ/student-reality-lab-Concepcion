import MetroDetailClient from "@/components/MetroDetailClient";
import MethodologyPanel from "@/components/MethodologyPanel";
import { getAvailableYears } from "@/lib/metrics";

interface MetroPageProps {
  params: Promise<{ id: string }>;
}

export default async function MetroPage({ params }: MetroPageProps) {
  const { id } = await params;
  const years = getAvailableYears();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="motion-rise motion-delay-1 hover-lift rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
        <div className="space-y-4">
          <span className="hover-soft inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
            Metro Detail
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-950">Metro {id}</h1>
            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              Review rent-burden trends across the available year range, then test salary, loan, roommate, and
              after-tax scenarios with the teaching calculator.
            </p>
          </div>
        </div>
      </header>
      <MethodologyPanel contextLabel="metro detail page" />
      <MetroDetailClient metroId={id} years={years} />
    </main>
  );
}
