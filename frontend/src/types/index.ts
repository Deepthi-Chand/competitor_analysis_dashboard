export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface ChartMeta {
  id: string;
  title: string;
  type: string;
  description: string;
}

export interface DashboardMeta {
  charts: ChartMeta[];
  filters: FilterConfig[];
  lastUpdated: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface DashboardData {
  'chart-one': ChartDataPoint[];
  'chart-two': ChartDataPoint[];
  'chart-three': ChartDataPoint[];
  'chart-four': ChartDataPoint[];
  filters: {
    timeRange: string;
    category: string;
  };
}

export interface DashboardFilters {
  timeRange: string;
  category: string;
}

export type ChartId = 'chart-one' | 'chart-two' | 'chart-three' | 'chart-four';
