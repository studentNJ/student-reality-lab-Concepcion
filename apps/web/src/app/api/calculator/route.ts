import { NextRequest, NextResponse } from "next/server";
import { calculateAffordability, getLatestRentByMetroData } from "@/lib/metrics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const annualSalary = Number(body.annualSalary);
    const metroId = String(body.metroId ?? "");
    const monthlyStudentLoan = body.monthlyStudentLoan === undefined ? 0 : Number(body.monthlyStudentLoan);
    const roommates = body.roommates === undefined ? 0 : Number(body.roommates);
    const useEstimatedAfterTaxIncome = Boolean(body.useEstimatedAfterTaxIncome);

    if (!metroId) {
      return NextResponse.json({ error: "metroId is required" }, { status: 400 });
    }

    const latestRent = await getLatestRentByMetroData(metroId);
    if (latestRent === null) {
      return NextResponse.json({ error: "Metro not found" }, { status: 404 });
    }

    const result = calculateAffordability(annualSalary, latestRent, {
      monthlyStudentLoan,
      roommates,
      useEstimatedAfterTaxIncome,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
