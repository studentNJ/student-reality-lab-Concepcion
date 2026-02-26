import { NextResponse } from "next/server";
import { getMetrosData } from "@/lib/metrics";

export async function GET() {
  return NextResponse.json(await getMetrosData());
}
