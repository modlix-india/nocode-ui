import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatFileMessage } from '../logger.js';

/**
 * These pin a contract that lives in another repository.
 *
 * Alloy tails /var/log/apps/*.log and runs one `stage.json` over every line
 * (oci-config/scripts/monitoring/alloy/config-base.alloy):
 *
 *     level       = "_level_name"
 *     service     = "host"
 *     instance_id = "instanceId"
 *
 * Nothing validates that the writer and that reader agree. When they did not, this process wrote
 * the console's plain text to the file too, and 232,000 lines a day - about 95% of production's
 * log volume on that host - arrived in Loki with no level, no service and no instance. No error
 * was raised anywhere; the labels were simply absent, which reads as "no SSR errors today".
 *
 * So these are not tests of JSON.stringify. They are the only place the field names are checked
 * against the thing that consumes them. If one is renamed, this fails instead of the alerting.
 */
describe('SSR file log format (GELF, consumed by Alloy)', () => {
	const parse = (line: string) => JSON.parse(line) as Record<string, unknown>;

	it('emits the three fields Alloy turns into labels', () => {
		const r = parse(formatFileMessage('INFO', 'SSR page request'));

		assert.equal(r._level_name, 'INFO', 'Alloy maps _level_name -> the `level` label');
		assert.equal(r.host, 'ssr', 'Alloy maps host -> the `service` label');
		assert.ok('instanceId' in r, 'Alloy maps instanceId -> the `instance_id` label');
	});

	it('carries the message in short_message, not in a free-text line', () => {
		const r = parse(formatFileMessage('INFO', 'HTML cache hit'));
		assert.equal(r.short_message, 'HTML cache hit');
		assert.equal(r.version, '1.1');
	});

	it('maps each level to its GELF severity and keeps the name', () => {
		for (const [level, severity] of [
			['ERROR', 3],
			['WARN', 4],
			['INFO', 6],
			['DEBUG', 7],
		] as const) {
			const r = parse(formatFileMessage(level, 'x'));
			assert.equal(r.level, severity, `${level} should be GELF severity ${severity}`);
			assert.equal(r._level_name, level);
		}
	});

	it('prefixes metadata with _ and never emits a bare id', () => {
		const r = parse(formatFileMessage('INFO', 'SSR page request', { url: '/deals', id: 'nope' }));

		assert.equal(r._url, '/deals', 'GELF additional fields must be underscore-prefixed');
		assert.ok(!('url' in r), 'the unprefixed key must not also be present');
		assert.ok(!('id' in r) && !('_id' in r), 'GELF forbids an id field');
	});

	it('does not double-prefix a key that already starts with _', () => {
		const r = parse(formatFileMessage('INFO', 'x', { _already: 1 }));
		assert.equal(r._already, 1);
		assert.ok(!('__already' in r));
	});

	it('is one single line, because Alloy parses per line', () => {
		const line = formatFileMessage('ERROR', 'boom', { stack: 'a\nb\nc' });
		assert.equal(line.includes('\n'), false, 'a newline would split one record into several');
		assert.equal(parse(line)._stack, 'a\nb\nc', 'and the newline must survive inside the value');
	});

	it('falls back to text rather than throwing when meta cannot be serialised', () => {
		// A logging call must never be able to take the process down.
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		const line = formatFileMessage('ERROR', 'still logged', circular);
		assert.ok(line.includes('still logged'));
		assert.equal(line.includes('\n'), false);
	});
});
