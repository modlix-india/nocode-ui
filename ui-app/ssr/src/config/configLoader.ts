/**
 * Configuration loader for SSR service
 * Loads configuration from Spring Boot Cloud Config Server
 */

interface SSRConfig {
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
		invalidationSecret: string;
	};
}

// Default configuration (used in development or if config server is unavailable)
const defaultConfig: SSRConfig = {
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
		invalidationSecret: 'dev-secret',
	},
};

let loadedConfig: SSRConfig | null = null;

/**
 * Fetch configuration from Spring Boot Cloud Config Server
 */
async function fetchFromConfigServer(): Promise<Partial<SSRConfig> | null> {
	const configServerUrl = process.env.CLOUD_CONFIG_SERVER || 'localhost';
	const configServerPort = process.env.CLOUD_CONFIG_SERVER_PORT || '8888';
	const profile = process.env.SPRING_PROFILE || process.env.SPRING_PROFILES_ACTIVE || 'default';
	const appName = 'ssr';

	const url = `http://${configServerUrl}:${configServerPort}/${appName}/${profile}`;

	console.log(`Fetching configuration from: ${url}`);

	try {
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(5000), // 5 second timeout
		});

		if (!response.ok) {
			console.warn(`Config server returned ${response.status}, using defaults`);
			return null;
		}

		const data = await response.json();

		// Spring Cloud Config returns format: { name, profiles, propertySources: [{ source: {...} }] }
		const source = data.propertySources?.[0]?.source || {};

		return {
			server: {
				port: source['server.port'] || defaultConfig.server.port,
			},
			redis: {
				url: source['redis.url'] || defaultConfig.redis.url,
			},
			gateway: {
				url: source['gateway.url'] || defaultConfig.gateway.url,
			},
			cdn: {
				hostName: source['ui.cdnHostName'] || defaultConfig.cdn.hostName,
				stripAPIPrefix: source['ui.cdnStripAPIPrefix'] ?? defaultConfig.cdn.stripAPIPrefix,
				replacePlus: source['ui.cdnReplacePlus'] ?? defaultConfig.cdn.replacePlus,
				resizeOptionsType: source['ui.cdnResizeOptionsType'] || defaultConfig.cdn.resizeOptionsType,
			},
			cache: {
				ttlSeconds: source['ssr.cache.ttlSeconds'] || defaultConfig.cache.ttlSeconds,
				invalidationSecret:
					source['ssr.cache.invalidationSecret'] || defaultConfig.cache.invalidationSecret,
			},
		};
	} catch (error) {
		console.warn('Failed to fetch from config server:', error);
		return null;
	}
}

/**
 * Load configuration from environment variables (overrides)
 */
function loadFromEnvironment(): Partial<SSRConfig> {
	return {
		server: {
			port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : defaultConfig.server.port,
		},
		redis: {
			url: process.env.REDIS_URL || defaultConfig.redis.url,
		},
		gateway: {
			url: process.env.GATEWAY_URL || defaultConfig.gateway.url,
		},
		cdn: {
			hostName: process.env.CDN_HOST_NAME || defaultConfig.cdn.hostName,
			stripAPIPrefix: process.env.CDN_STRIP_API_PREFIX === 'true' || defaultConfig.cdn.stripAPIPrefix,
			replacePlus: process.env.CDN_REPLACE_PLUS === 'true' || defaultConfig.cdn.replacePlus,
			resizeOptionsType: process.env.CDN_RESIZE_OPTIONS_TYPE || defaultConfig.cdn.resizeOptionsType,
		},
		cache: {
			ttlSeconds: process.env.CACHE_TTL_SECONDS
				? parseInt(process.env.CACHE_TTL_SECONDS, 10)
				: defaultConfig.cache.ttlSeconds,
			invalidationSecret:
				process.env.CACHE_INVALIDATION_SECRET || defaultConfig.cache.invalidationSecret,
		},
	};
}

/**
 * Merge configurations with priority: env > configServer > defaults
 */
function mergeConfigs(...configs: Array<Partial<SSRConfig> | null>): SSRConfig {
	const result = { ...defaultConfig };

	for (const config of configs) {
		if (!config) continue;

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

	console.log('Loading SSR configuration...');

	// Try to load from config server first
	const configServerConfig = await fetchFromConfigServer();

	// Load from environment variables (highest priority)
	const envConfig = loadFromEnvironment();

	// Merge: defaults < configServer < environment
	loadedConfig = mergeConfigs(defaultConfig, configServerConfig, envConfig);

	console.log('Configuration loaded:', {
		serverPort: loadedConfig.server.port,
		gatewayUrl: loadedConfig.gateway.url,
		redisConfigured: !!loadedConfig.redis.url,
		cdnHostName: loadedConfig.cdn.hostName || '(none)',
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
