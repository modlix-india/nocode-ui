import { resetBootstrapResolution, resolvePageForLocation } from '../pageRoute';
import { getDataFromPath } from '../../context/StoreContext';
import { getConsentState } from '../../App/analyticsConsent';
import {
	PAGE_ROUTE_ASSIGNMENT_COOKIE,
	PAGE_ROUTE_QUERY_COOKIE,
	PageRouting,
} from '../../util/pageRouting';

jest.mock('../../context/StoreContext', () => ({ getDataFromPath: jest.fn() }));
jest.mock('../../App/analyticsConsent', () => ({ getConsentState: jest.fn() }));

const mockedGet = getDataFromPath as jest.Mock;
const mockedConsent = getConsentState as jest.Mock;

const ROUTING: PageRouting = {
	pricing: {
		rules: {
			r1: {
				order: 0,
				type: 'PERSONALIZATION',
				page: 'pricing_dentists',
				conditions: {
					c: { source: 'QUERY', field: 'utm_campaign', operator: 'EQUALS', value: 'dentists' },
				},
			},
			r2: { order: 1, type: 'SPLIT', variants: { a: { page: 'pricing_a' } } },
		},
	},
	home: {
		rules: {
			m: {
				type: 'PERSONALIZATION',
				page: 'home_member',
				conditions: { c: { source: 'AUTH', operator: 'EQUALS', value: 'true' } },
			},
		},
	},
};

/** Route store reads to a plain object, the way the running app holds them. */
function store(properties: any, user?: any, urlData?: any) {
	mockedGet.mockImplementation((path: string) => {
		if (path.endsWith('.application.properties')) return properties;
		if (path.endsWith('.application.properties.defaultPage')) return properties?.defaultPage;
		if (path.endsWith('.auth.user')) return user;
		if (path.endsWith('.urlData')) return urlData;
		return undefined;
	});
}

const details = (pageName?: string, queryParameters: any = {}) => ({ pageName, queryParameters });

function clearCookies() {
	for (const part of document.cookie.split(';')) {
		const name = part.split('=')[0]?.trim();
		if (name) document.cookie = `${name}=; path=/; max-age=0`;
	}
}

beforeEach(() => {
	jest.clearAllMocks();
	clearCookies();
	resetBootstrapResolution();
	delete (globalThis as any).__APP_BOOTSTRAP__;
	// The app asks for no consent unless a test says otherwise.
	mockedConsent.mockReturnValue({
		required: false,
		decided: false,
		status: null,
		enabled: false,
		categories: { necessary: true, analytics: false, marketing: false },
	});
});

describe('the SSR answer on first load', () => {
	it('is taken instead of resolving again, so the bootstrap is not missed', () => {
		(globalThis as any).__APP_BOOTSTRAP__ = { resolvedPageName: 'pricing_b' };
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_b');
	});

	it('is used once — the next navigation resolves for itself', () => {
		(globalThis as any).__APP_BOOTSTRAP__ = { resolvedPageName: 'pricing_b' };
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_b');
		expect(resolvePageForLocation(details('about'))).toBe('about');
	});

	it('does not stop a page served without a bootstrap from resolving', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' });
		expect(resolvePageForLocation(details('pricing', { utm_campaign: 'dentists' }))).toBe(
			'pricing_dentists',
		);
	});
});

describe('resolving in the browser', () => {
	it('applies a personalization rule from the query string', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' });
		expect(resolvePageForLocation(details('pricing', { utm_campaign: 'dentists' }))).toBe(
			'pricing_dentists',
		);
	});

	it('reads the signed-in state from the store', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, { id: 7 });
		expect(resolvePageForLocation(details(undefined))).toBe('home_member');

		store({ pageRouting: ROUTING, defaultPage: 'home' });
		expect(resolvePageForLocation(details(undefined))).toBe('home');
	});

	it('leaves an unrouted page alone', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' });
		expect(resolvePageForLocation(details('about'))).toBe('about');
	});

	it('falls back to the URL then the default page when no definition has loaded', () => {
		store(undefined);
		expect(resolvePageForLocation(details('about'))).toBe('about');
	});
});

describe('query parameters across a visit', () => {
	// Landed on /landing?utm_campaign=dentists, then clicked through to /pricing,
	// which carries no query of its own.
	const arrivedOnLanding = {
		landing: { pageName: 'landing', queryParameters: { utm_campaign: 'dentists' } },
		pricing: { pageName: 'pricing', queryParameters: {} },
	};

	it('still matches a campaign rule after navigating away from the landing page', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, arrivedOnLanding);
		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_dentists');
	});

	it('lets the URL showing now win over a value carried from an earlier page', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, arrivedOnLanding);
		expect(
			resolvePageForLocation(details('pricing', { utm_campaign: 'clinics' })),
		).toBe('pricing_a');
	});

	it('is unaffected when nothing has been visited yet', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, undefined);
		expect(resolvePageForLocation(details('pricing', { utm_campaign: 'dentists' }))).toBe(
			'pricing_dentists',
		);
	});

	it('carries the campaign forward in a cookie once consent is granted', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: true,
			status: 'granted',
			enabled: true,
			categories: { necessary: true, analytics: true, marketing: true },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		resolvePageForLocation(details('pricing', { utm_campaign: 'dentists' }));
		expect(document.cookie).toContain(PAGE_ROUTE_QUERY_COOKIE);
		const raw = decodeURIComponent(
			document.cookie.split(`${PAGE_ROUTE_QUERY_COOKIE}=`)[1].split(';')[0],
		);
		// Only the fields some rule actually tests.
		expect(JSON.parse(raw)).toEqual({ utm_campaign: 'dentists' });
	});

	it('stores nothing at all when consent was withheld', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: true,
			status: 'denied',
			enabled: true,
			categories: { necessary: true, analytics: false, marketing: false },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		resolvePageForLocation(details('pricing', { utm_campaign: 'dentists' }));
		expect(document.cookie).not.toContain(PAGE_ROUTE_QUERY_COOKIE);
	});

	it('does not persist a query field no rule looks at', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' });
		resolvePageForLocation(details('pricing', { email: 'someone@example.com' }));
		expect(document.cookie).not.toContain('example.com');
	});

	it('reads a carried campaign back on a later visit with no history', () => {
		document.cookie = `${PAGE_ROUTE_QUERY_COOKIE}=${encodeURIComponent(
			JSON.stringify({ utm_campaign: 'dentists' }),
		)}; path=/`;
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, undefined);

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_dentists');
	});

	it('lets this visit override what an earlier one carried', () => {
		document.cookie = `${PAGE_ROUTE_QUERY_COOKIE}=${encodeURIComponent(
			JSON.stringify({ utm_campaign: 'dentists' }),
		)}; path=/`;
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, undefined);

		expect(resolvePageForLocation(details('pricing', { utm_campaign: 'clinics' }))).toBe(
			'pricing_a',
		);
	});

	it('survives a junk urlData rather than throwing', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, undefined, {
			a: null,
			b: 'not an object',
			c: { queryParameters: 'also not an object' },
		});
		expect(resolvePageForLocation(details('about'))).toBe('about');
	});
});

describe('split assignments', () => {
	it('stores the arm it drew, so the next navigation is not redrawn', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
		expect(
			JSON.parse(
				decodeURIComponent(
					document.cookie.split(`${PAGE_ROUTE_ASSIGNMENT_COOKIE}=`)[1].split(';')[0],
				),
			),
		).toEqual({ r2: 'a' });
	});

	it('honours an arm already in the cookie', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					r2: {
						type: 'SPLIT',
						variants: { a: { page: 'pricing_a' }, b: { page: 'pricing_b' } },
					},
				},
			},
		};
		document.cookie = `${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${encodeURIComponent(
			JSON.stringify({ r2: 'b' }),
		)}; path=/`;
		store({ pageRouting: routing });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_b');
	});

	it('does not draw, or store anything, when consent was withheld', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: true,
			status: 'denied',
			enabled: true,
			categories: { necessary: true, analytics: false, marketing: false },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		// Served an arm, but the FIRST one rather than a draw, and nothing stored.
		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).not.toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
	});

	it('treats an undecided visitor as withholding, not as agreeing', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: false,
			status: null,
			enabled: true,
			// Everything on, which is what a preferences panel shows before a choice
			// is made. Reading it as agreement would draw on silence.
			categories: { necessary: true, analytics: true, marketing: true },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).not.toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
	});

	it('draws once the visitor has agreed', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: true,
			status: 'granted',
			enabled: true,
			categories: { necessary: true, analytics: true, marketing: true },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
	});
});
