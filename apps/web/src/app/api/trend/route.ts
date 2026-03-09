import { NextRequest, NextResponse } from "next/server";
import { getTrendByMetroData } from "@/lib/metrics";

function parseYear(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET(request: NextRequest) {
  const metroId = request.nextUrl.searchParams.get("metro_id");
  if (!metroId) {
    return NextResponse.json({ error: "Missing metro_id" }, { status: 400 });
  }

  const startYear = parseYear(request.nextUrl.searchParams.get("start_year"));
  const endYear = parseYear(request.nextUrl.searchParams.get("end_year"));

  if ((startYear === null) !== (endYear === null)) {
    return NextResponse.json({ error: "Provide both start_year and end_year" }, { status: 400 });
  }

  if (startYear !== null && endYear !== null && startYear > endYear) {
    return NextResponse.json({ error: "start_year must be less than or equal to end_year" }, { status: 400 });
  }

  const trend = await getTrendByMetroData(metroId, startYear ?? undefined, endYear ?? undefined);
  if (trend.length === 0) {
    return NextResponse.json({ error: "Metro not found" }, { status: 404 });
  }

  return NextResponse.json(trend);
}
