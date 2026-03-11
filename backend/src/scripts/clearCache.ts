import { redis, invalidate } from '../cache/cache';

async function clearCache() {
  try {
    console.log('Clearing Redis cache...');
    
    const result = await invalidate('dashboard:*');
    
    if (result) {
      console.log('✓ Cache cleared successfully');
    } else {
      console.log('✗ Failed to clear cache');
      process.exit(1);
    }
    
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache();
