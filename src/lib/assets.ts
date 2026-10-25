export const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    providerId: "btc-bitcoin",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["Bitcoin"],
    color: "btc",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    providerId: "eth-ethereum",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["Ethereum"],
    color: "eth",
  },
  {
    symbol: "USDT",
    name: "Tether",
    providerId: "usdt-tether",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["Ethereum", "Tron"],
    color: "usdt",
  },
  {
    symbol: "SOL",
    name: "Solana",
    providerId: "sol-solana",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["Solana"],
    color: "sol",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    providerId: "usdc-usd-coin",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["Ethereum", "Solana"],
    color: "usdt",
  },
  {
    symbol: "BNB",
    name: "BNB",
    providerId: "bnb-binance-coin",
    price: null,
    change: null,
    balance: null,
    available: null,
    networks: ["BNB Smart Chain"],
    color: "btc",
  },
];

export type WalletTransaction = {
  type: string;
  symbol: string;
  amount: string;
  network: string;
  date: string;
  status: string;
};

export const transactions: WalletTransaction[] = [];
export const portfolioTotal: number | null = null;
