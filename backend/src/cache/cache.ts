import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '300', 10);

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

const generateCacheKey = (endpoint: string, params: Record<string, unknown> = {}): string => {
  const paramsHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .slice(0, 16);
  return `dashboard:${endpoint}:${paramsHash}`;
};

const get = async (key: string): Promise<unknown | null> => {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as unknown) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

const set = async (key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<boolean> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Cache set error:', err);
    return false;
  }
};

const invalidate = async (pattern: string): Promise<boolean> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (err) {
    console.error('Cache invalidate error:', err);
    return false;
  }
};

const checkConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};

export { redis, get, set, invalidate, generateCacheKey, checkConnection, DEFAULT_TTL };
