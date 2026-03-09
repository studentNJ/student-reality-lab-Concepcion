import { NextRequest, NextResponse } from "next/server";
import { getMetricsByRangeData } from "@/lib/metrics";

function parseYear(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET(request: NextRequest) {
  const year = parseYear(request.nextUrl.searchParams.get("year"));
  const startYear = parseYear(request.nextUrl.searchParams.get("start_year"));
  const endYear = parseYear(request.nextUrl.searchParams.get("end_year"));

  if (year !== null && (startYear !== null || endYear !== null)) {
    return NextResponse.json({ error: "Use either year or start_year/end_year, not both" }, { status: 400 });
  }

  if (year !== null) {
    return NextResponse.json(await getMetricsByRangeData(year, year));
  }

  if (startYear === null || endYear === null) {
    return NextResponse.json({ error: "Invalid or missing year range" }, { status: 400 });
  }

  if (startYear > endYear) {
    return NextResponse.json({ error: "start_year must be less than or equal to end_year" }, { status: 400 });
  }

  return NextResponse.json(await getMetricsByRangeData(startYear, endYear));
}
