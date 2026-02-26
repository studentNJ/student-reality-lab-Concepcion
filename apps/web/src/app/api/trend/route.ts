import { NextRequest, NextResponse } from "next/server";
import { getTrendByMetroData } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const metroId = request.nextUrl.searchParams.get("metro_id");
  if (!metroId) {
    return NextResponse.json({ error: "Missing metro_id" }, { status: 400 });
  }

  const trend = await getTrendByMetroData(metroId);
  if (trend.length === 0) {
    return NextResponse.json({ error: "Metro not found" }, { status: 404 });
  }

  return NextResponse.json(trend);
}
