# Development Guide

## Prerequisites

- Docker Desktop (recommended)
- Node.js 18+ and npm (for running outside Docker)
- PostgreSQL 15 and Redis 7 (if running locally without Docker)

---

## Option 1 — Docker (recommended)

### Development mode (hot reload, cache off, rate limiting off)

```bash
cd HWAIDashboard
docker-compose -f docker-compose.dev.yml up --build
```

- Frontend hot-reloads from `./frontend/src`
- Backend restarts on file changes via `nodemon` / `ts-node`
- PostgreSQL data persists in a named volume (`postgres_data_dev`)

### Production mode

```bash
docker-compose up --build
```

- Frontend is a compiled Nginx static build
- Cache and rate limiting are enabled

### Useful commands

```bash
# Rebuild a single service
docker-compose -f docker-compose.dev.yml up --build backend

# View backend logs
docker logs hwaidashboard-backend-dev -f

# Open a psql shell
docker exec -it hwaidashboard-postgres-dev psql -U user -d dashboarddb

# Open a Redis CLI
docker exec -it hwaidashboard-redis-dev redis-cli

# Stop and remove containers + volumes
docker-compose -f docker-compose.dev.yml down -v
```

---

## Option 2 — Local (no Docker)

### 1. Database & Redis

Start PostgreSQL and Redis locally, or use Docker just for the services:

```bash
docker-compose -f docker-compose.dev.yml up postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and REDIS_URL to your local instances

npm install
npm run migrate        # run Knex migrations
npx ts-node src/db/seed.ts   # seed data (if applicable)
npm run dev            # starts ts-node with nodemon
```

Backend runs at http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm start              # starts CRA dev server on port 3000
```

API calls are proxied to `http://backend:3001` via the `"proxy"` field in `package.json`. If your backend is on `localhost:3001` locally, update the proxy to:
```json
"proxy": "http://localhost:3001"
```

---

## Environment Flags (dev defaults)

| Flag | Dev default | Effect |
|------|-------------|--------|
| `USE_CACHE` | `false` | Skips Redis — all requests hit PostgreSQL directly |
| `USE_RATE_LIMIT` | `false` | No request throttling |

To test caching locally, set `USE_CACHE=true` in `.env`.

---

## Running Migrations

```bash
cd backend

# Apply all pending migrations
npm run migrate

# Roll back the last batch
npm run migrate:rollback
```

---

## Project Scripts

### Backend (`backend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `ts-node src/server.ts` | Start with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/server.js` | Run compiled build |
| `migrate` | `knex migrate:latest` | Run pending migrations |
| `migrate:rollback` | `knex migrate:rollback` | Roll back last batch |

### Frontend (`frontend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `craco start` | Dev server with hot reload |
| `build` | `craco build` | Production build to `build/` |
| `test` | `craco test` | Run tests |

---

## Code Structure

See [architecture.md](./architecture.md) for the full module breakdown.

Key conventions:
- All backend source is TypeScript under `backend/src/`; compiled to `backend/dist/` for production
- All frontend source is TypeScript/TSX under `frontend/src/`
- shadcn/ui components live in `frontend/src/components/ui/` — treat these as library code
- Shared types between API and frontend are mirrored manually (no shared package)

---

## Adding a New API Endpoint

1. Add a service function in `backend/src/services/dashboardService.ts`
2. Add a route in `backend/src/routes/dashboard.ts` with `validateQuery(caFiltersSchema)` and `cacheMiddleware('your-endpoint-name')`
3. If the endpoint takes new query params, add them to `caFiltersSchema` in `backend/src/middleware/validate.ts`
4. Add JSDoc `@openapi` annotation on the route for Swagger
5. Add the corresponding fetch function in `frontend/src/services/api.ts`
6. Add types to `frontend/src/types/index.ts`

---

## Swagger / API Docs

Available at http://localhost:3001/api-docs when the backend is running.

Generated from:
- Component schemas defined in `backend/src/config/swagger.ts`
- `@openapi` JSDoc annotations on each route in `backend/src/routes/`
