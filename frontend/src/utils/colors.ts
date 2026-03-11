// Shared color definitions for organizations and plan types

export const ORG_COLORS: Record<string, string> = {
  'Elevance': '#A5B4FC',
  'Elevance Health': '#A5B4FC',
  'Humana Inc.': '#F9A8D4',
  'UHG': '#FDE68A',
  'CVS': '#C4B5FD',
  'MEDICAL MUTUAL OF OHIO': '#CBD5E1',
  'Centene Corporation': '#FDBA74',
  'Devoted Health, Inc.': '#6EE7B7',
  'The Cigna Group': '#7DD3FC',
};

export const DEFAULT_ORG_COLOR = '#CBD5E1';

export function getOrgColor(org: string): string {
  return ORG_COLORS[org] ?? DEFAULT_ORG_COLOR;
}

export const PLAN_TYPE_COLORS: Record<string, string> = {
  'HMO': '#4F46E5',
  'HMO-POS': '#DB2777',
  'Local PPO': '#D97706',
  'Regional PPO': '#059669',
  'PFFS': '#EA580C',
};

export const DEFAULT_PLAN_TYPE_COLOR = '#94A3B8';

export function getPlanTypeColor(planType: string): string {
  return PLAN_TYPE_COLORS[planType] ?? DEFAULT_PLAN_TYPE_COLOR;
}
