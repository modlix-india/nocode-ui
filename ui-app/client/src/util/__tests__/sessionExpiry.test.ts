import axios, { AxiosAdapter } from 'axios';
import {
	installSessionExpiryWatch,
	setReloadForTests,
	uninstallSessionExpiryWatch,
} from '../sessionExpiry';

const APP_ON = { properties: { signInOnSessionExpiry: true } };
const TOKEN = 'tok-123';

const reload = jest.fn();
let calls: string[];
let answers: Record<string, number>;

const adapter: AxiosAdapter = async config => {
	const url = config.url ?? '';
	calls.push(url);
	const status = answers[url] ?? 200;
	const response = { data: {}, status, statusText: '', headers: {}, config };
	if (status >= 400) {
		const err: any = new Error('Request failed with status code ' + status);
		err.config = config;
		err.response = response;
		err.isAxiosError = true;
		throw err;
	}
	return response;
};

function signIn(expiresInSeconds: number) {
	localStorage.setItem('AuthToken', JSON.stringify(TOKEN));
	localStorage.setItem(
		'AuthTokenExpiry',
		String(Math.floor(Date.now() / 1000) + expiresInSeconds),
	);
}

const call = (url: string, withToken = true) =>
	axios.post(url, {}, { headers: withToken ? { Authorization: TOKEN } : {} });

/** Settled or still pending after the microtasks have run. */
async function state(p: Promise<any>): Promise<'resolved' | 'rejected' | 'pending'> {
	let s: 'resolved' | 'rejected' | 'pending' = 'pending';
	p.then(
		() => (s = 'resolved'),
		() => (s = 'rejected'),
	);
	for (let i = 0; i < 20; i++) await Promise.resolve();
	await new Promise(r => setTimeout(r, 0));
	return s;
}

beforeEach(() => {
	axios.defaults.adapter = adapter;
	calls = [];
	answers = {};
	reload.mockReset();
	setReloadForTests(reload);
	localStorage.clear();
	globalThis.isDesignMode = false;
});

afterEach(() => uninstallSessionExpiryWatch());

describe('session expiry watch', () => {
	it('is not installed unless the app opts in', async () => {
		expect(installSessionExpiryWatch({ properties: {} })).toBe(false);
		expect(installSessionExpiryWatch(undefined)).toBe(false);
		signIn(-60);
		answers['api/core/function/execute/X/y'] = 403;
		expect(await state(call('api/core/function/execute/X/y'))).toBe('rejected');
		expect(reload).not.toHaveBeenCalled();
		expect(localStorage.getItem('AuthToken')).not.toBeNull();
	});

	it('is not installed in design mode', () => {
		globalThis.isDesignMode = true;
		expect(installSessionExpiryWatch(APP_ON)).toBe(false);
	});

	it('stops a call carrying a clock-expired token and reloads for sign in', async () => {
		installSessionExpiryWatch(APP_ON);
		signIn(-60);
		expect(await state(call('api/core/function/execute/X/y'))).toBe('pending');
		expect(calls).toEqual([]);
		expect(reload).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem('AuthToken')).toBeNull();
		expect(localStorage.getItem('AuthTokenExpiry')).toBeNull();
	});

	it('reloads when a refused call carried a token the server no longer knows', async () => {
		installSessionExpiryWatch(APP_ON);
		signIn(600);
		answers['api/core/function/execute/X/y'] = 403;
		answers['api/security/verifyToken'] = 401;
		const first = call('api/core/function/execute/X/y');
		const second = call('api/core/function/execute/X/y');
		expect(await state(first)).toBe('pending');
		expect(await state(second)).toBe('pending');
		expect(calls.filter(c => c === 'api/security/verifyToken')).toHaveLength(1);
		expect(reload).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem('AuthToken')).toBeNull();
	});

	it('leaves a genuine permission refusal to the page', async () => {
		installSessionExpiryWatch(APP_ON);
		signIn(600);
		answers['api/core/function/execute/X/y'] = 403;
		expect(await state(call('api/core/function/execute/X/y'))).toBe('rejected');
		expect(await state(call('api/core/function/execute/X/y'))).toBe('rejected');
		// The live answer is remembered: one check for the two refusals.
		expect(calls.filter(c => c === 'api/security/verifyToken')).toHaveLength(1);
		expect(reload).not.toHaveBeenCalled();
		expect(localStorage.getItem('AuthToken')).not.toBeNull();
	});

	it('does not sign anyone out when the check itself fails', async () => {
		installSessionExpiryWatch(APP_ON);
		signIn(600);
		answers['api/core/function/execute/X/y'] = 401;
		answers['api/security/verifyToken'] = 502;
		expect(await state(call('api/core/function/execute/X/y'))).toBe('rejected');
		expect(reload).not.toHaveBeenCalled();
	});

	it('ignores calls without the stored token (anonymous pages, sign in)', async () => {
		installSessionExpiryWatch(APP_ON);
		answers['api/security/authenticate'] = 401;
		expect(await state(call('api/security/authenticate', false))).toBe('rejected');
		signIn(600);
		expect(await state(call('api/security/authenticate', false))).toBe('rejected');
		expect(calls).not.toContain('api/security/verifyToken');
		expect(reload).not.toHaveBeenCalled();
	});

	it('does not touch other errors', async () => {
		installSessionExpiryWatch(APP_ON);
		signIn(600);
		answers['api/core/function/execute/X/y'] = 500;
		expect(await state(call('api/core/function/execute/X/y'))).toBe('rejected');
		expect(calls).not.toContain('api/security/verifyToken');
		expect(reload).not.toHaveBeenCalled();
	});

	it('reloads when the tab comes back after the session ran out', () => {
		installSessionExpiryWatch(APP_ON);
		signIn(-60);
		document.dispatchEvent(new Event('visibilitychange'));
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it('does nothing on return when the session is alive or absent', () => {
		installSessionExpiryWatch(APP_ON);
		document.dispatchEvent(new Event('visibilitychange'));
		signIn(600);
		document.dispatchEvent(new Event('visibilitychange'));
		expect(reload).not.toHaveBeenCalled();
	});
});
