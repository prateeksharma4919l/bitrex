import { NextResponse } from "next/server";
import { assets } from "@/lib/assets";
import { marketSnapshot } from "@/lib/market-snapshot";

const defaultBaseUrl = "https://api.coinpaprika.com/v1";
const maxAgeMs = 30 * 60 * 1000;

type ProviderTicker = {
  id?: unknown;
  last_updated?: unknown;
  quotes?: { USD?: { price?: unknown; percent_change_24h?: unknown } };
};

export async function GET() {
  const baseUrl = (process.env.PRICE_PROVIDER_URL || defaultBaseUrl).replace(
    /\/+$/,
    "",
  );
  const apiKey = process.env.PRICE_PROVIDER_API_KEY;

  const prices = await Promise.all(
    assets.map(async ({ symbol, name, providerId }) => {
      try {
        const response = await fetch(
          `${baseUrl}/tickers/${encodeURIComponent(providerId)}`,
          {
            headers: {
              accept: "application/json",
              "user-agent": "BITREX-market-data/1.0",
              ...(apiKey ? { authorization: apiKey } : {}),
            },
            signal: AbortSignal.timeout(5000),
            next: { revalidate: 600 },
          },
        );
        if (!response.ok) throw new Error(`Price provider HTTP ${response.status}`);

        const ticker = (await response.json()) as ProviderTicker;
        const rawPrice = ticker.quotes?.USD?.price;
        const updatedAt =
          typeof ticker.last_updated === "string" ? ticker.last_updated : null;
        const priceIsValid =
          ticker.id === providerId &&
          typeof rawPrice === "number" &&
          Number.isFinite(rawPrice) &&
          rawPrice > 0;
        const timestamp = updatedAt ? Date.parse(updatedAt) : Number.NaN;
        const isFresh = Number.isFinite(timestamp) && Date.now() - timestamp <= maxAgeMs;

        if (!priceIsValid || !updatedAt) {
          return {
            symbol,
            name,
            price: null,
            percentChange24h: null,
            updatedAt,
            status: "UNAVAILABLE",
          };
        }

        const change = ticker.quotes?.USD?.percent_change_24h;
        return {
          symbol,
          name,
          price: String(rawPrice),
          percentChange24h:
            typeof change === "number" && Number.isFinite(change) ? change : null,
          updatedAt,
          status: isFresh ? "AVAILABLE" : "STALE",
        };
      } catch {
        const snapshot = marketSnapshot[symbol];
        return {
          symbol,
          name,
          price: snapshot?.price ?? null,
          percentChange24h: snapshot?.percentChange24h ?? null,
          updatedAt: snapshot?.updatedAt ?? null,
          status: snapshot ? "STALE" : "UNAVAILABLE",
        };
      }
    }),
  );

  const available = prices.filter((price) => price.status === "AVAILABLE").length;
  const stale = prices.filter((price) => price.status === "STALE").length;
  const source = process.env.PRICE_PROVIDER_NAME || "CoinPaprika";
  const isSnapshotOnly = available === 0 && stale > 0;
  return NextResponse.json(
    {
      mode: process.env.APP_MODE ?? "DEMO",
      status:
        available === prices.length
          ? "AVAILABLE"
          : available > 0
            ? "PARTIAL"
            : stale > 0
              ? "STALE"
              : "UNAVAILABLE",
      source: isSnapshotOnly ? `${source} (last snapshot)` : source,
      fetchedAt: new Date().toISOString(),
      prices,
      message:
        available === prices.length
          ? "Indicative market prices. Not a transaction quote."
          : isSnapshotOnly
            ? "Live provider access is unavailable. Displaying the last retrieved quotes with their original timestamps; these are stale and not transaction prices."
            : "Some market prices are unavailable; no values were estimated.",
    },
    {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    },
  );
}
