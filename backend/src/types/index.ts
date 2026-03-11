export interface CAFilters {
  region?: string;
  state?: string;
  county?: string;
  period_from_year?: number;
  period_from_month?: number;
  period_to_year?: number;
  period_to_month?: number;
  ind_grp_plans?: string;
  ma_mapd_pdp?: string[];
  snp_plan_type?: string[];
  plan_type?: string[];
  parent_orgs?: string[];
}

export interface MarketHighlightsData {
  period1: { year: number; month: string; enrollments: number; eligibles: number; penetration_pct: number };
  period2: { year: number; month: string; enrollments: number; eligibles: number; penetration_pct: number };
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

export interface BottomGridRow {
  org: string;
  color: string;
  market_share: { year: number; value: number }[];
  num_plans: { year: number; value: number }[];
  enrollments: { year: number; value: number }[];
  plan_type_enrollments: { year: number; plan_type: string; value: number }[];
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

export interface AppError extends Error {
  statusCode?: number;
}
