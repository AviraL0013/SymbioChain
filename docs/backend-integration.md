# Existing Vercel project release

Use the existing `symbiochain` project serving **https://symbiochain.vercel.app**. Preserve the owner/team, Node 22, Next.js configuration, `apps/web` root and access to workspace files. No new Vercel project or paid infrastructure is needed for this integration.

PRs #1–#4 are merged. The earlier accounting source is on main, but the November 6
read-only check still returns 404 for both hosted business endpoints; that feature
has not been verified as released. Production includes execution inspection, compute-budget telemetry, resumable event notification, protected PAPER operations and `/testnet`. The repository is public and operator configuration is complete. See [verified revisions and release evidence](validation.md#hosted-release-status). The checklist below applies to future updates; it does not describe pending initial deployment. Backend additions must remain compatible with the released frontend.

## Server-only environment

Configure Preview and Production deliberately in the existing project:

| Variable                | Value / source                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `BACKEND_URL`           | `https://symbiochain-core.onrender.com`                                                      |
| `BACKEND_READ_TOKEN`    | Existing backend `READ_TOKEN`, shared privately                                              |
| `SITE_URL`              | Production domain above; the intended preview origin for preview metadata                    |
| `BACKEND_ADMIN_TOKEN`   | Optional operator feature: existing backend `ADMIN_TOKEN`, shared privately                  |
| `OPERATOR_ACCESS_TOKEN` | Optional operator feature: a distinct randomly generated access code, at least 32 characters |

Both operator variables are required to unlock administrative controls. Missing variables disable that feature without breaking public data views. All three credentials must differ. Generate a fresh random access code, for example with `openssl rand -hex 32`, and deliver it privately to the operator. Do not put its output in chat, a PR, committed documentation or a `NEXT_PUBLIC_` variable.

Do not copy the backend `.env` into Vercel. This frontend does not need `DATABASE_URL`, NEAR recovery/worker keys, provider/model keys, Render credentials or the evidence encryption key. Keep local configuration in ignored `apps/web/.env.local`.

Operator cookies expire after 30 minutes. Production uses Secure, HttpOnly, SameSite=Strict and a host-scoped cookie. The access code is entered on `/operator`; backend bearer credentials are never returned to the browser. The operator page cannot arm LIVE or purchase inference.

## Release sequence

1. Confirm the existing Render backend includes the new `/api/viewer/status`, `/cycles`, `/cycles/:id` and `/events` routes, plus the operator expected-mode check.
2. Run `npm ci`, `npm test` and `npm run check` at the repository root with Node 22. Browser checks use a separate isolated local backend; see [testing](testing.md).
3. Configure the variables above in the existing Vercel project. Environment changes need a new deployment.
4. Push/deploy the PR branch as a protected preview in that same project. GitHub repository access and Vercel project access are separate. If Vercel refuses the commit author or project access, the existing owner must resolve that access or trigger the preview through their authorized account. Do not impersonate a teammate or create another project.
5. Complete the read-only preview checks below. Confirm operator configuration without funding, trades or crash injection on the shared hosted backend.
6. Merge through the repository's reviewed workflow, preserving the scoped commit history. Let the existing project's Git integration deploy production.
7. Repeat read-only production checks. Do not call a local build or unmerged PR a completed production release.

## Hosted acceptance

- `/api/swarm/snapshot`: 200, contractVersion 1, PAPER, exact integer strings, null runway and no backend credentials.
- `/api/swarm/status`: application allowance distinguished from unknown provider credits; configuration gates do not claim fresh TEE verification.
- `/cycles` and `/cycles/:id`: real persisted records and job attempts; no quote/profit fixtures invented by the browser.
- `/api/swarm/events`: bounded sanitized SSE; reconnects use sequence IDs, with polling fallback.
- `/nfts`: persisted unminted PAPER receipts with unknown net values until cost approval.
- `/verify?hash=...`: hash is prefilled; unknown hashes show no verified record, not an invalid-signature verdict.
- Anonymous `/api/operator/action` and private evidence requests fail. Cross-origin mutations fail even with an operator session. No arbitrary backend path can be proxied.
- `/operator`: missing optional configuration is explicit; configured access opens a short-lived session. Check state and logout only on the shared preview. The mutating recovery demonstration belongs on an isolated local PAPER backend.
- Browser traffic/storage, HTML and JavaScript contain no backend read/admin credentials or provider keys. Browser API calls remain same-origin.
- Unavailable/stale backend data stays visibly disconnected or stale, with no sample fallback.

## Rollback

Promote the preceding frontend deployment in the same project. Remove/rotate the optional operator access code to revoke sessions. Backend additions preserve the old viewer and require no database migration. Mainnet mode and funding remain separately unarmed.

## Business evidence source update

The `feature/business-revenue-loop` candidate adds `/business` and the fixed
`/api/swarm/business` proxy to `/api/business/status`, plus `/api/swarm/funding`
to `/api/business/funding`. Both endpoints are required by the updated page. It does not expose the
backend's financial-write APIs. Apply the backend's additive
`20261105120000_business_evidence` migration and run server-only database
hardening before deploying the paired backend, then release the frontend through
the existing project. See [candidate revisions](validation.md#business-feature-source-candidate).
The previous deployment remains valid without this page. An unavailable business
endpoint produces an explicit failure state rather than fabricated economic data.

The funding projection reports code capability separately from completed payments.
For the unfunded PAPER deployment, NFT funding must be implemented but disabled,
all completed payment counters must be zero, and compute purchasing must remain
unimplemented with its provider-protocol blocker. No financial-write proxy or
LIVE control was added. This extension requires no migration beyond the additive
business table already listed above.
