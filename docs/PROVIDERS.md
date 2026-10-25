# Provider adapter contract and safe rollout

The current product is demo-only. The market page fetches indicative USD tickers from CoinPaprika server-side; it does not use them as transaction quotes. Wallet custody, card processing, deposits and withdrawals are not supported.

## Market data

`GET /api/market/prices` fetches configured asset IDs from `${PRICE_PROVIDER_URL}/tickers/{coin_id}`. The default base is `https://api.coinpaprika.com/v1`; requests time out after five seconds and are cached for ten minutes. Each quote must match its configured provider ID and include a positive USD price and source timestamp. Quotes older than 30 minutes are displayed only as stale quotes with their original timestamps. If a request fails, the last retrieved local snapshot is shown as stale; the UI never labels a snapshot as live.

The dashboard labels prices as indicative, shows the source and provider timestamp, and never uses market data to calculate authoritative balances or execute orders. CoinPaprika's no-key tier is licensed for personal use and requires attribution; get a plan that permits the intended commercial use before redistribution. See [CoinPaprika API](https://coinpaprika.com/api) and [API terms](https://coinpaprika.github.io/files/terms_of_use_v1.pdf).

Recommended server-only adapter interfaces:

- `MarketData.getQuote(asset, fiat)` returns decimal strings, source, observedAt and expiry; cache briefly and report unavailable on timeout.
- `OnRamp.createQuote/createOrder` returns provider quote/order reference and provider status; provider hosted checkout handles payment details.
- `WalletInfrastructure.getOrCreateAddress(user, asset, network)` returns a provider-confirmed address plus network metadata; never derive/randomize addresses in the app.
- `BlockchainIndexer.getTransaction/getDeposits` returns chain hash, confirmations and observed status. Reconcile before ledger credit.
- `EmailSender.sendVerification/sendReset` sends single-use expiring tokens; persist only token hashes.
- `SwapProvider.quote/execute` binds quote expiry, assets, network, slippage and idempotency.

For any money operation: authorize server side; validate network, amount and destination; re-read available balance; calculate exact decimal fees; obtain a server quote; ask user to confirm quote details; require idempotency key; create request and audit row atomically; submit provider request; ingest signed and replay-protected provider events; reconcile before posting append-only debit/credit entries. Retries must reuse idempotency and never double post.

Provider secrets stay in server environment/secret manager. Do not log request headers, credentials, card data, private keys or seed phrases. Provider health view must show configured/unavailable state without revealing secret material.
