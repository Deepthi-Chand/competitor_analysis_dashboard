# API Reference

Base URL: `http://localhost:3001`

Interactive docs (Swagger UI): `http://localhost:3001/api-docs`

All dashboard endpoints accept query parameters as described below. Array-type filters are sent as comma-separated strings (e.g. `ma_mapd_pdp=MA,MAPD`).

---

## GET /api/health

Returns connectivity status of PostgreSQL and Redis.

**Response 200 — healthy**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-11T10:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

**Response 503 — unhealthy**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-03-11T10:00:00.000Z",
  "services": {
    "database": "disconnected",
    "redis": "connected"
  }
}
```

---

## GET /api/dashboard/filter-options

Returns all available filter values. Cached. No parameters.

**Response 200**
```json
{
  "regions": ["All", "North", "East", "South", "West"],
  "states": ["All", "Alabama", "Alaska", ...],
  "counties": {
    "All": ["All"],
    "Ohio": ["All", "Cuyahoga", "Franklin", ...]
  },
  "plan_types": ["HMO", "HMO-POS", "Local PPO", ...],
  "snp_plan_types": ["NON-SNP", "Dual-Eligible", "Institutional", "Chronic or Disabling Condition"],
  "ind_grp_options": ["Individual MA Plans", "Group MA Plans"],
  "ma_mapd_pdp_options": ["MA", "MAPD", "PDP"],
  "parent_orgs": ["UHG", "Humana Inc.", "CVS", ...]
}
```

---

## GET /api/dashboard/market-highlights

Returns enrollment snapshots for two periods and the growth between them.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `region` | string | — | Geographic region (e.g. `North`) |
| `state` | string | — | US state name |
| `county` | string | — | County name |
| `period_from_year` | integer | 2025 | Start year |
| `period_from_month` | integer | 2 | Start month (1–12) |
| `period_to_year` | integer | 2026 | End year |
| `period_to_month` | integer | 2 | End month (1–12) |
| `ind_grp_plans` | string | — | `Individual MA Plans` or `Group MA Plans` |
| `ma_mapd_pdp` | string | — | Comma-separated: `MA`, `MAPD`, `PDP` |
| `snp_plan_type` | string | — | Comma-separated SNP types |
| `plan_type` | string | — | Comma-separated plan types |

**Response 200**
```json
{
  "period1": {
    "year": 2025,
    "month": "February",
    "enrollments": 1200000,
    "eligibles": 4500000,
    "penetration_pct": 26.7
  },
  "period2": {
    "year": 2026,
    "month": "February",
    "enrollments": 1320000,
    "eligibles": 4600000,
    "penetration_pct": 28.7
  },
  "enrollment_growth_pct": 10.0
}
```

---

## GET /api/dashboard/monthly-trend

Returns monthly enrollment totals per parent organisation over the selected period.

**Query Parameters**

All parameters from [market-highlights](#get-apidashboardmarket-highlights), plus:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `parent_orgs` | string | — | Comma-separated org names to include |

**Response 200** — array of period objects, one entry per month. Each entry has dynamic keys for each org.

```json
[
  {
    "period": "Feb-25",
    "year": 2025,
    "month_num": 2,
    "UHG": 380000,
    "Humana Inc.": 210000,
    "CVS": 195000
  },
  {
    "period": "Mar-25",
    "year": 2025,
    "month_num": 3,
    "UHG": 385000,
    "Humana Inc.": 212000,
    "CVS": 197000
  }
]
```

---

## GET /api/dashboard/market-share

Returns per-org market share at the `period_to` snapshot, with growth vs. market average.

**Query Parameters**

Same as [market-highlights](#get-apidashboardmarket-highlights). `parent_orgs` is **not** applied here — all orgs are always returned.

**Response 200**
```json
[
  {
    "org": "UHG",
    "enrollments": 380000,
    "market_share_pct": 28.79,
    "growth_vs_avg": 1.23,
    "above_avg": true
  },
  {
    "org": "Humana Inc.",
    "enrollments": 210000,
    "market_share_pct": 15.91,
    "growth_vs_avg": -0.54,
    "above_avg": false
  }
]
```

---

## GET /api/dashboard/bottom-grid

Returns per-org summary data (market share, plan count, enrollments, plan type breakdown) for 2023–2025. Filtered to the orgs in `parent_orgs`; if not supplied, defaults to the top 5 by enrollment.

**Query Parameters**

All parameters from [market-highlights](#get-apidashboardmarket-highlights), plus:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `parent_orgs` | string | — | Comma-separated org names (up to 5 shown) |

**Response 200**
```json
[
  {
    "org": "UHG",
    "color": "#FBBF24",
    "market_share": [
      { "year": 2023, "value": 27.1 },
      { "year": 2024, "value": 28.0 },
      { "year": 2025, "value": 28.8 }
    ],
    "num_plans": [
      { "year": 2023, "value": 142 },
      { "year": 2024, "value": 155 },
      { "year": 2025, "value": 161 }
    ],
    "enrollments": [
      { "year": 2023, "value": 340000 },
      { "year": 2024, "value": 362000 },
      { "year": 2025, "value": 380000 }
    ],
    "plan_type_enrollments": [
      { "year": 2023, "plan_type": "HMO", "value": 180000 },
      { "year": 2023, "plan_type": "Local PPO", "value": 160000 }
    ]
  }
]
```

---

## Error Responses

All errors return a consistent JSON envelope:

```json
{
  "error": "ValidationError",
  "message": "Invalid value for period_from_month",
  "timestamp": "2026-03-11T10:00:00.000Z"
}
```

| Status | `error` value | Cause |
|--------|---------------|-------|
| 400 | `ValidationError` | Invalid query parameter (Zod validation failed) |
| 404 | `NotFoundError` | Resource not found |
| 429 | `TooManyRequests` | Rate limit exceeded (only when `USE_RATE_LIMIT=true`) |
| 500 | `Error` | Unexpected server error (message is generic in production) |

---

## Caching

All dashboard endpoints use Redis cache-aside. Cache is bypassed entirely when `USE_CACHE=false` (default in development).

- **Cache key:** `dashboard:{endpoint}:{sha256(params)[:16]}`
- **Default TTL:** 300 s (configurable via `CACHE_TTL`)
- **Production TTL:** 86 400 s (set in `docker-compose.yml`)

`filter-options` is also cached since it rarely changes.
