export interface DashboardFilters {
  timeRange?: string;
  category?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartMeta {
  id: string;
  title: string;
  type: string;
  description: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface DashboardMeta {
  charts: ChartMeta[];
  filters: FilterConfig[];
  lastUpdated: string;
}

export interface DashboardData {
  'chart-one': ChartDataPoint[];
  'chart-two': ChartDataPoint[];
  'chart-three': ChartDataPoint[];
  'chart-four': ChartDataPoint[];
  filters: DashboardFilters;
}

export interface AppError extends Error {
  statusCode?: number;
}
