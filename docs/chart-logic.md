# Chart Logic Documentation

This document describes the business logic and SQL queries used for each chart in the dashboard.

---

## Computed Fields

These fields are computed during data seeding (`backend/src/db/seed.ts`):

### IND_GRP_PLANS
Determines if a plan is Individual or Group based on Plan ID.

```
IF LEN(Plan_ID) = 3 AND LEFT(Plan_ID, 1) = '8' 
THEN 'Group MA Plans' 
ELSE 'Individual MA Plans'
```

**Implementation:**
```typescript
function computeIndGrp(planId: number): string {
  const s = String(planId);
  return (s.length === 3 && s[0] === '8') ? 'Group MA Plans' : 'Individual MA Plans';
}
```

### MA_MAPD_PDP
Categorizes plans into MA, MAPD, or PDP based on Contract ID and Part D offering.

```
IF (LEFT(Contract_ID, 1) = 'H' OR LEFT(Contract_ID, 1) = 'R') AND Offers_Part_D = 'Yes' 
THEN 'MAPD'
ELSEIF (LEFT(Contract_ID, 1) = 'H' OR LEFT(Contract_ID, 1) = 'R') AND Offers_Part_D = 'No' 
THEN 'MA'
ELSE 'PDP'
```

**Implementation:**
```typescript
function computeMaMapdPdp(contractId: string, offersPartD: string): string {
  const first = contractId?.[0] ?? '';
  if (['H','R'].includes(first) && offersPartD === 'Yes') return 'MAPD';
  if (['H','R'].includes(first) && offersPartD === 'No')  return 'MA';
  return 'PDP';
}
```

---

## 1. Market Highlights

**Location:** `getMarketHighlights()` in `dashboardService.ts`

**Purpose:** Shows enrollment summary comparing two time periods (from/to).

### Metrics

| Metric | Formula |
|--------|---------|
| **Enrollments** | `SUM(enrollments)` for the period |
| **Eligibles** | `SUM(ma_eligibles)` for the period |
| **Penetration %** | `(enrollments / eligibles) * 100` |
| **Enrollment Growth %** | `((period2_enrollments - period1_enrollments) / period1_enrollments) * 100` |

### SQL Query
```sql
SELECT
  year, month_num,
  SUM(enrollments)  AS enrollments,
  SUM(ma_eligibles) AS eligibles
FROM plan_data
WHERE {filters}
GROUP BY year, month_num
ORDER BY year, month_num
```

---

## 2. Monthly Trend

**Location:** `getMonthlyTrend()` in `dashboardService.ts`

**Purpose:** Shows enrollment trends over time by parent organization.

### Metrics

| Metric | Formula |
|--------|---------|
| **Enrollments** | `SUM(enrollments)` per org per month |
| **MoM %** (Fitted View) | `((current_month - previous_month) / previous_month) * 100` |
| **QoQ %** (Fitted View) | `((current_quarter_avg - previous_quarter_avg) / previous_quarter_avg) * 100` |
| **YoY %** (Fitted View) | `((current_month - same_month_last_year) / same_month_last_year) * 100` |

### SQL Query
```sql
SELECT
  year, month_num,
  parent_organization AS org,
  SUM(enrollments) AS enrollments
FROM plan_data
WHERE {filters}
GROUP BY year, month_num, parent_organization
ORDER BY year, month_num, enrollments DESC
```

### Period Filter
Results are filtered to include only months within the selected period range:
```
(year * 100 + month_num) >= period_from AND (year * 100 + month_num) <= period_to
```

---

## 3. Market Share

**Location:** `getMarketShare()` in `dashboardService.ts`

**Purpose:** Shows each organization's market share and growth vs market average.

### Metrics

| Metric | Formula |
|--------|---------|
| **Enrollments** | `SUM(enrollments)` for current period |
| **Market Share %** | `(org_enrollments / total_market_enrollments) * 100` |
| **Market Growth Rate** | `((total_current - total_prior) / total_prior) * 100` |
| **Org Growth Rate** | `((org_current - org_prior) / org_prior) * 100` |
| **Growth vs Avg** | `org_growth_rate - market_growth_rate` |
| **Above Avg** | `org_growth_rate > market_growth_rate` |

### SQL Queries

**Current Month:**
```sql
SELECT parent_organization AS org, SUM(enrollments) AS enrollments
FROM plan_data
WHERE {filters} AND year = {to_year} AND month_num = {to_month}
GROUP BY parent_organization
ORDER BY enrollments DESC
```

**Previous Month (for MoM comparison):**
```sql
SELECT parent_organization AS org, SUM(enrollments) AS enrollments
FROM plan_data
WHERE {filters} AND year = {prev_year} AND month_num = {prev_month}
GROUP BY parent_organization
```

---

## 4. Bottom Grid (Organization Comparison)

**Location:** `getBottomGrid()` in `dashboardService.ts`

**Purpose:** Shows detailed metrics for top 5 organizations across the last 3 years.

### Sub-Charts

#### 4.1 Market Share (per org per year)
| Metric | Formula |
|--------|---------|
| **Market Share %** | `(org_enrollments / year_total_enrollments) * 100` |

#### 4.2 No of Plans (per org per year)
| Metric | Formula |
|--------|---------|
| **Num Plans** | `COUNT(DISTINCT contract_id || '-' || plan_id)` |

> **Note:** A plan is uniquely identified by the combination of `contract_id` and `plan_id`, not just `plan_id` alone.

#### 4.3 Enrollments (per org per year)
| Metric | Formula |
|--------|---------|
| **Enrollments** | `SUM(enrollments)` |

#### 4.4 Plan Type Enrollments (per org per year per plan_type)
| Metric | Formula |
|--------|---------|
| **Enrollments by Plan Type** | `SUM(enrollments)` grouped by `plan_type` |

### SQL Queries

**Enrollments by Plan Type:**
```sql
SELECT
  parent_organization AS org,
  year,
  plan_type,
  SUM(enrollments) AS enrollments,
  SUM(SUM(enrollments)) OVER (PARTITION BY year) AS year_total
FROM plan_data
WHERE {filters} AND year IN ({last_3_years})
GROUP BY parent_organization, year, plan_type
ORDER BY parent_organization, year, enrollments DESC
```

**Distinct Plan Count:**
```sql
SELECT
  parent_organization AS org,
  year,
  COUNT(DISTINCT contract_id || '-' || CAST(plan_id AS TEXT)) AS num_plans
FROM plan_data
WHERE {filters} AND year IN ({last_3_years})
GROUP BY parent_organization, year
```

---

## Global Filters

All charts respect the following filters (applied via `buildWhere()` function):

| Filter | Column | Condition |
|--------|--------|-----------|
| Region | `state` | `state = ANY(states_in_region)` |
| State | `state` | `state = {value}` |
| County | `county` | `county = {value}` |
| Ind/Grp Plans | `ind_grp_plans` | `ind_grp_plans = {value}` |
| MA/MAPD/PDP | `ma_mapd_pdp` | `ma_mapd_pdp = ANY({values})` |
| SNP Type | `special_needs_plan_type` | `special_needs_plan_type = ANY({values})` |
| Plan Type | `plan_type` | `plan_type = ANY({values})` |

### Default Filter Values
- **Period From:** February 2025
- **Period To:** February 2026

---

## Data Source

All queries run against the `plan_data` table. See `docs/database.md` for schema details.
