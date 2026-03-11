export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPercentage = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0.0%';
  return `${num.toFixed(1)}%`;
};

export const calculateTotal = (data: Record<string, unknown>[], key: string): number => {
  return data.reduce((sum, item) => sum + (typeof item[key] === 'number' ? (item[key] as number) : 0), 0);
};

export const calculateAverage = (data: Record<string, unknown>[], key: string): number => {
  if (!data || data.length === 0) return 0;
  return calculateTotal(data, key) / data.length;
};

export const sortByKey = <T extends Record<string, unknown>>(data: T[], key: string, ascending = true): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[key] as number;
    const bVal = b[key] as number;
    return ascending ? aVal - bVal : bVal - aVal;
  });
};

export const filterByValue = <T extends Record<string, unknown>>(data: T[], key: string, minValue: number): T[] => {
  return data.filter((item) => (item[key] as number) >= minValue);
};

export const getChartColors = (): string[] => [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
  '#00C49F', '#FFBB28', '#FF8042', '#0088FE',
];

export const formatEnrollment = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`;
  return String(n);
};

export const monthLabel = (year: number, monthNum: number): string => {
  const abbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${abbr[monthNum - 1]}-${String(year).slice(2)}`;
};

export const yoyLabel = (curr: number, prev: number): string => {
  if (!prev) return '—';
  const pct = ((curr - prev) / prev) * 100;
  const sign = pct >= 0 ? '▲' : '▼';
  return `${sign} ${Math.abs(pct).toFixed(1)}%`;
};
