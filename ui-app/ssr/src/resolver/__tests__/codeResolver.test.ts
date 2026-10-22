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
