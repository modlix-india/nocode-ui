import axios from 'axios';
import { getDataFromPath } from '../../context/StoreContext';
import { disablePush, enablePush, pushStatus } from '../pushRegistration';
import { isNativeShell, pushMayBeRegistered } from '../pushGate';

jest.mock('axios');
jest.mock('../../context/StoreContext', () => ({ getDataFromPath: jest.fn() }));
jest.mock('../../components/util/getHref', () => ({
	// A shared host: every /api/ path carries the app's prefix.
	getHref: (p: string) => `/leadzumptwo/SYSTEM${p}`,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGet = getDataFromPath as jest.Mock;

const VAPID =
	'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';

function signedIn(user: any = { id: 142 }) {
	mockedGet.mockImplementation((path: string) => {
		if (path === 'Store.application.appCode') return 'leadzumptwo';
		if (path === 'Store.auth.user') return user;
		if (path.endsWith('.AuthToken')) return 'tok';
		return undefined;
	});
}

function subscription(endpoint = 'https://fcm.googleapis.com/fcm/send/abc') {
	return {
		endpoint,
		options: { applicationServerKey: undefined },
		unsubscribe: jest.fn(),
		toJSON: () => ({ endpoint, keys: { p256dh: 'p', auth: 'a' } }),
	};
}

let register: jest.Mock;
let subscribe: jest.Mock;
let getSubscription: jest.Mock;
let requestPermission: jest.Mock;

function browser(permission: NotificationPermission, existing?: any) {
	subscribe = jest.fn().mockResolvedValue(subscription());
	getSubscription = jest.fn().mockResolvedValue(existing ?? null);
	const reg = { pushManager: { subscribe, getSubscription } };
	register = jest.fn().mockResolvedValue(reg);
	requestPermission = jest.fn().mockResolvedValue('granted');
	Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
	Object.defineProperty(window, 'PushManager', { value: function () {}, configurable: true });
	Object.defineProperty(navigator, 'serviceWorker', {
		value: {
			register,
			ready: Promise.resolve(reg),
			getRegistration: jest.fn().mockResolvedValue(reg),
		},
		configurable: true,
	});
	(globalThis as any).Notification = { permission, requestPermission };
}

beforeEach(() => {
	jest.clearAllMocks();
	delete (globalThis as any).flutter_inappwebview;
	signedIn();
});

test('an app without notifications registers nothing, not even a service worker', async () => {
	browser('granted');
	mockedAxios.get.mockResolvedValue({ data: { enabled: false, vapidPublicKey: VAPID } });
	expect(await enablePush(true)).toEqual({ status: 'unsupported', registered: false });
	expect(mockedAxios.get.mock.calls[0][0]).toBe(
		'/leadzumptwo/SYSTEM/api/notification/push/config',
	);
	expect(register).not.toHaveBeenCalled();
	expect(requestPermission).not.toHaveBeenCalled();
	expect(mockedAxios.post).not.toHaveBeenCalled();
});

test('a browser asks once, registers the worker for the whole site and saves the subscription', async () => {
	browser('default');
	mockedAxios.get.mockResolvedValue({ data: { enabled: true, vapidPublicKey: VAPID } });
	mockedAxios.post.mockResolvedValue({ data: { registered: true } });
	expect(await enablePush(true)).toEqual({ status: 'granted', registered: true });
	expect(requestPermission).toHaveBeenCalledTimes(1);
	expect(register).toHaveBeenCalledWith(
		'/leadzumptwo/SYSTEM/api/notification/push/sw.js?base=%2Fleadzumptwo%2FSYSTEM',
		{ scope: '/' },
	);
	const key: Uint8Array = subscribe.mock.calls[0][0].applicationServerKey;
	expect(key.length).toBe(65);
	expect(key[0]).toBe(4);
	const [url, body, opts] = mockedAxios.post.mock.calls[0];
	expect(url).toBe('/leadzumptwo/SYSTEM/api/notification/push/devices');
	expect(body).toEqual({
		platform: 'WEB',
		token: 'https://fcm.googleapis.com/fcm/send/abc',
		keys: { p256dh: 'p', auth: 'a' },
	});
	expect(opts).toMatchObject({
		params: { appCode: 'leadzumptwo' },
		headers: { Authorization: 'tok' },
	});
});

test('without a prompt a browser that never decided is left alone', async () => {
	browser('default');
	mockedAxios.get.mockResolvedValue({ data: { enabled: true, vapidPublicKey: VAPID } });
	expect(await enablePush(false)).toEqual({ status: 'default', registered: false });
	expect(requestPermission).not.toHaveBeenCalled();
	expect(register).not.toHaveBeenCalled();
});

test('nobody signed in: nothing is asked or sent', async () => {
	browser('granted');
	signedIn(null);
	expect(await enablePush(true)).toEqual({ status: 'granted', registered: false });
	expect(mockedAxios.get).not.toHaveBeenCalled();
});

test('inside the mobile app the phone token is saved', async () => {
	const callHandler = jest.fn().mockResolvedValue({
		status: 'granted',
		platform: 'IOS',
		token: 'abcdef',
		appIdentifier: 'com.modlix.apps.system.lz',
		providerAccount: 'TEAM',
		apnsEnv: 'production',
	});
	(globalThis as any).flutter_inappwebview = { callHandler };
	Object.defineProperty(navigator, 'userAgent', {
		value: 'Mozilla/5.0 ModlixApp/3 SYSTEM/lz',
		configurable: true,
	});
	expect(isNativeShell()).toBe(true);
	expect(pushMayBeRegistered()).toBe(true);
	mockedAxios.get.mockResolvedValue({ data: { enabled: true } });
	mockedAxios.post.mockResolvedValue({ data: { registered: true } });
	expect(await enablePush(true)).toEqual({ status: 'granted', registered: true });
	expect(callHandler).toHaveBeenCalledWith('pushRegister', { prompt: true });
	expect(mockedAxios.post.mock.calls[0][1]).toEqual({
		platform: 'IOS',
		token: 'abcdef',
		appIdentifier: 'com.modlix.apps.system.lz',
		providerAccount: 'TEAM',
		apnsEnv: 'production',
	});

	callHandler.mockResolvedValue({ status: 'denied' });
	expect(await pushStatus()).toBe('denied');
	Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0', configurable: true });
});

test('sign-out removes the subscription from this user but keeps it in the browser', async () => {
	const sub = subscription();
	browser('granted', sub);
	mockedAxios.delete.mockResolvedValue({ data: { removed: 1 } });
	await disablePush();
	expect(mockedAxios.delete).toHaveBeenCalledWith(
		'/leadzumptwo/SYSTEM/api/notification/push/devices',
		expect.objectContaining({ data: { platform: 'WEB', token: sub.endpoint } }),
	);
	expect(sub.unsubscribe).not.toHaveBeenCalled();
});
