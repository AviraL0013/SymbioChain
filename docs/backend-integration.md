# Existing Vercel project handoff

The integration targets the existing teammate-owned project at **https://symbiochain.vercel.app**. No new Vercel project, account change or plan upgrade has been made.

## Preview access

Vercel blocked the pull request's automatic preview with: “Git author SuyashAlphaC must have access to the project on Vercel to create deployments.” GitHub repository access alone is insufficient. The existing project owner must handle the reviewed release through their own authorized account or resolve the project's Git collaboration permissions. The available collaboration options depend on the current plan; see [Vercel's project collaboration documentation](https://vercel.com/docs/deployments/troubleshoot-project-collaboration).

The source and production build have been checked locally against the hosted backend. A hosted preview remains unverified until that access requirement is resolved. The production domain has not been updated by this integration branch.

## Environment

In that project's **Settings → Environment Variables**, add the following server variables to the intended Preview and Production environments:

| Variable             | Value                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| `BACKEND_URL`        | `https://symbiochain-core.onrender.com`                                       |
| `BACKEND_READ_TOKEN` | The backend's existing `READ_TOKEN`, shared privately by its operator         |
| `SITE_URL`           | `https://symbiochain.vercel.app` in Production; the preview origin in Preview |

Never prefix the token with `NEXT_PUBLIC_`. Do not copy the backend `.env` into Vercel. This frontend does not need `ADMIN_TOKEN`, `DATABASE_URL`, wallet keys, `RENDER_API_KEY`, model credentials or encryption keys. Remove the unused `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_NEAR_NETWORK_ID` settings if they were added for the old preview.

For local development, use `apps/web/.env.local`, based on `.env.example`. Keep this file outside Git. Restart Next.js after setting it.

## Deploy the reviewed branch

1. Keep the existing Vercel project's framework and `apps/web` root directory. Keep workspace files outside that directory included, as required by `@symbiochain/shared`.
2. Run `npm ci`, `npm test` and `npm run check` with Node 22 at the repository root.
3. Deploy the integration branch as a **preview in the existing project**, using its current owner/team. If Git previews are enabled, use the pull request deployment. If the project is still CLI-managed, use the already-linked checkout and `vercel` without `--prod`. Confirm the project is `symbiochain` before deploying.
4. Confirm the Preview environment has the server read token. Environment changes require a new deployment.
5. Validate the preview, merge the reviewed branch, then deploy it to the existing production domain through the project's usual Git or CLI workflow.

Do not paste credentials into the pull request or chat. Access to the frontend GitHub repository does not grant access to its owner's Vercel project.

## Acceptance checks

- `/api/swarm/snapshot` returns 200, `contractVersion: 1`, `mode: PAPER`, integer string amounts and `survivalHours: null`. It sets `Cache-Control: private, no-store`.
- `/dashboard` matches the snapshot's treasury asset, balances, decisions and simulated settlements.
- `/topology` shows recorded heartbeats and decisions. It does not animate invented payments or display invented agent balances.
- `/nfts` shows actual execution receipt IDs, marks them unminted and leaves missing cost approvals unknown.
- `/verify` rejects malformed hashes. An unknown 64-character hash produces “No verified record found,” without declaring a signature invalid. A missing backend connection produces an unavailable result.
- Blocking `/api/swarm/snapshot` marks an already-loaded snapshot stale. Blocking it before first load produces disconnected empty states without sample records.
- Browser requests, response bodies, HTML, static JavaScript and browser storage contain no backend credentials. Browser network calls stay on `/api/swarm/*`; authorization is added only between Next.js and Fastify.
- POST to the public snapshot route is refused. Unknown proxy paths are not routed to the backend.

Telemetry refreshes every 10 seconds through bounded GET requests. Render's free service may take time to wake up; the UI retries and reports connection state. Durable workers and storage remain backend responsibilities.

## Rollback

Promote the preceding frontend deployment in the same Vercel project if a release fails. The new backend viewer endpoints are additive and do not change the old operator dashboard. No database migration is required. Remove the frontend read credential if access is being withdrawn.
