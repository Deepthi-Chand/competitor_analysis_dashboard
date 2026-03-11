import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

export const caFiltersSchema = z.object({
  region:              z.string().optional(),
  state:               z.string().optional(),
  county:              z.string().optional(),
  period_from_year:    z.coerce.number().int().optional(),
  period_from_month:   z.coerce.number().int().min(1).max(12).optional(),
  period_to_year:      z.coerce.number().int().optional(),
  period_to_month:     z.coerce.number().int().min(1).max(12).optional(),
  ind_grp_plans:       z.string().optional(),
  ma_mapd_pdp:         z.string().optional(),
  snp_plan_type:       z.string().optional(),
  plan_type:           z.string().optional(),
  parent_orgs:         z.string().optional(),
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
