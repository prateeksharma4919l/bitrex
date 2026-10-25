import { NextResponse } from "next/server";
import { currentUser, demoMode } from "@/lib/server-auth";
import { assets, portfolioTotal } from "@/lib/assets";
export async function GET() {
  if (!demoMode()) {
    if (!(await currentUser()))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(
      { error: "Portfolio provider is not configured." },
      { status: 503 },
    );
  }
  return NextResponse.json({
    mode: "DEMO",
    withdrawable: false,
    currency: "USD",
    total: portfolioTotal,
    assets: assets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      available: a.available,
      balance: a.balance,
      priceStatus: "UNAVAILABLE",
      priceSource: null,
      priceUpdatedAt: null,
      networks: a.networks,
    })),
  });
}
