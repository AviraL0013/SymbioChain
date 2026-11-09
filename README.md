# SymbioChain

A policy-controlled three-agent treasury with durable execution, verifiable inference gates and explicit cost accounting on NEAR.

[Website](https://symbiochain.vercel.app) · [Dashboard](https://symbiochain.vercel.app/dashboard) · [Backend source](https://github.com/SuyashAlphaC/symbiochain-core) · [Architecture](docs/architecture.md) · [Deployment](docs/backend-integration.md)

## Trust boundaries

**TEE execution status: QUARANTINED.** The recorded November 7 unmodified Brave audit failed deployment approval in provenance-only mode. Intel TDX, NVIDIA and TLS subchecks do not approve the complete gateway/model/proxy chain. Missing launcher provenance, source/OS pin differences and missing required gateway services remain documented in the [backend audit](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/brave-cli-verification.json). PAPER inference is a deterministic local simulation with no enclave or TEE signature; no cryptographically signed enclave emulator is claimed.

**Compute funding: HUMAN IN THE LOOP.** The backend implements durable manual tasks and provider-unverified purchase reports. Those reports cannot change credits, release held proceeds or open the TEE gate. The disarmed mainnet interface is read-only. Automatic provider purchases remain unimplemented.

**External revenue and demand: UNPROVEN.** Team payments and synthetic transactions prove only the tested mechanics. Receipt counts do not establish independent ownership, organic demand, complete net profit or product-market fit. The [backend service path](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/SERVICE_LOOP.md) accepts prepaid quote-risk reports separately from trading; it is not a wallet security audit or guarantee of profit. Do not solicit real payments while approved service delivery remains unavailable.

**The current release serves LIVE mainnet observations with execution DISARMED.** Treasury balances, storage collateral, worker permissions, executable identity and deployment transactions come from finalized NEAR mainnet state. The owner has activated bounded contract permissions; the runtime remains disarmed with monitor-only heartbeats. Paid AI inference, trading, customer delivery and NFT distributions are not active. The goal of an agent earning and purchasing its own compute remains an incomplete business loop. Unavailable data is labelled stale or disconnected.

The public `/evidence` view now contains mainnet-only results. It reports **13 passed, 11 blocked and 1 not run**, with 12 verified finalized mainnet transaction records. The legacy `/testnet` URL redirects there; historical testnet artifacts remain in Git and are excluded from mainnet coverage.

EYE (the SCOUT worker) discovers candidate routes, BRAIN assesses committed terms, and HAND tracks execution, reconciliation and receipts when execution is enabled. The production observer starts no worker. The Fastify backend owns PostgreSQL, jobs, signing and provider integrations. This Next.js repository supplies the public mainnet application and separately mode-bound PAPER operator controls.

Both repositories are public. The existing Vercel project is retained. See the [mainnet acceptance release verification](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/mainnet-acceptance-release.json) for exact frontend/backend revisions and checks; `/api/release` exposes only curated public deployment identifiers. Earlier records remain dated history. A hackathon form submission has not been confirmed.

The [Evidence overview](https://symbiochain.vercel.app/evidence) separates current finalized state from a dated acceptance audit, capital funding and the completed self-funded service-balance round trip. The 0.002 NEAR service deposit returned 0.0012 NEAR, retained 0.0008 NEAR as storage collateral and incurred 0.0007785144816934 NEAR in fees. Service credit is zero; the treasury stayed paused. This is escrow mechanics, not agent settlement, external revenue or a mainnet NFT distribution. The later activation panel records all seven owner-reviewed receipts, 0.05-USDC per-authorization / 0.10-USDC daily limits and the internal 0.02-NEAR owner gas allocation. [Audit scope and reproduction](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/MAINNET_ACCEPTANCE.md).

The [paired release record](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/mainnet-bounded-release.json)
identifies the deployed application revisions and production checks. Dated testnet,
PAPER and paused-state records preserve their original scope; they are not current
mainnet execution evidence.

## Explore

| Route         | Connected behavior                                                                       |
| ------------- | ---------------------------------------------------------------------------------------- |
| `/dashboard`  | Finalized mainnet treasury balance, storage collateral, owner policy and execution gates |
| `/evidence`   | Owner activation, seven receipts, dated acceptance, service escrow and execution gaps    |
| `/topology`   | Actual mainnet agent accounts, recovery custody and worker permissions                   |
| `/cycles`     | Known confirmed deployment transactions, labelled infrastructure rather than revenue     |
| `/cycles/:id` | Mainnet transaction view; historical PAPER cycle details are not published as LIVE       |
| `/verify`     | Bounded lookup of known deployment transactions, including receipt outcomes              |
| `/nfts`       | Actual on-chain supply and revenue-share totals; no simulated mint claims                |
| `/business`   | Unproven revenue, unknown full-business runway and unfinished funding claims             |
| `/testnet`    | Redirect to current mainnet evidence                                                     |
| `/operator`   | Read-only mainnet execution gates; no public arming or spending control                  |

Public pages read runtime-validated schemas through fixed server routes. Mainnet snapshots poll finalized state; PAPER telemetry retains its existing event stream and polling behavior when that mode is selected. No page invents records when the backend is unavailable.

Meteor and MyNearWallet connect using pinned wallet executors. Connection requests account access without adding keys or requesting a transaction. Wallet connection is separate from operator authentication. The automated browser check uses an explicit wallet adapter fixture; actual extension login still requires the user.

Operator access uses a separate code and a signed, 30-minute HttpOnly session. Backend read/admin credentials stay on the server. Each operation checks backend capabilities and binds the requested execution mode to PAPER, including across a backend deployment change. No public catch-all proxy or LIVE arming control exists.

## What is demonstrated

- A browser can follow an actual durable PAPER cycle through a worker crash, reclaim of the same job, settlement-bound cost approval and receipt creation.
- Admission uses integer amounts and a conservative return minus configured cost allowances. Losing routes remain rejected before paid inference or signing.
- Cost approval is immutable and identifies the exact settlement, native-fee evidence and billed inference total. Missing approval leaves net values unknown.
- Application compute allowance is distinct from provider credit balance. It does not establish a measured business runway or a profit-funded compute purchase.
- Proof lookup exposes recorded verification scope. PAPER inference never becomes a verified hardware proof.

The backend has separate real gateway/model hardware audit evidence and confidential-inference verification code. Final deployment approval and a signed paid completion still depend on the [documented provenance gate](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TEE_APPROVAL_HANDOFF.md). Mainnet deployment, owner-approved permissions and bounded USDC authorization limits are complete. Actual trading still needs separate approved capital/gas funding, TEE approval and a viable route. More detail: [mainnet activation requirements](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/MAINNET_PRODUCTION.md).

Business accounting, signed proceeds conversion, native withdrawal and NFT allocation with durable recovery are implemented. No funded mainnet payout or confirmed external revenue is claimed. These execution paths remain disabled. Automatic credit purchasing remains blocked on a publicly supported NEAR AI payment flow. The mainnet interface reports these limits explicitly; local and historical PAPER tests establish mechanics only.

## Run locally

Historical testnet and PAPER checks remain local regression evidence. They are not displayed as current mainnet results. The acceptance API is read-only and strictly validated at the server boundary; a blocked or unexecuted feature cannot appear as a passing execution check.

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
