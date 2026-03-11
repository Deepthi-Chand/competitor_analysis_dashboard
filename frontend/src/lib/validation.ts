import { z } from 'zod';

export const VALID_TIME_RANGES = ['7d', '30d', '90d', '1y'] as const;
export const VALID_CATEGORIES = ['all', 'sales', 'marketing', 'operations'] as const;

export const dashboardFiltersSchema = z.object({
  timeRange: z.enum(VALID_TIME_RANGES).default('30d'),
  category: z.enum(VALID_CATEGORIES).default('all'),
});

export type DashboardFiltersInput = z.input<typeof dashboardFiltersSchema>;
export type DashboardFiltersOutput = z.output<typeof dashboardFiltersSchema>;
