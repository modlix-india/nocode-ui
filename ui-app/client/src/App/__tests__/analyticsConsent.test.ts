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
	let posthog: any;

	beforeEach(() => {
		clearStorage();
		posthog = {
			opt_in_capturing: jest.fn(),
			opt_out_capturing: jest.fn(),
			startSessionRecording: jest.fn(),
			stopSessionRecording: jest.fn(),
			register: jest.fn(),
		};
		(globalThis as any).posthog = posthog;
		setAppAnalytics({ enabled: true, consentRequired: true });
	});

	afterEach(() => {
		delete (globalThis as any).posthog;
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
		expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
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

	it('treats a missing consentRequired as required', () => {
		setAppAnalytics({ enabled: true });
		expect(publishConsentState().required).toBe(true);
	});

	it('does not ask when the app turns consent off', () => {
		setAppAnalytics({ enabled: true, consentRequired: false });
		expect(publishConsentState().required).toBe(false);
	});

	it('grants every category and opts PostHog in', () => {
		const state = setConsent(true);
		expect(state.status).toBe('granted');
		expect(state.categories).toEqual({ necessary: true, analytics: true, marketing: true });
		expect(posthog.opt_in_capturing).toHaveBeenCalled();
		expect(posthog.opt_out_capturing).not.toHaveBeenCalled();
	});

	it('never starts session recording, whatever the app document says', () => {
		setAppAnalytics({ enabled: true, consentRequired: true, sessionReplay: { enabled: true } });
		setConsent(true);
		expect(posthog.startSessionRecording).not.toHaveBeenCalled();
	});

	it('denies and opts PostHog out', () => {
		const state = setConsent(false);
		expect(state.status).toBe('denied');
		expect(state.categories.analytics).toBe(false);
		expect(posthog.opt_out_capturing).toHaveBeenCalled();
	});

	it('records a grant with every category off as a denial', () => {
		const state = setConsent(true, { analytics: false, marketing: false });
		expect(state.status).toBe('denied');
		expect(posthog.opt_out_capturing).toHaveBeenCalled();
	});

	it('keeps analytics off but marketing on as a grant that does not capture', () => {
		const state = setConsent(true, { analytics: false });
		expect(state.status).toBe('granted');
		expect(state.categories.marketing).toBe(true);
		expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
		expect(posthog.opt_out_capturing).toHaveBeenCalled();
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
		setAppAnalytics({ enabled: true, consentRequired: true, consentCookieName: 'zumpconsent' });
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
		expect(posthog.opt_out_capturing).toHaveBeenCalled();
	});

	it('ignores a corrupt stored value rather than throwing', () => {
		window.localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, '{not json');
		expect(readConsentRecord()).toBeNull();
		expect(publishConsentState().decided).toBe(false);
	});
});
