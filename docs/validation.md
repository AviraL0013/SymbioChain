# Validation scope

The integration has two separate browser proofs:

- [Isolated PAPER lifecycle](validation/paper-browser.json): a real Chromium browser exercised the Next.js/Fastify/PostgreSQL path, simulated funding, a paused Scout job, a targeted worker crash, reclaim of that same job on attempt two, settlement-bound cost approval, a closed cycle, unminted receipt, private evidence access and logout. Both 1440px and 390px layouts were checked. No paid model or wallet operation was available to this isolated backend.
- [Production build against hosted data](validation/hosted-read.json): the local optimized frontend read the existing Render backend, including persisted cycles, compute allowance and resumable event readiness. Anonymous administrative requests returned 401. Browser traffic and assets did not expose the actual backend credentials. No hosted mutation was performed. This proves the application/backend connection; it is not a claim that the branch has been deployed to Vercel.

The frontend passes 19 credential-free regression checks, ESLint, TypeScript, formatting and `next build` with Node 22. The backend additions pass its CI backend/contract jobs at commit `72611fa8d9a83bda5d2e35731d68de7dcce1bd06`: [workflow run](https://github.com/SuyashAlphaC/symbiochain-core/actions/runs/41390734080). Its deployment is live on the existing Render service in PAPER mode.

The production build keeps backend read/admin tokens and the separate operator access secret server-only. The browser suite additionally verifies rejection of cross-origin operations, duplicate-safe request identifiers, logout/private-evidence rejection, no direct browser-to-backend requests and no backend credentials in browser storage.

## Hosted release status

The new frontend features remain a branch/PR until the existing Vercel project owner completes the preview and release workflow. The local Vercel login cannot resolve the teammate-owned `avirals-projects-27965510` scope. Repository write permission does not grant access to that Vercel project. No new project or account was created.

The owner must configure the two optional operator server variables, verify a protected preview in the existing project, merge the reviewed PR and verify its production deployment. Use the [ready-to-run teammate prompt](teammate-release-prompt.md) and [configuration checklist](backend-integration.md). The existing public production dashboard continues using its earlier read-only integration until that release.

None of these checks completes mainnet funding, proves profitable live trading, purchases compute credits, approves an unverified image measurement or mints an on-chain NFT. Those are separate backend gates and remain explicitly disclosed in the README.
