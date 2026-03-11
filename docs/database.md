# Database

PostgreSQL 15. Connection managed via `pg` connection pool (`backend/src/db/db.ts`).

---

## Core Table — `plan_data`

This is the primary fact table that all queries run against. It stores one row per plan per month.

| Column | Type | Description |
|--------|------|-------------|
| `year` | integer | Enrollment year |
| `month_num` | integer | Enrollment month (1–12) |
| `state` | text | US state name |
| `county` | text | County name |
| `parent_organization` | text | Top-level org name (e.g. `UHG`, `Humana Inc.`) |
| `plan_id` | text | Unique plan identifier |
| `plan_type` | text | Plan type (e.g. `HMO`, `Local PPO`) |
| `ma_mapd_pdp` | text | Plan category: `MA`, `MAPD`, or `PDP` |
| `special_needs_plan_type` | text | SNP type or `NON-SNP` |
| `ind_grp_plans` | text | `Individual MA Plans` or `Group MA Plans` |
| `enrollments` | integer | Total enrolled members |
| `ma_eligibles` | numeric | Medicare-eligible population in the area |

> Note: The exact DDL for `plan_data` is not in the Knex migrations (it is populated via seed/import). The migrations handle the metadata/config tables.

---

## Migration Tables (Knex)

Defined in `backend/src/db/migrations/20240101000000_initial_schema.ts`.

### `chart_configs`
Stores chart display configuration.

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar PK | e.g. `chart-one` |
| `title` | varchar | Display title |
| `type` | varchar | `line`, `bar`, `area`, `pie` |
| `description` | text | |
| `is_active` | boolean | Default `true` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `dashboard_data_snapshots`
Optional caching table for pre-computed chart data.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `chart_id` | varchar | FK → `chart_configs.id` (cascade delete) |
| `time_range` | varchar | |
| `category` | varchar | |
| `data` | jsonb | |
| `created_at` | timestamp | Default now |

### `filter_configs`
Stores filter display metadata.

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar PK | |
| `label` | varchar | Display label |
| `sort_order` | integer | Default 0 |
| `created_at` / `updated_at` | timestamp | |

### `filter_options`
Stores individual filter dropdown values.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `filter_id` | varchar | FK → `filter_configs.id` (cascade delete) |
| `value` | varchar | |
| `label` | varchar | |
| `sort_order` | integer | Default 0 |

---

## Running Migrations

```bash
cd backend

# Run all pending migrations
npm run migrate

# Roll back the last batch
npm run migrate:rollback
```

Knex config is in `backend/knexfile.ts`. In development it points to `src/db/migrations/` with `.ts` extension; in production it uses the compiled `dist/db/migrations/`.

---

## Seeding

```bash
cd backend
npx ts-node src/db/seed.ts
```

The seed script (`backend/src/db/seed.ts`) populates initial data. Review it before running against a production database.

---

## Connection Pool

Configured in `backend/src/db/db.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

All queries use the `query(sql, params)` helper which logs execution time outside production.

---

## Query Patterns

### `buildWhere(f, startIdx)`

All service functions use this shared helper to build a parameterised `WHERE` clause from a `CAFilters` object. It handles:

- Region → expands to `state = ANY($n)` using `getStatesInRegion()`
- State (when no region) → `state = $n`
- County → `county = $n`
- `ind_grp_plans` → exact match
- `ma_mapd_pdp` → `ma_mapd_pdp = ANY($n)`
- `snp_plan_type` → `special_needs_plan_type = ANY($n)`
- `plan_type` → `plan_type = ANY($n)`

`parent_orgs` is **not** applied by `buildWhere`. It is filtered in application code after the query runs (in `getMonthlyTrend` and `getBottomGrid`).

### Period filtering

`getMonthlyTrend` fetches all rows matching the `WHERE` clause then post-filters in JS:
```typescript
const filtered = result.rows.filter(r => {
  const ym = +r.year * 100 + +r.month_num;
  return ym >= fy * 100 + fm && ym <= ty * 100 + tm;
});
```

`getMarketHighlights` and `getMarketShare` inline the period condition directly into the SQL using literal integer values (not user-supplied strings — safe since they come from Zod-coerced numbers).
