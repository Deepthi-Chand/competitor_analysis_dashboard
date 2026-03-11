import { NextFunction, Request, Response, Router } from 'express';
import cacheMiddleware from '../middleware/cacheMiddleware';
import { caFiltersSchema, validateQuery } from '../middleware/validate';
import * as svc from '../services/dashboardService';

const router = Router();

router.get('/filter-options',
  cacheMiddleware('filter-options'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await svc.getFilterOptions()); } catch(e) { next(e); }
  }
);

router.get('/market-highlights',
  validateQuery(caFiltersSchema),
  cacheMiddleware('market-highlights'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const f = svc.parseFilters(req.query as Record<string, string>);
      res.json(await svc.getMarketHighlights(f));
    } catch(e) { next(e); }
  }
);

router.get('/monthly-trend',
  validateQuery(caFiltersSchema),
  cacheMiddleware('monthly-trend'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const f = svc.parseFilters(req.query as Record<string, string>);
      res.json(await svc.getMonthlyTrend(f));
    } catch(e) { next(e); }
  }
);

router.get('/market-share',
  validateQuery(caFiltersSchema),
  cacheMiddleware('market-share'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const f = svc.parseFilters(req.query as Record<string, string>);
      res.json(await svc.getMarketShare(f));
    } catch(e) { next(e); }
  }
);

router.get('/bottom-grid',
  validateQuery(caFiltersSchema),
  cacheMiddleware('bottom-grid'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const f = svc.parseFilters(req.query as Record<string, string>);
      res.json(await svc.getBottomGrid(f));
    } catch(e) { next(e); }
  }
);

export default router;
