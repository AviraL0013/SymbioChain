# Existing-project release verification

Initial owner release is complete as of November 5, 2026. PR #3 merged at
`83d46d8eb5db2257989bf1c831694da20617635e`. The repository is public, the existing
Vercel project is READY, `/testnet` is live, operator variables are configured,
and the owner verified login, PAPER state and logout. No initial publication,
operator configuration or merge step remains pending.

For a subsequent reviewed release, use the existing
`avirals-projects-27965510/symbiochain` project and domain
`https://symbiochain.vercel.app`. Preserve Node 22, `apps/web`, workspace access,
contributor attribution and server-only credentials. Do not create another
project or change the production domain.

1. Review the precise source revisions and backend compatibility. The business
   evidence feature requires the backend's additive business migration and API
   before its frontend is released. See [revision scope](validation.md#business-feature-source-candidate).
2. Require passing tests, full checks and a protected preview in the same project.
   Keep read/admin credentials server-only and distinct from the operator access code.
   The preview should make unavailable or stale data explicit.
3. Verify snapshot, cycles, proof, testnet and operator discovery. For the business
   feature, verify `/business`, `/api/swarm/business` and `/api/swarm/funding` show zero confirmed revenue,
   unknown net/runway, implemented-but-disabled NFT funding and unimplemented purchases in the unfunded PAPER
   deployment. Do not fabricate records when a backend route is unavailable.
4. Inspect browser traffic, HTML, JavaScript and storage for backend credentials.
   Browser API requests must remain same-origin. Verify operator login/state/logout,
   anonymous-action rejection and cross-origin rejection without hosted mutations.
5. After review, merge using a merge commit, let the existing project deploy, and
   repeat read-only production checks. Record the exact source commit and deployment.

No funding, trade, mint, crash or paid inference is required for these checks.
The mainnet account/caps are still unset and the owner has no mainnet funds.
The TEE deployment gate and provider purchase protocol remain unresolved. NFT
conversion/distribution recovery code is implemented but disabled and lacks funded
mainnet validation. The state-preserving testnet code upgrade is not revenue. Submission of the hackathon form or
publication of a social post is outside this runbook.

November 6 update: accounting PR #4 and backend PR #1 are already merged, but
both hosted business endpoints return 404. Do not re-merge them or treat a main
merge as release proof. The new funding code is in frontend PR #5 and backend
PR #2. Release the paired backend/migration first and validate both business
endpoints before the frontend. Use the existing projects and keep funding disabled.
