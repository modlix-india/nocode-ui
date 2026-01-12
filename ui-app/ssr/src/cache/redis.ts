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
			maxRetriesPerRequest: 10,
			enableOfflineQueue: false,
			retryStrategy: (times) => {
				if (times > 20) {
					logger.error('Redis max retries exceeded, giving up', { times });
					return null;
				}
				const delay = Math.min(times * 500, 10000);
				logger.warn('Redis retry attempt', { attempt: times, delayMs: delay });
				return delay;
			},
			reconnectOnError: (err) => {
				const targetError = 'READONLY';
				if (err.message.includes(targetError)) {
					return true;
				}
				return false;
			},
		});

		redisClient.on('error', (err) => {
			logger.error('Redis connection error (non-fatal)', { error: String(err) });
			// Don't throw - allow server to continue without Redis
		});

		redisClient.on('connect', () => {
			logger.info('Connected to Redis');
		});

		redisClient.on('close', () => {
			logger.warn('Redis connection closed');
		});

		redisClient.on('reconnecting', () => {
			logger.info('Reconnecting to Redis...');
		});
	}

	return redisClient;
}

/**
 * Interface for cache invalidation messages
 */
interface CacheInvalidationMessage {
	appCode?: string;
	clientCode?: string;
	pageName?: string;
	evictAll?: boolean;
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

	try {
		const redisUrl = getRedisUrl();
		subscriberClient = new Redis(redisUrl, {
			maxRetriesPerRequest: 10,
			enableOfflineQueue: false,
			retryStrategy: (times) => {
				if (times > 20) {
					logger.error('Redis subscriber max retries exceeded', { times });
					return null;
				}
				const delay = Math.min(times * 500, 10000);
				logger.warn('Redis subscriber retry attempt', { attempt: times, delayMs: delay });
				return delay;
			},
		});

		subscriberClient.on('error', (err) => {
			logger.error('Redis subscriber connection error (non-fatal)', { error: String(err) });
			// Don't throw - allow server to continue
		});

		subscriberClient.on('connect', () => {
			logger.info('Redis subscriber connected');
		});

		subscriberClient.on('close', () => {
			logger.warn('Redis subscriber connection closed');
		});

		subscriberClient.on('reconnecting', () => {
			logger.info('Redis subscriber reconnecting...');
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
					evictAll: data.evictAll,
					appCode: data.appCode,
					clientCode: data.clientCode,
					pageName: data.pageName,
				});

				// Build pattern based on the message
				let pattern: string;
				if (data.evictAll) {
					pattern = '*';
				} else if (data.pageName && data.clientCode) {
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
	} catch (error) {
		logger.error('Failed to initialize cache invalidation subscriber (non-fatal)', { error: String(error) });
		// Don't throw - allow server to start without subscriber
	}
}

/**
 * Get the cache invalidation channel name
 */
export function getCacheInvalidationChannel(): string {
	return SSR_CACHE_INVALIDATION_CHANNEL;
}

/**
 * Get cached data
 * Returns null if Redis is unavailable (graceful degradation)
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
	try {
		const redis = getRedisClient();
		const data = await redis.get(`${CACHE_PREFIX}${key}`);
		if (!data) return null;
		return JSON.parse(data);
	} catch (error) {
		logger.warn('Redis get error (degraded mode)', { key, error: String(error) });
		return null; // Gracefully degrade - return null to trigger backend fetch
	}
}

/**
 * Set cached data with TTL
 * Fails silently if Redis is unavailable (graceful degradation)
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
		logger.warn('Redis set error (degraded mode)', { key, ttlSeconds, error: String(error) });
		// Fail silently - server continues without caching
	}
}

/**
 * Invalidate cache by pattern
 * @param pattern - Pattern like "appCode:*" or "appCode:clientCode:*"
 * Returns 0 if Redis is unavailable (graceful degradation)
 */
export async function invalidateCache(pattern: string): Promise<number> {
	try {
		const redis = getRedisClient();
		const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
		if (keys.length === 0) return 0;
		return await redis.del(...keys);
	} catch (error) {
		logger.warn('Redis invalidate error (degraded mode)', { pattern, error: String(error) });
		return 0; // Fail silently - no cache to invalidate
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
