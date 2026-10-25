# BITREX Crypto Wallet

BITREX is a responsive wallet application starter with a premium dark dashboard and a transparent demo environment. **It is not a live exchange or custody service.** Demo balances, sample activity, asset prices and requests are illustrative and non-withdrawable. No funds are transferred and no sample record is represented as on-chain confirmed.

## Screenshots

Add current screenshots after starting the app:

- `docs/screenshots/dashboard-desktop.png` — desktop portfolio dashboard
- `docs/screenshots/dashboard-mobile.png` — responsive mobile dashboard

## Features

- Responsive portfolio with asset search, allocation snapshots, indicative sample chart, activity and light/dark toggle.
- Product overview at `/welcome` with supported asset examples, getting-started steps, factual demo disclosure, FAQ and account CTAs.
- Simulated buy, sell, send, swap and receive workflows with prominent demo notices. Receive intentionally shows no deposit address until verified wallet infrastructure exists.
- CSV export; simulated transaction history; network choices are asset-specific.
- Registration/login API with bcrypt password hashing, random opaque session token stored as SHA-256 hash, HttpOnly SameSite cookie, expiration and audit events (requires PostgreSQL).
- PostgreSQL Prisma schema for accounts, sessions, 2FA configuration, assets, chain networks, wallets/addresses, exact numeric balances, orders, transactions/events, providers, audit logs and notifications.
- Zod request validation, UUID idempotency key contract, role-protected admin API and demo mode guard that disables real-money execution.
- Vitest decimal tests, Playwright demo-flow test and GitHub Actions checks.

## Architecture

Next.js App Router + TypeScript serves the UI and server API. Prisma maps PostgreSQL relations; financial schema fields use `DECIMAL(38,18)`. Use string/decimal arithmetic at all authority boundaries; the tiny fixed point helper is for exact addition/subtraction and must not be replaced with JS floating point for ledgers. Provider integrations should implement server-only adapters and webhook signature verification before enabling live operations.

`APP_MODE=DEMO` is the default. Demo sample prices are explicitly sample display content and the market price API reports unavailable; no market provider is configured. In non-demo mode, the root page and private portfolio/history routes require a valid opaque session and operations return unavailable until provider/ledger execution is implemented. Admin overview enforces `ADMIN` on the server.

## Requirements and local setup

- Node.js 22+
- npm 10+
- PostgreSQL 15+ for account persistence (the dashboard demo runs without it)

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. The dashboard works with no credentials in demo mode. Configure `DATABASE_URL` to enable auth persistence. Then run:

```powershell
npm.cmd run db:generate
npx.cmd prisma migrate dev --name init
npm.cmd run db:seed
```

The seed script adds only asset registry entries and creates no users or credentials. Build and start with `npm.cmd run build` and `npm.cmd run start`.

## Environment

See `.env.example`. `DATABASE_URL` is a PostgreSQL connection string; `APP_MODE` remains `DEMO` unless real services and controls have been reviewed. Price, on-ramp, custody, RPC/indexer, email, and swap provider URLs and keys are server-only placeholders. Never expose them via `NEXT_PUBLIC_*` or commit actual values.

## API overview

- `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- `GET /api/portfolio`, `/api/transactions`
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

## Deployment

Deploy Next.js to Vercel and use managed PostgreSQL with TLS, connection pooling and automated backups. Set environment variables in deployment settings. Apply reviewed migrations in release pipeline. Keep `APP_MODE=DEMO` until providers and operational controls have passed review. Set production HTTPS and secure cookies, configure trusted proxy headers, monitoring, secret rotation and restore tests.

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

This workspace is prepared for `bitrex-crypto-wallet`. Check account/remotes, then create and push explicitly:

```powershell
git init
git add .
git commit -m "Build BITREX wallet demo application"
gh repo create bitrex-crypto-wallet --private --source . --remote origin
git push -u origin main
```

Review `git status` and `.gitignore` before committing. No GitHub remote or authenticated publishing operation has been performed here.
