# Provider adapter contract and safe rollout

The current product is demo-only. No provider adapters are enabled and no live quotes, custody, card processing, deposits or withdrawals are supported.

Recommended server-only adapter interfaces:

- `MarketData.getQuote(asset, fiat)` returns decimal strings, source, observedAt and expiry; cache briefly and report unavailable on timeout.
- `OnRamp.createQuote/createOrder` returns provider quote/order reference and provider status; provider hosted checkout handles payment details.
- `WalletInfrastructure.getOrCreateAddress(user, asset, network)` returns a provider-confirmed address plus network metadata; never derive/randomize addresses in the app.
- `BlockchainIndexer.getTransaction/getDeposits` returns chain hash, confirmations and observed status. Reconcile before ledger credit.
- `EmailSender.sendVerification/sendReset` sends single-use expiring tokens; persist only token hashes.
- `SwapProvider.quote/execute` binds quote expiry, assets, network, slippage and idempotency.

For any money operation: authorize server side; validate network, amount and destination; re-read available balance; calculate exact decimal fees; obtain a server quote; ask user to confirm quote details; require idempotency key; create request and audit row atomically; submit provider request; ingest signed and replay-protected provider events; reconcile before posting append-only debit/credit entries. Retries must reuse idempotency and never double post.

Provider secrets stay in server environment/secret manager. Do not log request headers, credentials, card data, private keys or seed phrases. Provider health view must show configured/unavailable state without revealing secret material.
