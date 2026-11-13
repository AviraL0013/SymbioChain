# Backend integration and release

[Overview](../README.md) · [Architecture](architecture.md) · [Testing](testing.md) · [Backend operations](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/OPERATIONS.md)

## Existing deployment

Use the existing `avirals-projects-27965510/symbiochain` Vercel project serving
**https://symbiochain.vercel.app**. Preserve Node 22, Next.js configuration, the
`apps/web` root and workspace access. The backend remains on the existing
[Render service](https://symbiochain-core.onrender.com/readyz), using Node 24.

Production observes LIVE mainnet with automated execution **DISARMED** and AI
**QUARANTINED**. Human-authorized mainnet transfers and the isolated unverified
Cloud completion are captured evidence, not actions initiated by opening a page.
The [backend verification guide](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/VERIFICATION.md)
separates actual transfers, manual inference, PAPER simulation and unproven claims.

`/api/swarm/runtime` chooses the explicit mode before telemetry starts. LIVE
uses fixed mainnet server routes and strict shared schemas; the old PAPER
publication refuses LIVE. Missing data becomes unavailable/stale rather than
sample balances. Wallet connection requests no key grant or transaction and
does not authenticate an operator.

## Server-only environment

Use ignored `apps/web/.env.local` locally. Configure Preview and Production
deliberately in the existing Vercel project:

| Variable                | Value / source                                                                 |
| ----------------------- | ------------------------------------------------------------------------------ |
| `BACKEND_URL`           | `https://symbiochain-core.onrender.com`, or an isolated local backend          |
| `BACKEND_READ_TOKEN`    | Matching backend read token, shared privately                                  |
| `SITE_URL`              | Production domain above, or the intended local/preview origin                  |
| `BACKEND_ADMIN_TOKEN`   | Optional private PAPER operator feature: matching backend admin token          |
| `OPERATOR_ACCESS_TOKEN` | Optional operator feature: distinct random access code, at least 32 characters |

Both operator variables are required to unlock administrative controls. All
three credentials must differ. Missing operator configuration disables controls
without breaking public views. Never publish these values or use `NEXT_PUBLIC_`
for credentials. Public judging needs no login, token or wallet.

Do not copy the backend `.env` into Vercel. The frontend needs no database URL,
NEAR recovery/worker key, AI key, Cloud session, Render credential or evidence
encryption key. The browser uses only same-origin Next.js routes.

Operator login creates a 30-minute HttpOnly, SameSite=Strict cookie, with Secure
and host scope in production. No credential enters browser storage. Operator
actions are separately checked against PAPER mode and fixed schemas; this
interface cannot arm LIVE, purchase inference or submit a financial payout.

## Release checks

1. Validate compatible backend schemas first. Preserve its database, encryption
   key, tokens and cumulative AI budget identity.
2. Run `npm ci`, `npm test` and `npm run check` here with Node 22. Use an
   isolated localhost backend for mutating browser checks; see [testing](testing.md).
3. Deploy a protected preview through the existing Vercel Git integration.
   Environment changes require a new deployment. Project/repository access must
   be resolved by their owner, not by creating a replacement project.
4. Check dashboard/evidence reads, strict mode selection, wallet connection
   parameters, proof lookup, stale/disconnected recovery and mobile layout.
   Verify no backend credential in traffic, storage, HTML or JavaScript, and no
   browser request directly to the backend.
5. Check anonymous/cross-origin operator rejection. On shared hosted systems,
   test only login, state and logout; crash/funding mutations belong on localhost.
6. Merge with the scoped commit history preserved, wait for the existing
   project's production deployment and repeat the read-only checks.

`/api/release` exposes the public frontend commit, deployment ID and environment.
The [backend release guide](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/RELEASE_REVISIONS.md)
links the frozen paired application record. Newer documentation-only deployments
are not new mainnet execution evidence. The records in [validation/](validation/)
retain their original dates; they do not override current mode or deployment.

## Rollback

Promote a compatible prior frontend in the same Vercel project. Rotate/remove
the operator access code to revoke sessions. Preserve financial records and
schema compatibility. Restore a compatible PAPER backend/environment before a
PAPER-only frontend; never run an older backend image under new LIVE settings.
Keep execution disarmed during recovery and reconcile existing payment
identities. Documentation cleanup requires no change to runtime configuration.
