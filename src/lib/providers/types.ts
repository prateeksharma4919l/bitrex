/** Server-only provider contracts. Monetary values are decimal strings; never return secrets to client code. */
export type ProviderResult<T> =
  { status: "AVAILABLE"; value: T } | { status: "UNAVAILABLE"; reason: string };

export interface MarketQuote {
  asset: string;
  fiat: string;
  price: string;
  source: string;
  observedAt: string;
  expiresAt: string;
}
export interface MarketDataProvider {
  quote(asset: string, fiat: string): Promise<ProviderResult<MarketQuote>>;
}

export interface BuyQuote {
  asset: string;
  fiat: string;
  fiatAmount: string;
  assetAmount: string;
  fee: string;
  rate: string;
  expiresAt: string;
}
export interface OnRampProvider {
  quote(input: {
    asset: string;
    fiat: string;
    fiatAmount: string;
  }): Promise<ProviderResult<BuyQuote>>;
  createOrder(input: {
    quote: BuyQuote;
    userId: string;
    idempotencyKey: string;
  }): Promise<ProviderResult<{ providerOrderId: string; status: string }>>;
}

export interface WalletProvider {
  getDepositAddress(input: {
    userId: string;
    asset: string;
    network: string;
  }): Promise<
    ProviderResult<{ address: string; network: string; verified: boolean }>
  >;
}
export interface BlockchainProvider {
  validateAddress(input: {
    address: string;
    asset: string;
    network: string;
  }): Promise<ProviderResult<{ valid: boolean }>>;
  transactionStatus(input: {
    txHash: string;
    network: string;
  }): Promise<ProviderResult<{ status: string; confirmations: number }>>;
}
export interface EmailProvider {
  send(input: {
    to: string;
    template: "verify-email" | "reset-password";
    token: string;
  }): Promise<ProviderResult<{ messageId: string }>>;
}
export interface SwapProvider {
  quote(input: {
    fromAsset: string;
    toAsset: string;
    network: string;
    amount: string;
  }): Promise<
    ProviderResult<{ amountOut: string; fee: string; expiresAt: string }>
  >;
}
