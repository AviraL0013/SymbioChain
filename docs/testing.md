# Integration testing

[Architecture](architecture.md) · [Configuration/release](backend-integration.md) · [Current paired verification](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/VERIFICATION.md)

Historical sanitized browser summaries remain in [validation/](validation/) with
their original scope and dates. Current deployment identities are reported by
`/api/release` and the backend release guide; those fixtures are not live status.

`npm test` runs credential-free transport, schema, BigInt display, replay, operator-session, CSRF and mode-boundary checks. `npm run check` adds formatting, lint, TypeScript and production build. Normal GitHub CI runs these without production secrets.

`npm run test:e2e` is a mutating browser suite for an **isolated localhost PAPER backend**. It refuses a remote frontend origin and requires the backend URL in `apps/web/.env.local` to be loopback. Do not point this suite at the shared Render/Vercel deployment.

## Local setup

1. Check out the [backend](https://github.com/SuyashAlphaC/symbiochain-core) beside this repository. Use Node 24 there and Node 22 here.
2. Create a dedicated local PostgreSQL database ending in `_test`. Use a separate ignored backend `.env.e2e` with that URL, dedicated random admin/read/encryption keys, PAPER mode and no provider API key. Set `HOST=127.0.0.1`, `PORT=3301`, `ENABLE_CHAOS_DEMO=true`, `NFT_SHARE_BPS=100`, `WORKER_LEASE_MS=2000` and `WORKER_POLL_MS=100`. Use the default PAPER assets, chains and recipient. The shortened lease is only for this local test.
3. Build the backend with `npm ci && npm run build`. Run its migration/hardening/start supervisor under an outer restart loop so a deliberate worker exit restarts the local service:

```sh
trap 'exit' INT TERM
while true; do
  DOTENV_CONFIG_PATH=.env.e2e bash scripts/start-render.sh
  sleep 1
done
```

4. In this repository's ignored `apps/web/.env.local`, use `BACKEND_URL=http://127.0.0.1:3301`, the matching local read/admin tokens, a separate random operator access code and `SITE_URL=http://127.0.0.1:3300`. Do not use real provider or wallet credentials.
5. Install frontend dependencies and Chromium, then start the application:

```sh
npm ci
npx playwright install chromium
npm run dev --workspace=@symbiochain/web -- --port 3300
```

6. In another terminal, run `npm run test:e2e`. `E2E_BASE_URL` defaults to `http://127.0.0.1:3300`. `E2E_OPERATOR_ACCESS_CODE` can override the local access code. To use an installed Chrome binary, set `E2E_CHROME_PATH` to its absolute path.

The suite checks public telemetry and event readiness, unauthenticated/cross-origin rejection, operator login, simulated funding, a paused Scout job, targeted crash/reclaim, settlement-bound cost approval, final receipt, private evidence access, proof lookup, logout, mobile layout and credential exposure. It never performs a real trade or paid inference. Funding references and cycle idempotency keys are unique per new test run and stable for their request.

Screenshots and a sanitized verification summary go into ignored `artifacts/browser/`. They include PAPER cycle IDs, not credentials. Traces stay disabled so entered access codes are not archived in a network trace. Stop the local frontend and backend supervisor after the run.

## Mainnet observation check

Run `test/e2e/mainnet.spec.ts` separately against an isolated localhost frontend/backend pair configured with `EXECUTION_MODE=LIVE`, `EXECUTION_ENABLED=false`, the reviewed mainnet deployment IDs and a dedicated local test database. This profile needs no wallet private key or model API key. It reads finalized public mainnet state; it submits no transaction or paid inference.

Set `E2E_BASE_URL` to the local frontend, `E2E_BACKEND_ORIGIN` to the local backend and optionally `E2E_MAINNET_SECRETS` to a comma-separated list of random local test credentials for the exposure check. Keep these values in the environment. Then run:

```sh
npm run test:e2e -- test/e2e/mainnet.spec.ts
```

This check covers the recorded deployment receipt, actual balances, stale-state recovery, page routes, mobile width and server credential isolation. The injected wallet is an explicit test adapter: it proves connection parameters and the absence of key grants or transaction requests. It does not prove that a user completed extension login in Meteor or MyNearWallet. The PAPER browser tests continue to require their separate PAPER profile.
