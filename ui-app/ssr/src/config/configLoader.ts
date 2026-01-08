/**
 * Configuration loader for SSR service
 * Loads configuration from Spring Boot Cloud Config Server
 *
 * Configuration Priority (highest to lowest):
 * 1. Environment variables
 * 2. Spring Cloud Config Server
 * 3. Default configuration
 *
 * Environment Variables:
 * - CLOUD_CONFIG_SERVER: Config server host (default: localhost)
 * - CLOUD_CONFIG_SERVER_PORT: Config server port (default: 8888)
 * - SPRING_PROFILE / SPRING_PROFILES_ACTIVE: Active profile (default: default)
 * - SERVER_PORT: SSR server port (default: 3080)
 * - REDIS_URL: Redis connection URL
 * - GATEWAY_URL: Backend gateway URL
 * - CDN_HOST_NAME: CDN hostname
 * - CDN_STRIP_API_PREFIX: Strip API prefix from CDN URLs (default: true)
 * - CDN_REPLACE_PLUS: Replace + in query params (default: false)
 * - CDN_RESIZE_OPTIONS_TYPE: Image resize options type (default: none)
 * - CACHE_TTL_SECONDS: Cache TTL in seconds (default: 1800)
 */

import logger from './logger.js';

interface SSRConfig {
	// Cloud Config Server configuration
	configServer: {
		host: string;
		port: number;
		profile: string;
		appName: string;
	};
	// Server configuration
	server: {
		port: number;
	};
	// Redis configuration
	redis: {
		url: string;
	};
	// Gateway configuration
	gateway: {
		url: string;
	};
	// CDN configuration
	cdn: {
		hostName: string;
		stripAPIPrefix: boolean;
		replacePlus: boolean;
		resizeOptionsType: string;
	};
	// Cache configuration
	cache: {
		ttlSeconds: number;
	};
}

// Default configuration (used in development or if config server is unavailable)
const defaultConfig: SSRConfig = {
	configServer: {
		host: process.env.CLOUD_CONFIG_SERVER || 'localhost',
		port: Number.parseInt(process.env.CLOUD_CONFIG_SERVER_PORT || '8888', 10),
		profile: process.env.SPRING_PROFILE || process.env.SPRING_PROFILES_ACTIVE || 'default',
		appName: process.env.SSR_APP_NAME || 'ssr',
	},
	server: {
		port: 3080,
	},
	redis: {
		url: 'redis://:Kiran%40123@localhost:6379',
	},
	gateway: {
		url: 'http://localhost:8080',
	},
	cdn: {
		hostName: '',
		stripAPIPrefix: true,
		replacePlus: false,
		resizeOptionsType: 'none',
	},
	cache: {
		ttlSeconds: 1800, // 30 minutes
	},
};

let loadedConfig: SSRConfig | null = null;

/**
 * Fetch configuration from Spring Boot Cloud Config Server
 */
async function fetchFromConfigServer(): Promise<Partial<SSRConfig> | null> {
	const { host, port, profile, appName } = defaultConfig.configServer;

	const url = `http://${host}:${port}/${appName}/${profile}`;

	logger.info('Fetching configuration from config server', { url });

	try {
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(5000), // 5 second timeout
		});

		if (!response.ok) {
			logger.warn('Config server returned error, using defaults', { status: response.status });
			return null;
		}

		const data = await response.json();

		// Spring Cloud Config returns format: { name, profiles, propertySources: [{ source: {...} }] }
		const source = data.propertySources?.[0]?.source || {};

		// SSR-specific config takes priority, fallback to shared config
		return {
			server: {
				port: source['ssr.server.port'] || source['server.port'] || defaultConfig.server.port,
			},
			redis: {
				url: source['ssr.redis.url'] || defaultConfig.redis.url,
			},
			gateway: {
				url: source['ssr.gateway.url'] || source['gateway.url'] || defaultConfig.gateway.url,
			},
			cdn: {
				hostName: source['ssr.cdn.hostName'] || source['ui.cdnHostName'] || defaultConfig.cdn.hostName,
				stripAPIPrefix: source['ssr.cdn.stripAPIPrefix'] ?? source['ui.cdnStripAPIPrefix'] ?? defaultConfig.cdn.stripAPIPrefix,
				replacePlus: source['ssr.cdn.replacePlus'] ?? source['ui.cdnReplacePlus'] ?? defaultConfig.cdn.replacePlus,
				resizeOptionsType: source['ssr.cdn.resizeOptionsType'] || source['ui.cdnResizeOptionsType'] || defaultConfig.cdn.resizeOptionsType,
			},
			cache: {
				ttlSeconds: source['ssr.cache.ttlSeconds'] || defaultConfig.cache.ttlSeconds,
			},
		};
	} catch (error) {
		logger.warn('Failed to fetch from config server, using defaults', { error: String(error) });
		return null;
	}
}

/**
 * Load configuration from environment variables (overrides)
 */
function loadFromEnvironment(): Partial<SSRConfig> {
	const config: Partial<SSRConfig> = {};

	// Only set values if environment variables are explicitly provided
	if (process.env.SERVER_PORT) {
		config.server = { port: Number.parseInt(process.env.SERVER_PORT, 10) };
	}

	if (process.env.REDIS_URL) {
		config.redis = { url: process.env.REDIS_URL };
	}

	if (process.env.GATEWAY_URL) {
		config.gateway = { url: process.env.GATEWAY_URL };
	}

	// CDN config - only include if env vars are set
	const cdnConfig: Partial<SSRConfig['cdn']> = {};
	if (process.env.CDN_HOST_NAME) {
		cdnConfig.hostName = process.env.CDN_HOST_NAME;
	}
	if (process.env.CDN_STRIP_API_PREFIX !== undefined) {
		cdnConfig.stripAPIPrefix = process.env.CDN_STRIP_API_PREFIX === 'true';
	}
	if (process.env.CDN_REPLACE_PLUS !== undefined) {
		cdnConfig.replacePlus = process.env.CDN_REPLACE_PLUS === 'true';
	}
	if (process.env.CDN_RESIZE_OPTIONS_TYPE) {
		cdnConfig.resizeOptionsType = process.env.CDN_RESIZE_OPTIONS_TYPE;
	}
	if (Object.keys(cdnConfig).length > 0) {
		config.cdn = cdnConfig as SSRConfig['cdn'];
	}

	if (process.env.CACHE_TTL_SECONDS) {
		config.cache = { ttlSeconds: Number.parseInt(process.env.CACHE_TTL_SECONDS, 10) };
	}

	return config;
}

/**
 * Merge configurations with priority: env > configServer > defaults
 */
function mergeConfigs(...configs: Array<Partial<SSRConfig> | null>): SSRConfig {
	const result = { ...defaultConfig };

	for (const config of configs) {
		if (!config) continue;

		if (config.configServer) {
			result.configServer = { ...result.configServer, ...config.configServer };
		}
		if (config.server) {
			result.server = { ...result.server, ...config.server };
		}
		if (config.redis) {
			result.redis = { ...result.redis, ...config.redis };
		}
		if (config.gateway) {
			result.gateway = { ...result.gateway, ...config.gateway };
		}
		if (config.cdn) {
			result.cdn = { ...result.cdn, ...config.cdn };
		}
		if (config.cache) {
			result.cache = { ...result.cache, ...config.cache };
		}
	}

	return result;
}

/**
 * Load configuration (called once at startup)
 */
export async function loadConfig(): Promise<SSRConfig> {
	if (loadedConfig) {
		return loadedConfig;
	}

	logger.info('Loading SSR configuration...');
	logger.info('Config server settings', {
		host: defaultConfig.configServer.host,
		port: defaultConfig.configServer.port,
		profile: defaultConfig.configServer.profile,
		appName: defaultConfig.configServer.appName,
	});

	// Try to load from config server first
	const configServerConfig = await fetchFromConfigServer();

	// Load from environment variables (highest priority)
	const envConfig = loadFromEnvironment();

	// Merge: defaults < configServer < environment
	loadedConfig = mergeConfigs(defaultConfig, configServerConfig, envConfig);

	logger.info('Configuration loaded', {
		serverPort: loadedConfig.server.port,
		gatewayUrl: loadedConfig.gateway.url,
		redisUrl: loadedConfig.redis.url ? '(configured)' : '(not configured)',
		cdnHostName: loadedConfig.cdn.hostName || '(none)',
		cdnStripAPIPrefix: loadedConfig.cdn.stripAPIPrefix,
		cdnReplacePlus: loadedConfig.cdn.replacePlus,
		cdnResizeOptionsType: loadedConfig.cdn.resizeOptionsType,
		cacheTtlSeconds: loadedConfig.cache.ttlSeconds,
	});

	return loadedConfig;
}

/**
 * Get loaded configuration (must call loadConfig first)
 */
export function getConfig(): SSRConfig {
	if (!loadedConfig) {
		throw new Error('Configuration not loaded. Call loadConfig() first.');
	}
	return loadedConfig;
}

/**
 * Export for use in other modules
 */
export type { SSRConfig };
