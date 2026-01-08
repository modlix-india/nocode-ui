import { Redis } from 'ioredis';
import { getConfig } from '../config/configLoader.js';
import logger from '../config/logger.js';

const CACHE_PREFIX = 'ssr:';
const SSR_CACHE_INVALIDATION_CHANNEL = 'ssr:cache:invalidation';

let redisClient: Redis | null = null;
let subscriberClient: Redis | null = null;

function getRedisUrl(): string {
	try {
		return getConfig().redis.url;
	} catch {
		// Config not loaded yet, use env variable or default
		return process.env.REDIS_URL || 'redis://:Kiran%40123@localhost:6379';
	}
}

export function getRedisClient(): Redis {
	if (!redisClient) {
		const redisUrl = getRedisUrl();
		redisClient = new Redis(redisUrl, {
			lazyConnect: true,
			maxRetriesPerRequest: 3,
			retryStrategy: (times) => {
				if (times > 3) return null;
				return Math.min(times * 100, 3000);
			},
		});

		redisClient.on('error', (err) => {
			logger.error('Redis connection error', { error: String(err) });
		});

		redisClient.on('connect', () => {
			logger.info('Connected to Redis');
		});
	}

	return redisClient;
}

/**
 * Interface for cache invalidation messages
 */
interface CacheInvalidationMessage {
	appCode: string;
	clientCode?: string;
	pageName?: string;
	timestamp: number;
}

/**
 * Initialize Redis Pub/Sub subscriber for cache invalidation
 * All SSR instances subscribe to the same channel and invalidate their local cache
 */
export async function initCacheInvalidationSubscriber(): Promise<void> {
	if (subscriberClient) {
		logger.info('Cache invalidation subscriber already initialized');
		return;
	}

	const redisUrl = getRedisUrl();
	subscriberClient = new Redis(redisUrl, {
		maxRetriesPerRequest: 3,
		retryStrategy: (times) => {
			if (times > 3) return null;
			return Math.min(times * 100, 3000);
		},
	});

	subscriberClient.on('error', (err) => {
		logger.error('Redis subscriber connection error', { error: String(err) });
	});

	subscriberClient.on('connect', () => {
		logger.info('Redis subscriber connected');
	});

	// Subscribe to cache invalidation channel
	await subscriberClient.subscribe(SSR_CACHE_INVALIDATION_CHANNEL);
	logger.info('Subscribed to cache invalidation channel', { channel: SSR_CACHE_INVALIDATION_CHANNEL });

	// Handle incoming messages
	subscriberClient.on('message', async (channel, message) => {
		if (channel !== SSR_CACHE_INVALIDATION_CHANNEL) return;

		try {
			const data: CacheInvalidationMessage = JSON.parse(message);
			logger.info('Received cache invalidation message', {
				appCode: data.appCode,
				clientCode: data.clientCode,
				pageName: data.pageName,
			});

			// Build pattern based on the message
			let pattern: string;
			if (data.pageName && data.clientCode) {
				pattern = `${data.appCode}:${data.clientCode}:${data.pageName}`;
			} else if (data.clientCode) {
				pattern = `${data.appCode}:${data.clientCode}:*`;
			} else if (data.pageName) {
				pattern = `${data.appCode}:*:${data.pageName}`;
			} else {
				pattern = `${data.appCode}:*`;
			}

			const invalidated = await invalidateCache(pattern);
			logger.info('Cache invalidated', { pattern, keysRemoved: invalidated });
		} catch (error) {
			logger.error('Error processing cache invalidation message', { error: String(error) });
		}
	});
}

/**
 * Get the cache invalidation channel name
 */
export function getCacheInvalidationChannel(): string {
	return SSR_CACHE_INVALIDATION_CHANNEL;
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
		logger.error('Redis get error', { key, error: String(error) });
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
		logger.error('Redis set error', { key, ttlSeconds, error: String(error) });
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
		logger.error('Redis invalidate error', { pattern, error: String(error) });
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
 * Close Redis connections (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
	if (subscriberClient) {
		await subscriberClient.quit();
		subscriberClient = null;
	}
	if (redisClient) {
		await redisClient.quit();
		redisClient = null;
	}
}
