import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCacheableResolution } from '../codeResolver.js';

test('a draft host is never cached, so a rotated link stops resolving at once', () => {
	assert.equal(isCacheableResolution('d893dd891db83e69bd399ca6cae1ff43e.stage.modlix.com'), false);
	assert.equal(isCacheableResolution('d893dd891db83e69bd399ca6cae1ff43e.stage.modlix.com:443'), false);
	assert.equal(isCacheableResolution('ddbb40fb9084b830a3fe865258796c644.local.modlix.com', 'LIVE'), false);
});

test('a DRAFT answer is never cached, whatever the hostname looks like', () => {
	assert.equal(isCacheableResolution('preview.example.com', 'DRAFT'), false);
});

test('live hosts keep the cache', () => {
	assert.equal(isCacheableResolution('stage.leadzump.ai'), true);
	assert.equal(isCacheableResolution('stage.leadzump.ai', 'LIVE'), true);
	assert.equal(isCacheableResolution('dev.leadzump.ai'), true);
	// a label that only starts with d and hex, or is too short, is not a draft host
	assert.equal(isCacheableResolution('deadbeef.modlix.com'), true);
	assert.equal(isCacheableResolution('d893dd891db83e69bd399ca6cae1ff43ex.modlix.com'), true);
});

test('the hosting gate swaps only when security names another app for a suspended client', async () => {
	const { askHostingGate } = await import('../codeResolver.js');
	const realFetch = globalThis.fetch;
	const answer = (status: number, body: unknown) => {
		globalThis.fetch = (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
	};
	try {
		answer(200, { suspended: true, serveAppCode: 'paused', serveClientCode: 'SYSTEM' });
		assert.deepEqual(await askHostingGate('site1', 'FIN'), { appCode: 'paused', clientCode: 'SYSTEM' });
		answer(200, { suspended: false, serveAppCode: 'site1', serveClientCode: 'FIN' });
		assert.equal(await askHostingGate('site1', 'FIN'), null);
		// suspended but no target named: serve the site
		answer(200, { suspended: true, serveAppCode: 'site1', serveClientCode: 'FIN' });
		assert.equal(await askHostingGate('site1', 'FIN'), null);
		answer(200, { suspended: true, serveAppCode: '', serveClientCode: 'SYSTEM' });
		assert.equal(await askHostingGate('site1', 'FIN'), null);
		// security did not answer: undefined, so the caller serves the site and caches nothing
		answer(500, {});
		assert.equal(await askHostingGate('site1', 'FIN'), undefined);
	} finally {
		globalThis.fetch = realFetch;
	}
});
