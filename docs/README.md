# HWAIDashboard — Documentation

**HealthWorks AI Competitor Analysis Dashboard** — a full-stack web application for visualising Medicare Advantage (MA) enrollment trends, market share, and plan breakdowns by competitor organisation.

---

## Contents

| Doc | Description |
|-----|-------------|
| [architecture.md](./architecture.md) | System design, data flow, component relationships |
| [api.md](./api.md) | All backend endpoints — params, responses, error codes |
| [frontend.md](./frontend.md) | Component tree, filter architecture, hooks |
| [database.md](./database.md) | Schema, tables, migrations, seeding |
| [configuration.md](./configuration.md) | All environment variables and feature flags |
| [development.md](./development.md) | Local setup, Docker, running the app |

---

## Quick Start

```bash
# Development (hot reload, cache off, rate limiting off)
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger UI: http://localhost:3001/api-docs
- Health check: http://localhost:3001/api/health

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Recharts, shadcn/ui, Tailwind CSS, Axios, Zod |
| Backend | Node.js, Express, TypeScript, Zod, Helmet, express-rate-limit |
| Database | PostgreSQL 15 (via `pg`) |
| Cache | Redis 7 (via `ioredis`) |
| Migrations | Knex |
| API Docs | Swagger UI (swagger-jsdoc) |
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx (production frontend) |
