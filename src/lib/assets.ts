export const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    providerId: "btc-bitcoin",
    price: null,
    change: null,
    balance: 0,
    available: 0,
    networks: ["Bitcoin"],
    color: "btc",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    providerId: "eth-ethereum",
    price: null,
    change: null,
    balance: 0,
    available: 0,
    networks: ["Ethereum"],
    color: "eth",
  },
  {
    symbol: "USDT",
    name: "Tether",
    providerId: "usdt-tether",
    price: null,
    change: null,
    balance: 5_000_000,
    available: 5_000_000,
    networks: ["Ethereum", "Tron"],
    color: "usdt",
  },
  {
    symbol: "SOL",
    name: "Solana",
    providerId: "sol-solana",
    price: null,
    change: null,
    balance: 0,
    available: 0,
    networks: ["Solana"],
    color: "sol",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    providerId: "usdc-usd-coin",
    price: null,
    change: null,
    balance: 0,
    available: 0,
    networks: ["Ethereum", "Solana"],
    color: "usdt",
  },
  {
    symbol: "BNB",
    name: "BNB",
    providerId: "bnb-binance-coin",
    price: null,
    change: null,
    balance: 0,
    available: 0,
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

export const transactions: WalletTransaction[] = [
  {
    type: "Withdrawal",
    symbol: "USDT",
    amount: "11,829.00",
    network: "TRON",
    date: "Demo preview",
    status: "IN_PROGRESS",
  },
];
// Clearly simulated preview balance. It is not held in a wallet and cannot be withdrawn.
export const portfolioTotal: number | null = 5_000_000;
