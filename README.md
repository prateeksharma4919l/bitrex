# BITREX Crypto Wallet

BITREX is a responsive wallet application starter with a premium dark dashboard and a transparent demo environment. **It is not a live exchange or custody service.** The dashboard includes a clearly marked simulated 5,000,000 USDT preview balance and a single simulated withdrawal entry so the interface can be reviewed. These are not funds, cannot be withdrawn, and are never represented as on-chain activity. Market prices are indicative only.

## Screenshots

Add current screenshots after starting the app:

- `docs/screenshots/dashboard-desktop.png` — desktop portfolio dashboard
- `docs/screenshots/dashboard-mobile.png` — responsive mobile dashboard

## Features

- Responsive portfolio with searchable assets, indicative price-source timestamps, an explicitly simulated demo balance/activity preview, and light/dark toggle.
- Product overview at `/welcome` with supported asset examples, getting-started steps, factual demo disclosure, FAQ and account CTAs.
- Simulated buy, sell, send, swap and receive workflows with prominent demo notices. Receive intentionally shows no deposit address until verified wallet infrastructure exists.
- CSV export; simulated transaction history; network choices are asset-specific.
- Registration/login API with bcrypt password hashing, random opaque session token stored as SHA-256 hash, HttpOnly SameSite cookie, expiration and audit events (requires PostgreSQL).
- PostgreSQL Prisma schema for accounts, sessions, 2FA configuration, assets, chain networks, wallets/addresses, exact numeric balances, orders, transactions/events, providers, audit logs and notifications.
- Zod request validation, UUID idempotency key contract, role-protected admin API and demo mode guard that disables real-money execution.
- Vitest decimal tests, Playwright demo-flow test and GitHub Actions checks.

## Architecture

Next.js App Router + TypeScript serves the UI and server API. Prisma maps PostgreSQL relations; financial schema fields use `DECIMAL(38,18)`. Use string/decimal arithmetic at all authority boundaries; the tiny fixed point helper is for exact addition/subtraction and must not be replaced with JS floating point for ledgers. Provider integrations should implement server-only adapters and webhook signature verification before enabling live operations.

`APP_MODE=DEMO` is the default. The dashboard preview balance and withdrawal are explicitly marked simulated, and do not update an on-chain or withdrawable balance. Indicative USD market prices load server-side from CoinPaprika and include provider update timestamps; prices are cached for 10 minutes and are not transaction quotes. A last-retrieved local price snapshot is shown only with an explicit stale label when outbound API access fails. In non-demo mode, the root page and private portfolio/history routes require a valid opaque session and operations return unavailable until provider/ledger execution is implemented. Admin overview enforces `ADMIN` on the server.

## Requirements and local setup

- Node.js 22+
- npm 10+
- PostgreSQL 15+ for account persistence (the dashboard demo runs without it)

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000 to reach the login page. Select “explore the demo” (or open http://localhost:3000/demo) to view the empty wallet dashboard and indicative market prices without credentials. Configure `DATABASE_URL` to enable account registration and persistent authentication. Then run:

```powershell
Copy-Item .env.example .env
# Replace REPLACE_WITH_A_LOCAL_ONLY_PASSWORD in both POSTGRES_PASSWORD and DATABASE_URL.
docker compose up -d postgres
npm.cmd run db:generate
npx.cmd prisma migrate dev --name init
npm.cmd run dev
```

Create your account at http://localhost:3000/signup, then sign in. The database password above is only for local PostgreSQL; choose your wallet account password in the signup form. Docker Desktop must be running before `docker compose up`.

The seed script adds only asset registry entries and creates no users or credentials. Build and start with `npm.cmd run build` and `npm.cmd run start`.

## Environment

See `.env.example`. `DATABASE_URL` is a PostgreSQL connection string; `APP_MODE` remains `DEMO` unless real services and controls have been reviewed. `PRICE_PROVIDER_URL` defaults to CoinPaprika's public API; the page shows the source and timestamp. The public data tier is for personal use and requires attribution; obtain a plan that permits your intended commercial use before redistributing quotes. Other provider URLs and keys are server-only placeholders. Never expose them via `NEXT_PUBLIC_*` or commit actual values.

## API overview

- `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- `GET /api/portfolio`, `/api/transactions`
- `GET /api/market/prices` — indicative CoinPaprika USD tickers, cached for 10 minutes; source timestamp is returned per asset and old/fallback quotes are marked stale.
- `POST /api/transactions/request` — validates operation, network, decimal string and UUID idempotency key; in demo mode acknowledges as simulated without changing balance.
- `GET /api/admin/overview` — session authenticated and role checked on server.

Document and implement any additional provider/webhook endpoint before wiring a provider. Verify provider webhook signatures, enforce timestamp replay windows, persist provider event IDs uniquely, and reconcile chain/provider status before crediting funds.

## Testing and checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

For end-to-end verification, start `npm.cmd run dev` in a second terminal and then run `npm.cmd run test:e2e` (Playwright reuses that server). Install browser binaries with `npx.cmd playwright install chromium`. CI runs lint, typecheck, unit tests, the demo send end-to-end flow, npm advisory audit, and production build. Local `npm audit` could not reach the npm advisory endpoint in this environment.

## Deploy to Render

The repository includes [`render.yaml`](render.yaml), a Render Blueprint for a Node web service and a private PostgreSQL database. It runs Prisma migrations before building, uses the Render-assigned HTTPS URL for origin checks, and keeps `APP_MODE=DEMO` enabled.

1. Push this repository to GitHub.
2. In Render, select **New → Blueprint**, connect `prateeksharma4919l/bitrex`, and apply the `render.yaml` configuration.
3. Wait for the Blueprint to create the database and deploy the web service. Open the `bitrex` service's `onrender.com` URL and add `/demo` to view the wallet preview.

This Blueprint uses Render's free plans for a no-cost demo. Free web services spin down when idle, and free PostgreSQL databases expire after 30 days; they are suitable for a preview, not durable account storage. Upgrade the database before relying on signups or saved data. Never use the demo app for customer funds. See [Render's free instance limits](https://render.com/docs/free) and [Next.js deployment guide](https://render.com/docs/deploy-nextjs-app).

## Provider integration guide

Implement typed server-side adapters for market quotes, on-ramp, blockchain indexing/RPC, custody/wallet infrastructure, email, and optional swap. Provider adapters must time out, validate response schemas, redact secrets, expose health status, and fail closed. Never collect payment card data. Wallet addresses must come from configured infrastructure and be verified against the selected chain. A ticker on one network is not fungible with the same ticker on another.

No adapter currently connects to a real financial provider. Auth uses portable bcrypt rather than Argon2id and the in-process rate-limit utility is not distributed; replace with Argon2id and Redis-backed limits before public deployment. Password reset, email verification, TOTP lifecycle, CSRF token defense, reconciled double-entry ledger posting, production quote execution, provider webhook routes/signature verification and real chain send/receive are not implemented. This app must not handle customer funds in its current state.

## Security and readiness checklist

- [ ] Add Argon2id, password reset/verification with single-use hashed tokens, TOTP lifecycle, MFA recovery and session management.
- [ ] Add CSRF strategy for state-changing cookie-auth endpoints, distributed IP/account rate limits, bot defenses and security headers/CSP.
- [ ] Implement transaction authorization, re-authentication, risk screening and posting to the double-entry ledger schema with atomic DB transactions and idempotent webhook ingestion.
- [ ] Integrate reviewed custody/provider adapters, address validation per chain, fee quotes, confirmation tracking and reconciliation.
- [ ] Add admin audit access controls, production monitoring, incident response, privacy/terms legal review, backups/restore drills and independent security review.
- [ ] Complete high-risk flow integration tests and run dependency/container/security scanning.

No audit, regulatory status, insurance or production security certification is claimed.

## GitHub repository

The project is published at [prateeksharma4919l/bitrex](https://github.com/prateeksharma4919l/bitrex). Push commits to `main`; Render can deploy new commits automatically after the Blueprint is connected.
