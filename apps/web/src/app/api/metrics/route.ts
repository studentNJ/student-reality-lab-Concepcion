import { NextRequest, NextResponse } from "next/server";
import { getMetricsByYearData } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const year = Number.parseInt(request.nextUrl.searchParams.get("year") ?? "", 10);
  if (Number.isNaN(year)) {
    return NextResponse.json({ error: "Invalid or missing year" }, { status: 400 });
  }

  return NextResponse.json(await getMetricsByYearData(year));
}
