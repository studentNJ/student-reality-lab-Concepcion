import DashboardClient from "@/components/DashboardClient";
import DataSourceBadge from "@/components/DataSourceBadge";
import { getAvailableYears } from "@/lib/metrics";

export default function Home() {
  const years = getAvailableYears();

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">The 30% Problem</h1>
          <DataSourceBadge />
        </div>
        <p className="text-sm text-gray-600">
          Are young adults spending more than 30% of monthly income on rent?
        </p>
      </header>

      <DashboardClient years={years} />
    </main>
  );
}
