# Validation scope

The integration has three separate browser proofs:

- [Isolated PAPER lifecycle](validation/paper-browser.json): a real Chromium browser exercised the Next.js/Fastify/PostgreSQL path, simulated funding, a paused Scout job, a targeted worker crash, reclaim of that same job on attempt two, settlement-bound cost approval, a closed cycle, unminted receipt, private evidence access and logout. Both 1440px and 390px layouts were checked. No paid model or wallet operation was available to this isolated backend.
- [Production build against hosted data](validation/hosted-read.json): the local optimized frontend read the existing Render backend, including persisted cycles, compute allowance and resumable event readiness. Anonymous administrative requests returned 401. Browser traffic and assets did not expose the actual backend credentials. No hosted mutation was performed. This proves the application/backend connection; it is not a claim that the branch has been deployed to Vercel.
- [Testnet evidence page](validation/testnet-browser.json): Chromium checked the historical contract report, the integrated runner's recorded Brain approval gate, two confirmed Sepolia/Solana devnet authorization fixtures and their NEAR MPC request links. It also checked explicit simulation, unavailable responses and the 390px layout. Two server-held credentials were checked against browser traffic and loaded responses; no exposure or direct browser-to-backend request was found. Reading this page performs no chain writes or inference purchase.

The latest frontend verification passes 23 credential-free regression checks, ESLint, TypeScript, formatting and `next build` with Node 22. The backend additions pass 129 unit tests, 70 PostgreSQL integration tests, TypeScript and the production build locally. The [testnet submission walkthrough](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TESTNET_SUBMISSION.md) records reproducible commands, actual transactions, worker recovery and remaining gates. Browser verification observes a blocked integrated run, not a completed authenticated AI cycle.

The [hosted report check](validation/testnet-hosted.json) verifies Render deployment
`dep-dbm0nohsrm7s73en4t9g` at backend commit `e1633c7ff16cb2ce3ce484aa44b12d09cc0117a5`:
readiness 200, anonymous report 401, authenticated report 200, exact equality with
the reviewed artifact and no credential exposure. It records both confirmed
destination fixtures and the blocked integrated Brain run with zero paid requests.
Agent operations remain PAPER. Backend/container and Rust contract CI pass:
[workflow run](https://github.com/SuyashAlphaC/symbiochain-core/actions/runs/41970521814).

The production build keeps backend read/admin tokens and the separate operator access secret server-only. The regression checks cover stable idempotency-key forwarding. The browser suite additionally verifies cross-origin rejection, logout/private-evidence rejection, no direct browser-to-backend requests and no backend credentials in browser storage.

## Hosted release status

Verified on November 5, 2026: PR #3 merged at
[`83d46d8eb5db2257989bf1c831694da20617635e`](https://github.com/AviraL0013/SymbioChain/commit/83d46d8eb5db2257989bf1c831694da20617635e).
The public repository is anonymously accessible. The existing Vercel project
`avirals-projects-27965510/symbiochain` serves
[the testnet page](https://symbiochain.vercel.app/testnet); its same-origin JSON
report matches the hosted backend. Snapshot returns PAPER, contract version 1,
and null survival hours. Operator discovery is configured; anonymous operator
state returns 401. The owner separately verified login, PAPER state and logout,
and reported the existing deployment READY. These completed owner steps replace
the earlier observations of a missing page and unconfigured operator.

The verified Render deployment serves backend application revision
[`e1633c7ff16cb2ce3ce484aa44b12d09cc0117a5`](https://github.com/SuyashAlphaC/symbiochain-core/commit/e1633c7ff16cb2ce3ce484aa44b12d09cc0117a5).
Later documentation or feature commits are not automatically deployed. The
[backend release evidence](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/frontend-production-release.json)
separates independent read checks from owner-reported browser checks.

Real execution evidence covers NEAR testnet contract calls, MPC signatures and
separate confirmed Sepolia/Solana devnet transfers. Those transfers are
**authorization fixtures**, not TEE-approved trades. Market data, quotes,
settlement economics and PAPER receipts are simulated. The recorded integrated
runner stops at TEE deployment approval with zero paid requests. External customer
revenue, realized business profit, automatic AI-credit purchases and business-funded
NFT distributions remain unproven. A testnet NFT funding fixture is not revenue.

No hackathon submission receipt has been recorded. The revisions above identify
the verified deployed baseline, not an assertion that a later feature branch was
submitted or released. Follow the [release checklist](backend-integration.md)
for subsequent updates in the same projects.

## Business feature source candidate

The locally verified application commits are frontend
[`e6bbcfe57d608297447b068d11c4910456c016d7`](https://github.com/AviraL0013/SymbioChain/commit/e6bbcfe57d608297447b068d11c4910456c016d7)
and backend
[`bc5df4e4c67fde7cd336a466436d1b53dacf7dac`](https://github.com/SuyashAlphaC/symbiochain-core/commit/bc5df4e4c67fde7cd336a466436d1b53dacf7dac).
Both are on `feature/business-revenue-loop`. Subsequent documentation commits
maintain release notes without changing those application revisions. These are
source candidates, not deployed or confirmed submitted revisions. The exact
[release manifest](https://github.com/SuyashAlphaC/symbiochain-core/blob/feature/business-revenue-loop/artifacts/funding-release-manifest.json)
keeps those states separate.

The new `/business` page reads a curated backend projection through fixed
same-origin business/funding routes. It excludes invoices, deposits and internal transfers from
confirmed revenue, labels closed-window net as accountant-reported, and retains
unknown runway. The NFT funding code capability is implemented but disabled; automatic credit
purchasing remains provider-blocked and unimplemented. No public financial-write proxy is added; LIVE business responses
remain outside this frontend's PAPER publication contract.

[Browser evidence](validation/business-browser.json) covers the actual isolated
Next.js/Fastify/PostgreSQL connection, zero confirmed revenue, unknown net/runway,
disabled NFT funding capability, unfinished credit purchases, stale/unavailable responses, a 390px viewport and absence
of credential exposure/direct backend requests. Backend invoice receipt verification is
tested with injected RPC fixtures. A separate November 6 credit parser check
passed against a third-party final public transaction; no actual project customer
receipt was verified. These are implementation tests, not economic proof.

Deploy the additive backend migration and API before this frontend feature. No
hosted Supabase migration, Render deployment or Vercel production release was
performed for the feature. The existing deployed site remains the baseline in
the preceding section. Automatic credit purchases still lack a publicly supported provider protocol.
The NFT conversion, withdrawal, allocation and recovery code is implementation-tested
but lacks funded mainnet validation. The owner has no mainnet funds/account/caps.
The existing testnet treasury received the new getters/pause protection in a
state-preserving upgrade and remains paused; this is not business revenue or
a proceeds-funded payout. See the [funding runbook](https://github.com/SuyashAlphaC/symbiochain-core/blob/feature/business-revenue-loop/docs/BUSINESS_FUNDING.md).

### November 6 merge/deployment recheck

The accounting PR #4 is already merged at
`b855671653e4ac8a188f512b3a879c2a1a527227`; backend PR #1 is merged at
`6a6a2ba6e6e1a4b3ad39a62b46d10500201453d6`. Both hosted business endpoints still
return 404, and the Render API confirms the older `e1633c7` deployment. A main
merge is not a completed paired production release. The frontend hash in the
hosted-release section is the last independently verified exact deployment
baseline, not a fresh assertion based on main. No production mutation was performed.

The NFT funding extension is now reviewed separately in
[frontend PR #5](https://github.com/AviraL0013/SymbioChain/pull/5) and
[backend PR #2](https://github.com/SuyashAlphaC/symbiochain-core/pull/2). Read-only
[preflight evidence](https://github.com/SuyashAlphaC/symbiochain-core/blob/feature/business-revenue-loop/artifacts/funding-production-preflight.json)
records the merged/deployed distinction and required backend-first release.
