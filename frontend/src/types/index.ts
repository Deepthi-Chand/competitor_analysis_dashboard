// ── Filter State ─────────────────────────────────────────────────────────────
export interface CAFilterState {
  region: string;
  state: string;
  county: string;
  period_from_year: number;
  period_from_month: number;
  period_to_year: number;
  period_to_month: number;
  ind_grp_plans: string;
  ma_mapd_pdp: string[];
  snp_plan_type: string[];
  plan_type: string[];
  parent_orgs: string[];
}

export const DEFAULT_FILTERS: CAFilterState = {
  region:             'All',
  state:              'All',
  county:             'All',
  period_from_year:   2025,
  period_from_month:  2,
  period_to_year:     2026,
  period_to_month:    2,
  ind_grp_plans:      'Individual MA Plans',
  ma_mapd_pdp:        ['MA', 'MAPD', 'PDP'],
  snp_plan_type:      ['NON-SNP'],
  plan_type:          [],
  parent_orgs:        [],
};

// ── API Response Types ────────────────────────────────────────────────────────
export interface PeriodSnapshot {
  year: number;
  month: string;
  enrollments: number;
  eligibles: number;
  penetration_pct: number;
}

export interface MarketHighlightsData {
  period1: PeriodSnapshot;
  period2: PeriodSnapshot;
  enrollment_growth_pct: number;
}

export interface MonthlyTrendPoint {
  period: string;
  year: number;
  month_num: number;
  [org: string]: string | number;
}

export interface MarketShareOrg {
  org: string;
  enrollments: number;
  market_share_pct: number;
  growth_vs_avg: number | null;
  above_avg: boolean | null;
}

export interface YearValue {
  year: number;
  value: number;
}

export interface PlanTypeValue {
  year: number;
  plan_type: string;
  value: number;
}

export interface BottomGridRow {
  org: string;
  color: string;
  market_share: YearValue[];
  num_plans: YearValue[];
  enrollments: YearValue[];
  plan_type_enrollments: PlanTypeValue[];
}

export interface FilterOptions {
  regions: string[];
  states: string[];
  counties: Record<string, string[]>;
  plan_types: string[];
  snp_plan_types: string[];
  ind_grp_options: string[];
  ma_mapd_pdp_options: string[];
  parent_orgs: string[];
}
