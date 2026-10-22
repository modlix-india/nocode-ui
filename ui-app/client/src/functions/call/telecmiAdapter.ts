import { loadScript } from './loadScript';
import { CallAdapter, CallCredentials, CallStateListener, CallStatus } from './types';

/**
 * TeleCMI through its PIOPIY WebRTC web SDK, `@telecmi/piopiyjs` (Apache-2.0). The unscoped
 * `piopiyjs` package is deprecated in its favour. The browser bundle defines the `PIOPIY`
 * global. API and events checked against the package's index.d.ts and README (0.26.6) and
 * https://doc.telecmi.com/piopiy/docs/client-sdk.
 *
 * Credentials: `userId`, `password`, optional `region` (SBC host such as `sbcind.telecmi.com`;
 * the SDK defaults to `sbcsg.telecmi.com`), `name`, `ringTime`.
 */
export const TELECMI_SDK_URL =
	'https://cdn.jsdelivr.net/npm/@telecmi/piopiyjs@0.26.6/dist/piopiy.min.js';

const ACTIVE_STATUSES: ReadonlyArray<CallStatus> = ['ringing', 'connected'];

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
};

export interface TelecmiAdapterOptions {
	/** Resolves the PIOPIY constructor. Tests pass a fake. */
	loadSdk?: () => Promise<any>;
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
		p.on('login', () => {
			if (pendingLogin) {
				pendingLogin.resolve();
				pendingLogin = undefined;
			}
			// A re-login after a dropped transport puts a call that is still up back as it was.
			if (!ACTIVE_STATUSES.includes(status)) emit({ status: 'ready', error: undefined });
		});
		p.on('loginFailed', (d: any) => {
			const message = `TeleCMI sign in failed: ${text(d?.status) ?? 'invalid user or password'}`;
			if (pendingLogin) {
				pendingLogin.reject(new Error(message));
				pendingLogin = undefined;
			} else emit({ status: 'error', error: message });
		});
		p.on('disconnected', () => {
			// The SDK reconnects on its own; until then the agent cannot take calls.
			if (!signingOut && status === 'ready') emit({ status: 'registering' });
		});
		p.on('connected', () => {
			if (status === 'registering' && !pendingLogin) emit({ status: 'ready' });
		});
		p.on('sbc_logout', (d: any) => {
			emit({
				status: 'error',
				error: `TeleCMI signed this agent out: ${text(d?.reason) ?? 'signed in elsewhere'}`,
			});
		});
		p.on('logout', () => {
			if (!signingOut) emit({ status: 'idle' });
		});

		p.on('inComingCall', (d: any) => {
			emit({
				status: 'ringing',
				direction: 'inbound',
				callId: text(d?.call_id),
				from: text(d?.from),
				to: text(d?.to_number),
			});
		});
		p.on('trying', (d: any) => {
			// Progress of a call the server placed through the agent's login.
			if (d?.call_id) emit({ callId: text(d.call_id) });
		});
		p.on('ringing', (d: any) => {
			const patch: any = { status: 'ringing' };
			if (d?.call_id) patch.callId = text(d.call_id);
			if (d?.type === 'outbound' || d?.type === 'outgoing') patch.direction = 'outbound';
			else if (d?.type === 'incoming') patch.direction = 'inbound';
			// Keep a ringing call's caller details: the patch carries no from or to.
			if (status === 'ringing') delete patch.status;
			emit(patch);
		});
		p.on('answered', (d: any) => {
			const patch: any = { status: 'connected' };
			if (d?.call_id) patch.callId = text(d.call_id);
			emit(patch);
		});
		const ended = () => {
			if (ACTIVE_STATUSES.includes(status)) emit({ status: 'ended' });
		};
		p.on('ended', ended);
		p.on('hangup', ended);
		p.on('missedCall', ended);
		p.on('mediaFailed', (d: any) => {
			emit({
				error: `Microphone unavailable or not allowed${d?.status ? ': ' + d.status : ''}`,
			});
		});
		// Command errors ("call not found", "already in call"): the call itself goes on.
		p.on('error', (d: any) => {
			emit({ error: text(d?.status) ?? 'TeleCMI error' });
		});
	}

	return {
		async load() {
			const g = await loadSdk();
			Ctor = g?.default ?? g;
			if (typeof Ctor !== 'function') throw new Error('The TeleCMI SDK did not load.');
		},

		register(credentials: CallCredentials) {
			const userId = text(credentials?.userId ?? credentials?.user_id);
			const password = text(credentials?.password);
			if (!userId || !password)
				return Promise.reject(new Error('TeleCMI needs userId and password.'));

			const p: Piopiy = new Ctor({
				name: credentials.name ?? '',
				debug: false,
				autoplay: true,
				...(credentials.ringTime ? { ringTime: Number(credentials.ringTime) } : {}),
			});
			sdk = p;
			signingOut = false;
			attach(p);
			emit({ status: 'registering' });
			return new Promise<void>((resolve, reject) => {
				pendingLogin = { resolve, reject };
				try {
					p.login(userId, password, text(credentials.region ?? credentials.sbc));
				} catch (e: any) {
					pendingLogin = undefined;
					reject(new Error(e?.message ?? 'TeleCMI sign in failed'));
				}
			});
		},

		answer() {
			need().answer();
		},

		hangup() {
			const p = need();
			// A ringing incoming call is rejected; anything else is terminated.
			if (status === 'ringing' && direction === 'inbound') p.reject();
			else p.terminate();
		},

		mute(on: boolean) {
			const p = need();
			if (on) p.mute();
			else p.unMute();
		},

		disconnect() {
			const p = sdk;
			sdk = undefined;
			if (pendingLogin) {
				pendingLogin.reject(new Error('Disconnected before sign in finished.'));
				pendingLogin = undefined;
			}
			if (!p) return;
			signingOut = true;
			try {
				if (ACTIVE_STATUSES.includes(status)) p.terminate();
			} catch {
				// No call to end.
			}
			p.logout();
			p.removeAllListeners?.();
			status = 'idle';
		},

		onStateChange(l: CallStateListener) {
			listener = l;
		},
	};
}
