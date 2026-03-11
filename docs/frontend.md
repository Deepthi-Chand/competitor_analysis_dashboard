# Frontend

## Component Tree

```
App
└── TooltipProvider
    └── Dashboard
        ├── GlobalFilter              ← sticky filter bar (all global filters)
        │
        ├── MarketHighlights          ← KPI cards (enrollment snapshots, growth %)
        │
        ├── MonthlyTrend              ← sparkline grid + Parent Org picker + view toggle
        │   └── [Parent Org Popover]
        │
        ├── MarketShare               ← per-org bar chart / table
        │
        └── BottomGrid                ← 5-column org grid
            └── [per org: market share, # plans, enrollments, plan type sparklines]
```

---

## Dashboard.tsx

The root layout component. Owns all filter state and wires data to child components.

**State**
```typescript
const [filters, setFilters] = useState<CAFilterState>(DEFAULT_FILTERS);
```

**Data**
```typescript
const { filterOptions, highlights, trend, marketShare, bottomGrid, loading, error, refetch }
  = useDashboard(filters);
```

**Default org selection** — on first load, `filterOptions` is returned before data. A `useEffect` watches for this and auto-selects the top 5 orgs:
```typescript
useEffect(() => {
  if (filterOptions?.parent_orgs?.length > 0 && filters.parent_orgs.length === 0) {
    setFilters(prev => ({ ...prev, parent_orgs: filterOptions.parent_orgs.slice(0, 5) }));
  }
}, [filterOptions, filters.parent_orgs.length]);
```

---

## GlobalFilter.tsx

Sticky filter bar rendered at the top of the page. Renders all global filters (Period, Region, State, County, Ind-Grp Plans, MA-MAPD-PDP, SNP Plan Type, Plan Type).

**Cascading reset rules** (applied in `onChange` calls):

| Filter changed | Fields reset |
|----------------|-------------|
| Region | `state: 'All'`, `county: 'All'` |
| State | `county: 'All'` |
| Ind-Grp Plans | `ma_mapd_pdp: []`, `snp_plan_type: []`, `plan_type: []` |
| MA-MAPD-PDP | `snp_plan_type: []`, `plan_type: []` |
| SNP Plan Type | `plan_type: []` |

**State options** are dynamically filtered by the selected region using `getStatesInRegion()`.

**County options** come from `filterOptions.counties[filters.state]`.

Multi-select filters (MA-MAPD-PDP, SNP Plan Type, Plan Type) use a Popover + Checkbox pattern.

---

## MonthlyTrend.tsx

Displays enrollment trends per organisation. Has two view modes toggled by the user.

**Props**
```typescript
interface MonthlyTrendProps {
  data: MonthlyTrendPoint[];
  loading: boolean;
  selectedOrgs: string[];      // current parent org filter selection
  allOrgs: string[];           // full org list from filterOptions
  onOrgsChange: (orgs: string[]) => void;
}
```

**View Modes**

| Mode | Description |
|------|-------------|
| Monthly | One horizontal sparkline per org, sorted by latest enrollment descending. Shows start value, trend line, end value. |
| Fitted | Three micro-charts per org: MoM (month-over-month %), QoQ (quarter-over-quarter %), YoY (year-over-year %). |

**`orgDataByOrg` memo** — pre-computes per-org `data`, `startValue`, `endValue`, `minVal`, `maxVal`, `momData`, `qoqData`, `yoyData` from the raw `MonthlyTrendPoint[]` array.

**Parent Org Picker** — a compact Popover rendered in the card header. Changing it calls `onOrgsChange`, which updates `filters.parent_orgs` in Dashboard and triggers a refetch of `monthly-trend` and `bottom-grid` only.

---

## MarketHighlights.tsx

KPI cards showing:
- Period 1 snapshot: month/year, total enrollments, eligibles, penetration %
- Period 2 snapshot: same fields
- Enrollment growth % between the two periods

---

## MarketShare.tsx

Visualises `MarketShareOrg[]`. Shows each org's enrollment, market share %, and whether their growth is above or below the market average (`growth_vs_avg`, `above_avg`).

---

## BottomGrid.tsx

Renders up to 5 organisation columns (limited to `data.slice(0, 5)`). Each column shows:

1. **Org name header** (coloured by org)
2. **Market share** — line sparkline over 2023–2025
3. **No. of Plans** — bar chart over 2023–2025
4. **Enrollments** — bar chart over 2023–2025
5. **Plan Type Enrollments** — multi-line chart by plan type over 2023–2025

On screens < 1280px, the row label column is hidden and inline labels appear instead.

---

## useDashboard Hook

`frontend/src/hooks/useDashboard.ts`

Fetches all dashboard data in response to filter changes.

```typescript
const useDashboard = (filters: CAFilterState) => {
  // returns: { filterOptions, highlights, trend, marketShare, bottomGrid, loading, error, refetch }
}
```

**Dependency array** — the `useEffect` watches individual filter fields (not the whole object reference) to avoid spurious refetches:
```typescript
useEffect(() => { fetchAll(filters); }, [
  fetchAll,
  filters.region, filters.state, filters.county,
  filters.period_from_year, filters.period_from_month,
  filters.period_to_year, filters.period_to_month,
  filters.ind_grp_plans,
  filters.ma_mapd_pdp.join(','),
  filters.snp_plan_type.join(','),
  filters.plan_type.join(','),
  filters.parent_orgs.join(','),
]);
```

**Two-phase load** — if `parent_orgs` is empty, `fetchAll` returns after fetching only `filterOptions`, allowing Dashboard to set defaults before triggering a full data fetch.

---

## api.ts — Parameter Building

Two functions build query params from `CAFilterState`:

```typescript
// Used by: market-highlights, market-share, filter-options
toParams(f)        → includes region, state, county, period, ind_grp_plans, ma_mapd_pdp, snp_plan_type, plan_type

// Used by: monthly-trend, bottom-grid
toTrendParams(f)   → toParams(f) + parent_orgs
```

`parent_orgs` is intentionally excluded from `market-highlights` and `market-share` so those widgets always show the full market picture regardless of the org selection in the trend chart.

---

## Types

Key types in `frontend/src/types/index.ts`:

```typescript
CAFilterState          // complete filter state object
DEFAULT_FILTERS        // initial values
MonthlyTrendPoint      // { period, year, month_num, [org: string]: number }
MarketHighlightsData   // { period1, period2, enrollment_growth_pct }
MarketShareOrg         // { org, enrollments, market_share_pct, growth_vs_avg, above_avg }
BottomGridRow          // { org, color, market_share[], num_plans[], enrollments[], plan_type_enrollments[] }
FilterOptions          // all dropdown options from the API
```

---

## Utilities

### `dataTransform.ts`
| Function | Description |
|----------|-------------|
| `formatEnrollment(n)` | Formats large numbers: `1.2M`, `340K`, `9,500` |
| `formatCurrency(n)` | USD with no decimal places |
| `formatPercentage(n)` | `"12.3%"` with null safety |
| `calculateTotal(data, key)` | Sum a numeric key across an array |
| `calculateAverage(data, key)` | Average a numeric key |
| `sortByKey(data, key, asc)` | Immutable sort |
| `getChartColors()` | Returns the 8-colour palette |

### `regionMapping.ts`
| Function | Description |
|----------|-------------|
| `getStatesInRegion(region, allStates)` | Returns states belonging to a region |
| `getRegionForState(state)` | Reverse lookup — state → region |

### `lib/validation.ts`
Zod schema for frontend-side filter validation:
```typescript
dashboardFiltersSchema   // validates timeRange and category enums
```
