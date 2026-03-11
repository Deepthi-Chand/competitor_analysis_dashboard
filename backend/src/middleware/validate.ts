import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const VALID_TIME_RANGES = ['7d', '30d', '90d', '1y'] as const;
export const VALID_CATEGORIES = ['all', 'sales', 'marketing', 'operations'] as const;
export const VALID_CHART_IDS = ['chart-one', 'chart-two', 'chart-three', 'chart-four'] as const;

const dashboardQuerySchema = z.object({
  timeRange: z.enum(VALID_TIME_RANGES).optional().default('30d'),
  category: z.enum(VALID_CATEGORIES).optional().default('all'),
});

const chartIdSchema = z.object({
  chartId: z.enum(VALID_CHART_IDS),
});

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: result.error.errors.map((e) => e.message).join(', '),
        timestamp: new Date().toISOString(),
      });
      return;
    }
    req.query = result.data as Record<string, string>;
    next();
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: result.error.errors.map((e) => e.message).join(', '),
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next();
  };
};

export { dashboardQuerySchema, chartIdSchema };
