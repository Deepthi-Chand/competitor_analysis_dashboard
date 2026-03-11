# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│                                                             │
│   React App (port 3000)                                     │
│   ├── GlobalFilter  ← sticky filter bar                     │
│   ├── MarketHighlights                                      │
│   ├── MonthlyTrend  ← includes Parent Org picker            │
│   ├── MarketShare                                           │
│   └── BottomGrid                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP /api/*  (proxied via Nginx in prod,
                       │              CRA proxy in dev)
┌──────────────────────▼──────────────────────────────────────┐
│   Express Backend (port 3001)                               │
│                                                             │
│   Middleware stack (in order):                              │
│   1. Helmet (security headers)                              │
│   2. CORS (origin allowlist)                                │
│   3. Rate limiter  [USE_RATE_LIMIT]                         │
│   4. JSON body parser (10 kb limit)                         │
│   5. Morgan (HTTP logging)                                  │
│   6. Routes                                                 │
│      ├── /api/health                                        │
│      ├── /api/dashboard/*                                   │
│      │   └── validateQuery → cacheMiddleware → handler      │
│      └── /api-docs  (Swagger UI)                            │
│   7. Error handler                                          │
└───────────┬─────────────────────┬───────────────────────────┘
            │                     │
   ┌────────▼────────┐   ┌────────▼────────┐
   │  PostgreSQL 15  │   │    Redis 7       │
   │  (plan_data     │   │  [USE_CACHE]     │
   │   table)        │   │                  │
   └─────────────────┘   └─────────────────┘
```

---

## Request Lifecycle

1. **Filter change** in the UI triggers `useDashboard` hook via React's `useEffect`.
2. Hook calls `api.ts` service functions which build query params via `toParams()` / `toTrendParams()`.
3. Requests hit the Express backend.
4. **Validation middleware** (`validateQuery`) parses and validates query params with Zod. Unknown fields are stripped; invalid values return `400`.
5. **Cache middleware** checks Redis. On a hit, returns cached JSON immediately. On a miss, lets the request continue and wraps `res.json` to cache the response before sending. Bypassed entirely when `USE_CACHE=false`.
6. **Route handler** calls `svc.parseFilters()` to convert raw query strings to a typed `CAFilters` object, then calls the relevant service function.
7. **Service** builds a parameterised SQL query via `buildWhere()`, executes it, shapes the result, and returns it.
8. Response flows back through the middleware stack.

---

## Filter Architecture

Two categories of filter exist in the UI:

### Global Filters (affect all four widgets)
Managed in `Dashboard.tsx` state (`CAFilterState`). Sent as query params to all four API endpoints.

| Filter | Field | Cascade behaviour |
|--------|-------|-------------------|
| Period From | `period_from_year`, `period_from_month` | — |
| Period To | `period_to_year`, `period_to_month` | — |
| Region | `region` | resets State → All, County → All |
| State | `state` | resets County → All; options filtered by Region |
| County | `county` | options filtered by State |
| Ind-Grp Plans | `ind_grp_plans` | resets MA-MAPD-PDP, SNP, Plan Type |
| MA-MAPD-PDP | `ma_mapd_pdp` | resets SNP Plan Type, Plan Type |
| SNP Plan Type | `snp_plan_type` | resets Plan Type |
| Plan Type | `plan_type` | — |

### Parent Org Filter (affects MonthlyTrend + BottomGrid only)
Lives inside the `MonthlyTrend` component header. Stored in `filters.parent_orgs`. Sent only by `toTrendParams()` — excluded from `fetchMarketHighlights` and `fetchMarketShare`.

**Initial load behaviour:** `useDashboard` fetches `filter-options` first. If `parent_orgs` is empty, it stops and returns only `filterOptions`. `Dashboard.tsx` watches for this and auto-selects the top 5 orgs by enrollment, which triggers a second fetch with populated `parent_orgs`.

---

## Backend Module Structure

```
backend/src/
├── server.ts               Express app setup, middleware, graceful shutdown
├── types/index.ts          Shared TypeScript interfaces (CAFilters, response shapes)
├── config/
│   └── swagger.ts          swagger-jsdoc options, OpenAPI component schemas
├── routes/
│   ├── health.ts           GET /api/health
│   └── dashboard.ts        GET /api/dashboard/*
├── middleware/
│   ├── validate.ts         Zod schemas + validateQuery / validateParams
│   ├── cacheMiddleware.ts  Redis cache-aside (bypassed when USE_CACHE=false)
│   └── errorHandler.ts     Centralised error handler (hides stack traces in prod)
├── services/
│   └── dashboardService.ts All SQL queries, data shaping, filter parsing
├── db/
│   ├── db.ts               pg Pool, typed query helper, checkConnection
│   ├── seed.ts             Database seed script
│   └── migrations/
│       └── 20240101000000_initial_schema.ts   Knex initial migration
├── cache/
│   └── cache.ts            ioredis client, get/set/invalidate, SHA-256 key hashing
└── utils/
    └── regionMapping.ts    State → region lookup, getStatesInRegion()
```

## Frontend Module Structure

```
frontend/src/
├── types/index.ts          CAFilterState, DEFAULT_FILTERS, all API response types
├── services/
│   └── api.ts              Axios instance, toParams(), toTrendParams(), fetch* functions
├── hooks/
│   └── useDashboard.ts     Fetches all dashboard data; coordinates filter → API → state
├── components/
│   ├── Dashboard.tsx        Layout, filter state, wires everything together
│   ├── GlobalFilter.tsx     Sticky filter bar with cascading selects/multi-selects
│   ├── MonthlyTrend.tsx     Stacked sparklines (monthly) or MoM/QoQ/YoY (fitted view)
│   ├── MarketHighlights.tsx KPI cards — enrollment snapshots and growth
│   ├── MarketShare.tsx      Per-org market share breakdown
│   ├── BottomGrid.tsx       Per-org column grid: market share, plan count, enrollments, plan types
│   └── ui/                 shadcn/ui primitives (card, button, select, popover, checkbox…)
├── utils/
│   ├── dataTransform.ts    formatEnrollment, formatCurrency, formatPercentage, etc.
│   └── regionMapping.ts    STATE_TO_REGION map, getStatesInRegion(), getRegionForState()
└── lib/
    ├── utils.ts            cn() Tailwind class merger
    └── validation.ts       Zod schema for dashboard filters (frontend-side)
```

---

## Data Flow Diagram — Filter Change

```
User changes a filter
        │
        ▼
GlobalFilter.onChange / MonthlyTrend.onOrgsChange
        │
        ▼
Dashboard.handleFilterChange → setFilters(...)
        │
        ▼
useDashboard(filters) — useEffect detects changed dependency
        │
        ▼
fetchAll(filters)
  ├── fetchFilterOptions()         → GET /api/dashboard/filter-options
  │     (always re-fetches to keep options fresh)
  │
  ├── [if parent_orgs empty → stop, wait for Dashboard to set defaults]
  │
  ├── fetchMarketHighlights(f)     → GET /api/dashboard/market-highlights?...
  ├── fetchMonthlyTrend(f)         → GET /api/dashboard/monthly-trend?...&parent_orgs=...
  ├── fetchMarketShare(f)          → GET /api/dashboard/market-share?...
  └── fetchBottomGrid(f)           → GET /api/dashboard/bottom-grid?...&parent_orgs=...
        │
        ▼
setState({ highlights, trend, marketShare, bottomGrid })
        │
        ▼
React re-renders affected components
```
