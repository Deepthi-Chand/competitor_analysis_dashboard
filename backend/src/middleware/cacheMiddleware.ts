import { Request, Response, NextFunction } from 'express';
import * as cache from '../cache/cache';

const CACHE_ENABLED = process.env.USE_CACHE === 'true';

if (!CACHE_ENABLED) {
  console.log('Cache disabled (USE_CACHE != true)');
}

const cacheMiddleware = (endpoint: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!CACHE_ENABLED) {
      next();
      return;
    }

    const cacheKey = cache.generateCacheKey(endpoint, {
      ...req.params,
      ...req.query,
    });

    try {
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        res.json(cachedData);
        return;
      }

      console.log(`Cache miss for key: ${cacheKey}`);

      const originalJson = res.json.bind(res);
      res.json = (data: unknown) => {
        cache.set(cacheKey, data).catch((err) => console.error('Cache set error:', err));
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

export default cacheMiddleware;
