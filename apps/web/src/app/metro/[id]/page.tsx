import MetroDetailClient from "@/components/MetroDetailClient";
import { getAvailableYears } from "@/lib/metrics";

interface MetroPageProps {
  params: Promise<{ id: string }>;
}

export default async function MetroPage({ params }: MetroPageProps) {
  const { id } = await params;
  const years = getAvailableYears();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Metro Detail</h1>
      <MetroDetailClient metroId={id} years={years} />
    </main>
  );
}
