/**
 * Last externally retrieved CoinPaprika USD quotes for local preview fallback.
 * These are always marked STALE; they are never used for balance math/orders.
 * Refresh through the live API route whenever the server has network access.
 */
export const marketSnapshot: Record<
  string,
  { price: string; percentChange24h: number; updatedAt: string }
> = {
  BTC: {
    price: "80432.60379536534",
    percentChange24h: 0.01,
    updatedAt: "2026-10-25T21:30:14Z",
  },
  ETH: {
    price: "2343.208887503835",
    percentChange24h: 0.13,
    updatedAt: "2026-10-25T21:19:16Z",
  },
  USDT: {
    price: "0.9991039119549082",
    percentChange24h: 0,
    updatedAt: "2026-10-25T21:25:13Z",
  },
  SOL: {
    price: "101.48178978727223",
    percentChange24h: 0.06,
    updatedAt: "2026-10-25T21:16:12Z",
  },
  USDC: {
    price: "1.0001426007840482",
    percentChange24h: -0.01,
    updatedAt: "2026-10-25T21:26:13Z",
  },
  BNB: {
    price: "739.8510522832514",
    percentChange24h: 0.85,
    updatedAt: "2026-10-25T21:19:16Z",
  },
};
