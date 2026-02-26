import { NextResponse } from "next/server";
import { getDataSourceStatus } from "@/lib/metrics";

export async function GET() {
  const status = await getDataSourceStatus();

  return NextResponse.json({
    status: "ok",
    configuredMode: status.configuredMode,
    activeSource: status.activeSource,
    checkedAt: new Date().toISOString(),
  });
}
