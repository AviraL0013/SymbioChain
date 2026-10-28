# SymbioChain

SymbioChain is a planned autonomous AI agent swarm on NEAR. The proposed swarm monitors cross-chain order flow, assesses risk through TEE-backed inference, and executes cross-chain transactions using Chain Signatures. Its metabolic rule ties continued operation to the ability to fund compute costs.

## Team responsibilities

- Frontend lead: UI/UX, mission control dashboard, wallet connection, and real-time data integration.
- Backend lead: agent orchestration, contracts, persistence, and external API integration.

## Local setup

Use Node.js 22.13 or later in the 22.x line and npm 10 or later. From the repository root:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Copy `apps/web/.env.example` to `apps/web/.env.local` when configuring integrations. The scaffold does not call external services.

Run `npm run check` for formatting, lint, TypeScript, and a production build. No deployment or remote CI is configured.

## Structure

- `apps/web`: frontend application.
- `apps/backend`: backend lead's future service.
- `packages/shared`: shared API and socket event types.
- `contracts`: backend lead's future NEAR contracts.
- `docs`: [architecture](docs/architecture.md) and [design reference](docs/design/reference.md).

## Planned frontend

- `/`: Ctrl-inspired SymbioChain landing page.
- `/dashboard`: swarm health, treasury balance, compute burn rate, survival time, decision stream, and recent settlements.
- `/topology`: EYE, BRAIN, and HAND agent status and interactions.
- `/verify`: TEE attestation verification.
- `/nfts`: Proof of Metabolism NFT gallery.

The scaffold uses Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, and shadcn path configuration. State, chart, socket, animation, and wallet dependencies will be added with their features. Review dependency advisories before deployment.

## Current status

Runnable scaffold and explicit route placeholders only. No page designs, animations, wallet connection, mock telemetry, integrations, or contracts are implemented. Keep all work local until the owner authorizes pushing; publish nothing before November 1, 2026.

## Local secrets

Keep private keys, seed phrases, API credentials, and local environment files out of Git. Commit only environment templates containing placeholders.
