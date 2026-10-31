import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { getHref } from '../components/util/getHref';
import { isNativeShell } from './pushGate';

// Push registration for this browser or, inside the Modlix mobile app, this phone. Loaded with
// import() only: from UIEngine.EnablePushNotifications / GetPushStatus, from sign-out, and from
// the App's resume when push permission is already granted. A site never loads it.
//
// The notification service keeps the device; an app without notifications answers
// enabled: false and nothing is registered (no service worker either).

export type PushStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export type PushResult = { status: PushStatus; registered: boolean };

type NativeDevice = {
	status?: PushStatus;
	platform?: 'ANDROID' | 'IOS';
	token?: string;
	appIdentifier?: string;
	providerAccount?: string;
	apnsEnv?: string;
};

const SW_PATH = '/api/notification/push/sw.js';

function appCode(): string {
	return getDataFromPath('Store.application.appCode', []) ?? globalThis.__mlxAppCode ?? '';
}

function headers(): Record<string, string> {
	const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
	return token ? { Authorization: token } : {};
}

/** The /{app}/{client} prefix on a shared host, empty on the app's own domain. */
function pathPrefix(): string {
	const href = getHref(SW_PATH, window.location) ?? SW_PATH;
	return href.substring(0, href.length - SW_PATH.length);
}

function api(path: string): string {
	return getHref(path, window.location) ?? path;
}

function nativeCall<T>(handler: string, args?: any): Promise<T | undefined> {
	return (globalThis as any).flutter_inappwebview.callHandler(handler, args ?? {});
}

function webSupported(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.isSecureContext &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		typeof Notification !== 'undefined'
	);
}

async function config(app: string): Promise<{ enabled: boolean; vapidPublicKey?: string }> {
	const { data } = await axios.get(api('/api/notification/push/config'), {
		params: { appCode: app },
		headers: headers(),
	});
	return data ?? { enabled: false };
}

async function saveDevice(app: string, device: Record<string, any>): Promise<boolean> {
	const { data } = await axios.post(api('/api/notification/push/devices'), device, {
		params: { appCode: app },
		headers: headers(),
	});
	return data?.registered === true;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
	const padded = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
		.replaceAll('-', '+')
		.replaceAll('_', '/');
	const raw = atob(padded);
	const out = new Uint8Array(new ArrayBuffer(raw.length));
	for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
	return out;
}

function sameKey(sub: PushSubscription, key: Uint8Array): boolean {
	const current = sub.options?.applicationServerKey;
	if (!current) return true;
	const bytes = new Uint8Array(current as ArrayBuffer);
	return bytes.length === key.length && bytes.every((b, i) => b === key[i]);
}

/** Whether push is on for this browser or phone, without asking. */
export async function pushStatus(): Promise<PushStatus> {
	if (isNativeShell()) {
		const r = await nativeCall<{ status?: PushStatus }>('pushStatus');
		return r?.status ?? 'unsupported';
	}
	if (!webSupported()) return 'unsupported';
	return Notification.permission as PushStatus;
}

/**
 * Turns push on and registers the device for the signed-in user. With `prompt`, asks the user
 * when they have not decided yet (call it from a click: browsers ignore a prompt without one).
 */
export async function enablePush(prompt: boolean): Promise<PushResult> {
	const app = appCode();
	if (!app || !getDataFromPath('Store.auth.user', []))
		return { status: await pushStatus(), registered: false };

	const cfg = await config(app);
	if (!cfg.enabled) return { status: 'unsupported', registered: false };

	if (isNativeShell()) {
		const d = await nativeCall<NativeDevice>('pushRegister', { prompt });
		const status = d?.status ?? 'unsupported';
		if (status !== 'granted' || !d?.token || !d.platform) return { status, registered: false };
		const registered = await saveDevice(app, {
			platform: d.platform,
			token: d.token,
			appIdentifier: d.appIdentifier,
			providerAccount: d.providerAccount,
			apnsEnv: d.apnsEnv,
		});
		return { status, registered };
	}

	if (!webSupported() || !cfg.vapidPublicKey) return { status: 'unsupported', registered: false };
	let permission = Notification.permission as PushStatus;
	if (permission === 'default' && prompt)
		permission = (await Notification.requestPermission()) as PushStatus;
	if (permission !== 'granted') return { status: permission, registered: false };

	const prefix = pathPrefix();
	const reg = await navigator.serviceWorker.register(
		`${prefix}${SW_PATH}?base=${encodeURIComponent(prefix)}`,
		{ scope: '/' },
	);
	await navigator.serviceWorker.ready;
	const key = keyBytes(cfg.vapidPublicKey);
	let sub = await reg.pushManager.getSubscription();
	if (sub && !sameKey(sub, key)) {
		// The platform's VAPID keys changed: the old subscription can no longer be sent to.
		await sub.unsubscribe();
		sub = null;
	}
	sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
	const json = sub.toJSON();
	const registered = await saveDevice(app, {
		platform: 'WEB',
		token: json.endpoint,
		keys: json.keys,
	});
	return { status: 'granted', registered };
}

/** Called after sign-in when permission is already granted: keeps the device current. */
export async function resumePush(): Promise<void> {
	try {
		await enablePush(false);
	} catch (e) {
		// Push is a nicety: a failure here must never reach the page.
		console.warn('Push registration did not complete', e);
	}
}

/**
 * Sign-out: the device stops reaching this user. The browser keeps its subscription, so the
 * next person to sign in here takes the device over (the server moves it to them).
 */
export async function disablePush(): Promise<void> {
	try {
		const app = appCode();
		if (!app) return;
		let device: { platform: string; token: string } | undefined;
		if (isNativeShell()) {
			const d = await nativeCall<NativeDevice>('pushToken');
			if (d?.token && d.platform) device = { platform: d.platform, token: d.token };
		} else if (webSupported()) {
			const reg = await navigator.serviceWorker.getRegistration('/');
			const sub = await reg?.pushManager.getSubscription();
			if (sub?.endpoint) device = { platform: 'WEB', token: sub.endpoint };
		}
		if (!device) return;
		await axios.delete(api('/api/notification/push/devices'), {
			params: { appCode: app },
			headers: headers(),
			data: device,
		});
	} catch (e) {
		console.warn('Push device was not removed', e);
	}
}
