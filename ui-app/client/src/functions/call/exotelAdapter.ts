import { loadScript } from './loadScript';
import { CallAdapter, CallCredentials, CallStateListener, CallStatus } from './types';

/**
 * Exotel through its WebRTC web SDK, `@exotel-npm-dev/webrtc-client-sdk` (ISC), the bundle
 * that defines the `exotelSDK` global. API and callbacks checked against the package source
 * (3.0.16 and 3.0.17) and its integration guide, demo-non-npm/README.md in
 * https://github.com/exotel/webrtc-client-sdk.
 *
 * Credentials (the guide's sipAccountInfo): `userName`, `secret` (SIP password), `sipdomain`,
 * `domain` (host:port of the WebSocket server), optional `authUser` (defaults to userName),
 * `port` (default 443), `displayName`, `security` (default `wss`).
 *
 * The SDK cannot place calls: outbound calls start on the server with Exotel's Calls connect
 * API (`From` = the agent's SIP user), which rings this browser first.
 */
export const EXOTEL_SDK_URL =
	'https://cdn.jsdelivr.net/npm/@exotel-npm-dev/webrtc-client-sdk@3.0.16/dist/exotelsdk.js';

/** The key the SDK keeps its last 1000 log lines under, in localStorage. */
const SDK_LOG_KEY = 'webrtc_sdk_logs';

const ACTIVE_STATUSES: ReadonlyArray<CallStatus> = ['ringing', 'connected'];

/**
 * The SDK refuses a second ExotelWebClient for a SIP user it has seen in this tab (its phone
 * pool is never emptied), so a reconnect for the same user reuses the first client.
 */
const clients = new Map<string, any>();

export interface ExotelAdapterOptions {
	/** Resolves the `exotelSDK` global. Tests pass a fake. */
	loadSdk?: () => Promise<any>;
	/** For tests. Defaults to globalThis.localStorage. */
	storage?: () => Storage | undefined;
}

function text(v: any): string | undefined {
	if (v === undefined || v === null || v === '') return undefined;
	return String(v);
}

export function createExotelAdapter(options: ExotelAdapterOptions = {}): CallAdapter {
	const loadSdk = options.loadSdk ?? (() => loadScript(EXOTEL_SDK_URL, 'exotelSDK'));
	const storage =
		options.storage ??
		(() => {
			try {
				return globalThis.localStorage;
			} catch {
				return undefined;
			}
		});

	let sdk: any;
	let client: any;
	let listener: CallStateListener = () => {};
	let status: CallStatus = 'idle';
	let signingOut = false;
	let secret: string | undefined;
	let pendingRegister: { resolve: () => void; reject: (e: Error) => void } | undefined;

	const emit: CallStateListener = patch => {
		if (patch.status) status = patch.status;
		listener(patch);
	};

	/**
	 * The SDK logs its whole sipAccountInfo, SIP password included, and copies every log line
	 * into localStorage. Drop those lines, so the password is not kept in the browser.
	 */
	const scrub = () => {
		if (!secret) return;
		try {
			const s = storage();
			const raw = s?.getItem(SDK_LOG_KEY);
			if (!raw || !raw.includes(secret)) return;
			const lines: unknown = JSON.parse(raw);
			if (!Array.isArray(lines)) {
				s!.removeItem(SDK_LOG_KEY);
				return;
			}
			s!.setItem(
				SDK_LOG_KEY,
				JSON.stringify(lines.filter(l => !String(l).includes(secret!))),
			);
		} catch {
			// Unreadable logs: nothing to keep.
			try {
				storage()?.removeItem(SDK_LOG_KEY);
			} catch {
				// Storage blocked: nothing was written either.
			}
		}
	};

	const call = () => {
		const c = client?.getCall?.();
		if (!c) throw new Error('No Exotel call.');
		return c;
	};

	const onRegister = (state: string) => {
		const s = String(state ?? '').toLowerCase();
		if (s === 'registered') {
			if (pendingRegister) {
				pendingRegister.resolve();
				pendingRegister = undefined;
			}
			if (!ACTIVE_STATUSES.includes(status)) emit({ status: 'ready', error: undefined });
		} else if (s === 'unregistered' || s === 'terminated') {
			if (pendingRegister) {
				pendingRegister.reject(new Error('Exotel registration failed.'));
				pendingRegister = undefined;
			} else if (!signingOut && status === 'ready') {
				// The SDK re-registers on its own every 5 seconds until it succeeds.
				emit({ status: 'registering' });
			}
		}
		scrub();
	};

	const onCall = (callObj: any, eventType: string) => {
		const callId = text(callObj?.callSid) ?? text(callObj?.callId);
		switch (eventType) {
			case 'incoming':
				emit({
					status: 'ringing',
					direction: 'inbound',
					callId,
					from: text(callObj?.remoteId) ?? text(callObj?.remoteDisplayName),
					to: undefined,
				});
				break;
			case 'ringing':
				if (!ACTIVE_STATUSES.includes(status)) emit({ status: 'ringing', callId });
				break;
			case 'connected':
				emit({ status: 'connected', ...(callId ? { callId } : {}) });
				break;
			case 'callEnded':
			case 'terminated':
				if (ACTIVE_STATUSES.includes(status)) emit({ status: 'ended' });
				break;
			default:
			// activeSession and others are multi tab notices; one tab owns the call here.
		}
		scrub();
	};

	const onSession = (state: string, _phone: string, error?: any) => {
		if (state === 'media_permission_denied') {
			emit({ error: 'Microphone access was denied.' });
		} else if (state === 'websocket_disconnected' && !signingOut) {
			const patch: any = { error: text(error?.message) ?? 'Exotel connection lost.' };
			if (status === 'ready') patch.status = 'registering';
			emit(patch);
		}
		scrub();
	};

	return {
		async load() {
			sdk = await loadSdk();
			if (typeof sdk?.ExotelWebClient !== 'function')
				throw new Error('The Exotel SDK did not load.');
		},

		async register(credentials: CallCredentials) {
			const userName = text(credentials?.userName);
			const password = text(credentials?.secret ?? credentials?.password);
			const sipdomain = text(credentials?.sipdomain);
			const domain = text(credentials?.domain);
			if (!userName || !password || !sipdomain || !domain)
				throw new Error('Exotel needs userName, secret, sipdomain and domain.');

			secret = password;
			signingOut = false;
			const displayName =
				text(credentials.displayName ?? credentials.displayname) ?? userName;
			const sipAccountInfo = {
				userName,
				authUser: text(credentials.authUser) ?? userName,
				sipdomain,
				domain,
				displayName,
				displayname: displayName,
				secret: password,
				port: String(credentials.port ?? 443),
				security: text(credentials.security) ?? 'wss',
				endpoint: text(credentials.endpoint) ?? 'wss',
			};

			// Console logging off: the SDK prints the sipAccountInfo, password included.
			sdk.ExotelWebClient.setEnableConsoleLogging?.(false);
			client = clients.get(userName) ?? new sdk.ExotelWebClient();
			clients.set(userName, client);
			client.enableAutoRetry?.();

			emit({ status: 'registering' });
			const registered = new Promise<void>((resolve, reject) => {
				pendingRegister = { resolve, reject };
			});
			try {
				const ok = await client.initWebrtc(sipAccountInfo, onRegister, onCall, onSession);
				scrub();
				if (!ok)
					throw new Error(
						'Exotel could not start: this SIP user is in use in this tab, or a field is missing.',
					);
				if (client.DoRegister() === false)
					throw new Error('Exotel is not ready to register yet. Try again.');
			} catch (e) {
				pendingRegister = undefined;
				throw e;
			}
			await registered;
			scrub();
		},

		answer() {
			call().Answer();
		},

		hangup() {
			call().Hangup();
		},

		mute(on: boolean) {
			if (on) call().Mute();
			else call().UnMute();
		},

		disconnect() {
			if (pendingRegister) {
				pendingRegister.reject(new Error('Disconnected before registration finished.'));
				pendingRegister = undefined;
			}
			const c = client;
			client = undefined;
			if (c) {
				signingOut = true;
				try {
					if (ACTIVE_STATUSES.includes(status)) c.getCall?.()?.Hangup();
				} catch {
					// No call to end.
				}
				c.disableAutoRetry?.();
				c.UnRegister?.();
			}
			scrub();
			secret = undefined;
			status = 'idle';
		},

		onStateChange(l: CallStateListener) {
			listener = l;
		},
	};
}

/** For tests. */
export function resetExotelClients() {
	clients.clear();
}
