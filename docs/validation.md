# Validation scope

The integration has three separate browser proofs:

- [Isolated PAPER lifecycle](validation/paper-browser.json): a real Chromium browser exercised the Next.js/Fastify/PostgreSQL path, simulated funding, a paused Scout job, a targeted worker crash, reclaim of that same job on attempt two, settlement-bound cost approval, a closed cycle, unminted receipt, private evidence access and logout. Both 1440px and 390px layouts were checked. No paid model or wallet operation was available to this isolated backend.
- [Production build against hosted data](validation/hosted-read.json): the local optimized frontend read the existing Render backend, including persisted cycles, compute allowance and resumable event readiness. Anonymous administrative requests returned 401. Browser traffic and assets did not expose the actual backend credentials. No hosted mutation was performed. This proves the application/backend connection; it is not a claim that the branch has been deployed to Vercel.
- [Testnet evidence page](validation/testnet-browser.json): Chromium checked the historical contract report, the integrated runner's recorded Brain approval gate, two confirmed Sepolia/Solana devnet authorization fixtures and their NEAR MPC request links. It also checked explicit simulation, unavailable responses and the 390px layout. Two server-held credentials were checked against browser traffic and loaded responses; no exposure or direct browser-to-backend request was found. Reading this page performs no chain writes or inference purchase.

The latest frontend verification passes 21 credential-free regression checks, ESLint, TypeScript, formatting and `next build` with Node 22. The backend additions pass 105 unit tests, 50 PostgreSQL integration tests, TypeScript and the production build locally. The [testnet submission walkthrough](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TESTNET_SUBMISSION.md) records reproducible commands, actual transactions, worker recovery and remaining gates. Browser verification observes a blocked integrated run, not a completed authenticated AI cycle.

The [hosted report check](validation/testnet-hosted.json) verifies the existing
Render service at `ce2b870f79051867cb16d54ce3319b86f35fc467`: readiness 200,
anonymous report 401, authenticated report 200, exact equality with the reviewed
artifact and no credential exposure. Agent execution remains PAPER. Backend and
contract CI, including the release-image report check, passes at that revision:
[workflow run](https://github.com/SuyashAlphaC/symbiochain-core/actions/runs/41428905783).

The production build keeps backend read/admin tokens and the separate operator access secret server-only. The regression checks cover stable idempotency-key forwarding. The browser suite additionally verifies cross-origin rejection, logout/private-evidence rejection, no direct browser-to-backend requests and no backend credentials in browser storage.

## Hosted release status

The earlier integration was merged in PR #2 at `2b5f2964699bbc7e7cd71effd5183b7c23c94fe6`. A fresh production read returned a valid PAPER snapshot (200). Operator session discovery returned `configured: false`; the optional server-side operator credentials still need configuration in the existing Vercel project. The `/testnet` route returned 404 because the rehearsal page is a separate follow-up change.

The new testnet page remains on `feature/testnet-rehearsal` until its follow-up PR is reviewed and released. The local Vercel login cannot resolve the teammate-owned `avirals-projects-27965510` scope. Repository write permission does not grant access to that project. No new Vercel project or account was created.

The owner must configure the two optional operator server variables, verify a protected preview in the existing project, merge the reviewed follow-up PR and verify its production deployment. Use the [ready-to-run teammate prompt](teammate-release-prompt.md) and [configuration checklist](backend-integration.md).

These checks do not complete mainnet funding, prove profitable live trading, purchase compute credits, approve an unverified image measurement or mint a mainnet NFT. The separate rehearsal does mint a real testnet NFT and exercises a test-token distribution/claim against synthetic accountant reconciliation. Those testnet mechanics do not establish an autonomous business or replace the remaining production gates.
