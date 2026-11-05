# Validation scope

The integration has three separate browser proofs:

- [Isolated PAPER lifecycle](validation/paper-browser.json): a real Chromium browser exercised the Next.js/Fastify/PostgreSQL path, simulated funding, a paused Scout job, a targeted worker crash, reclaim of that same job on attempt two, settlement-bound cost approval, a closed cycle, unminted receipt, private evidence access and logout. Both 1440px and 390px layouts were checked. No paid model or wallet operation was available to this isolated backend.
- [Production build against hosted data](validation/hosted-read.json): the local optimized frontend read the existing Render backend, including persisted cycles, compute allowance and resumable event readiness. Anonymous administrative requests returned 401. Browser traffic and assets did not expose the actual backend credentials. No hosted mutation was performed. This proves the application/backend connection; it is not a claim that the branch has been deployed to Vercel.
- [Testnet evidence page](validation/testnet-browser.json): Chromium checked the historical contract report, the integrated runner's recorded Brain approval gate, two confirmed Sepolia/Solana devnet authorization fixtures and their NEAR MPC request links. It also checked explicit simulation, unavailable responses and the 390px layout. Two server-held credentials were checked against browser traffic and loaded responses; no exposure or direct browser-to-backend request was found. Reading this page performs no chain writes or inference purchase.

The latest frontend verification passes 22 credential-free regression checks, ESLint, TypeScript, formatting and `next build` with Node 22. The backend additions pass 116 unit tests, 58 PostgreSQL integration tests, TypeScript and the production build locally. The [testnet submission walkthrough](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/TESTNET_SUBMISSION.md) records reproducible commands, actual transactions, worker recovery and remaining gates. Browser verification observes a blocked integrated run, not a completed authenticated AI cycle.

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
[`be50793f719f8696736a648ad9ac9e4d3eb3a9a2`](https://github.com/AviraL0013/SymbioChain/commit/be50793f719f8696736a648ad9ac9e4d3eb3a9a2)
and backend
[`54883186106c70f2b83589f15f6003e9b87dbf92`](https://github.com/SuyashAlphaC/symbiochain-core/commit/54883186106c70f2b83589f15f6003e9b87dbf92).
Both are on `feature/business-revenue-loop`. Subsequent documentation commits
maintain release notes without changing those application revisions. These are
source candidates, not deployed or confirmed submitted revisions. The exact
[release manifest](https://github.com/SuyashAlphaC/symbiochain-core/blob/feature/business-revenue-loop/artifacts/business-release-manifest.json)
keeps those states separate.

The new `/business` page reads a curated backend projection through a fixed
same-origin route. It excludes invoices, deposits and internal transfers from
confirmed revenue, labels closed-window net as accountant-reported, and retains
unknown runway. Unimplemented credit purchasing and earned-proceeds NFT funding
remain explicit. No public financial-write proxy is added; LIVE business responses
remain outside this frontend's PAPER publication contract.

[Browser evidence](validation/business-browser.json) covers the actual isolated
Next.js/Fastify/PostgreSQL connection, zero confirmed revenue, unknown net/runway,
unfinished cash flows, stale/unavailable responses, a 390px viewport and absence
of credential exposure/direct backend requests. Backend receipt verification is
tested with injected RPC fixtures; the public RPC probe timed out and no actual
customer receipt was verified. These are implementation tests, not economic proof.

Deploy the additive backend migration and API before this frontend feature. No
hosted Supabase migration, Render deployment or Vercel production release was
performed for the feature. The existing deployed site remains the baseline in
the preceding section. Automatic credit purchases and business-funded NFT
settlement still need implementation, a supported provider contract and actual
earned proceeds; the owner currently has no mainnet funds/account/caps.
