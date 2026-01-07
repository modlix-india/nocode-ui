import Redis from 'ioredis';

// Redis configuration from application-default.yml
// redis.url: redis://Kiran%40123@localhost:6379
const REDIS_URL = process.env.REDIS_URL || 'redis://:Kiran%40123@localhost:6379';
const CACHE_PREFIX = 'ssr:';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
	if (!redisClient) {
		redisClient = new Redis(REDIS_URL, {
			lazyConnect: true,
			maxRetriesPerRequest: 3,
			retryStrategy: (times) => {
				if (times > 3) return null;
				return Math.min(times * 100, 3000);
			},
		});

		redisClient.on('error', (err) => {
			console.error('Redis connection error:', err);
		});

		redisClient.on('connect', () => {
			console.log('Connected to Redis');
		});
	}

	return redisClient;
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
	try {
		const redis = getRedisClient();
		const data = await redis.get(`${CACHE_PREFIX}${key}`);
		if (!data) return null;
		return JSON.parse(data);
	} catch (error) {
		console.error('Redis get error:', error);
		return null;
	}
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(
	key: string,
	data: T,
	ttlSeconds: number = 1800 // 30 minutes default
): Promise<void> {
	try {
		const redis = getRedisClient();
		await redis.setex(`${CACHE_PREFIX}${key}`, ttlSeconds, JSON.stringify(data));
	} catch (error) {
		console.error('Redis set error:', error);
	}
}

/**
 * Invalidate cache by pattern
 * @param pattern - Pattern like "appCode:*" or "appCode:clientCode:*"
 */
export async function invalidateCache(pattern: string): Promise<number> {
	try {
		const redis = getRedisClient();
		const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
		if (keys.length === 0) return 0;
		return await redis.del(...keys);
	} catch (error) {
		console.error('Redis invalidate error:', error);
		return 0;
	}
}

/**
 * Generate cache key for SSR pages
 * Format: {appCode}:{clientCode}:{pageName}
 */
export function generateCacheKey(
	appCode: string,
	clientCode: string,
	pageName: string
): string {
	return `${appCode}:${clientCode}:${pageName}`;
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
	if (redisClient) {
		await redisClient.quit();
		redisClient = null;
	}
}
