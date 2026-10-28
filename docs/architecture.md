# Architecture

One npm workspace repository with one lockfile. The frontend is runnable; backend and contract directories are ownership boundaries only.

```text
apps/
  web/
    public/brand/         Original supplied logo
    public/fonts/         Future licensed local fonts
    public/stickers/      Future original footer artwork
    src/app/
      (marketing)/        Landing page at /
      (app)/              /dashboard, /topology, /verify, /nfts
    src/components/ui/    shadcn primitives, added when needed
    src/components/shared/ Cross-route components
    src/features/
      landing/            Landing sections and footer motion
      swarm/              Health, decisions, settlements, store
      topology/           Agent visualization
      tee/                Attestation verification
      nfts/               NFT queries and presentation
      wallet/             NEAR wallet connection
    src/hooks/            Cross-feature React hooks
    src/lib/              Shared frontend utilities
    src/styles/           Global CSS and visual tokens
  backend/                Future orchestration service
packages/shared/          Frontend/backend API contracts
contracts/                Future NEAR contracts
docs/design/              Reference analysis and motion requirements
```

Route groups do not add URL segments. Mission Control moves from the original brief's `/` to `/dashboard` because `/` is reserved for the requested landing page.

Keep route entry points small. Place feature components, hooks, and state with their owning feature. Extract utilities when reused. Do not duplicate shared data types or invent service layers.

No wallet, socket, inference, trade, or contract code runs in this scaffold. Add state, socket, chart, animation, and wallet dependencies when implementing their features. `components.json` configures shadcn paths; no UI components have been generated.

Next.js 16.4.3, React 19.3.1, and ESLint 10 replace the original brief's Next.js 14 baseline with the owner's approval. Use Node.js 22.13 or later in the 22.x line. Recheck dependency advisories before deployment.

## API agreement

The supplied health, decision, and transaction contracts live in `packages/shared/src/types.ts`. Proposed timestamp convention: Unix milliseconds. Amounts remain decimal strings. Balances and compute costs must use the same unit when calculating survival.

Still agree with the backend lead on authentication, errors, snapshots, reconnection, stale-data thresholds, inter-agent payments, NFT responses, kill-switch recovery events, and TEE responses. TypeScript does not validate untrusted runtime payloads.
