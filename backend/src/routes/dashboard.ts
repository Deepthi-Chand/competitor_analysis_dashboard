import { Router, Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';
import cacheMiddleware from '../middleware/cacheMiddleware';
import { validateQuery, validateParams, dashboardQuerySchema, chartIdSchema } from '../middleware/validate';

const router = Router();

/**
 * @openapi
 * /api/dashboard/meta:
 *   get:
 *     summary: Get dashboard metadata
 *     description: Returns chart configuration and filter options (cached)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMeta'
 */
router.get('/meta', cacheMiddleware('meta'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await dashboardService.getChartMeta();
    res.json(meta);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/dashboard/data:
 *   get:
 *     summary: Get all chart data
 *     description: Returns data for all charts with optional filtering (cached)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time range filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, sales, marketing, operations]
 *           default: all
 *         description: Category filter
 *     responses:
 *       200:
 *         description: All chart data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardData'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/data',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware('data'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeRange, category } = req.query as { timeRange: string; category: string };
      const data = await dashboardService.getAllData({ timeRange, category });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/dashboard/{chartId}:
 *   get:
 *     summary: Get data for a specific chart
 *     description: Returns data for the specified chart (cached)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [chart-one, chart-two, chart-three, chart-four]
 *         description: Chart identifier
 *     responses:
 *       200:
 *         description: Chart data
 *       400:
 *         description: Invalid chart ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Chart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:chartId',
  validateParams(chartIdSchema),
  cacheMiddleware('chart'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chartId } = req.params;
      const data = await dashboardService.getChartData(chartId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
