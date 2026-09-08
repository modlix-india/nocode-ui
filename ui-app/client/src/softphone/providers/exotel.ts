import getSrcUrl from '../../components/util/getSrcUrl';
import { SoftphoneError, SoftphoneErrorCode, SoftphoneEvent } from '../types';
import { ICallProvider, ProviderInit } from './ICallProvider';

/**
 * Exotel's CRM WebRTC SDK, wrapped so nothing above this file knows it is Exotel.
 *
 * Everything vendor-shaped stops here: the global the UMD bundle defines, its five event literals,
 * its toggle-only controls, and the several places it fails quietly.
 */

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
 * What the vendor hands the call listener - its `getCallDetails()` snapshot, verified against the
 * built bundle rather than guessed.
 *
 * The complete shape is `callId, remoteId, remoteDisplayName, callDirection, callState,
 * callDuration, callStartedTime, callEstablishedTime, callEndedTime, callAnswerTime,
 * callEndReason, sessionId, callSid, sipHeaders`, plus `callFromNumber` which the SDK copies on
 * afterwards. Only the fields used are declared.
 *
 * **On an inbound call most of these are empty, and that is a defect in the bundle rather than a
 * field-name guessing game.** `callFromNumber`, `callSid`, `callId` and `sipHeaders` are populated
 * only by the vendor's `onRecieveInvite` handler, which reads them off the INVITE - and that
 * handler has no call sites anywhere in the built bundle. The number does get extracted, in
 * `newSession`, as `session.displayName = remoteIdentity.displayName || remoteIdentity.uri.user`,
 * but onto the SIP.js session object, which is not passed to this callback. So the caller's number
 * exists in the page and cannot be reached through the public API. The fix is one line in the
 * vendor source we already have to fork for `publicPath`; nothing on this side can substitute.
 *
 * `callDirection` is deliberately unused: it is unverified, and the event name already says which
 * direction the call is.
 */
interface ExotelCallEventData {
	callId?: string;
	/** The provider's own call identity, and what ties a call to its backend record. */
	callSid?: string;
	remoteId?: string;
	remoteDisplayName?: string;
	callFromNumber?: string;
	callEndReason?: string;
	/** Raw INVITE headers, when the bundle populates them - `X-Exotel-CallSid`, `From`, and so on. */
	sipHeaders?: Record<string, string>;
}

/**
 * Keyed by URL, not a single promise.
 *
 * Memoised so two near-simultaneous callers - a leader election racing a remount - share one
 * script tag instead of appending two. Keyed because the URL is configuration: a single shared
 * promise would hand the second caller the *first* caller's bundle whenever the two URLs differ,
 * with nothing anywhere to say the requested one was never fetched.
 */
const loads = new Map<string, Promise<ExotelSdkConstructor>>();

/**
 * Loads the vendor bundle from the URL the component was given, and only from there.
 *
 * There is deliberately no built-in default. A default is a path that has to be true of every
 * deployment, and the one that used to be here was true of none of them - it named a folder that
 * had never been created, so the softphone failed with a 404 and a MIME-type complaint that read
 * like a corrupt bundle. Requiring the URL means an unconfigured component says so plainly instead
 * of failing somewhere three layers down.
 */
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
		const existing = (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
		if (existing) {
			resolve(existing as ExotelSdkConstructor);
			return;
		}

		// Resolved here rather than at module scope: getSrcUrl reads globalThis.cdnPrefix, which
		// is set during boot and may not exist yet when this module is first evaluated. This is
		// also what puts the bundle on the CDN when one is configured - the same treatment Image
		// gives its src.
		const script = document.createElement('script');
		script.src = getSrcUrl(requested);
		script.async = true;

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

		// Drop the memo rather than caching the failure forever, so a corrected URL or a bundle
		// that 404d mid-deploy can be retried without reloading the tab. This is the case an
		// author hits while getting the URL right.
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

function err(code: SoftphoneErrorCode, message: string): SoftphoneError {
	return { code, message };
}

export class ExotelCallProvider implements ICallProvider {
	// Lowercase to match the backend's own name for it - see PROVIDERS in registry.ts.
	readonly provider = 'exotel';

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

	/**
	 * Whether a call is in progress, tracked separately from its id.
	 *
	 * These are different questions and conflating them broke auto-answer. The provider does not
	 * always give an id - `callSid` and `callId` are both empty when its INVITE reader has not
	 * populated them - so a guard written as `if (!this.activeCallId)` treated a perfectly real
	 * ringing call as no call, threw, and left the agent's own outbound leg ringing until the
	 * provider timed it out.
	 */
	private callInProgress = false;

	/** The provider's id for that call, when it gives one. Reporting only; never a presence check. */
	private activeCallId?: string;

	async init(config: ProviderInit): Promise<void> {
		await ensureMicrophone();
		const Sdk = await loadSdk(config.sdkUrl);

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
		this.callInProgress = false;
		this.activeCallId = undefined;
		this.onHold = false;
		this.muted = false;
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

	/**
	 * The provider's own identity for the call, preferred over the SIP dialog id.
	 *
	 * `callSid` is what the backend records and what a callback arrives with, so it is the value
	 * worth putting in front of a page. `callId` is the SIP Call-ID and only a fallback.
	 */
	private static identify(data: ExotelCallEventData): string {
		return data?.callSid || data?.callId || '';
	}

	/**
	 * The caller's number, from whichever field the bundle actually filled in.
	 *
	 * Every source here is a real field on the vendor's snapshot - no speculative names. On the
	 * current bundle all of them are empty for an inbound call; see ExotelCallEventData.
	 */
	private static callerNumber(data: ExotelCallEventData): string {
		return (
			data?.callFromNumber ||
			data?.remoteId ||
			data?.sipHeaders?.['From'] ||
			data?.sipHeaders?.['P-Asserted-Identity'] ||
			''
		);
	}

	/** Turns the vendor's five literals into our union. */
	private onVendorCallEvent(event: string, data: ExotelCallEventData): void {
		const callId = ExotelCallProvider.identify(data);

		switch (event) {
			case 'incoming':
				this.callInProgress = true;
				this.activeCallId = callId;
				this.onHold = false;
				this.muted = false;
				this.emit({
					type: 'INCOMING',
					callId,
					from: ExotelCallProvider.callerNumber(data),
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
				this.callInProgress = false;
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
