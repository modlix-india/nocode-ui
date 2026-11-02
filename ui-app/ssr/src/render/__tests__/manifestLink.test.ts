import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generateExternalLinks } from '../htmlRenderer.js';
import type { ApplicationDefinition } from '../../api/client.js';

const app = (properties: ApplicationDefinition['properties']): ApplicationDefinition => ({
	name: 'loopzump',
	appCode: 'loopzump',
	clientCode: 'SYSTEM',
	properties,
});

describe('the PWA manifest link', () => {
	it('is written after the app links when the app has a manifest', () => {
		const html = generateExternalLinks(
			app({
				links: { icon: { rel: 'icon', href: 'api/files/static/file/SYSTEM/x.png' } },
				manifest: { name: 'LoopZump', icons: [] },
			}),
		);
		assert.equal(
			html,
			'<link rel="icon" href="api/files/static/file/SYSTEM/x.png">\n\t\t<link rel="manifest" href="api/manifest/manifest.json">',
		);
	});

	it('is left out without one, or with an empty one', () => {
		assert.equal(generateExternalLinks(app({})), '');
		assert.equal(generateExternalLinks(app({ manifest: {} })), '');
		assert.equal(generateExternalLinks(null), '');
	});
});
