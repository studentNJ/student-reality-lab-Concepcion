import { NextResponse } from "next/server";
import { getDataSourceStatus } from "@/lib/metrics";

export async function GET() {
  const status = await getDataSourceStatus();

  return NextResponse.json({
    status: "ok",
    configuredMode: status.configuredMode,
    activeSource: status.activeSource,
    datasetType: status.datasetType,
    datasetLabel: status.datasetLabel,
    sourceDescription: status.sourceDescription,
    metroCount: status.metroCount,
    startYear: status.startYear,
    endYear: status.endYear,
    lastRefreshed: status.lastRefreshed,
    checkedAt: new Date().toISOString(),
  });
}
