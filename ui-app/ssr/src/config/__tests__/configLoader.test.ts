import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * CONFIG_SERVER_ENABLED=false is how the SSR containers start once config-server is retired:
 * every setting comes from the environment (an env file rendered from the same values), and the
 * loader must not ask a config server that is gone, which would cost every start a 5 s timeout.
 *
 * The loader keeps its result and reads part of the environment when it is imported, so each case
 * imports a fresh copy of the module (a distinct query string is a distinct module).
 */

const VARS = [
	'CONFIG_SERVER_ENABLED',
	'CLOUD_CONFIG_SERVER',
	'CLOUD_CONFIG_SERVER_PORT',
	'SPRING_PROFILE',
	'SPRING_PROFILES_ACTIVE',
	'SSR_REGION',
	'SERVER_PORT',
	'REDIS_URL',
	'REDIS_INVALIDATION_URL',
	'GATEWAY_URL',
	'CDN_HOST_NAME',
	'CDN_STRIP_API_PREFIX',
	'CDN_REPLACE_PLUS',
	'CDN_RESIZE_OPTIONS_TYPE',
	'CACHE_TTL_SECONDS',
	'ANALYTICS_INGESTION_HOST',
	'SECURITY_APP_CODE_SUFFIX',
	'CLIENT_BUNDLE_URL',
];

type Loader = typeof import('../configLoader.js');

let copies = 0;
async function freshLoader(): Promise<Loader> {
	copies += 1;
	return (await import(`../configLoader.js?copy=${copies}`)) as Loader;
}

const configServerAnswer = {
	name: 'ssr',
	profiles: ['ocitest'],
	propertySources: [
		{
			name: 'application-ocitest.yml',
			source: {
				'ssr.gateway.url': 'http://gateway-server:8080',
				'ssr.redis.url': 'redis://from-config-server:6379',
				'ssr.redis.invalidationUrl': 'redis://invalidations-from-config-server:6379',
				'ssr.cdn.hostName': 'cdn.example.test',
				'ssr.cache.ttlSeconds': 600,
				'ui.analytics.ingestionHost': 'https://analytics.example.test',
				'security.appCodeSuffix': '-test',
			},
		},
	],
};

describe('SSR config loader and CONFIG_SERVER_ENABLED', () => {
	const savedEnv: Record<string, string | undefined> = {};
	const savedFetch = globalThis.fetch;
	let fetched: string[];

	beforeEach(() => {
		for (const name of VARS) {
			savedEnv[name] = process.env[name];
			delete process.env[name];
		}
		fetched = [];
		globalThis.fetch = (async (input: string | URL | Request) => {
			fetched.push(String(input));
			return new Response(JSON.stringify(configServerAnswer), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}) as typeof fetch;
	});

	afterEach(() => {
		for (const name of VARS) {
			if (savedEnv[name] === undefined) delete process.env[name];
			else process.env[name] = savedEnv[name];
		}
		globalThis.fetch = savedFetch;
	});

	it('reads only "false" as off, whatever its case or spacing', async () => {
		const { configServerEnabled } = await freshLoader();
		for (const [value, enabled] of [
			[undefined, true],
			['', true],
			['true', true],
			['TRUE', true],
			['false', false],
			['False', false],
			[' false ', false],
		] as const) {
			if (value === undefined) delete process.env.CONFIG_SERVER_ENABLED;
			else process.env.CONFIG_SERVER_ENABLED = value;
			assert.equal(configServerEnabled(), enabled, `CONFIG_SERVER_ENABLED=${JSON.stringify(value)}`);
		}
	});

	it('does not call the config server when it is switched off, and takes the environment', async () => {
		process.env.CONFIG_SERVER_ENABLED = 'false';
		process.env.CLOUD_CONFIG_SERVER = 'config-server';
		process.env.GATEWAY_URL = 'http://gateway:8080';
		process.env.REDIS_URL = 'redis://from-env:6379';
		process.env.REDIS_INVALIDATION_URL = 'redis://invalidations-from-env:6379';
		process.env.CDN_HOST_NAME = 'cdn.env.test';
		process.env.CDN_STRIP_API_PREFIX = 'false';
		process.env.CACHE_TTL_SECONDS = '900';
		process.env.ANALYTICS_INGESTION_HOST = 'https://analytics.env.test';
		process.env.SECURITY_APP_CODE_SUFFIX = '';

		const { loadConfig } = await freshLoader();
		const config = await loadConfig();

		assert.deepEqual(fetched, [], 'no request may reach a config server');
		assert.equal(config.gateway.url, 'http://gateway:8080');
		assert.equal(config.redis.url, 'redis://from-env:6379');
		assert.equal(config.redis.invalidationUrl, 'redis://invalidations-from-env:6379');
		assert.equal(config.cdn.hostName, 'cdn.env.test');
		assert.equal(config.cdn.stripAPIPrefix, false);
		assert.equal(config.cache.ttlSeconds, 900);
		assert.equal(config.analytics.ingestionHost, 'https://analytics.env.test');
		assert.equal(config.security.appCodeSuffix, '');
	});

	it('keeps the defaults for what the environment does not set when switched off', async () => {
		process.env.CONFIG_SERVER_ENABLED = 'false';

		const { loadConfig } = await freshLoader();
		const config = await loadConfig();

		assert.deepEqual(fetched, []);
		assert.equal(config.gateway.url, 'http://localhost:8080');
		assert.equal(config.redis.invalidationUrl, undefined);
		assert.equal(config.analytics.ingestionHost, '');
		assert.equal(config.cache.ttlSeconds, 1800);
	});

	it('still asks the config server when the switch is not set, with the environment on top', async () => {
		process.env.CLOUD_CONFIG_SERVER = 'config-server';
		process.env.CLOUD_CONFIG_SERVER_PORT = '8888';
		process.env.SPRING_PROFILE = 'ocitest';
		process.env.REDIS_URL = 'redis://from-env:6379';

		const { loadConfig } = await freshLoader();
		const config = await loadConfig();

		assert.deepEqual(fetched, ['http://config-server:8888/ssr/ocitest']);
		assert.equal(config.gateway.url, 'http://gateway-server:8080');
		assert.equal(config.redis.url, 'redis://from-env:6379', 'the environment outranks the config server');
		assert.equal(
			config.redis.invalidationUrl,
			'redis://invalidations-from-config-server:6379',
			'setting REDIS_URL alone must not erase the invalidation URL the config server gave',
		);
		assert.equal(config.cdn.hostName, 'cdn.example.test');
		assert.equal(config.cache.ttlSeconds, 600);
		assert.equal(config.analytics.ingestionHost, 'https://analytics.example.test');
		assert.equal(config.security.appCodeSuffix, '-test');
	});
});
