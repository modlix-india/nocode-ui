import { processLocation } from '../locationProcessor';

/**
 * `Url.origin` exists so a page can tell ANOTHER app to trust the one it is being
 * served from — the CSP `frame-ancestors` entry SiteZump writes onto a customer's
 * site so the click map can frame it. Nothing else can supply that value: the
 * server endpoints answer about the app being asked after, not about the asker,
 * and the environments do not agree on what a host looks like.
 */
describe('processLocation', () => {
	it('reads host and origin from a real Location', () => {
		const details = processLocation({
			pathname: '/siteAnalytics/site/crumbco',
			search: '',
			host: 'sitezump.local.modlix.com',
			origin: 'https://sitezump.local.modlix.com',
		} as any);

		expect(details.host).toBe('sitezump.local.modlix.com');
		expect(details.origin).toBe('https://sitezump.local.modlix.com');
	});

	it('falls back to the window on a react-router Location, which carries neither', () => {
		// This is the in-app navigation path, and it is the common one: every move
		// between pages after the first arrival goes through it.
		const details = processLocation({ pathname: '/pages', search: '' } as any);

		expect(details.origin).toBe(window.location.origin);
		expect(details.host).toBe(window.location.host);
	});

	it('still splits the path the way it always did', () => {
		const details = processLocation({
			pathname: '/siteAnalytics/site/crumbco',
			search: '?debug=true',
		} as any);

		expect(details.pageName).toBe('siteAnalytics');
		expect(details.pathParts).toEqual(['siteAnalytics', 'site', 'crumbco']);
		expect(details.queryParameters).toEqual({ debug: 'true' });
	});

	it('reads the app and client out of a /page/ url', () => {
		const details = processLocation({
			pathname: '/sitezump/SYSTEM/page/siteAnalytics/site/crumbco',
			search: '',
		} as any);

		expect(details.appName).toBe('sitezump');
		expect(details.clientCode).toBe('SYSTEM');
		expect(details.pageName).toBe('siteAnalytics');
		// The parts a page reads are relative to the page name, so `[2]` is the
		// site code on both url shapes. The analytics page depends on that.
		expect(details.pathParts?.[2]).toBe('crumbco');
	});
});
