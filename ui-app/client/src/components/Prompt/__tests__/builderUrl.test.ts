import { builderPageUrl, pagePathFrom } from '../builderUrl';

/**
 * The link that carries a conversation from a docked sidekick to a full page.
 *
 * Worth testing because every failure here is silent and lands the user
 * somewhere plausible: a wrong prefix opens the right page of the wrong app, and
 * a dropped session id opens an empty chat that looks like a new one.
 */

describe('pagePathFrom', () => {
	it('keeps the app and client prefix of the page it is called from', () => {
		expect(pagePathFrom('/appbuilder/SYSTEM/page/workspace/leadzump', 'ai', 'sess-1')).toBe(
			'/appbuilder/SYSTEM/page/ai/sess-1',
		);
	});

	it('takes the prefix from the `page` pivot, not the first two segments', () => {
		// A domain-mapped host serves pages with no codes in the path at all.
		// Taking parts[0]/parts[1] here would build a link back through whatever
		// page the user happened to be on.
		expect(pagePathFrom('/page/home', 'ai', 'sess-1')).toBe('/page/ai/sess-1');
	});

	it('handles a path with no page segment', () => {
		expect(pagePathFrom('/dashboard', 'ai', 'sess-1')).toBe('/page/ai/sess-1');
	});

	it('handles a prefix deeper than two segments', () => {
		expect(pagePathFrom('/a/b/c/page/x', 'ai', 'sess-1')).toBe('/a/b/c/page/ai/sess-1');
	});

	it('omits the trailing segment when there is no session yet', () => {
		expect(pagePathFrom('/appbuilder/SYSTEM/page/org', 'ai')).toBe(
			'/appbuilder/SYSTEM/page/ai',
		);
	});

	it('drops empty and undefined segments rather than emitting a double slash', () => {
		expect(pagePathFrom('/appbuilder/SYSTEM/page/org', 'ai', '')).toBe(
			'/appbuilder/SYSTEM/page/ai',
		);
		expect(pagePathFrom('/appbuilder/SYSTEM/page/org', 'ai', undefined)).toBe(
			'/appbuilder/SYSTEM/page/ai',
		);
	});

	it('encodes segments, so a stray slash cannot change the route', () => {
		expect(pagePathFrom('/appbuilder/SYSTEM/page/org', 'ai', 'a/b')).toBe(
			'/appbuilder/SYSTEM/page/ai/a%2Fb',
		);
	});

	it('does not throw when there is no pathname to read', () => {
		expect(pagePathFrom(undefined, 'ai', 'sess-1')).toBe('/page/ai/sess-1');
	});
});

describe('builderPageUrl', () => {
	it('reads the live location and builds a page path from it', () => {
		// jsdom's default location is `/`, which has no prefix and no pivot.
		expect(builderPageUrl('ai', 'sess-1')).toBe('/page/ai/sess-1');
	});
});
