import { loadScript } from './loadScript';
import { CallAdapter, CallCredentials, CallStateListener, CallStatus } from './types';

/**
 * TeleCMI through its PIOPIY WebRTC web SDK, `@telecmi/piopiyjs` (Apache-2.0). The unscoped
 * `piopiyjs` package is deprecated in its favour. The browser bundle defines the `PIOPIY`
 * global. API and events checked against the package's index.d.ts and README (0.26.6) and
 * https://doc.telecmi.com/piopiy/docs/client-sdk.
 *
 * Credentials: `userId`, `password`, optional `region` (SBC host, default `sbcind.telecmi.com`),
 * `name`, `ringTime` (seconds, default RING_TIME_SECONDS).
 *
 * What the SDK does that this adapter allows for (read from its lib/userAgent.js and
 * lib/session.js, 0.26.6):
 * - with no region it signs in to Singapore (`sbcsg.telecmi.com`), and an empty region from the
 *   server means none, so the India SBC is always passed when none is given (LZT-2165 8c);
 * - it ends an unanswered incoming call after `ringTime` (default 40 s), before TeleCMI's own
 *   no answer wait, so the browser went quiet while the call still rang (LZT-2165 8b);
 * - `logout()` does nothing while the phone is still signing in ("Please login") and the sign in
 *   then completes, and `login()` refuses while an earlier phone is still signed in ("Please
 *   logout before you login") with no `loginFailed`. A phone torn down while signing in is now
 *   signed out when its sign in lands, and a refused login fails at once instead of after the
 *   30 s register timeout;
 * - one incoming call at a time: a second INVITE while a call is up is ended by the SDK before
 *   it reports anything, so call waiting is not possible in the browser (LZT-2169);
 * - `mute()` and `unMute()` refuse silently in some states (an `error` event), so the state is
 *   read back with `onMute()`;
 * - `logout()` is not finished when it returns: the sign out ends with the SDK's `logout` event or
 *   the socket's `disconnected` (either order), and on a socket that is reconnecting it does
 *   nothing ("Please login") while the SDK signs back in by itself. So disconnect waits, bounded
 *   by SIGN_OUT_WAIT_MS, for either signal, and a phone that signs in after it was let go is
 *   signed out by its `login` listener, which is never removed (LZT-2163);
 * - `sendDtmf()` reports a tone it will not send as an `error` event (SDK_INVALID_DTMF), so a
 *   refused key is an error, not a silent no (LZT-2166).
 *
 * The agent's password is read from the credentials inside register and handed to the SDK's
 * login; it is never kept in a field of the adapter (LZT-2162).
 */
export const TELECMI_SDK_URL =
	'https://cdn.jsdelivr.net/npm/@telecmi/piopiyjs@0.26.6/dist/piopiy.min.js';

const ACTIVE_STATUSES: ReadonlyArray<CallStatus> = ['ringing', 'connected'];

/** Always passed when no region is given: the SDK's own default is Singapore. */
export const DEFAULT_REGION = 'sbcind.telecmi.com';

/** Longer than the SDK's 40 s, so TeleCMI's no answer wait, not the browser, ends the ringing. */
export const RING_TIME_SECONDS = 60;

/** The SDK's `error` code for a login while an earlier phone is still signed in. */
const SDK_LOGOUT_FIRST = 1001;

/** The SDK's "Please login": a control, or `logout()`, on a phone that is not signed in. */
const SDK_NOT_SIGNED_IN = 1002;

/** The SDK's `error` code for a DTMF tone it will not send. */
const SDK_INVALID_DTMF = 1005;

/** How long disconnect waits for the SDK to confirm a sign out before it moves on. */
export const SIGN_OUT_WAIT_MS = 3000;

type Piopiy = {
	on(event: string, handler: (data: any) => void): unknown;
	removeAllListeners?(event?: string): unknown;
	login(userId: string, password: string, region?: string): void;
	logout(callback?: (data: any) => void): void;
	call(to: string, options?: Record<string, any>): void;
	answer(): void;
	reject(): void;
	terminate(): void;
	mute(): void;
	unMute(): void;
	onMute?(): boolean;
	hold(): void;
	unHold(): void;
	sendDtmf?(tone: string): void;
};

export interface TelecmiAdapterOptions {
	/** Resolves the PIOPIY constructor. Tests pass a fake. */
	loadSdk?: () => Promise<any>;
}

/**
 * The PIOPIY bundle sets `window.onbeforeunload` when it loads, and that handler ends every call
 * and unregisters the agent. `beforeunload` fires BEFORE the browser asks "Leave site?", so a
 * refresh hung up the call and signed the agent out even when the user then pressed Cancel.
 * The handler is moved to `pagehide`, which fires only when the page really goes away.
 */
let sdkUnload: ((this: any, ev: any) => any) | undefined;
let unloadMoved = false;

function moveSdkUnloadToPagehide(before: any) {
	if (typeof window === 'undefined') return;
	const now = window.onbeforeunload;
	if (typeof now !== 'function' || now === before) return;
	sdkUnload = now;
	window.onbeforeunload = before ?? null;
	if (unloadMoved) return;
	unloadMoved = true;
	window.addEventListener('pagehide', ev => {
		try {
			sdkUnload?.call(window, ev);
		} catch {
			// The page is going away; nothing more to do.
		}
	});
}

function text(v: any): string | undefined {
	if (v === undefined || v === null || v === '') return undefined;
	return String(v);
}

export function createTelecmiAdapter(options: TelecmiAdapterOptions = {}): CallAdapter {
	const loadSdk = options.loadSdk ?? (() => loadScript(TELECMI_SDK_URL, 'PIOPIY'));

	let Ctor: any;
	let sdk: Piopiy | undefined;
	let listener: CallStateListener = () => {};
	let status: CallStatus = 'idle';
	let direction: 'inbound' | 'outbound' | undefined;
	let signingOut = false;
	let pendingLogin: { resolve: () => void; reject: (e: Error) => void } | undefined;
	/** Set while sendDtmf runs: the SDK's refusal of that tone, if it reports one at once. */
	let dtmfRefusal: string | undefined;
	let sendingDtmf = false;
	/** `answer()` was called for the call now up, before the SDK confirms it (LZT-2165 8a). */
	let answered = false;

	const emit: CallStateListener = patch => {
		if (patch.status) status = patch.status;
		if (patch.direction) direction = patch.direction;
		listener(patch);
	};

	const need = (): Piopiy => {
		if (!sdk) throw new Error('TeleCMI is not connected.');
		return sdk;
	};

	function attach(p: Piopiy) {
		// A phone torn down while it was signing in signs out when that sign in lands.
		p.on('login', () => {
			if (sdk !== p) {
				signOutLate(p);
				return;
			}
			if (pendingLogin) {
				pendingLogin.resolve();
				pendingLogin = undefined;
			}
			// A re-login after a dropped transport puts a call that is still up back as it was.
			if (!ACTIVE_STATUSES.includes(status)) emit({ status: 'ready', error: undefined });
		});
		const on = (event: string, handler: (d: any) => void) =>
			p.on(event, (d: any) => {
				if (sdk === p) handler(d);
			});
		on('loginFailed', (d: any) => {
			const message = `TeleCMI sign in failed: ${text(d?.status) ?? 'invalid user or password'}`;
			if (pendingLogin) {
				pendingLogin.reject(new Error(message));
				pendingLogin = undefined;
			} else emit({ status: 'error', error: message });
		});
		on('disconnected', () => {
			// The SDK reconnects on its own; until then the agent cannot take calls.
			if (!signingOut && status === 'ready') emit({ status: 'registering' });
		});
		on('connected', () => {
			if (status === 'registering' && !pendingLogin) emit({ status: 'ready' });
		});
		on('sbc_logout', (d: any) => {
			emit({
				status: 'error',
				error: `TeleCMI signed this agent out: ${text(d?.reason) ?? 'signed in elsewhere'}`,
			});
		});
		on('logout', () => {
			if (!signingOut) emit({ status: 'idle' });
		});

		on('inComingCall', (d: any) => {
			answered = false;
			emit({
				status: 'ringing',
				direction: 'inbound',
				callId: text(d?.call_id),
				from: text(d?.from),
				to: text(d?.to_number),
			});
		});
		on('trying', (d: any) => {
			// Progress of a call the server placed through the agent's login.
			if (d?.call_id) emit({ callId: text(d.call_id) });
		});
		on('ringing', (d: any) => {
			const patch: any = { status: 'ringing' };
			if (d?.call_id) patch.callId = text(d.call_id);
			if (d?.type === 'outbound' || d?.type === 'outgoing') patch.direction = 'outbound';
			else if (d?.type === 'incoming') patch.direction = 'inbound';
			// Keep a ringing call's caller details: the patch carries no from or to.
			if (status === 'ringing') delete patch.status;
			emit(patch);
		});
		on('answered', (d: any) => {
			const patch: any = { status: 'connected' };
			if (d?.call_id) patch.callId = text(d.call_id);
			emit(patch);
		});
		// One end per call, whichever of the SDK's end events comes first.
		const ended = () => {
			answered = false;
			if (ACTIVE_STATUSES.includes(status)) emit({ status: 'ended' });
		};
		on('ended', ended);
		on('hangup', ended);
		on('missedCall', ended);
		on('mediaFailed', (d: any) => {
			emit({
				error: `Microphone unavailable or not allowed${d?.status ? ': ' + d.status : ''}`,
			});
		});
		// Command errors ("call not found", "already in call"): the call itself goes on.
		on('error', (d: any) => {
			if (Number(d?.code) === SDK_INVALID_DTMF) {
				const message = `TeleCMI would not send that key${text(d?.status) ? ': ' + d.status : ''}`;
				if (sendingDtmf) dtmfRefusal = message;
				else emit({ error: message });
				return;
			}
			if (pendingLogin && Number(d?.code) === SDK_LOGOUT_FIRST) {
				pendingLogin.reject(
					new Error(`TeleCMI sign in failed: ${text(d?.status) ?? 'already signed in'}`),
				);
				pendingLogin = undefined;
				return;
			}
			emit({ error: text(d?.status) ?? 'TeleCMI error' });
		});
	}

	/**
	 * A phone let go that signed in anyway (its sign in was under way, or its socket reconnected):
	 * signed out now. Its listeners go and only this guard stays, for a later sign in.
	 */
	function signOutLate(p: Piopiy) {
		try {
			p.logout();
		} catch {
			// Nothing more can be done for a phone already let go.
		}
		p.removeAllListeners?.();
		p.on('login', () => signOutLate(p));
	}

	/**
	 * Resolves when the SDK says the sign out finished (`logout`, the socket's `disconnected`, or
	 * "Please login": nothing was signed in), or after SIGN_OUT_WAIT_MS. Then only the login guard
	 * stays on the phone.
	 */
	function signedOut(p: Piopiy): Promise<void> {
		return new Promise<void>(resolve => {
			let done = false;
			const finish = () => {
				if (done) return;
				done = true;
				clearTimeout(timer);
				p.removeAllListeners?.();
				p.on('login', () => signOutLate(p));
				resolve();
			};
			const timer = setTimeout(finish, SIGN_OUT_WAIT_MS);
			p.on('logout', finish);
			p.on('disconnected', finish);
			p.on('error', (d: any) => {
				if (Number(d?.code) === SDK_NOT_SIGNED_IN) finish();
			});
		});
	}

	return {
		async load() {
			const before = typeof window === 'undefined' ? undefined : window.onbeforeunload;
			const g = await loadSdk();
			moveSdkUnloadToPagehide(before);
			Ctor = g?.default ?? g;
			if (typeof Ctor !== 'function') throw new Error('The TeleCMI SDK did not load.');
		},

		register(credentials: CallCredentials) {
			const userId = text(credentials?.userId ?? credentials?.user_id);
			const password = text(credentials?.password);
			if (!userId || !password)
				return Promise.reject(new Error('TeleCMI needs userId and password.'));

			const ringTime = Number(credentials.ringTime);
			const p: Piopiy = new Ctor({
				name: credentials.name ?? '',
				debug: false,
				autoplay: true,
				ringTime: ringTime > 0 ? ringTime : RING_TIME_SECONDS,
			});
			sdk = p;
			signingOut = false;
			answered = false;
			attach(p);
			emit({ status: 'registering' });
			return new Promise<void>((resolve, reject) => {
				pendingLogin = { resolve, reject };
				try {
					p.login(
						userId,
						password,
						text(credentials.region) ?? text(credentials.sbc) ?? DEFAULT_REGION,
					);
				} catch (e: any) {
					pendingLogin = undefined;
					reject(new Error(e?.message ?? 'TeleCMI sign in failed'));
				}
			});
		},

		answer() {
			need().answer();
			// Marked at the press: the SDK's answered event comes later (LZT-2165 8a).
			answered = true;
		},

		hangup() {
			const p = need();
			// An incoming call not answered is rejected; anything else (answered here, even if
			// the SDK has not said so yet) is terminated.
			if (status === 'ringing' && direction === 'inbound' && !answered) p.reject();
			else p.terminate();
		},

		mute(on: boolean) {
			const p = need();
			if (on) p.mute();
			else p.unMute();
			// The SDK refuses with an error event, not a throw: read back what it did.
			const now = typeof p.onMute === 'function' ? p.onMute() : undefined;
			if (typeof now === 'boolean' && now !== on)
				throw new Error(
					on ? 'TeleCMI did not mute the call.' : 'TeleCMI did not unmute the call.',
				);
		},

		hold(on: boolean) {
			const p = need();
			if (on) p.hold();
			else p.unHold();
		},

		sendDtmf(digit: string) {
			const p = need();
			if (!/^[0-9*#]$/.test(digit)) throw new Error(`"${digit}" is not a keypad key.`);
			if (typeof p.sendDtmf !== 'function')
				throw new Error('This TeleCMI SDK cannot send keypad tones.');
			dtmfRefusal = undefined;
			sendingDtmf = true;
			try {
				p.sendDtmf(digit);
			} finally {
				sendingDtmf = false;
			}
			const refused = dtmfRefusal;
			dtmfRefusal = undefined;
			if (refused) throw new Error(refused);
		},

		disconnect() {
			const p = sdk;
			sdk = undefined;
			if (pendingLogin) {
				pendingLogin.reject(new Error('Disconnected before sign in finished.'));
				pendingLogin = undefined;
			}
			if (!p) return Promise.resolve();
			signingOut = true;
			answered = false;
			try {
				if (ACTIVE_STATUSES.includes(status)) p.terminate();
			} catch {
				// No call to end.
			}
			status = 'idle';
			// Listened for before logout: the SDK may confirm inside the call.
			const done = signedOut(p);
			try {
				p.logout();
			} catch {
				// Not signed in: the login listener signs it out if a sign in still lands.
			}
			return done;
		},

		onStateChange(l: CallStateListener) {
			listener = l;
		},
	};
}
