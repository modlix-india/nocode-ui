import { Redis } from 'ioredis';
import { gzip, gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import { getConfig } from '../config/configLoader.js';
import logger from '../config/logger.js';
import { BUILD_ID } from '../config/buildInfo.js';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const CACHE_PREFIX = `ssr:${BUILD_ID}:`;
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
			enableOfflineQueue: true, // Allow queuing during brief disconnections for pub/sub reliability
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

		subscriberClient.on('ready', () => {
			logger.info('Redis subscriber ready and connected');
			// Resubscribe after reconnection
			if (subscriberClient) {
				subscriberClient.subscribe(SSR_CACHE_INVALIDATION_CHANNEL).catch((err) => {
					logger.error('Failed to resubscribe after reconnection', { error: String(err) });
				});
			}
		});

		// Subscribe to cache invalidation channel
		await subscriberClient.subscribe(SSR_CACHE_INVALIDATION_CHANNEL);
		logger.info('✅ Subscribed to cache invalidation channel', {
			channel: SSR_CACHE_INVALIDATION_CHANNEL,
			offlineQueueEnabled: true
		});

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

		// Build patterns for all cache key types
		// 1. html:gz:{pattern} - Pre-compressed HTML
		// 2. html:{pattern} - Raw HTML
		// 3. {pattern}:data - Object data cache
		// 4. {pattern} - Legacy object cache
		const patterns = [
			`${CACHE_PREFIX}html:gz:${pattern}`,
			`${CACHE_PREFIX}html:${pattern}`,
			`${CACHE_PREFIX}${pattern}:data`,
			`${CACHE_PREFIX}${pattern}`
		];

		let totalKeysRemoved = 0;

		// Find and delete keys for each pattern
		for (const searchPattern of patterns) {
			const keys = await redis.keys(searchPattern);
			if (keys.length > 0) {
				const deleted = await redis.del(...keys);
				totalKeysRemoved += deleted;
				logger.info('Invalidated cache keys', {
					pattern: searchPattern,
					keysFound: keys.length,
					keysDeleted: deleted
				});
			}
		}

		return totalKeysRemoved;
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
 * Get cached HTML string (for rendered HTML caching)
 * Returns null if Redis is unavailable or HTML not found
 * Supports both raw HTML and gzipped HTML (for faster serving)
 */
export async function getCachedHtml(key: string): Promise<string | null> {
	try {
		const redis = getRedisClient();

		// Try to get gzipped version first (faster TTFB)
		const gzippedBuffer = await redis.getBuffer(`${CACHE_PREFIX}html:gz:${key}`);
		if (gzippedBuffer) {
			const html = await gunzipAsync(gzippedBuffer);
			return html.toString('utf-8');
		}

		// Fallback to raw HTML
		const html = await redis.get(`${CACHE_PREFIX}html:${key}`);
		return html;
	} catch (error) {
		logger.warn('Redis get HTML error (degraded mode)', { key, error: String(error) });
		return null;
	}
}

/**
 * Get cached gzipped HTML buffer (for direct serving to client)
 * This avoids decompression on the server side
 */
export async function getCachedGzippedHtml(key: string): Promise<Buffer | null> {
	try {
		const redis = getRedisClient();
		const gzippedBuffer = await redis.getBuffer(`${CACHE_PREFIX}html:gz:${key}`);
		return gzippedBuffer;
	} catch (error) {
		logger.warn('Redis get gzipped HTML error (degraded mode)', { key, error: String(error) });
		return null;
	}
}

/**
 * Set cached HTML string with TTL
 * Stores both raw HTML and pre-gzipped version for faster serving
 */
export async function setCachedHtml(
	key: string,
	html: string,
	ttlSeconds: number = 1800 // 30 minutes default
): Promise<void> {
	try {
		const redis = getRedisClient();

		// Store raw HTML (for debugging and fallback)
		await redis.setex(`${CACHE_PREFIX}html:${key}`, ttlSeconds, html);

		// Pre-compress and store gzipped version (much faster TTFB!)
		const gzipped = await gzipAsync(html, { level: 6 });
		await redis.setex(`${CACHE_PREFIX}html:gz:${key}`, ttlSeconds, gzipped);

		const compressionRatio = ((1 - gzipped.length / html.length) * 100).toFixed(1);
		logger.info('Cached HTML (pre-compressed)', {
			key,
			rawSize: html.length,
			gzipSize: gzipped.length,
			compressionRatio: `${compressionRatio}%`,
			ttl: ttlSeconds
		});
	} catch (error) {
		logger.warn('Redis set HTML error (degraded mode)', { key, ttlSeconds, error: String(error) });
	}
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
