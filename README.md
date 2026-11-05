# SymbioChain

A policy-controlled three-agent treasury with durable execution, verifiable inference gates and explicit cost accounting on NEAR.

[Website](https://symbiochain.vercel.app) · [Dashboard](https://symbiochain.vercel.app/dashboard) · [Backend source](https://github.com/SuyashAlphaC/symbiochain-core) · [Architecture](docs/architecture.md) · [Deployment](docs/backend-integration.md)

**The deployed demonstration uses PAPER execution.** Its telemetry comes from persisted backend records; economic results, inference and receipts in that mode are simulated. Real wallet deposits, live trading and on-chain ownership are not enabled by this frontend. The goal of an agent earning and purchasing its own compute remains an incomplete business loop.

The deployed site includes a separate `/testnet` evidence page. It publishes
recorded NEAR testnet contract checks and real MPC signature results independently
from the PAPER agent feed. Market settlement and reported economics in that
rehearsal remain explicitly simulated. Hardware verification, deployment approval
and signed inference are displayed as separate gates.

EYE (the SCOUT worker) discovers candidate routes, BRAIN assesses committed terms, and HAND tracks execution, reconciliation and receipts. The Fastify backend owns PostgreSQL, jobs, signing and provider integrations. This Next.js repository supplies the public application and protected PAPER operator controls.

Released frontend: [`83d46d8`](https://github.com/AviraL0013/SymbioChain/commit/83d46d8eb5db2257989bf1c831694da20617635e) (PR #3). The repository is public and the existing Vercel project serves `/testnet`; operator configuration and owner login/logout checks are complete. See [release evidence and revision scope](docs/validation.md#hosted-release-status). This records deployment, not confirmation of a hackathon form submission.

## Explore

| Route         | Connected behavior                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`  | Treasury history, agent heartbeats, recorded decisions, settlements and the application compute allowance                                                       |
| `/topology`   | Actual worker availability and recorded coordination                                                                                                            |
| `/cycles`     | Paginated execution journal, including rejected and incomplete cycles                                                                                           |
| `/cycles/:id` | Quote shortfall, current-policy comparison, durable job attempts, settlement economics and recorded proofs                                                      |
| `/verify`     | Stored verification lookup; a missing record does not mean a signature is invalid                                                                               |
| `/nfts`       | Persisted PAPER receipts, clearly marked unminted and simulated                                                                                                 |
| `/testnet`    | Separate historical rehearsal report, testnet transaction links, explicit simulations and TEE approval gates                                                    |
| `/operator`   | Authenticated simulated funding, idempotent cycle creation, pause/resume, recovery demonstration, policy revisions, cost approval and private evidence download |

Public pages read runtime-validated publication schemas through fixed server routes. A resumable event stream refreshes persisted telemetry; polling continues through interruptions. Stale and disconnected states retain their labels. No page invents records when the backend is unavailable.

Operator access uses a separate code and a signed, 30-minute HttpOnly session. Backend read/admin credentials stay on the server. Each operation checks backend capabilities and binds the requested execution mode to PAPER, including across a backend deployment change. No public catch-all proxy or LIVE arming control exists.

## What is demonstrated

- A browser can follow an actual durable PAPER cycle through a worker crash, reclaim of the same job, settlement-bound cost approval and receipt creation.
- Admission uses integer amounts and a conservative return minus configured cost allowances. Losing routes remain rejected before paid inference or signing.
- Cost approval is immutable and identifies the exact settlement, native-fee evidence and billed inference total. Missing approval leaves net values unknown.
- Application compute allowance is distinct from provider credit balance. It does not establish a measured business runway or a profit-funded compute purchase.
- Proof lookup exposes recorded verification scope. PAPER inference never becomes a verified hardware proof.

The backend has separate real gateway/model hardware audit evidence and confidential-inference verification code. Final deployment approval and a signed paid completion still depend on the [documented provenance gate](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TEE_APPROVAL_HANDOFF.md). Mainnet execution awaits the dedicated account, explicit funding limits and a genuinely profitable executable route. More detail: [trading evidence](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TRADING_GATES.md).

## Run locally

The testnet page also displays the integrated runner's recorded stage and
remaining TEE gate, plus separate confirmed Sepolia and Solana devnet execution
fixtures. These are independent of the PAPER overview. Follow the backend's
[testnet judge walkthrough](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TESTNET_SUBMISSION.md)
for commands, transaction links, recovery and precise simulation boundaries.

Use **Node 22.13 or later in the 22.x line** and npm 10 or later. The separately deployed backend uses Node 24.

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Set `BACKEND_URL`, `BACKEND_READ_TOKEN` and `SITE_URL` in that ignored file. Optional operator controls additionally require `BACKEND_ADMIN_TOKEN` and a distinct, random `OPERATOR_ACCESS_TOKEN` of at least 32 characters. Never prefix credentials with `NEXT_PUBLIC_`; never copy the entire backend environment into this application. See [configuration and release steps](docs/backend-integration.md).

Open [localhost:3000](http://localhost:3000). Font setup downloads licensed Clash Display files from Fontshare when missing; first-run builds need internet access.

| Command                           | Purpose                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm test`                        | Transport, schema, exact amounts, cursor replay, authentication and mode-boundary regression checks |
| `npm run check`                   | Formatting, lint, TypeScript and production build                                                   |
| `npm run test:e2e`                | Full browser flow against an isolated local PAPER backend; [setup](docs/testing.md)                 |
| `npm run build` / `npm run start` | Production build and local server                                                                   |

The browser suite refuses remote targets and checks that backend credentials never enter browser traffic, page assets or browser storage. It is intentionally separate from credential-free CI checks. [Validation notes](docs/validation.md) distinguish local execution proof from hosted release status.

## Repository and contracts

```text
apps/web/                  Next.js application and server routes
packages/shared/           Validated public and operator schemas
scripts/                   Contract synchronization and font setup
test/e2e/                 Browser integration checks
docs/                     Architecture, setup, validation and release handoff
```

The [backend repository](https://github.com/SuyashAlphaC/symbiochain-core) contains Fastify, Prisma, durable workers, provider adapters and the Rust NEAR treasury. The local `apps/backend` and `contracts` directories are pointers to that source, not duplicate implementations.

Public schemas are copied from a reviewed backend checkout with:

```sh
node scripts/sync-viewer-contract.mjs /path/to/symbiochain-core
```

The original v1 snapshot remains compatible. New status, cycle and event endpoints are additive. Monetary values and event cursors remain strings; BigInt handles arithmetic and exact display. See [architecture](docs/architecture.md) for the publication boundary.

## Assets and attribution

The existing interface, teammate contributions and commit history are preserved. DM Sans is bundled under its SIL Open Font License. Clash Display files stay outside Git; their setup script and license remain in the repository. Chain icon notices accompany their assets. No private keys, seed phrases, provider credentials or local environment files belong in Git.
