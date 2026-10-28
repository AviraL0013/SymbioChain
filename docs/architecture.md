# Architecture

SymbioChain uses npm workspaces with one lockfile. The frontend runs independently with sample data. Backend and contract directories reserve ownership boundaries for future integration.

## Frontend structure

```text
apps/web/src/
  app/
    (marketing)/         Landing page at /
    (app)/               Dashboard, topology, verifier, and gallery routes
  components/ui/         Reusable UI primitives
  features/
    application/         Shared navigation, shell, and wallet preview
    landing/             Product sections, artwork, and scroll motion
    dashboard/           Treasury chart, sample events, and demo state
    topology/            Agent visualization and transfer animation
    verify/              Attestation input and sample result states
    nfts/                Collection previews and generated SVG artwork
  lib/                   Shared frontend utilities
  styles/                Global styles and fonts
packages/shared/src/     API and event type definitions
```

Route groups do not add URL segments. The landing page uses `/`; Mission Control uses `/dashboard`. Route files compose feature components rather than owning behavior.

Landing motion uses GSAP and ScrollTrigger. Application pages share navigation, dialogs, spacing, and typography. Demo events and recovery states run locally; they do not submit transactions or call verification services.

## Integration boundaries

The supplied health, decision, and transaction contracts live in `packages/shared/src/types.ts`. Amounts remain decimal strings. The proposed timestamp convention is Unix milliseconds. Balances and compute costs must use the same unit when calculating survival.

Before connecting the backend, agree on authentication, errors, initial snapshots, reconnection, stale-data thresholds, inter-agent payments, NFT responses, kill-switch recovery events, and TEE verification responses. TypeScript types do not validate incoming payloads at runtime.

Wallet connection, backend event transport, inference, transaction execution, and contracts remain pending. Credentials and signing belong outside browser code. The current wallet UI is a preview, and arbitrary attestation hashes cannot produce a verified result without a verifier service.

## Build and hosting

Use Node.js 22.13 or later in the 22.x line. `npm run check` runs formatting, lint, TypeScript checks, and a production build. The font setup script fetches missing Clash Display assets from Fontshare before development and builds.

The frontend is hosted on Vercel with `apps/web` as the project root. Set `SITE_URL` to the public origin for metadata. Deployment was performed through the CLI; Git-based deployments are not configured.
