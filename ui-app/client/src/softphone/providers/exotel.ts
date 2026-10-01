import getSrcUrl from '../../components/util/getSrcUrl';
import { SoftphoneError, SoftphoneErrorCode, SoftphoneEvent } from '../types';
import { ICallProvider, ProviderInit } from './ICallProvider';

/** Exotel's CRM WebRTC SDK: five event literals, toggle-only controls, several quiet failures. */

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

/**
 * The vendor's `getCallDetails()` snapshot, verified against the built bundle; only used fields
 * are declared.
 *
 * On an inbound call `callFromNumber`, `callSid`, `callId` and `sipHeaders` are empty: only the
 * vendor's `onRecieveInvite` fills them, and it has no call sites in the bundle. The number lands
 * on the SIP.js session (`newSession`), which this callback never receives; fixing it needs the
 * vendor fork. `callDirection` is unverified and unused.
 */
interface ExotelCallEventData {
	callId?: string;
	/** What ties a call to its backend record. */
	callSid?: string;
	remoteId?: string;
	remoteDisplayName?: string;
	callFromNumber?: string;
	callEndReason?: string;
	sipHeaders?: Record<string, string>;
}

/**
 * Memoized so near-simultaneous callers share one script tag; keyed by URL so a caller asking for
 * a different URL is never handed the first caller's bundle.
 */
const loads = new Map<string, Promise<ExotelSdkConstructor>>();

/**
 * Which URL the bundle on `globalThis.ExotelCRMWebSDK` came from. Kept on the global because the
 * global outlives this module's instances, and its presence alone says nothing about which URL.
 */
const SDK_SOURCE_KEY = '__modlixExotelSdkSource';

function sdkOnPage(url: string): ExotelSdkConstructor | undefined {
	const globals = globalThis as Record<string, unknown>;
	const sdk = globals.ExotelCRMWebSDK;
	if (!sdk || globals[SDK_SOURCE_KEY] !== url) return undefined;
	return sdk as ExotelSdkConstructor;
}

/** No built-in default URL: no single path is true of every deployment. */
function loadSdk(sdkUrl?: string): Promise<ExotelSdkConstructor> {
	const requested = sdkUrl?.trim();

	if (!requested)
		return Promise.reject(
			err(
				'SDK_LOAD_FAILED',
				'No calling library URL is configured. Set the Softphone component\'s "Calling Library URL".',
			),
		);

	const cached = loads.get(requested);
	if (cached) return cached;

	const load = new Promise<ExotelSdkConstructor>((resolve, reject) => {
		// A different URL's bundle is fetched even though it overwrites the global.
		const existing = sdkOnPage(requested);
		if (existing) {
			resolve(existing);
			return;
		}

		// Not at module scope: getSrcUrl reads globalThis.cdnPrefix, which is set during boot.
		const script = document.createElement('script');
		script.src = getSrcUrl(requested);
		script.async = true;

		script.onload = () => {
			const sdk = (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
			if (sdk) {
				(globalThis as Record<string, unknown>)[SDK_SOURCE_KEY] = requested;
				resolve(sdk as ExotelSdkConstructor);
			} else
				reject(
					err(
						'SDK_LOAD_FAILED',
						'The calling library loaded but defined nothing usable.',
					),
				);
		};

		// Drop the memo so a failed load can be retried without reloading the tab.
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

/**
 * Asks for the microphone before the SDK does: left to the SDK, a refusal surfaces as a
 * registration that never completes, and Chrome remembers a denial per origin.
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
		// Released at once: the SDK opens its own, and holding this lights the mic indicator.
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

/** `(?![a-z])` rather than `\b`, so "registered_at" still counts (`_` is a word character). */
const REGISTERED = /(?:^|[^a-z])registered(?![a-z])/;

/** "not registered", "un-registered", "de registered". */
const NOT_REGISTERED = /(?:^|[^a-z])(?:not|non|un|de)[^a-z]*registered(?![a-z])/;

function err(code: SoftphoneErrorCode, message: string): SoftphoneError {
	return { code, message };
}

export class ExotelCallProvider implements ICallProvider {
	readonly provider = 'exotel';

	private phone?: ExotelPhone;
	private listeners = new Set<(event: SoftphoneEvent) => void>();

	/** Tracked here: `holdtoggle` / `mutetoggle` say a toggle happened, not what it landed on. */
	private onHold = false;
	private muted = false;

	/**
	 * What the outstanding request asked for. The bundle delivers events more than once, so
	 * flipping per event would invert state on a duplicate; asserting the requested value makes
	 * the duplicate a no-op. With nothing outstanding the current value is re-stated.
	 */
	private requestedHold?: boolean;
	private requestedMute?: boolean;

	/** Tracked apart from the id, which is often empty (see ExotelCallEventData). */
	private callInProgress = false;

	/** Reporting only; never a presence check. */
	private activeCallId?: string;

	async init(config: ProviderInit): Promise<void> {
		await ensureMicrophone();
		const Sdk = await loadSdk(config.sdkUrl);

		const sdk = new Sdk(config.token, config.providerUserId, config.autoRegister);

		// None may be null: the SDK's wrappers call each stored callback unguarded, so a null is
		// a TypeError during registration.
		const phone = await sdk.Initialize(
			(event, data) => this.onVendorCallEvent(event, data),
			state => this.onVendorRegisterEvent(state),
			() => {
				/* Duplicates the register callback. */
			},
		);

		// `Initialize` returns void on every settings failure (no app, user mapping or SIP id),
		// with only a console warning.
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
		this.requestedHold = !this.onHold;
		try {
			this.phone?.ToggleHold();
		} catch (e) {
			this.requestedHold = undefined;
			throw e;
		}
	}

	/** The vendor's `ToggleMute`, unlike `ToggleHold`, throws with no call in progress. */
	toggleMute(): void {
		this.requireCall();
		this.requestedMute = !this.muted;
		try {
			this.phone?.ToggleMute();
		} catch (e) {
			this.requestedMute = undefined;
			throw e;
		}
	}

	sendDtmf(digit: string): void {
		this.requireCall();
		if (!/^[0-9*#]$/.test(digit))
			throw err('INVALID_INPUT', `"${digit}" is not a dialable key.`);
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
		this.callInProgress = false;
		this.activeCallId = undefined;
		this.resetCallControls();
	}

	on(listener: (event: SoftphoneEvent) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private requireCall(): void {
		if (!this.callInProgress) throw err('NO_ACTIVE_CALL', 'There is no call in progress.');
	}

	private emit(event: SoftphoneEvent): void {
		this.listeners.forEach(l => l(event));
	}

	/** `callSid` is what the backend records; `callId` (the SIP Call-ID) is only a fallback. */
	private static identify(data: ExotelCallEventData): string {
		return data?.callSid || data?.callId || '';
	}

	/** All real snapshot fields, though all empty inbound on the current bundle. */
	private static callerNumber(data: ExotelCallEventData): string {
		return (
			data?.callFromNumber ||
			data?.remoteId ||
			data?.sipHeaders?.['From'] ||
			data?.sipHeaders?.['P-Asserted-Identity'] ||
			''
		);
	}

	private resetCallControls(): void {
		this.onHold = false;
		this.muted = false;
		this.requestedHold = undefined;
		this.requestedMute = undefined;
	}

	private onVendorCallEvent(event: string, data: ExotelCallEventData): void {
		const callId = ExotelCallProvider.identify(data);

		switch (event) {
			case 'incoming':
				this.callInProgress = true;
				this.activeCallId = callId;
				this.resetCallControls();
				this.emit({
					type: 'INCOMING',
					callId,
					from: ExotelCallProvider.callerNumber(data),
					displayName: data?.remoteDisplayName,
				});
				return;

			case 'connected':
				this.activeCallId = callId || this.activeCallId;
				// Our own clock: the vendor's timestamp format is unverified.
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
				this.callInProgress = false;
				this.activeCallId = undefined;
				this.resetCallControls();
				return;

			case 'holdtoggle':
				this.onHold = this.requestedHold ?? this.onHold;
				this.requestedHold = undefined;
				this.emit({ type: 'HOLD', onHold: this.onHold });
				return;

			case 'mutetoggle':
				this.muted = this.requestedMute ?? this.muted;
				this.requestedMute = undefined;
				this.emit({ type: 'MUTE', muted: this.muted });
				return;
		}
	}

	/**
	 * The registration strings are undocumented and unverified, so this matches loosely and passes
	 * the raw value as `detail`. Negations are excluded, since a plain substring match would read
	 * "unregistered" as registered.
	 */
	private onVendorRegisterEvent(state: string): void {
		const value = (state ?? '').toString();
		const normalised = value.toLowerCase();
		const registered = REGISTERED.test(normalised) && !NOT_REGISTERED.test(normalised);
		const failed = /fail|error|reject/.test(normalised);

		this.emit({ type: 'REGISTRATION', registered: registered && !failed, detail: value });

		if (failed)
			this.emit({
				type: 'ERROR',
				error: err('REGISTRATION_FAILED', `The phone could not register: ${value}`),
			});
	}
}
