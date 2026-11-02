import { STORE_PREFIX } from '../../constants';
import { setData } from '../../context/StoreContext';
import {
	activateConsentedScripts,
	applyConsentToBeacon,
	resetConsent,
	setConsent,
} from '../analyticsConsent';

/**
 * LZT-1915: the analytics beacon must not even be REQUESTED before the visitor grants
 * analytics. The renderers write it as a `text/plain` tag the browser neither fetches nor
 * runs; these check that only a grant turns it into a live script.
 */
const BEACON =
	'<script type="text/plain" data-mlx-consent="analytics" data-mlx-beacon="ssr"' +
	' data-src="https://analytics.example.com/a.js" data-autocapture="true"' +
	' data-heatmaps="false" data-consent="required"></script>';

const PIXEL =
	'<script type="text/plain" data-mlx-consent="marketing" data-src="https://ads.example.com/p.js"></script>';

function liveScripts(): HTMLScriptElement[] {
	return Array.from(document.querySelectorAll('script')).filter(
		s => s.type !== 'text/plain' && !!s.getAttribute('src'),
	);
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

describe('scripts held back until consent', () => {
	beforeEach(() => {
		clearStorage();
		document.head.innerHTML = BEACON + PIXEL;
		delete (globalThis as any).mlx;
		setData(`${STORE_PREFIX}.application`, {
			appCode: 'testapp',
			urlClientCode: 'SYSTEM',
			properties: { analytics: { enabled: true } },
		});
	});

	it('loads nothing when only necessary cookies are chosen', () => {
		setConsent(false);
		expect(liveScripts()).toHaveLength(0);
	});

	it('loads nothing when analytics is off and marketing on, except the marketing script', () => {
		setConsent(true, { analytics: false, marketing: true });
		expect(liveScripts().map(s => s.getAttribute('src'))).toEqual([
			'https://ads.example.com/p.js',
		]);
	});

	it('loads the beacon the moment analytics is granted, keeping its settings', () => {
		setConsent(true, { analytics: true, marketing: false });
		const live = liveScripts();
		expect(live).toHaveLength(1);
		expect(live[0].getAttribute('src')).toBe('https://analytics.example.com/a.js');
		expect(live[0].getAttribute('data-consent')).toBe('required');
		expect(live[0].getAttribute('data-autocapture')).toBe('true');
		expect(live[0].getAttribute('data-heatmaps')).toBe('false');
		// The queue the beacon replays on arrival, with the grant in it.
		const q = (globalThis as any).mlx.q.map((a: IArguments) => Array.from(a));
		expect(q).toContainEqual(['consent', true]);
	});

	it('loads it once, however often consent is applied', () => {
		setConsent(true);
		applyConsentToBeacon({
			status: 'granted',
			categories: { necessary: true, analytics: true, marketing: true },
			at: '',
			v: 1,
		});
		expect(liveScripts()).toHaveLength(2);
		expect(activateConsentedScripts('analytics')).toBe(0);
	});

	it('loads nothing after the decision is withdrawn', () => {
		resetConsent();
		expect(liveScripts()).toHaveLength(0);
	});

	it('starts a held inline script with its body', () => {
		document.head.innerHTML =
			'<script type="text/plain" data-mlx-consent="marketing">window.__pixel = 1;</script>';
		expect(activateConsentedScripts('marketing')).toBe(1);
		const live = document.head.querySelector('script')!;
		expect(live.type).toBe('');
		expect(live.text).toBe('window.__pixel = 1;');
	});

	it('can start the beacon alone', () => {
		expect(activateConsentedScripts('analytics', true)).toBe(1);
		expect(activateConsentedScripts('marketing', true)).toBe(0);
	});
});
