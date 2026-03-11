import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { pool } from './db';

const MONTH_MAP: Record<string, number> = {
  January:1, February:2, March:3, April:4, May:5, June:6,
  July:7, August:8, September:9, October:10, November:11, December:12
};

function computeIndGrp(planId: number): string {
  const s = String(planId);
  return (s.length === 3 && s[0] === '8') ? 'Group MA Plans' : 'Individual MA Plans';
}

function computeMaMapdPdp(contractId: string, offersPartD: string): string {
  const first = contractId?.[0] ?? '';
  if (['H','R'].includes(first) && offersPartD === 'Yes') return 'MAPD';
  if (['H','R'].includes(first) && offersPartD === 'No')  return 'MA';
  return 'PDP';
}

function jitter(val: number, pct = 0.08): number {
  return Math.round(val * (1 + (Math.random() - 0.5) * 2 * pct));
}

async function seed() {
  const csvPath = path.join(__dirname, '../../data/CA_SAMPLE_DATA.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found at', csvPath, '— place CA_SAMPLE_DATA.csv in backend/data/');
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  const rows = records.map((r: Record<string, string>) => ({
    contract_id:            r.Contract_ID,
    plan_id:                parseInt(r.Plan_ID),
    ssa_code:               r.SSA_State_County_Code ? parseFloat(r.SSA_State_County_Code) : null,
    fips_code:              parseInt(r.FIPS_State_County_Code),
    state:                  r.State,
    county:                 r.County,
    enrollments:            parseInt(r.enrollments) || 0,
    parent_organization:    r.Parent_Organization,
    plan_type:              r.Plan_Type,
    offers_part_d:          r.Offers_Part_D,
    snp_plan:               r.SNP_Plan,
    eghp:                   r.EGHP,
    plan_name:              r.Plan_Name,
    year:                   parseInt(r.Year),
    month:                  r.Month,
    month_num:              MONTH_MAP[r.Month] ?? 1,
    ma_eligibles:           r.ma_eligibles ? parseFloat(r.ma_eligibles) : null,
    special_needs_plan_type: r.Special_Needs_Plan_Type,
    snp_eligibles:          r.SNP_Eligibles ? parseFloat(r.SNP_Eligibles) : null,
    poa:                    r.POA || null,
    acquisition_type:       r.Acquisition_Type || null,
    ind_grp_plans:          computeIndGrp(parseInt(r.Plan_ID)),
    ma_mapd_pdp:            computeMaMapdPdp(r.Contract_ID, r.Offers_Part_D),
  }));

  const jan2024 = rows.filter((r: any) => r.year === 2024 && r.month === 'January');
  const months2023 = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const synthetic2023: typeof rows = [];
  for (const baseRow of jan2024) {
    for (const month of months2023) {
      synthetic2023.push({
        ...baseRow,
        year: 2023,
        month,
        month_num: MONTH_MAP[month],
        enrollments: jitter(baseRow.enrollments),
        ma_eligibles: baseRow.ma_eligibles ? jitter(baseRow.ma_eligibles, 0.03) : null,
      });
    }
  }

  const allRows = [...rows, ...synthetic2023];

  const client = await pool.connect();
  try {
    await client.query('TRUNCATE plan_data RESTART IDENTITY');
    const chunkSize = 500;
    for (let i = 0; i < allRows.length; i += chunkSize) {
      const chunk = allRows.slice(i, i + chunkSize);
      const cols = Object.keys(chunk[0]);
      const placeholders = chunk.map((_, ri) =>
        '(' + cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(',') + ')'
      ).join(',');
      const values = chunk.flatMap(row => cols.map(c => (row as any)[c]));
      await client.query(
        `INSERT INTO plan_data (${cols.join(',')}) VALUES ${placeholders}`,
        values
      );
    }
    console.log(`Seeded ${allRows.length} rows (${rows.length} real + ${synthetic2023.length} synthetic 2023)`);
  } finally {
    client.release();
  }
}

seed().catch(console.error).finally(() => pool.end());
