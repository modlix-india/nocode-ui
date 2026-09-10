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
	| 'NO_ACTIVE_CALL'
	/**
	 * A control was given something it cannot act on - a DTMF key that is not a key, say.
	 *
	 * Separate from NO_ACTIVE_CALL because the answer is different: there is a call, and the page
	 * passed a value that has to change. Reported as "no active call" it sent an author looking
	 * at the phone instead of at their own expression.
	 */
	| 'INVALID_INPUT'
	/**
	 * A control this build does not implement was asked for.
	 *
	 * Reachable across a deploy: a follower tab running newer code can relay an action a leader
	 * running older code has no case for. Reported rather than ignored, because a control that
	 * quietly does nothing tells the page its hangup worked.
	 */
	| 'UNSUPPORTED_CONTROL';

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
 * What the last call was, captured the moment it ended.
 *
 * Snapshotted in the registry rather than computed by a page, because the fields it needs -
 * direction, the other party, when audio started - are cleared the instant the call ends, and a
 * page has no reliable moment to read them. It is one store write per call, not a tick.
 */
export interface SoftphoneCallSummary {
	/** The provider's call id, when it gave us one. */
	callId?: string;
	direction?: CallDirection;

	/**
	 * The other party's number: the caller on an inbound call.
	 *
	 * **Absent on outbound**, and that is by design rather than an omission. The customer's number
	 * is read from the deal on the server and never sent to the browser, so there is nothing here
	 * to show. Use `ticketId` for outbound - it names the deal, which is more useful on screen than
	 * digits and is what a redial needs.
	 */
	phoneNumber?: string;

	/**
	 * The deal this call was placed against. Outbound only; what a Redial control should pass.
	 *
	 * Recorded by the tab that placed the call, which is the tab the agent clicked in and so the
	 * one showing them the wrap-up. Another tab watching the same call renders the call fine but
	 * has no deal to name, because it never placed it.
	 */
	ticketId?: string;

	/** The agent's identity at the provider. */
	agent?: string;

	/** ISO, when audio started. Undefined when the call was never answered in this browser. */
	startedAt?: string;
	/** ISO, when the call ended. */
	endedAt: string;

	/** Seconds of connected audio. Zero when never answered. */
	durationSeconds: number;

	/**
	 * Whether audio was ever established **in this browser**.
	 *
	 * Not the same as "the customer picked up". On an outbound call the agent's own leg is answered
	 * as soon as the provider bridges it, before the far end rings out - so a call the customer
	 * never took still reads as answered here. Whether the customer answered is known only to the
	 * server, from the provider's callback, and belongs to the deal's call log.
	 */
	answered: boolean;

	/** The provider's own reason for the call ending, when it gives one. */
	endReason?: string;
}

/**
 * What the registry owns, and most of what a page binds to.
 *
 * Deliberately has no live duration. `startedAt` is written once, when audio begins, and the
 * clock that counts from it is owned by the component and written to `Store.softphone.duration` -
 * a path the registry never touches, so a tick cannot be clobbered by an unrelated state change.
 * That is the one part of `Store.softphone` not described by this type.
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
	/**
	 * Dialled number on an outbound call.
	 *
	 * Always undefined today, and by design: the customer's number is read from the deal on the
	 * server and never sent to the browser. Kept because a future provider may report the leg it
	 * placed; a page wanting to name an outbound call should use the deal, not this.
	 */
	to?: string;
	remoteName?: string;
	/** ISO, written once when the call connects. */
	startedAt?: string;

	isMuted: boolean;
	isOnHold: boolean;
	/** Sticky: once the microphone is refused, saying so is more useful than retrying silently. */
	micDenied: boolean;

	lastError: SoftphoneError | null;

	/**
	 * The call that just ended, or null before the first one.
	 *
	 * Survives the call being cleared, so a page can render a wrap-up card, offer a redial, or log
	 * an outcome after the fact.
	 */
	lastCall: SoftphoneCallSummary | null;
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
	lastCall: null,
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
