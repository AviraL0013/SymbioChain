# SymbioChain

An autonomous AI swarm on NEAR, designed to earn the compute it needs to stay alive.

[Live demo](https://symbiochain.vercel.app) | [Mission Control](https://symbiochain.vercel.app/dashboard) | [Architecture](docs/architecture.md)

Three agents share one loop: **EYE** finds candidate routes, **BRAIN** assesses risk, and **HAND** prepares cross-chain execution. The proposed metabolic rule ties the swarm's survival to its ability to fund inference.

## Explore the frontend

| Page                                                        | What it shows                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| [Landing](https://symbiochain.vercel.app)                   | Product story, animated agents, network directory, and FAQs          |
| [Mission Control](https://symbiochain.vercel.app/dashboard) | Treasury history, survival metrics, decision stream, and settlements |
| [Swarm topology](https://symbiochain.vercel.app/topology)   | Agent roles, funding states, and simulated transfers                 |
| [Proof verifier](https://symbiochain.vercel.app/verify)     | Attestation input and sample verification states                     |
| [NFT gallery](https://symbiochain.vercel.app/nfts)          | Proof of Metabolism artwork and collection previews                  |

The frontend is implemented with clearly labeled sample data. Wallet connection, live backend events, real attestation verification, trading, and contracts are pending integration. Sample settlements and proofs do not represent on-chain activity or verified results.

## Run locally

Use **Node.js 22.13 or later in the 22.x line** and **npm 10 or later**.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Development and production builds download the required Clash Display fonts from Fontshare when missing, so the first run needs internet access.

For configuration, copy `apps/web/.env.example` to `apps/web/.env.local`. Set `SITE_URL` to the deployment origin for production metadata. Backend and network variables are reserved for integration; setting them does not connect the current demo to live services.

| Command         | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `npm run dev`   | Start the local frontend                                 |
| `npm run check` | Check formatting, lint, TypeScript, and production build |
| `npm run build` | Build the frontend                                       |
| `npm run start` | Serve the production build locally                       |

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, GSAP, Recharts, and Lucide. Clash Display headlines pair with DM Sans body text. Animations include reduced-motion alternatives.

## Repository

```text
apps/
  web/                  Next.js frontend
  backend/              Reserved for agent orchestration
packages/
  shared/               Shared API and event types
contracts/              Reserved for NEAR contracts
docs/
  architecture.md       Structure and integration boundaries
```

Route files stay thin. Page behavior lives under `apps/web/src/features`; shared UI lives under `components/ui`. The backend lead owns orchestration, credentials, persistence, verification, and transaction submission.

## Assets and credentials

DM Sans is bundled with its SIL Open Font License. Clash Display is fetched by `apps/web/scripts/setup-fonts.mjs`; its font files stay outside Git. Font licenses and chain icon notices accompany the assets in `apps/web/public`.

Keep private keys, seed phrases, API credentials, and local environment files outside Git. Never put secrets in `NEXT_PUBLIC_*` variables.
