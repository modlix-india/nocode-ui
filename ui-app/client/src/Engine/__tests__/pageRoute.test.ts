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

/** Everything the page told the analytics beacon during one test. */
const mlxCalls: any[][] = [];
const experimentCalls = () => mlxCalls.filter(c => c[0] === 'experiment');

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
	mlxCalls.length = 0;
	(globalThis as any).mlx = (...args: any[]) => mlxCalls.push(args);
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

	// Consent no longer gates the draw. It used to, on the reasoning that drawing
	// means storing the assignment -- and the effect was that a site without a
	// working consent banner ran no test at all. Kiran's call 2026-09-20.
	it('draws and stores for a visitor who refused cookies', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: true,
			status: 'denied',
			enabled: true,
			categories: { necessary: true, analytics: false, marketing: false },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
	});

	it('draws for a visitor who has not answered yet', () => {
		mockedConsent.mockReturnValue({
			required: true,
			decided: false,
			status: null,
			enabled: true,
			categories: { necessary: true, analytics: true, marketing: true },
		});
		store({ pageRouting: ROUTING, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_a');
		expect(document.cookie).toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
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

describe('telling analytics which arm was drawn', () => {
	const SPLIT: PageRouting = {
		pricing: {
			rules: {
				exp1: {
					type: 'SPLIT',
					variants: {
						a: { page: 'pricing_a', order: 0 },
						b: { page: 'pricing_b', order: 1 },
					},
				},
			},
		},
	};

	it('sends the rule key and a variant that carries it', () => {
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		const page = resolvePageForLocation(details('pricing'));

		expect(experimentCalls()).toEqual([['experiment', 'exp1', `exp1:${page}`]]);
	});

	// The prefix is not decoration. The engine rolls up one dimension at a time
	// and its query has no filter, so two tests running at once would put their
	// arms in one undifferentiated list.
	it('makes the variant value globally unique', () => {
		store({
			pageRouting: {
				pricing: { rules: { expA: { type: 'SPLIT', variants: { x: { page: 'shared' } } } } },
				offers: { rules: { expB: { type: 'SPLIT', variants: { y: { page: 'shared' } } } } },
			},
		});

		resolvePageForLocation(details('pricing'));
		resolvePageForLocation(details('offers'));

		const variants = experimentCalls().map(c => c[2]);
		expect(variants).toEqual(['expA:shared', 'expB:shared']);
		expect(new Set(variants).size).toBe(2);
	});

	it('says nothing for a personalization rule, which is not a test', () => {
		store({ pageRouting: ROUTING, defaultPage: 'home' }, { id: 1 });

		expect(resolvePageForLocation(details('home'))).toBe('home_member');
		expect(experimentCalls()).toEqual([]);
	});

	it('says nothing when no rule applied at all', () => {
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		resolvePageForLocation(details('somewhereElse'));

		expect(experimentCalls()).toEqual([]);
	});

	// Re-reported on every navigation, including one that reuses a stored arm. The
	// beacon holds the pair rather than the page holding it, and a visitor who
	// arrives, navigates away and comes back is still in the test.
	it('reports again when an existing assignment is reused', () => {
		document.cookie = `${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${encodeURIComponent(
			JSON.stringify({ exp1: 'b' }),
		)}; path=/`;
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		resolvePageForLocation(details('pricing'));
		resolvePageForLocation(details('pricing'));

		expect(experimentCalls()).toEqual([
			['experiment', 'exp1', 'exp1:pricing_b'],
			['experiment', 'exp1', 'exp1:pricing_b'],
		]);
	});

	// The assignment cannot come from the bootstrap -- that document is cached and
	// shared -- so the browser re-derives it from the cookie SSR set.
	it('reports the arm SSR served on a direct arrival', () => {
		document.cookie = `${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${encodeURIComponent(
			JSON.stringify({ exp1: 'b' }),
		)}; path=/`;
		(globalThis as any).__APP_BOOTSTRAP__ = { resolvedPageName: 'pricing_b' };
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_b');
		expect(experimentCalls()).toEqual([['experiment', 'exp1', 'exp1:pricing_b']]);
	});

	it('reports nothing when its own answer disagrees with the bootstrap', () => {
		document.cookie = `${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${encodeURIComponent(
			JSON.stringify({ exp1: 'a' }),
		)}; path=/`;
		(globalThis as any).__APP_BOOTSTRAP__ = { resolvedPageName: 'pricing_b' };
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		// The bootstrap still wins for what renders; only the exposure is withheld.
		expect(resolvePageForLocation(details('pricing'))).toBe('pricing_b');
		expect(experimentCalls()).toEqual([]);
	});

	it('does not draw or store a second arm on the bootstrap path', () => {
		(globalThis as any).__APP_BOOTSTRAP__ = { resolvedPageName: 'pricing_a' };
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		resolvePageForLocation(details('pricing'));

		expect(document.cookie).not.toContain(PAGE_ROUTE_ASSIGNMENT_COOKIE);
	});

	// The webpack dev server serves a template with no beacon tag: the binder
	// assembles one from the application definition, and that lands after routing
	// has resolved. Dropping the tag there meant nothing was ever reported.
	it('queues the tag when the beacon has not arrived yet', () => {
		delete (globalThis as any).mlx;
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		resolvePageForLocation(details('pricing'));

		// The stub a.js replays on arrival, and its queue holds our call.
		const stub = (globalThis as any).mlx;
		expect(typeof stub).toBe('function');
		const queued = [...stub.q].map((a: any) => [...a]);
		expect(queued.length).toBe(1);
		expect(queued[0][0]).toBe('experiment');
		expect(queued[0][1]).toBe('exp1');
		// Which arm is a coin toss; that it names one of this rule's is not.
		expect(['exp1:pricing_a', 'exp1:pricing_b']).toContain(queued[0][2]);
	});

	it('uses the real beacon once it is there, rather than shadowing it', () => {
		store({ pageRouting: SPLIT, defaultPage: 'home' });

		resolvePageForLocation(details('pricing'));

		expect((globalThis as any).mlx.q).toBeUndefined();
		expect(experimentCalls().length).toBe(1);
	});
});
