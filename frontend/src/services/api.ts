import axios, { AxiosResponse } from 'axios';
import {
  BottomGridRow,
  CAFilterState,
  FilterOptions,
  MarketHighlightsData,
  MarketShareOrg,
  MonthlyTrendPoint,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (r: AxiosResponse) => r,
  (error: unknown) => {
    const e = error as { response?: { data?: unknown }; message?: string };
    console.error('API Error:', e.response?.data || e.message);
    return Promise.reject(error);
  }
);

function toParams(f: Partial<CAFilterState>): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.region)             p.region             = f.region;
  if (f.state)              p.state              = f.state;
  if (f.county)             p.county             = f.county;
  if (f.period_from_year)   p.period_from_year   = String(f.period_from_year);
  if (f.period_from_month)  p.period_from_month  = String(f.period_from_month);
  if (f.period_to_year)     p.period_to_year     = String(f.period_to_year);
  if (f.period_to_month)    p.period_to_month    = String(f.period_to_month);
  if (f.ind_grp_plans)      p.ind_grp_plans      = f.ind_grp_plans;
  if (f.ma_mapd_pdp?.length)  p.ma_mapd_pdp      = f.ma_mapd_pdp.join(',');
  if (f.snp_plan_type?.length) p.snp_plan_type   = f.snp_plan_type.join(',');
  if (f.plan_type?.length)  p.plan_type          = f.plan_type.join(',');
  return p;
}

// Extends base params with parent_orgs — used only for trend + bottom grid
function toTrendParams(f: Partial<CAFilterState>): Record<string, string> {
  const p = toParams(f);
  if (f.parent_orgs?.length) p.parent_orgs = f.parent_orgs.join(',');
  return p;
}

export const fetchFilterOptions = (): Promise<FilterOptions> =>
  api.get<FilterOptions>('/dashboard/filter-options').then(r => r.data);

export const fetchMarketHighlights = (f: Partial<CAFilterState>): Promise<MarketHighlightsData> =>
  api.get<MarketHighlightsData>('/dashboard/market-highlights', { params: toParams(f) }).then(r => r.data);

export const fetchMonthlyTrend = (f: Partial<CAFilterState>): Promise<MonthlyTrendPoint[]> =>
  api.get<MonthlyTrendPoint[]>('/dashboard/monthly-trend', { params: toTrendParams(f) }).then(r => r.data);

export const fetchMarketShare = (f: Partial<CAFilterState>): Promise<MarketShareOrg[]> =>
  api.get<MarketShareOrg[]>('/dashboard/market-share', { params: toParams(f) }).then(r => r.data);

export const fetchBottomGrid = (f: Partial<CAFilterState>): Promise<BottomGridRow[]> =>
  api.get<BottomGridRow[]>('/dashboard/bottom-grid', { params: toTrendParams(f) }).then(r => r.data);

export const checkHealth = (): Promise<unknown> =>
  api.get('/health').then(r => r.data);

export default api;
