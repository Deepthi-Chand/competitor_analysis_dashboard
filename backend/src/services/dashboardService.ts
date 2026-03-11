import { DashboardFilters, DashboardMeta, DashboardData, ChartDataPoint, AppError } from '../types';

const VALID_TIME_RANGES = ['7d', '30d', '90d', '1y'] as const;
const VALID_CATEGORIES = ['all', 'sales', 'marketing', 'operations'] as const;

type TimeRange = typeof VALID_TIME_RANGES[number];
type Category = typeof VALID_CATEGORIES[number];

const getChartMeta = async (): Promise<DashboardMeta> => {
  return {
    charts: [
      { id: 'chart-one', title: 'Revenue Overview', type: 'line', description: 'Monthly revenue trends' },
      { id: 'chart-two', title: 'User Analytics', type: 'bar', description: 'User engagement metrics' },
      { id: 'chart-three', title: 'Performance Metrics', type: 'area', description: 'System performance over time' },
      { id: 'chart-four', title: 'Distribution Analysis', type: 'pie', description: 'Category distribution breakdown' },
    ],
    filters: [
      {
        id: 'timeRange',
        label: 'Time Range',
        options: [
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: '90d', label: 'Last 90 Days' },
          { value: '1y', label: 'Last Year' },
        ],
      },
      {
        id: 'category',
        label: 'Category',
        options: [
          { value: 'all', label: 'All Categories' },
          { value: 'sales', label: 'Sales' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'operations', label: 'Operations' },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
};

const getAllData = async (filters: DashboardFilters = {}): Promise<DashboardData> => {
  const timeRange = (VALID_TIME_RANGES.includes(filters.timeRange as TimeRange) ? filters.timeRange : '30d') as TimeRange;
  const category = (VALID_CATEGORIES.includes(filters.category as Category) ? filters.category : 'all') as Category;

  return {
    'chart-one': generateLineChartData(timeRange, category),
    'chart-two': generateBarChartData(timeRange, category),
    'chart-three': generateAreaChartData(timeRange, category),
    'chart-four': generatePieChartData(timeRange, category),
    filters: { timeRange, category },
  };
};

const getChartData = async (chartId: string): Promise<ChartDataPoint[]> => {
  const allData = await getAllData();
  const data = allData[chartId as keyof Omit<DashboardData, 'filters'>];

  if (!data) {
    const error = new Error(`Chart not found: ${chartId}`) as AppError;
    error.statusCode = 404;
    throw error;
  }

  return data;
};

const getMultiplier = (timeRange: TimeRange, category: Category): number => {
  const timeMultipliers: Record<TimeRange, number> = { '7d': 0.5, '30d': 1, '90d': 1.5, '1y': 2 };
  const categoryMultipliers: Record<Category, number> = { all: 1, sales: 1.2, marketing: 0.8, operations: 0.9 };
  return timeMultipliers[timeRange] * categoryMultipliers[category];
};

const generateLineChartData = (timeRange: TimeRange, category: Category): ChartDataPoint[] => {
  const multiplier = getMultiplier(timeRange, category);
  const dataPoints: Record<TimeRange, number> = { '7d': 7, '30d': 12, '90d': 12, '1y': 12 };
  const labels: Record<TimeRange, string[]> = {
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30d': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    '90d': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    '1y': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  return labels[timeRange].slice(0, dataPoints[timeRange]).map((month, idx) => ({
    name: month,
    revenue: Math.floor((20000 + idx * 3000) * multiplier),
    target: Math.floor((25000 + idx * 2500) * multiplier),
  }));
};

const generateBarChartData = (timeRange: TimeRange, category: Category): ChartDataPoint[] => {
  const multiplier = getMultiplier(timeRange, category);
  const categories = category === 'all'
    ? ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
    : [`${category} A`, `${category} B`, `${category} C`];
  return categories.map((cat, idx) => ({
    name: cat,
    users: Math.floor((500 + idx * 100) * multiplier),
    sessions: Math.floor((2000 + idx * 500) * multiplier),
  }));
};

const generateAreaChartData = (timeRange: TimeRange, category: Category): ChartDataPoint[] => {
  const multiplier = getMultiplier(timeRange, category);
  const weekCount: Record<TimeRange, number> = { '7d': 1, '30d': 4, '90d': 8, '1y': 8 };
  const weeks = Array.from({ length: weekCount[timeRange] }, (_, i) => `Week ${i + 1}`);
  return weeks.map((week, idx) => ({
    name: week,
    cpu: Math.floor((40 + idx * 5) * (multiplier * 0.8)),
    memory: Math.floor((50 + idx * 3) * (multiplier * 0.9)),
    network: Math.floor((30 + idx * 4) * multiplier),
  }));
};

const generatePieChartData = (timeRange: TimeRange, category: Category): ChartDataPoint[] => {
  const multiplier = getMultiplier(timeRange, category);
  return category === 'all'
    ? [
        { name: 'Sales', value: Math.floor(400 * multiplier) },
        { name: 'Marketing', value: Math.floor(300 * multiplier) },
        { name: 'Operations', value: Math.floor(250 * multiplier) },
        { name: 'Support', value: Math.floor(200 * multiplier) },
      ]
    : [
        { name: `${category} Q1`, value: Math.floor(350 * multiplier) },
        { name: `${category} Q2`, value: Math.floor(280 * multiplier) },
        { name: `${category} Q3`, value: Math.floor(320 * multiplier) },
        { name: `${category} Q4`, value: Math.floor(250 * multiplier) },
      ];
};

export { getChartMeta, getAllData, getChartData };
