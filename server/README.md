# TechSolve API — server

Express + TypeScript + Sequelize (PostgreSQL) backend, with Redis-backed
caching, a BullMQ email queue, Stripe payments, and Socket.IO chat.

## Local setup (without Docker)

```bash
cp .env.example .env        # then fill in the values
npm install
npm run migrate             # applies everything in migrations/
npm run dev                 # API on http://localhost:3002
```

The email worker is a **separate process** — run it alongside `npm run dev`
in another terminal:

```bash
npm run worker
```

Both need Postgres and Redis reachable at the hosts/ports in `.env`. The
fastest way to get those locally is `docker compose up -d postgres redis
mailhog` from the project root (see below) — mailhog gives you a local
inbox at http://localhost:8025 so `SMTP_HOST=localhost` / `SMTP_PORT=1025`
just works without a real email provider.

## Everything with Docker

From the `web-internship/` project root (not this folder):

```bash
cp server/.env.example server/.env   # then fill in the values
docker compose up -d
```

This starts Postgres, Redis, mailhog, the API (`server`), and the email
worker (`worker`) as separate containers. Run migrations once the `server`
container's Postgres dependency is healthy:

```bash
docker compose exec server npx sequelize-cli db:migrate
```

## Testing

```bash
npm test          # vitest run
npm run test:watch
```

- `tests/unit/` — pure logic (Zod schemas), no services required.
- `tests/api/` — Supertest against the Express `app` directly (imported
  from `app.ts`, which has no side effects — no DB/Redis connection is
  opened just by importing it). Covers health checks, validation
  responses, auth rejection, and rate limiting.
- `tests/integration/` — hits a real Postgres database. These
  automatically skip (rather than fail) if no database is reachable, so
  `npm test` still works with nothing running locally. To run them for
  real: `docker compose up -d postgres redis` then `npm run migrate`
  first.

CI (`.github/workflows/ci.yml`) runs all of the above against real
Postgres/Redis service containers on every push and PR.

## New in this pass

| Area | Where |
|---|---|
| Indexes on hot-path columns | `migrations/20260923101725-add-performance-indexes.js` |
| Redis client + connection options | `config/redis.ts` |
| Response caching (`GET /pg/products`) | `middleware/cache.ts`, `pgRoutes/productRoutes.ts` |
| Email templates | `services/emailService.ts` |
| Email queue (producer) | `queues/emailQueue.ts` |
| Email worker (consumer, separate process) | `workers/emailWorker.ts` |
| Unit / API / integration tests | `tests/`, `vitest.config.ts` |
| App/server split for testability | `app.ts` (Express app) vs `server.ts` (entrypoint: HTTP server + Socket.IO + `listen`) |
| Dockerfile (multi-stage) | `Dockerfile`, `.dockerignore` |
| docker-compose (api + worker + postgres + redis + mailhog) | `../docker-compose.yml` |
| CI/CD | `../.github/workflows/ci.yml` |
| Deployment blueprint | `../render.yaml` |

`app.ts` was split out of `server.ts` specifically so tests can import the
Express app without triggering a real Postgres connection or opening a
port — `server.ts` is now just the process entrypoint that wires up
Socket.IO and calls `listen()`.
