import getSrcUrl from '../../components/util/getSrcUrl';
import { SoftphoneError, SoftphoneErrorCode, SoftphoneEvent } from '../types';
import { ICallProvider, ProviderInit } from './ICallProvider';

/**
 * TeleCMI's PIOPIY browser SDK (`@telecmi/piopiyjs` 0.26.4). Its controls report misuse as an
 * `error` event instead of throwing. The event behaviour below is read from the SDK's source
 * (`lib/session.js`, `lib/userAgent.js`); its README does not describe it.
 */

interface PiopiyStatus {
	code?: number;
	status?: string;
}

/** `inComingCall`. `from` is the INVITE's display name, or `'unknown'` when it has none. */
interface PiopiyIncoming {
	from?: string;
	name?: string;
	call_id?: string;
}

interface PiopiyEnded extends PiopiyStatus {
	reason?: string;
}

interface PiopiyHold extends PiopiyStatus {
	/** `myself` when this browser held the call, `other` when the far end did. */
	whom?: 'myself' | 'other';
}

interface PiopiyMissed {
	from?: string | null;
	reason?: string;
}

interface PiopiySbcLogout {
	code?: number;
	reason?: string;
}

interface PiopiyPhone {
	login(userId: string, password: string, region?: string): void;
	logout(): void;
	answer(): void;
	reject(): void;
	terminate(): void;
	hold(): void;
	unHold(): void;
	onHold(): boolean;
	mute(): void;
	unMute(): void;
	onMute(): boolean;
	sendDtmf(tone: string): void;
	on(event: string, handler: (data: unknown) => void): unknown;
}

interface PiopiyConstructor {
	new (options: {
		name?: string;
		debug?: boolean;
		autoplay?: boolean;
		ringTime?: number;
	}): PiopiyPhone;
}

/** Always passed: the SDK's own default is Singapore, and every account in scope is on India. */
const DEFAULT_REGION = 'sbcind.telecmi.com';

/** Longer than the SDK's 40 s, so TeleCMI's no-answer wait, not the browser, ends the ringing. */
const RING_TIME_SECONDS = 60;

const loads = new Map<string, Promise<PiopiyConstructor>>();

/** Which URL `globalThis.PIOPIY` came from - see `exotel.ts`. */
const SDK_SOURCE_KEY = '__modlixTelecmiSdkSource';

function sdkOnPage(url: string): PiopiyConstructor | undefined {
	const globals = globalThis as Record<string, unknown>;
	const sdk = globals.PIOPIY;
	if (typeof sdk !== 'function' || globals[SDK_SOURCE_KEY] !== url) return undefined;
	return sdk as PiopiyConstructor;
}

/** No built-in default URL: the bundle is self-hosted and its path differs per deployment. */
function loadSdk(sdkUrl?: string): Promise<PiopiyConstructor> {
	const requested = sdkUrl?.trim();

	if (!requested)
		return Promise.reject(
			err(
				'SDK_LOAD_FAILED',
				'No calling library URL is configured. Set it on the calling connection or on the Softphone component\'s "Calling Library URL".',
			),
		);

	const cached = loads.get(requested);
	if (cached) return cached;

	const load = new Promise<PiopiyConstructor>((resolve, reject) => {
		const existing = sdkOnPage(requested);
		if (existing) {
			resolve(existing);
			return;
		}

		const script = document.createElement('script');
		script.src = getSrcUrl(requested);
		script.async = true;

		script.onload = () => {
			const sdk = (globalThis as Record<string, unknown>).PIOPIY;
			if (typeof sdk === 'function') {
				(globalThis as Record<string, unknown>)[SDK_SOURCE_KEY] = requested;
				resolve(sdk as PiopiyConstructor);
			} else {
				// Not remembered: a wrong file at the right URL should be fixable without a reload.
				loads.delete(requested);
				reject(
					err(
						'SDK_LOAD_FAILED',
						'The calling library loaded but defined nothing usable.',
					),
				);
			}
		};

		script.onerror = () => {
			loads.delete(requested);
			reject(
				err(
					'SDK_LOAD_FAILED',
					`The calling library could not be loaded from ${requested}.`,
				),
			);
		};

		document.head.appendChild(script);
	});

	loads.set(requested, load);
	return load;
}

async function ensureMicrophone(): Promise<void> {
	if (!globalThis.isSecureContext)
		throw err(
			'INSECURE_CONTEXT',
			'Calling needs a secure (HTTPS) connection. This page is not on one.',
		);

	if (!navigator.mediaDevices?.getUserMedia)
		throw err(
			'INSECURE_CONTEXT',
			'This browser does not offer microphone access to this page.',
		);

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach(t => t.stop());
	} catch (e) {
		const name = e instanceof Error ? e.name : '';
		if (name === 'NotAllowedError' || name === 'SecurityError')
			throw err(
				'MIC_DENIED',
				'Microphone access is blocked for this site. Allow it in the browser site settings, then reload.',
			);
		throw err('MIC_DENIED', 'The microphone could not be opened.');
	}
}

/** The SDK's code for a DTMF tone it will not send. */
const SDK_INVALID_DTMF = 1005;

/** The SDK's "Please login": a control, or `logout()`, on a phone it has not registered. */
const SDK_NOT_SIGNED_IN = 1002;

/**
 * How long a sign-out's socket may take to report closing after `logout`. Bounded so a close that
 * never comes cannot swallow the next real network drop.
 */
const OLD_SOCKET_CLOSE_MS = 5_000;

function err(code: SoftphoneErrorCode, message: string): SoftphoneError {
	return { code, message };
}

export class TelecmiCallProvider implements ICallProvider {
	readonly provider = 'telecmi';

	private phone?: PiopiyPhone;
	private listeners = new Set<(event: SoftphoneEvent) => void>();

	/**
	 * Holds the agent's password in its closure, never a field: the SDK needs it on every `login`,
	 * so it cannot be dropped after first use as Exotel's token is.
	 */
	private signIn?: () => void;

	/*
	 * The SDK's `logout()` does nothing unless the phone is registered at that moment (it emits
	 * "Please login" and leaves a pending sign-in running), and its `login()` refuses a registered
	 * phone and opens a second connection beside a reconnecting one. So we track sign-in state
	 * ourselves; otherwise a phone torn down on logout registers a moment later.
	 */

	private wantOnline = false;
	private registered = false;
	/** `login()` was called, or the SDK is reconnecting a dropped socket. */
	private signingIn = false;
	/**
	 * Until the SDK's `logout` or the closed socket's `disconnected` (either order), Available is
	 * only noted, and acted on when the sign-out finishes.
	 */
	private signingOut = false;
	/** A sign-out finished by `logout`; its socket's `disconnected` is still to come. */
	private oldSocketOpen = false;
	private oldSocketTimer?: ReturnType<typeof setTimeout>;

	/** Set by destroy. Every SDK handler but `login`'s then does nothing. */
	private destroyed = false;

	private callInProgress = false;
	private activeCallId?: string;

	/** Set on `answer()`, before the SDK confirms, so hanging up picks terminate over reject. */
	private answered = false;

	/** Checks `destroyed` after each await: the registry may destroy a provider still in here. */
	async init(config: ProviderInit): Promise<void> {
		await ensureMicrophone();
		if (this.destroyed) return;

		const Sdk = await loadSdk(config.sdkUrl);
		if (this.destroyed) return;

		const phone = new Sdk({ autoplay: true, ringTime: RING_TIME_SECONDS });
		this.subscribe(phone);
		this.phone = phone;

		const { providerUserId, token } = config;
		const region = config.region?.trim() || DEFAULT_REGION;
		this.signIn = () => phone.login(providerUserId, token, region);

		if (config.autoRegister) this.register();
	}

	/**
	 * The SDK answers with `login` or `loginFailed`; it throws only on a non-string user id or
	 * password, a provisioning gap.
	 */
	register(): void {
		if (!this.signIn) return;
		this.wantOnline = true;
		if (this.registered || this.signingIn || this.signingOut) return;

		this.signingIn = true;
		try {
			this.signIn();
		} catch {
			this.signingIn = false;
			throw err(
				'INIT_FAILED',
				'The calling provider would not start a phone for this agent. They may need to be set up again.',
			);
		}
	}

	/**
	 * On TeleCMI signing out also sends inbound calls straight to the agent's mobile. A phone still
	 * signing in is signed out by the `login` handler.
	 */
	unregister(): void {
		this.wantOnline = false;
		if (this.registered && !this.signingOut) this.signOut(this.phone);
	}

	answer(): void {
		this.requireCall();
		this.phone?.answer();
		this.answered = true;
	}

	/** The SDK's `reject()` and `terminate()` both end the session with `terminate()`. */
	hangup(): void {
		this.requireCall();
		if (this.answered) this.phone?.terminate();
		else this.phone?.reject();
	}

	toggleHold(): void {
		this.requireCall();
		if (!this.phone) return;
		// The SDK emits `hold` / `unhold` synchronously from inside these calls.
		if (this.phone.onHold()) this.phone.unHold();
		else this.phone.hold();
	}

	/** The SDK has no mute event, so the state is read back from it and emitted here. */
	toggleMute(): void {
		this.requireCall();
		const phone = this.phone;
		if (!phone) return;
		if (phone.onMute()) phone.unMute();
		else phone.mute();
		this.emit({ type: 'MUTE', muted: !!phone.onMute() });
	}

	sendDtmf(digit: string): void {
		this.requireCall();
		if (!/^[0-9*#]$/.test(digit))
			throw err('INVALID_INPUT', `"${digit}" is not a dialable key.`);
		this.phone?.sendDtmf(digit);
	}

	/**
	 * SDK listeners stay attached on purpose: `logout()` cannot reach a phone still signing in, so
	 * the `login` handler signs it out when it gets there.
	 */
	destroy(): void {
		this.wantOnline = false;
		this.destroyed = true;
		this.listeners.clear();
		try {
			if (this.registered && !this.signingOut) this.signOut(this.phone);
		} catch {
			/* Tearing down a phone that is already gone is not worth reporting. */
		}
		this.phone = undefined;
		this.signIn = undefined;
		this.forgetOldSocket();
		this.endCall();
	}

	private forgetOldSocket(): void {
		if (this.oldSocketTimer) clearTimeout(this.oldSocketTimer);
		this.oldSocketTimer = undefined;
		this.oldSocketOpen = false;
	}

	on(listener: (event: SoftphoneEvent) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private signOut(phone: PiopiyPhone | undefined): void {
		if (!phone) return;
		this.signingOut = true;
		phone.logout();
	}

	/** If Available was pressed during the sign-out, sign in now. */
	private signedOut(detail: string | undefined): void {
		this.signingOut = false;
		this.offline(detail);
		if (!this.wantOnline) return;

		// Inside the SDK's event callback: report, never throw.
		try {
			this.register();
		} catch (e) {
			this.emit({
				type: 'ERROR',
				error:
					e && typeof e === 'object' && 'code' in e
						? (e as SoftphoneError)
						: err('REGISTRATION_FAILED', 'The phone could not sign in again.'),
			});
		}
	}

	private requireCall(): void {
		if (!this.callInProgress) throw err('NO_ACTIVE_CALL', 'There is no call in progress.');
	}

	private emit(event: SoftphoneEvent): void {
		this.listeners.forEach(l => l(event));
	}

	private endCall(): void {
		this.callInProgress = false;
		this.activeCallId = undefined;
		this.answered = false;
	}

	private subscribe(phone: PiopiyPhone): void {
		const on = (event: string, handler: (data: unknown) => void) =>
			phone.on(event, data => {
				if (!this.destroyed) handler(data);
			});

		phone.on('login', data => {
			this.signingIn = false;

			// Signed in after Away or destroy: sign out now (destroy already cleared `this.phone`).
			if (!this.wantOnline) {
				try {
					this.signOut(phone);
				} catch {
					/* Nothing more can be done from here. */
				}
				return;
			}

			this.registered = true;
			this.emit({ type: 'REGISTRATION', registered: true, detail: statusOf(data) });
		});

		// Only ever the answer to our `logout()`. Outside a sign-out it is the late half of one
		// already finished by `disconnected`, and must not take down a phone signed in since.
		on('logout', data => {
			if (!this.signingOut) return;
			this.forgetOldSocket();
			this.oldSocketOpen = true;
			this.oldSocketTimer = setTimeout(() => this.forgetOldSocket(), OLD_SOCKET_CLOSE_MS);
			this.signedOut(statusOf(data));
		});

		// During our sign-out, the sign-out finishing. Otherwise a drop the SDK reconnects by
		// itself, so it counts as a sign-in under way.
		on('disconnected', data => {
			if (this.signingOut) {
				this.signedOut(statusOf(data));
				return;
			}
			// The old sign-out's socket, possibly closing after a new sign-in: not a drop.
			if (this.oldSocketOpen) {
				this.forgetOldSocket();
				return;
			}
			if (this.registered || this.signingIn) this.signingIn = this.wantOnline;
			this.offline(statusOf(data));
		});

		// Refused (401 bad credentials, 405 too many sign-ins, 407 address not allowed or token
		// refused) or signed out by TeleCMI.
		on('loginFailed', data => {
			this.signingIn = false;
			this.offline(statusOf(data), true);
		});
		on('sbc_logout', data => {
			this.signingIn = false;
			this.offline((data as PiopiySbcLogout)?.reason ?? statusOf(data), true);
		});

		on('inComingCall', data => {
			const call = (data ?? {}) as PiopiyIncoming;
			this.callInProgress = true;
			this.activeCallId = call.call_id || '';
			this.answered = false;
			this.emit({
				type: 'INCOMING',
				callId: this.activeCallId,
				from: call.from && call.from !== 'unknown' ? call.from : '',
				displayName: call.name,
			});
		});

		on('answered', () => {
			if (!this.callInProgress) return;
			this.answered = true;
			// The SDK sends no time with this event.
			this.emit({
				type: 'CONNECTED',
				callId: this.activeCallId ?? '',
				startedAt: new Date().toISOString(),
			});
		});

		// `ended`: far end hung up; `hangup`: this browser did (reject included); `missedCall`:
		// unanswered call withdrawn. More than one can arrive for one call.
		on('ended', data => this.ended((data as PiopiyEnded)?.reason ?? statusOf(data)));
		on('hangup', data => this.ended(statusOf(data)));
		on('missedCall', data => this.ended((data as PiopiyMissed)?.reason));

		// Only this browser's own hold.
		on('hold', data => {
			if ((data as PiopiyHold)?.whom === 'myself') this.emit({ type: 'HOLD', onHold: true });
		});
		on('unhold', data => {
			if ((data as PiopiyHold)?.whom === 'myself') this.emit({ type: 'HOLD', onHold: false });
		});

		on('mediaFailed', () =>
			this.emit({
				type: 'ERROR',
				error: err(
					'MIC_DENIED',
					'The microphone could not be opened for this call. Check the browser site settings.',
				),
			}),
		);

		on('error', data => {
			const { code, status } = (data ?? {}) as PiopiyStatus;

			// "Please login" answering our `logout()`: nothing was registered (a missed drop), so
			// the sign-out is finished. Unhandled, `signingOut` would never clear.
			if (code === SDK_NOT_SIGNED_IN && this.signingOut) {
				this.signedOut(status);
				return;
			}

			this.emit({
				type: 'ERROR',
				error:
					code === SDK_INVALID_DTMF
						? err('INVALID_INPUT', `The phone would not send that key: ${status ?? ''}`)
						: !this.registered
							? err('REGISTRATION_FAILED', 'The phone is not signed in.')
							: err(
									'NO_ACTIVE_CALL',
									`The phone refused: ${status ?? 'no reason given'}`,
								),
			});
		});
	}

	private offline(detail: string | undefined, failed = false): void {
		this.registered = false;
		this.emit({ type: 'REGISTRATION', registered: false, detail });
		if (failed)
			this.emit({
				type: 'ERROR',
				error: err('REGISTRATION_FAILED', `The phone could not register: ${detail ?? ''}`),
			});
	}

	/** Once per call, whichever of the SDK's end events arrives first. */
	private ended(reason: string | undefined): void {
		if (!this.callInProgress) return;
		const callId = this.activeCallId ?? '';
		this.endCall();
		this.emit({ type: 'ENDED', callId, reason });
	}
}

function statusOf(data: unknown): string | undefined {
	return (data as PiopiyStatus)?.status;
}
