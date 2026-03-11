# Configuration

## Environment Variables

All backend environment variables are read at startup. Copy `backend/.env.example` to `backend/.env` for local development.

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/dashboarddb` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend HTTP port |
| `CACHE_TTL` | `300` | Redis cache TTL in seconds |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | — | Set to `production` to suppress query logging |

---

## Feature Flags

Both flags use the same convention: only the exact string `'true'` enables the feature. Any other value (including missing/unset) disables it. A log line is printed at startup when a flag is off.

### `USE_CACHE`

Controls Redis caching in `cacheMiddleware.ts`.

| Value | Behaviour |
|-------|-----------|
| `false` (default) | All requests hit the database. Cache middleware is a no-op passthrough. |
| `true` | Responses are cached in Redis. Cache key: `dashboard:{endpoint}:{sha256(params)[:16]}`. TTL set by `CACHE_TTL`. |

**When to enable:** Always enable in production. Disable during development to see live query results without needing to flush Redis.

### `USE_RATE_LIMIT`

Controls `express-rate-limit` in `server.ts`.

| Value | Behaviour |
|-------|-----------|
| `false` (default) | No rate limiting applied. |
| `true` | 100 requests per 15 minutes per IP. Exceeding returns `429 TooManyRequests`. |

**When to enable:** Always enable in production. Disable during development to avoid hitting limits during rapid iteration.

---

## Per-Environment Defaults

### `.env.example` (local baseline)
```
PORT=3001
DATABASE_URL=postgresql://user:password@postgres:5432/dashboarddb
REDIS_URL=redis://redis:6379
CACHE_TTL=300
USE_CACHE=false
USE_RATE_LIMIT=false
ALLOWED_ORIGINS=http://localhost:3000
```

### `docker-compose.yml` (production)
```yaml
USE_CACHE: 'true'
USE_RATE_LIMIT: 'true'
CACHE_TTL: 86400          # 24 hours
```

### `docker-compose.dev.yml` (development)
```yaml
USE_CACHE: 'false'
USE_RATE_LIMIT: 'false'
CACHE_TTL: 86400
NODE_ENV: development
```

---

## Frontend Configuration

The frontend has no `.env` file in development — API calls use the CRA proxy:

```json
// frontend/package.json
"proxy": "http://backend:3001"
```

In production, Nginx handles proxying (`/api/*` → `http://backend:3001`). See `frontend/nginx.conf`.

---

## Knex / Database Configuration

`backend/knexfile.ts` controls migration behaviour per environment:

```typescript
development: {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: { directory: './src/db/migrations', extension: 'ts' },
  seeds:      { directory: './src/db/seeds' },
},
production: {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: { directory: './dist/db/migrations' },
}
```
