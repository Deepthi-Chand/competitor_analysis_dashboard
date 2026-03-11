import { query } from '../db/db';
import { BottomGridRow, CAFilters, FilterOptions, MarketHighlightsData, MarketShareOrg, MonthlyTrendPoint } from '../types';
import { REGIONS, getStatesInRegion } from '../utils/regionMapping';

const MONTH_NAMES: Record<number, string> = {
  1:'January',2:'February',3:'March',4:'April',5:'May',6:'June',
  7:'July',8:'August',9:'September',10:'October',11:'November',12:'December'
};
const MONTH_ABBR: Record<number, string> = {
  1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',
  7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'
};

const ORG_COLORS: Record<string, string> = {
  'Elevance':                           '#6366F1',
  'Elevance Health':                    '#6366F1',
  'Humana Inc.':                        '#F472B6',
  'UHG':                                '#FBBF24',
  'CVS':                                '#818CF8',
  'MEDICAL MUTUAL OF OHIO':             '#94A3B8',
  'Medical Mutual of Ohio':             '#94A3B8',
  'Centene Corporation':                '#FB923C',
  'Devoted Health, Inc.':               '#34D399',
  'The Cigna Group':                    '#38BDF8',
  'Health Care Service Corporation':    '#A78BFA',
};
const DEFAULT_COLOR = '#CBD5E1';

function getOrgColor(org: string): string {
  return ORG_COLORS[org] ?? DEFAULT_COLOR;
}

function buildWhere(f: CAFilters, startIdx = 1): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = startIdx;

  if (f.region && f.region !== 'All') {
    const statesInRegion = getStatesInRegion(f.region);
    if (statesInRegion.length > 0) {
      conditions.push(`state = ANY($${idx++})`);
      params.push(statesInRegion);
    }
  } else if (f.state && f.state !== 'All') {
    conditions.push(`state = $${idx++}`);
    params.push(f.state);
  }
  if (f.county && f.county !== 'All') {
    conditions.push(`county = $${idx++}`);
    params.push(f.county);
  }
  if (f.ind_grp_plans) {
    conditions.push(`ind_grp_plans = $${idx++}`);
    params.push(f.ind_grp_plans);
  }
  if (f.ma_mapd_pdp && f.ma_mapd_pdp.length > 0) {
    conditions.push(`ma_mapd_pdp = ANY($${idx++})`);
    params.push(f.ma_mapd_pdp);
  }
  if (f.snp_plan_type && f.snp_plan_type.length > 0) {
    conditions.push(`special_needs_plan_type = ANY($${idx++})`);
    params.push(f.snp_plan_type);
  }
  if (f.plan_type && f.plan_type.length > 0) {
    conditions.push(`plan_type = ANY($${idx++})`);
    params.push(f.plan_type);
  }

  const clause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return { clause, params };
}

function parseMulti(val: string | undefined): string[] | undefined {
  if (!val) return undefined;
  return val.split(',').map(v => v.trim()).filter(Boolean);
}

export function parseFilters(raw: Record<string, string>): CAFilters {
  return {
    region:            raw.region,
    state:             raw.state,
    county:            raw.county,
    period_from_year:  raw.period_from_year  ? parseInt(raw.period_from_year)  : 2025,
    period_from_month: raw.period_from_month ? parseInt(raw.period_from_month) : 2,
    period_to_year:    raw.period_to_year    ? parseInt(raw.period_to_year)    : 2026,
    period_to_month:   raw.period_to_month   ? parseInt(raw.period_to_month)   : 2,
    ind_grp_plans:     raw.ind_grp_plans,
    ma_mapd_pdp:       parseMulti(raw.ma_mapd_pdp),
    snp_plan_type:     parseMulti(raw.snp_plan_type),
    plan_type:         parseMulti(raw.plan_type),
    parent_orgs:       parseMulti(raw.parent_orgs),
  };
}

export async function getMarketHighlights(f: CAFilters): Promise<MarketHighlightsData> {
  const { clause, params } = buildWhere(f);

  const sql = `
    SELECT
      year, month_num,
      SUM(enrollments)  AS enrollments,
      SUM(ma_eligibles) AS eligibles
    FROM plan_data
    ${clause}
    GROUP BY year, month_num
    ORDER BY year, month_num
  `;

  const result = await query(sql, params);
  const rows = result.rows;

  const fy = f.period_from_year ?? 2025;
  const fm = f.period_from_month ?? 2;
  const ty = f.period_to_year ?? 2026;
  const tm = f.period_to_month ?? 2;

  const p1 = rows.find(r => +r.year === fy && +r.month_num === fm);
  const p2 = rows.find(r => +r.year === ty && +r.month_num === tm);

  const calcPenetration = (enr: number, elig: number) =>
    elig > 0 ? Math.round((enr / elig) * 1000) / 10 : 0;

  const e1 = p1 ? parseInt(p1.enrollments) : 0;
  const el1 = p1 ? parseFloat(p1.eligibles) : 0;
  const e2 = p2 ? parseInt(p2.enrollments) : 0;
  const el2 = p2 ? parseFloat(p2.eligibles) : 0;
  const growth = e1 > 0 ? Math.round(((e2 - e1) / e1) * 10000) / 100 : 0;

  return {
    period1: { year: fy, month: MONTH_NAMES[fm], enrollments: e1, eligibles: el1, penetration_pct: calcPenetration(e1, el1) },
    period2: { year: ty, month: MONTH_NAMES[tm], enrollments: e2, eligibles: el2, penetration_pct: calcPenetration(e2, el2) },
    enrollment_growth_pct: growth,
  };
}

export async function getMonthlyTrend(f: CAFilters): Promise<MonthlyTrendPoint[]> {
  const fy = f.period_from_year ?? 2025;
  const fm = f.period_from_month ?? 2;
  const ty = f.period_to_year ?? 2026;
  const tm = f.period_to_month ?? 2;

  const { clause, params } = buildWhere(f);

  const sql = `
    SELECT
      year, month_num,
      parent_organization AS org,
      SUM(enrollments) AS enrollments
    FROM plan_data
    ${clause}
    GROUP BY year, month_num, parent_organization
    ORDER BY year, month_num, enrollments DESC
  `;

  const result = await query(sql, params);

  const filtered = result.rows.filter(r => {
    const ym = +r.year * 100 + +r.month_num;
    return ym >= fy * 100 + fm && ym <= ty * 100 + tm;
  });

  const selectedOrgs = f.parent_orgs && f.parent_orgs.length > 0 ? f.parent_orgs : null;

  const periodMap: Record<string, MonthlyTrendPoint> = {};
  filtered.forEach(r => {
    if (selectedOrgs && !selectedOrgs.includes(r.org)) return;
    const key = `${r.year}-${String(r.month_num).padStart(2,'0')}`;
    if (!periodMap[key]) {
      periodMap[key] = {
        period: `${MONTH_ABBR[+r.month_num]}-${String(r.year).slice(2)}`,
        year: +r.year,
        month_num: +r.month_num,
      };
    }
    periodMap[key][r.org] = parseInt(r.enrollments);
  });

  return Object.values(periodMap).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month_num - b.month_num
  );
}

export async function getMarketShare(f: CAFilters): Promise<MarketShareOrg[]> {
  const ty = f.period_to_year ?? 2026;
  const tm = f.period_to_month ?? 2;
  const fy = f.period_from_year ?? 2025;
  const fm = f.period_from_month ?? 2;

  const { clause, params } = buildWhere(f);

  const sqlCurrent = `
    SELECT parent_organization AS org, SUM(enrollments) AS enrollments
    FROM plan_data
    ${clause ? clause + ' AND' : 'WHERE'} year = ${ty} AND month_num = ${tm}
    GROUP BY parent_organization
    ORDER BY enrollments DESC
  `;
  const sqlPrior = `
    SELECT parent_organization AS org, SUM(enrollments) AS enrollments
    FROM plan_data
    ${clause ? clause + ' AND' : 'WHERE'} year = ${fy} AND month_num = ${fm}
    GROUP BY parent_organization
  `;

  const [curr, prior] = await Promise.all([
    query(sqlCurrent, params),
    query(sqlPrior, params),
  ]);

  const totalCurr = curr.rows.reduce((s, r) => s + parseInt(r.enrollments), 0);
  const totalPrior = prior.rows.reduce((s, r) => s + parseInt(r.enrollments), 0);
  const marketGrowth = totalPrior > 0 ? (totalCurr - totalPrior) / totalPrior * 100 : 0;

  const priorMap: Record<string, number> = {};
  prior.rows.forEach(r => { priorMap[r.org] = parseInt(r.enrollments); });

  return curr.rows.map(r => {
    const enr = parseInt(r.enrollments);
    const priorEnr = priorMap[r.org] ?? 0;
    const orgGrowth = priorEnr > 0 ? (enr - priorEnr) / priorEnr * 100 : null;
    const growthVsAvg = orgGrowth !== null ? Math.round((orgGrowth - marketGrowth) * 100) / 100 : null;
    return {
      org: r.org,
      enrollments: enr,
      market_share_pct: totalCurr > 0 ? Math.round(enr / totalCurr * 10000) / 100 : 0,
      growth_vs_avg: growthVsAvg,
      above_avg: growthVsAvg !== null ? growthVsAvg >= 0 : null,
    };
  });
}

export async function getBottomGrid(f: CAFilters): Promise<BottomGridRow[]> {
  const { clause, params } = buildWhere(f);

  const sql = `
    SELECT
      parent_organization AS org,
      year,
      plan_type,
      SUM(enrollments)         AS enrollments,
      COUNT(DISTINCT plan_id)  AS num_plans,
      SUM(SUM(enrollments)) OVER (PARTITION BY year) AS year_total
    FROM plan_data
    ${clause ? clause + ' AND' : 'WHERE'} year IN (2023, 2024, 2025)
    GROUP BY parent_organization, year, plan_type
    ORDER BY parent_organization, year, enrollments DESC
  `;

  const result = await query(sql, params);

  const selectedOrgs = f.parent_orgs && f.parent_orgs.length > 0 ? f.parent_orgs : null;
  let topOrgs: string[];
  
  if (selectedOrgs) {
    topOrgs = selectedOrgs;
  } else {
    const orgTotals: Record<string, number> = {};
    result.rows.forEach(r => {
      orgTotals[r.org] = (orgTotals[r.org] ?? 0) + parseInt(r.enrollments);
    });
    topOrgs = Object.entries(orgTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([org]) => org);
  }

  return topOrgs.map(org => {
    const orgRows = result.rows.filter(r => r.org === org);

    const byYear: Record<number, { enr: number; plans: Set<string>; yearTotal: number; planTypes: Record<string, number> }> = {};
    orgRows.forEach(r => {
      const yr = +r.year;
      if (!byYear[yr]) byYear[yr] = { enr: 0, plans: new Set(), yearTotal: parseFloat(r.year_total), planTypes: {} };
      byYear[yr].enr += parseInt(r.enrollments);
      byYear[yr].planTypes[r.plan_type] = (byYear[yr].planTypes[r.plan_type] ?? 0) + parseInt(r.enrollments);
    });

    const years = [2023, 2024, 2025];
    const planTypeEnrollments: { year: number; plan_type: string; value: number }[] = [];
    years.forEach(yr => {
      if (byYear[yr]) {
        Object.entries(byYear[yr].planTypes).forEach(([pt, val]) => {
          planTypeEnrollments.push({ year: yr, plan_type: pt, value: val });
        });
      }
    });

    return {
      org,
      color: getOrgColor(org),
      market_share: years.map(yr => ({
        year: yr,
        value: byYear[yr] ? Math.round(byYear[yr].enr / byYear[yr].yearTotal * 10000) / 100 : 0,
      })),
      num_plans: years.map(yr => ({
        year: yr,
        value: byYear[yr] ? Object.keys(byYear[yr].planTypes).length : 0,
      })),
      enrollments: years.map(yr => ({
        year: yr,
        value: byYear[yr]?.enr ?? 0,
      })),
      plan_type_enrollments: planTypeEnrollments,
    };
  });
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [statesResult, countiesResult, planTypesResult, orgsResult] = await Promise.all([
    query('SELECT DISTINCT state FROM plan_data ORDER BY state'),
    query('SELECT DISTINCT state, county FROM plan_data ORDER BY state, county'),
    query('SELECT DISTINCT plan_type FROM plan_data ORDER BY plan_type'),
    query(`
      SELECT parent_organization AS org, SUM(enrollments) AS total_enrollments
      FROM plan_data
      GROUP BY parent_organization
      ORDER BY total_enrollments DESC
    `),
  ]);

  const counties: Record<string, string[]> = {};
  countiesResult.rows.forEach(r => {
    if (!counties[r.state]) counties[r.state] = ['All'];
    if (r.county && r.county !== 'All') {
      counties[r.state].push(r.county);
    }
  });
  counties['All'] = ['All'];

  return {
    regions:           ['All', ...REGIONS],
    states:            ['All', ...statesResult.rows.map(r => r.state)],
    counties,
    plan_types:        planTypesResult.rows.map(r => r.plan_type),
    snp_plan_types:    ['NON-SNP', 'Dual-Eligible', 'Institutional', 'Chronic or Disabling Condition'],
    ind_grp_options:   ['Individual MA Plans', 'Group MA Plans'],
    ma_mapd_pdp_options: ['MA', 'MAPD', 'PDP'],
    parent_orgs:       orgsResult.rows.map(r => r.org),
  };
}
