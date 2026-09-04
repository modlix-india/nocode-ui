import { SoftphoneError, SoftphoneEvent } from '../types';
import { ICallProvider, ProviderInit } from './ICallProvider';

/**
 * Exotel's CRM WebRTC SDK, wrapped so nothing above this file knows it is Exotel.
 *
 * Everything vendor-shaped stops here: the global the UMD bundle defines, its five event literals,
 * its toggle-only controls, and the several places it fails quietly.
 */

/**
 * Where the bundle lives.
 *
 * `/api/files/static/file/**` is the download route on the files service - the shorter
 * `/api/files/static/**` is the *directory listing* handler and returns JSON, which fails as a
 * script with a confusing error.
 *
 * The version is in the path because a vendor bundle silently replaced under a stable filename is
 * an unpleasant way to lose a phone system.
 *
 * This must be the rebuilt bundle, not the one from the vendor's release page. The published build
 * sets webpack's `publicPath` to `./target/`, so it resolves its four audio files against the
 * *page* URL: on `/deals/501` it asks for `/deals/target/ringtone.wav`. That does not even 404 -
 * the UI service answers every non-`/api/` path with `index.html` and HTTP 200, so the audio
 * element is handed HTML, fails to decode, and leaves nothing in the network tab to look at.
 * Rebuild with `publicPath` set to SDK_BASE and upload the four `.wav` files beside the bundle.
 */
const SDK_BASE = '/api/files/static/file/SYSTEM/jslib/exotel/1.3.0';
const SDK_URL = `${SDK_BASE}/crmBundle.js`;

/**
 * Subresource integrity for the bundle above.
 *
 * Empty until the rebuilt bundle is hashed - an empty `integrity` attribute is not "no integrity",
 * it is a malformed one that blocks the load, so it is applied only when set. Fill it in when the
 * bundle is uploaded: this is a script that holds call credentials, and a supply-chain swap should
 * fail closed.
 */
const SDK_INTEGRITY = '';

/** The UMD bundle is built with `libraryExport: 'default'`, so the global is the class itself. */
interface ExotelSdkConstructor {
	new (
		token: string,
		agentUserId: string,
		autoConnectVOIP: boolean,
	): {
		Initialize(
			callListener: (event: string, data: ExotelCallEventData) => void,
			registerListener: (state: string) => void,
			sessionListener: (state: string, sipInfo: unknown) => void,
		): Promise<ExotelPhone | void>;
	};
}

interface ExotelPhone {
	RegisterDevice(): void;
	UnRegisterDevice(): void;
	AcceptCall(): void;
	HangupCall(): void;
	ToggleHold(): void;
	ToggleMute(): void;
	SendDTMF(digit: string): void;
}

/** The vendor's own payload. `callDirection` is deliberately unused: it is unverified, and the
 * event name already says which direction the call is. */
interface ExotelCallEventData {
	callId?: string;
	remoteId?: string;
	remoteDisplayName?: string;
	callFromNumber?: string;
	callEndReason?: string;
}

let loadPromise: Promise<ExotelSdkConstructor> | undefined;

/**
 * Injects the bundle once per page, however many times a provider is created.
 *
 * Memoised on the promise rather than on a boolean so two near-simultaneous callers - a leader
 * election racing a remount - share one script tag instead of appending two.
 */
function loadSdk(): Promise<ExotelSdkConstructor> {
	if (loadPromise) return loadPromise;

	loadPromise = new Promise<ExotelSdkConstructor>((resolve, reject) => {
		const existing = (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
		if (existing) {
			resolve(existing as ExotelSdkConstructor);
			return;
		}

		const script = document.createElement('script');
		script.src = SDK_URL;
		script.async = true;
		if (SDK_INTEGRITY) {
			script.integrity = SDK_INTEGRITY;
			script.crossOrigin = 'anonymous';
		}

		script.onload = () => {
			const sdk = (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
			if (sdk) resolve(sdk as ExotelSdkConstructor);
			else
				reject(
					err(
						'SDK_LOAD_FAILED',
						'The calling library loaded but defined nothing usable.',
					),
				);
		};

		// Let the next attempt retry rather than caching the failure forever: a bundle that 404s
		// during a deploy should not disable the phone until the tab is reloaded.
		script.onerror = () => {
			loadPromise = undefined;
			reject(err('SDK_LOAD_FAILED', 'The calling library could not be loaded.'));
		};

		document.head.appendChild(script);
	});

	return loadPromise;
}

/**
 * Asks for the microphone before the SDK does.
 *
 * Not redundant. Left to the SDK, a refused microphone surfaces as a registration that never
 * completes, which looks exactly like a broken integration. Asking here turns it into a specific
 * answer the UI can put in front of the agent - and Chrome remembers a denial per origin, so
 * "clear it in site settings" is the only useful thing to say and we can only say it if we know.
 */
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
		// Release it immediately. The SDK opens its own; holding this one would leave the
		// recording indicator lit between calls.
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

function err(code: SoftphoneError['code'], message: string): SoftphoneError {
	return { code, message };
}

export class ExotelCallProvider implements ICallProvider {
	readonly provider = 'EXOTEL';

	private phone?: ExotelPhone;
	private listeners = new Set<(event: SoftphoneEvent) => void>();

	/**
	 * Hold and mute are tracked here because the SDK will not tell us.
	 *
	 * `holdtoggle` and `mutetoggle` report that a toggle happened, not what it landed on, so the
	 * only way to have a state to show is to keep one.
	 */
	private onHold = false;
	private muted = false;

	/** Set on `incoming`, cleared on `callEnded`. Gates the controls that throw without a call. */
	private activeCallId?: string;

	async init(config: ProviderInit): Promise<void> {
		await ensureMicrophone();
		const Sdk = await loadSdk();

		const sdk = new Sdk(config.token, config.providerUserId, config.autoRegister);

		// All three callbacks are passed, and none of them may be null. The SDK stores the last two
		// only when truthy, but wires its own wrappers into the WebRTC client unconditionally and
		// each wrapper calls the stored callback with no guard - so a null here is a TypeError the
		// first time the provider says anything, which is during registration.
		const phone = await sdk.Initialize(
			(event, data) => this.onVendorCallEvent(event, data),
			state => this.onVendorRegisterEvent(state),
			() => {
				/* Session state duplicates what the register callback already tells us. Present
				   because it must be, ignored because it adds nothing. */
			},
		);

		// `Initialize` returns void on every settings failure - no app, no user mapping, no SIP id -
		// and says so only with a console warning. Treating a missing return as a hard failure is
		// the difference between "your phone is not set up" and a phone that silently never rings.
		if (!phone)
			throw err(
				'INIT_FAILED',
				'The calling provider would not start a phone for this agent. They may need to be set up again.',
			);

		this.phone = phone;
	}

	register(): void {
		this.phone?.RegisterDevice();
	}

	unregister(): void {
		this.phone?.UnRegisterDevice();
	}

	answer(): void {
		this.requireCall();
		this.phone?.AcceptCall();
	}

	hangup(): void {
		this.requireCall();
		this.phone?.HangupCall();
	}

	toggleHold(): void {
		this.requireCall();
		this.phone?.ToggleHold();
	}

	/**
	 * Guarded because the vendor does not guard it.
	 *
	 * `ToggleHold` calls through an optional chain and `ToggleMute` does not, so mute with no call
	 * in progress throws inside the bundle. The asymmetry is theirs; the check has to be ours.
	 */
	toggleMute(): void {
		this.requireCall();
		this.phone?.ToggleMute();
	}

	sendDtmf(digit: string): void {
		this.requireCall();
		if (!/^[0-9*#]$/.test(digit))
			throw err('NO_ACTIVE_CALL', `"${digit}" is not a dialable key.`);
		this.phone?.SendDTMF(digit);
	}

	destroy(): void {
		try {
			this.phone?.UnRegisterDevice();
		} catch {
			/* Tearing down a phone that is already gone is not worth reporting. */
		}
		this.phone = undefined;
		this.listeners.clear();
		this.activeCallId = undefined;
		this.onHold = false;
		this.muted = false;
	}

	on(listener: (event: SoftphoneEvent) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private requireCall(): void {
		if (!this.activeCallId) throw err('NO_ACTIVE_CALL', 'There is no call in progress.');
	}

	private emit(event: SoftphoneEvent): void {
		this.listeners.forEach(l => l(event));
	}

	/** Turns the vendor's five literals into our union. */
	private onVendorCallEvent(event: string, data: ExotelCallEventData): void {
		const callId = data?.callId ?? '';

		switch (event) {
			case 'incoming':
				this.activeCallId = callId;
				this.onHold = false;
				this.muted = false;
				this.emit({
					type: 'INCOMING',
					callId,
					from: data?.callFromNumber ?? data?.remoteId ?? '',
					displayName: data?.remoteDisplayName,
				});
				return;

			case 'connected':
				this.activeCallId = callId || this.activeCallId;
				// Our own clock rather than the vendor's timestamps: their format is unverified,
				// and a wrong parse here shows the agent a call that started in 1970.
				this.emit({
					type: 'CONNECTED',
					callId: this.activeCallId ?? '',
					startedAt: new Date().toISOString(),
				});
				return;

			case 'callEnded':
				this.emit({
					type: 'ENDED',
					callId: callId || (this.activeCallId ?? ''),
					reason: data?.callEndReason,
				});
				this.activeCallId = undefined;
				this.onHold = false;
				this.muted = false;
				return;

			case 'holdtoggle':
				this.onHold = !this.onHold;
				this.emit({ type: 'HOLD', onHold: this.onHold });
				return;

			case 'mutetoggle':
				this.muted = !this.muted;
				this.emit({ type: 'MUTE', muted: this.muted });
				return;
		}
	}

	/**
	 * The registration strings are not documented and not verified against a live account.
	 *
	 * So this matches loosely and passes the raw value through as `detail`, rather than testing for
	 * one literal and reporting "offline" for every string nobody predicted. Tighten it once a
	 * prototype run has recorded what actually arrives.
	 */
	private onVendorRegisterEvent(state: string): void {
		const value = (state ?? '').toString();
		const registered = /^registered$/i.test(value) || /(^|[^n])registered/i.test(value);
		const failed = /fail|error|reject/i.test(value);

		this.emit({ type: 'REGISTRATION', registered: registered && !failed, detail: value });

		if (failed)
			this.emit({
				type: 'ERROR',
				error: err('REGISTRATION_FAILED', `The phone could not register: ${value}`),
			});
	}
}
