import { STORE_PREFIX } from '../../constants';
import { setData } from '../../context/StoreContext';
import {
	DEFAULT_CONSENT_COOKIE_NAME,
	getConsentState,
	publishConsentState,
	readConsentRecord,
	resetConsent,
	setConsent,
} from '../analyticsConsent';

function setAppAnalytics(analytics: any) {
	setData(`${STORE_PREFIX}.application`, {
		appCode: 'testapp',
		urlClientCode: 'SYSTEM',
		properties: { analytics },
	});
}

function clearStorage() {
	window.localStorage.clear();
	document.cookie
		.split('; ')
		.filter(Boolean)
		.forEach(row => {
			document.cookie = `${row.split('=')[0]}=; path=/; max-age=0`;
		});
}

describe('analytics consent', () => {
	// The beacon's queue stub, which is what the page really talks to: window.mlx exists
	// before the script has loaded, so consent decided during the first paint is not lost.
	let beacon: jest.Mock;

	/** Whether consent was last pushed as granted, denied, or not pushed at all. */
	const lastConsent = (): boolean | undefined => {
		const calls = beacon.mock.calls.filter(c => c[0] === 'consent');
		return calls.length ? !!calls[calls.length - 1][1] : undefined;
	};

	beforeEach(() => {
		clearStorage();
		beacon = jest.fn();
		(globalThis as any).mlx = beacon;
		setAppAnalytics({ enabled: true });
	});

	afterEach(() => {
		delete (globalThis as any).mlx;
	});

	it('starts undecided, so a consent page is asked for', () => {
		const state = publishConsentState();
		expect(state.decided).toBe(false);
		expect(state.status).toBeNull();
		expect(state.required).toBe(true);
		expect(state.enabled).toBe(true);
	});

	it('offers every category switched on before a decision is made', () => {
		const state = publishConsentState();
		expect(state.categories).toEqual({ necessary: true, analytics: true, marketing: true });
	});

	it('does not capture on the strength of those defaults', () => {
		publishConsentState();
		expect(lastConsent()).toBeUndefined();
		expect(getConsentState().decided).toBe(false);
	});

	it('shows the stored choice, not the defaults, once decided', () => {
		setConsent(true, { analytics: false, marketing: true });
		expect(publishConsentState().categories).toEqual({
			necessary: true,
			analytics: false,
			marketing: true,
		});
	});

	it('requires consent unconditionally, whatever the application says', () => {
		// The app-level switch is gone. A document that still carries
		// `consentRequired: false` — several do — must no longer be able to turn
		// asking off, because that is the failure nobody sees: the pages render,
		// the numbers arrive, and the banner simply never appears.
		setAppAnalytics({ enabled: true, consentRequired: false } as any);
		expect(publishConsentState().required).toBe(true);
		expect(getConsentState().decided).toBe(false);

		setAppAnalytics({ enabled: true });
		expect(publishConsentState().required).toBe(true);
	});

	it('grants every category and switches the beacon on', () => {
		const state = setConsent(true);
		expect(state.status).toBe('granted');
		expect(state.categories).toEqual({ necessary: true, analytics: true, marketing: true });
		expect(lastConsent()).toBe(true);
	});

	it('denies and switches the beacon off', () => {
		const state = setConsent(false);
		expect(state.status).toBe('denied');
		expect(state.categories.analytics).toBe(false);
		expect(lastConsent()).toBe(false);
	});

	it('records a grant with every category off as a denial', () => {
		const state = setConsent(true, { analytics: false, marketing: false });
		expect(state.status).toBe('denied');
		expect(lastConsent()).toBe(false);
	});

	it('keeps analytics off but marketing on as a grant that does not capture', () => {
		const state = setConsent(true, { analytics: false });
		expect(state.status).toBe('granted');
		expect(state.categories.marketing).toBe(true);
		expect(lastConsent()).toBe(false);
	});

	it('never lets necessary be switched off', () => {
		expect(setConsent(false, { necessary: false } as any).categories.necessary).toBe(true);
	});

	it('survives a reload through localStorage', () => {
		setConsent(true, { marketing: false });
		const record = readConsentRecord();
		expect(record?.status).toBe('granted');
		expect(record?.categories).toEqual({
			necessary: true,
			analytics: true,
			marketing: false,
		});
		expect(publishConsentState().decided).toBe(true);
	});

	it('falls back to the cookie when localStorage is unavailable', () => {
		setConsent(true);
		window.localStorage.clear();
		expect(readConsentRecord()?.status).toBe('granted');
	});

	it('reads the bare-word value written by earlier releases', () => {
		window.localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, 'granted');
		const record = readConsentRecord();
		expect(record?.status).toBe('granted');
		expect(record?.categories.analytics).toBe(true);
		expect(publishConsentState().decided).toBe(true);
	});

	it('honours a custom cookie name from the application', () => {
		setAppAnalytics({ enabled: true, consentCookieName: 'zumpconsent' });
		setConsent(true);
		expect(window.localStorage.getItem('zumpconsent')).toBeTruthy();
		expect(window.localStorage.getItem(DEFAULT_CONSENT_COOKIE_NAME)).toBeNull();
	});

	it('forgets the decision on reset so the page is asked again', () => {
		setConsent(true);
		expect(getConsentState().decided).toBe(true);

		const cleared = resetConsent();
		expect(cleared.decided).toBe(false);
		expect(cleared.status).toBeNull();
		expect(readConsentRecord()).toBeNull();
		expect(lastConsent()).toBe(false);
	});

	it('ignores a corrupt stored value rather than throwing', () => {
		window.localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, '{not json');
		expect(readConsentRecord()).toBeNull();
		expect(publishConsentState().decided).toBe(false);
	});
});
