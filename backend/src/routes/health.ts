import { Router, Request, Response, NextFunction } from 'express';
import * as db from '../db/db';
import * as cache from '../cache/cache';

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API including database and Redis connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: One or more services unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [dbHealthy, redisHealthy] = await Promise.all([
      db.checkConnection(),
      cache.checkConnection(),
    ]);

    const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';
    const statusCode = status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
