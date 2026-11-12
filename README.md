# SymbioChain

[Live dashboard](https://symbiochain.vercel.app/dashboard) · [Mainnet evidence](https://symbiochain.vercel.app/evidence) · [Backend source](https://github.com/SuyashAlphaC/symbiochain-core)

## 1. What it is and why it matters

AI agents need spending authority without unrestricted control of a treasury.
SymbioChain is a policy-controlled AI treasury on NEAR. Scout discovers candidate
routes, Brain assesses committed terms, and Hand requests execution through
bounded contract permissions.

Its **Metabolic Rule** combines two layers: the NEAR contract protects reserves
and enforces roles, approved assets/chains and spending limits; the application
checks compute budgets, trading economics and TEE workload approval. A model's
recommendation cannot override those deterministic checks.

This repository is the Next.js dashboard and server-side API proxy. The
[backend](https://github.com/SuyashAlphaC/symbiochain-core) contains the workers,
ledger, provider adapters and Rust treasury contract.

## 2. Live on Mainnet (Proven Mechanics)

**Owner-initiated execution:** human-authorized scripts used scoped agent-role
keys and Chain Signatures to complete real [Base](https://basescan.org/tx/0x671a03fd1e327cd4a6cb57d5eb668016b3625364a14eb7a7beaafaebfd24135c)
and [Solana](https://solscan.io/tx/2WvDKWegMfxqaDDUJbsjXDgQ1CQK7aoHL7b51mNuscVG9swPC36i55pZYFNDANnEFp2E2c4hx1Hwd3vJQ3rdfxZv)
transfers. Both treasury cycles closed, with eight NEAR receipts. **The AI engine
did not initiate these transactions.** Real 1Click/Intents conversions funded
destination gas, and internal Intents agent payments also settled.

| Control                | Current policy                                         |
| ---------------------- | ------------------------------------------------------ |
| USDC authorization     | 0.25 USDC per action; 0.50 USDC per day                |
| Native SOL transfer    | 0.004 SOL per action; 0.008 SOL per day                |
| Protected NEAR reserve | 0.10 NEAR                                              |
| Automatic execution    | DISARMED; contract and scoped permissions are deployed |

The [evidence page](https://symbiochain.vercel.app/evidence) separates current
finalized state, original activation receipts, later funding/permission changes
and confirmed destination transfers. The original 0.05/0.10-USDC policy is dated
history; the table above gives the later owner-approved limits.

**Glossary:** _Receiver-scoped function-call keys_ are restricted to listed
methods on one receiver contract. _MPC/Chain Signatures_ enables signatures for
wallets on other chains. _1Click_ is NEAR Intents' intent-based cross-chain swap API.

## 3. Verify in 5 Minutes

**No judge token, login or wallet connection is required** for the public
read-only application. The backend read token stays on the server; private
operator access is separate.

| Do this                                                                                                                         | See this                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Open [Dashboard](https://symbiochain.vercel.app/dashboard)                                                                      | Finalized balances, owner policy and DISARMED execution state                      |
| Open [Evidence](https://symbiochain.vercel.app/evidence) expand **Mainnet MPC transfer fixtures** and follow the transfer links | Two confirmed owner-initiated transfers and eight NEAR execution receipts          |
| Expand **Manual AI API probe**                                                                                                  | `NEAR_AI_OK`, 31 input / 6 completion tokens and a **$0.00000548** provider charge |
| Open [Topology](https://symbiochain.vercel.app/topology) and [Receipts](https://symbiochain.vercel.app/nfts)                    | Actual agent accounts, permissions and on-chain NFT supply                         |
| Read the [release record](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/mainnet-rpc-recovery.json)       | Exact application revisions, automated checks and desktop/mobile verification      |

A local frontend requires **Node 22.13+ in the 22.x line** and npm 10+. In a fresh
checkout:

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Set `BACKEND_URL`, `BACKEND_READ_TOKEN` and `SITE_URL` only in the ignored
`apps/web/.env.local`, using an isolated local backend or your own deployment.
The [backend PAPER quickstart](https://github.com/SuyashAlphaC/symbiochain-core#run-locally)
uses Node 24 and Docker and requires no funded wallet or paid inference.
[Configuration](docs/backend-integration.md) explains server-only credentials;
[testing](docs/testing.md) covers the isolated browser suite. `npm test` runs 28
frontend tests; `npm run check` runs formatting, lint, TypeScript and the build.
The paired project has 290 automated tests plus contract/sandbox checks.

Implementation details: [architecture](docs/architecture.md),
[validation](docs/validation.md), [shared schemas](packages/shared/src), and the
[demo/X-post draft](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/DEMO_POST.md).

## 4. Simulated vs. Real

| Mode / evidence      | State                                                               | What it proves                                                   |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| LIVE mainnet         | Owner-initiated transfers finalized; AI engine DISARMED             | Real signing, transfers, Intents settlement and bounded policies |
| PAPER                | Simulated market/model/settlement with durable jobs                 | Complete three-agent workflow, accounting and recovery           |
| Local NEAR sandbox   | Actual local contract calls with a mock MPC transport               | Contract behavior and payload constraints                        |
| Historical testnet   | Real MPC and separate Sepolia/devnet transfers; synthetic economics | Test-network signing and transfer mechanics                      |
| Manual unverified AI | One actual Cloud completion, one reconciled charge                  | API authentication, model availability and billing               |

`/testnet` redirects to `/evidence`; historical testnet artifacts retain their
original scope. The manual completion does not independently verify organization
membership, its response signature or TEE workload acceptance.

## 5. Not Yet Proven

- **TEE-approved autonomous execution:** complete software provenance and
  workload measurements did not meet the acceptance policy; automated execution
  remains quarantined despite passing hardware/TLS subchecks.
- **Profitable strategy trading:** the current signed route fails the unchanged
  profit floor, independently of the TEE gate.
- **External revenue and full business profitability:** owner capital and
  internal payments establish mechanics; demand and complete cost valuation are
  still to be established.
- **Automatic AI-credit purchases:** a supported public payment-to-credit flow is
  missing; the backend implements manual operator tasks.
- **Profit-funded NFT distributions:** implemented/tested funding and recovery
  mechanics still need actual business proceeds and mainnet payout validation.

## 6. Tracks

- **Security:** bounded treasury permissions, one-use signing, deterministic
  admission, durable recovery and fail-closed application TEE checks.
- **DeFi:** mainnet Chain Signatures transfer rails, Intents settlement and signed
  quote checks.

The existing interface, teammate contributions and commit history are preserved.
DM Sans uses its SIL Open Font License; Clash Display setup/license and chain-icon
notices remain with their assets. [MIT license](LICENSE). Dependencies are listed
in [package.json](package.json).

The frontend started October 28. [Changes after the October 30 foundation](https://github.com/AviraL0013/SymbioChain/compare/ba589e8f19476bb106d7115ea5a10ec2f744f32b...main)
show later integration and evidence work. Current frontend identity is public at
[/api/release](https://symbiochain.vercel.app/api/release); documentation-only
revisions can be newer than the frozen application record. Submission is on hold.
