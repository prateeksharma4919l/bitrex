import { NextResponse } from "next/server";
import { assets } from "@/lib/assets";

/** Explicitly unavailable until a server-side market data provider is configured. */
export async function GET() {
  return NextResponse.json({
    mode: process.env.APP_MODE ?? "DEMO",
    status: "UNAVAILABLE",
    source: null,
    updatedAt: null,
    prices: assets.map(({ symbol, name }) => ({ symbol, name, price: null })),
    message:
      "No market price provider is configured; sample dashboard values are not live quotes.",
  });
}
