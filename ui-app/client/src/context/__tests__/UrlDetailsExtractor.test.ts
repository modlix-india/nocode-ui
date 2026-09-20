import { GLOBAL_CONTEXT_NAME } from '../../constants';
import { UrlDetailsExtractor, getDataFromPath, setData } from '../StoreContext';

/**
 * Every case below is a context whose name is not the page the URL names, which
 * is the ordinary case rather than the exception.
 */
describe('UrlDetailsExtractor', () => {
	beforeEach(() => {
		setData('Store.urlDetails', {});
		setData('Store.urlData', {});
		setData('Store.application.properties.defaultPage', 'newHome');
	});

	it('resolves the default page when the URL names none', () => {
		UrlDetailsExtractor.addDetails({
			queryParameters: { utm_campaign: 'test1' },
			pathParts: [],
		});

		expect(getDataFromPath('Store.urlDetails.pageName', [])).toBe('newHome');
		expect(
			UrlDetailsExtractor.getForContext('newHome').getValue('Url.queryParameters.utm_campaign'),
		).toBe('test1');
	});

	it('reads the same URL from a context the URL never named', () => {
		UrlDetailsExtractor.addDetails({
			queryParameters: { a: '1' },
			pathParts: ['somePage'],
			pageName: 'somePage',
		});

		// The shell, the page routing resolved to, and a subpage.
		for (const context of [GLOBAL_CONTEXT_NAME, 'somePage_b', 'someSubPage'])
			expect(UrlDetailsExtractor.getForContext(context).getValue('Url.queryParameters.a')).toBe(
				'1',
			);
	});

	it('does not lose a query parameter to a context asking after the fact', () => {
		UrlDetailsExtractor.addDetails({ queryParameters: { a: '1' }, pathParts: [] });

		// This is what every component does on render, and it used to overwrite
		// the details with an empty copy of its own.
		UrlDetailsExtractor.getForContext('newHome');

		expect(getDataFromPath('Store.urlDetails.queryParameters', [])).toEqual({ a: '1' });
	});

	it('replaces the previous URL on navigation rather than accumulating pages', () => {
		UrlDetailsExtractor.addDetails({
			queryParameters: { a: '1' },
			pathParts: ['newHome'],
			pageName: 'newHome',
		});
		UrlDetailsExtractor.addDetails({
			queryParameters: {},
			pathParts: ['aboutUs'],
			pageName: 'aboutUs',
		});

		expect(getDataFromPath('Store.urlDetails', [])).toEqual({
			queryParameters: {},
			pathParts: ['aboutUs'],
			pageName: 'aboutUs',
		});
		// The stale query parameter is gone, not merged in underneath.
		expect(
			UrlDetailsExtractor.getForContext('aboutUs').getValue('Url.queryParameters.a'),
		).toBeUndefined();
	});

	/**
	 * Pages bind to `Store.urlData.<page>` by absolute path -- leadzump's `deals`
	 * to its own entry, and `tasks` and `bpTeammates` to `deals`' entry, which is
	 * how a dashboard hands a drill-through filter to the list.
	 */
	describe('Store.urlData, which pages bind to by absolute path', () => {
		it('fills the default page entry when the URL names no page', () => {
			UrlDetailsExtractor.addDetails({
				queryParameters: { utm_campaign: 'test1' },
				pathParts: [],
			});

			expect(getDataFromPath('Store.urlData.newHome.queryParameters', [])).toEqual({
				utm_campaign: 'test1',
			});
		});

		it('keeps the entry of a page navigated away from', () => {
			UrlDetailsExtractor.addDetails({
				queryParameters: { stage: 'WON' },
				pathParts: ['deals'],
				pageName: 'deals',
			});
			UrlDetailsExtractor.addDetails({
				queryParameters: {},
				pathParts: ['tasks'],
				pageName: 'tasks',
			});

			// What `tasks` reads on load.
			expect(getDataFromPath('Store.urlData.deals.queryParameters.stage', [])).toBe('WON');
			expect(getDataFromPath('Store.urlData.tasks.queryParameters', [])).toEqual({});
		});

		it('replaces a page entry when that page is the URL again', () => {
			UrlDetailsExtractor.addDetails({ queryParameters: { stage: 'WON' }, pageName: 'deals' });
			UrlDetailsExtractor.addDetails({ queryParameters: {}, pageName: 'deals' });

			expect(getDataFromPath('Store.urlData.deals.queryParameters', [])).toEqual({});
		});
	});
});
