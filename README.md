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

- `/`: SymbioChain landing page.
- `/dashboard`: swarm health, treasury balance, compute burn rate, survival time, decision stream, and recent settlements.
- `/topology`: EYE, BRAIN, and HAND agent status and interactions.
- `/verify`: TEE attestation verification.
- `/nfts`: Proof of Metabolism NFT gallery.

The frontend uses Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, GSAP/ScrollTrigger, and Lucide icons. shadcn paths are configured for future application components. State, chart, socket, and wallet dependencies will be added with their features.

### Typography

The landing page uses Clash Display SemiBold (600) for headlines and DM Sans Medium (500) for body text. Both permit free commercial website use. DM Sans is bundled with its SIL Open Font License. Clash Display is downloaded from Fontshare by `npm run fonts:setup --workspace=@symbiochain/web`, which also runs before development and builds. Its official files stay Git-ignored because the ITF Free Font License permits self-hosting but excludes repository redistribution. Font licenses are included under `apps/web/public/fonts`.

## Current status

The landing page includes responsive layouts, hero motion, a pinned three-agent illustration, a searchable animated network directory, feature sections, agent cards, and a horizontal security sequence. Phones and reduced-motion users receive readable alternatives. FAQ uses native disclosures; the footer includes cycling headlines and a branded cursor sticker trail.

Application routes remain explicit placeholders. Wallet connection, live telemetry, trading, backend integrations, and contracts are not implemented. Keep all work local until the owner authorizes pushing; publish nothing before November 1, 2026.

## Local secrets

Keep private keys, seed phrases, API credentials, and local environment files out of Git. Commit only environment templates containing placeholders.
