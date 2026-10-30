# Architecture

The Next.js frontend reads a deliberately published PAPER view from the separate Fastify backend. The backend owns the database, durable workers, provider credentials, signing, cost approvals and administrative actions.

```text
Browser → same-origin /api/swarm/* → Fastify /api/viewer/* → PostgreSQL
                         │
                 server-only read token
```

## Data contract

`packages/shared/src/viewer-contract.ts` is a runtime-validated copy of the backend's `src/viewer-contract.ts`. Both ends reject unsupported versions, additional fields and modes other than PAPER. Regenerate it from a reviewed backend checkout:

```sh
node scripts/sync-viewer-contract.mjs /path/to/symbiochain-core
```

Amounts are integer strings with explicit asset decimals. Exact display and comparisons use BigInt. Chart geometry uses floating point; tooltips and the data table retain exact amounts. Timestamps are ISO UTC strings. EYE is the display name for the SCOUT worker. Runway stays null until a complete cost basis supports a measurement.

The backend snapshot reads ledger balances, workers, decisions, transactions, execution receipts and event metadata in a repeatable-read transaction. Published decisions use phase descriptions rather than arbitrary prompts or decision JSON. Proof evidence, signing material, invoice references and raw event payloads are excluded.

## Frontend structure

```text
apps/web/src/
  app/
    (marketing)/         Landing page at /
    (app)/               Shared telemetry provider and application pages
    api/swarm/           Fixed GET snapshot and proof handlers
  features/
    application/         Shared navigation, shell and wallet status
    swarm/               Snapshot lifecycle and exact amount formatting
    dashboard/           Ledger history, decisions and settlements
    topology/            Worker heartbeats and recorded coordination
    verify/              Recorded verification lookup
    nfts/                Unminted PAPER receipts and SVG artwork
  lib/server/            Server-only authenticated backend reader
packages/shared/src/     Validated viewer schemas and legacy preview types
```

One provider polls the same-origin snapshot every 10 seconds while an application page is open, and every 60 seconds in a hidden tab. Requests are sequential and aborted on unmount or refresh. A failed request marks retained data stale. An initial failure shows empty, disconnected states. There is no sample-data fallback. The marketing page does not poll.

The proof page looks up a request or response hash in previously verified NEAR AI records. A 404 means no matching record, not an invalid signature. A successful lookup returns stored metadata and explicitly records that no fresh attestation took place. PAPER inference fixtures cannot qualify as verified evidence.

## Security and operator boundary

Only `BACKEND_URL`, `BACKEND_READ_TOKEN` and `SITE_URL` belong in this frontend's server environment. The browser receives the curated PAPER view. It never receives the read token, administrative token, database URL, NEAR keys or provider keys. The reader permits a configured HTTPS origin (HTTP only for local development), fixed paths, no redirects, no upstream caching and a 15-second timeout. Public errors exclude upstream details.

The public routes expose no arbitrary backend proxy or mutation handler. The existing operator dashboard remains the authenticated entry point for funding simulations, cost approvals, pause/resume and fault recovery. Wallet authentication, real deposits, trading, purchased compute and on-chain ownership are separate capabilities; this integration does not enable them.

## Build and hosting

Use Node.js 22.13 or later in the 22.x line. `npm test` checks the server transport and amount/heartbeat handling. `npm run check` runs formatting, lint, TypeScript and the production build. CI runs both without production credentials.

Keep the teammate-owned Vercel project serving `https://symbiochain.vercel.app` and its existing `apps/web` project root. Follow [the deployment handoff](backend-integration.md) to configure that project and validate a preview. The backend remains on the existing Render service. Browser-to-backend CORS changes are unnecessary because the browser talks to Next.js on its own origin.
