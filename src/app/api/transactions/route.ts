import { NextResponse } from "next/server";
import { currentUser, demoMode } from "@/lib/server-auth";
import { demoTransactions } from "@/lib/assets";
export async function GET() {
  if (!demoMode()) {
    if (!(await currentUser()))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(
      { error: "Transaction provider is not configured." },
      { status: 503 },
    );
  }
  return NextResponse.json({
    mode: "DEMO",
    transactions: demoTransactions.map((t, i) => ({
      ...t,
      id: `demo-${i + 1}`,
      simulated: true,
      txHash: null,
      status: "SIMULATED",
    })),
  });
}
