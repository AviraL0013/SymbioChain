# Backend source

The running backend is maintained in [SuyashAlphaC/symbiochain-core](https://github.com/SuyashAlphaC/symbiochain-core). It contains Fastify, Prisma/PostgreSQL, durable workers, NEAR/Intents/provider integrations and the treasury contract. This directory is a pointer, not an unimplemented production service.

The frontend consumes strict publication contracts and fixed administrative operations through its Next.js server. See [architecture](../../docs/architecture.md), [deployment](../../docs/backend-integration.md) and [isolated integration tests](../../docs/testing.md).
