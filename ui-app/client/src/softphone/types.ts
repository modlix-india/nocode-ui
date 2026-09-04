/**
 * Provider-neutral vocabulary for browser calling.
 *
 * Nothing Exotel-specific appears here. The adapter in `providers/exotel.ts` translates the
 * vendor's own event literals - `incoming`, `connected`, `callEnded`, `holdtoggle`, `mutetoggle` -
 * into the union below, so a second provider can be added without its words leaking into
 * `Store.softphone` and from there into every page definition that binds to it.
 */

/**
 * Why the softphone is not working, when it is not working.
 *
 * Distinct codes rather than one message string, because telling these apart is the entire job of
 * the UI in the failure case. "You clicked Block once and Chrome remembered it" and "the tenant's
 * integration is down" need different words to the agent, and only the code can tell them apart.
 */
export type SoftphoneErrorCode =
	/** getUserMedia was refused. Remembered per origin, so it will keep failing until site settings change. */
	| 'MIC_DENIED'
	/** Not an HTTPS origin. getUserMedia does not exist at all here. */
	| 'INSECURE_CONTEXT'
	/** The vendor bundle did not load: wrong path, SRI mismatch, or CSP script-src. */
	| 'SDK_LOAD_FAILED'
	/** The bundle loaded but refused to produce a phone. Usually a provider-side provisioning gap. */
	| 'INIT_FAILED'
	/** This agent has no browser endpoint. Not an error so much as an answer. */
	| 'NOT_PROVISIONED'
	/** /browser/token failed or returned nothing usable. */
	| 'TOKEN_FAILED'
	/** The provider dropped our registration, or never accepted it. */
	| 'REGISTRATION_FAILED'
	/** browser-dial refused: no access to the deal, no number on it, or the provider said no. */
	| 'DIAL_REJECTED'
	/** A control was relayed to the leader tab and it never answered. */
	| 'RELAY_TIMEOUT'
	/** A control was called with no call in progress. */
	| 'NO_ACTIVE_CALL';

export interface SoftphoneError {
	code: SoftphoneErrorCode;
	message: string;
}

/** What the adapter emits, after normalisation. */
export type SoftphoneEvent =
	| { type: 'REGISTRATION'; registered: boolean; detail?: string }
	| { type: 'INCOMING'; callId: string; from: string; displayName?: string }
	| { type: 'CONNECTED'; callId: string; startedAt: string }
	| { type: 'ENDED'; callId: string; reason?: string }
	| { type: 'HOLD'; onHold: boolean }
	| { type: 'MUTE'; muted: boolean }
	| { type: 'ERROR'; error: SoftphoneError };

export type CallDirection = 'inbound' | 'outbound';

/**
 * Everything a page can bind to.
 *
 * Deliberately has no `durationSeconds`. A ticking counter here would be a store write every
 * second, and store writes fan out synchronously to every listener on the path - including
 * anything bound to `Store.softphone` as a whole, which in a CRM means a data grid re-rendering
 * for the length of every call. `startedAt` is written once; whatever renders the clock ticks in
 * its own local state.
 */
export interface SoftphoneState {
	/** Whether the backend holds a browser endpoint for this agent. Undefined until asked. */
	provisioned: boolean;
	/** Which provider is behind it, from the status response rather than a page property. */
	provider?: string;
	providerUserId?: string;
	virtualNumber?: string;

	/** The provider has accepted our registration. Not evidence that dialling works - see BrowserCallStatus. */
	registered: boolean;
	/** This tab holds the session. Exactly one tab per browser profile should be true. */
	isLeader: boolean;

	inCall: boolean;
	callId?: string;
	direction?: CallDirection;
	/** Customer's number on an inbound call. */
	from?: string;
	/** Dialled number on an outbound call, when the backend tells us one. */
	to?: string;
	remoteName?: string;
	/** ISO, written once when the call connects. */
	startedAt?: string;

	isMuted: boolean;
	isOnHold: boolean;
	/** Sticky: once the microphone is refused, saying so is more useful than retrying silently. */
	micDenied: boolean;

	lastError: SoftphoneError | null;
}

export const INITIAL_STATE: SoftphoneState = {
	provisioned: false,
	registered: false,
	isLeader: false,
	inCall: false,
	isMuted: false,
	isOnHold: false,
	micDenied: false,
	lastError: null,
};

/**
 * What the UIEngine functions call.
 *
 * Identical in every tab. On a follower the implementation relays to the leader over the
 * BroadcastChannel instead of touching the SDK, so a page author never has to know which tab holds
 * the session, and a control never silently no-ops because it ran in the wrong window.
 *
 * `dial` is here and not on `ICallProvider` on purpose: dialling is a call to our own backend, not
 * to the provider, and it works from any tab. Everything else needs the leader.
 */
export interface SoftphoneFacade {
	answer(): Promise<boolean>;
	hangup(): Promise<boolean>;
	/** Returns the new hold state. Toggle only - the vendor SDK exposes no set-hold. */
	toggleHold(): Promise<boolean>;
	/** Returns the new mute state. Toggle only. */
	toggleMute(): Promise<boolean>;
	sendDtmf(digit: string): Promise<boolean>;
	/** Places a call to a deal's customer. The number comes from the deal, never from here. */
	dial(ticketId: string, connectionName?: string): Promise<unknown>;
	/** Registers or unregisters the device, so an agent can step away without closing tabs. */
	setAvailability(available: boolean): Promise<boolean>;
}

/** Shapes returned by the `message` service. */
export interface BrowserCallStatus {
	provisioned: boolean;
	provider?: string;
	providerUserId?: string;
	virtualNumber?: string;
	dialReadyChecked?: boolean;
}

export interface BrowserCallToken {
	token: string;
	providerUserId: string;
	expiresIn: number;
	provider: string;
}
