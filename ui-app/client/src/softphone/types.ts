/**
 * Provider-neutral vocabulary for browser calling. Adapters translate vendor events into these
 * types so vendor words never leak into `Store.softphone` and the pages that bind to it.
 */

export type SoftphoneErrorCode =
	/** getUserMedia was refused. Remembered per origin until site settings change. */
	| 'MIC_DENIED'
	| 'INSECURE_CONTEXT'
	/** The vendor bundle did not load: wrong path, SRI mismatch, or CSP script-src. */
	| 'SDK_LOAD_FAILED'
	/** The bundle loaded but produced no phone; usually a provider-side provisioning gap. */
	| 'INIT_FAILED'
	| 'NOT_PROVISIONED'
	| 'TOKEN_FAILED'
	| 'REGISTRATION_FAILED'
	/** browser-dial refused: no access to the deal, no number on it, or the provider said no. */
	| 'DIAL_REJECTED'
	| 'RELAY_TIMEOUT'
	| 'NO_ACTIVE_CALL'
	/** There is a call, but the page passed a value the control cannot act on. */
	| 'INVALID_INPUT'
	/**
	 * A newer follower tab relayed an action this older leader has no case for. Reported, not
	 * ignored, so a page is never told a hangup worked when nothing happened.
	 */
	| 'UNSUPPORTED_CONTROL';

export interface SoftphoneError {
	code: SoftphoneErrorCode;
	message: string;
}

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
 * Snapshotted by the registry as the call ends, because the fields it needs are cleared at that
 * instant and a page has no reliable moment to read them.
 */
export interface SoftphoneCallSummary {
	callId?: string;
	direction?: CallDirection;

	/**
	 * The caller on an inbound call. Absent on outbound by design: the customer's number never
	 * reaches the browser. Use `ticketId` for outbound.
	 */
	phoneNumber?: string;

	/**
	 * Outbound only; what a Redial control should pass. Known only in the tab that placed the call.
	 */
	ticketId?: string;

	/** The agent's identity at the provider. */
	agent?: string;

	/** ISO, when audio started. Undefined when the call was never answered in this browser. */
	startedAt?: string;
	endedAt: string;

	durationSeconds: number;

	/**
	 * Whether audio was established in this browser, not whether the customer picked up: the
	 * agent's outbound leg is answered when the provider bridges it.
	 */
	answered: boolean;

	endReason?: string;
}

/**
 * No live duration here: the component ticks `Store.softphone.duration`, a path the registry never
 * writes, so a tick cannot be clobbered by an unrelated state change.
 */
export interface SoftphoneState {
	provisioned: boolean;
	provider?: string;
	providerUserId?: string;
	virtualNumber?: string;

	/** Not evidence that dialling works - see fetchStatus. */
	registered: boolean;
	isLeader: boolean;

	inCall: boolean;
	callId?: string;
	direction?: CallDirection;
	from?: string;
	/** Always undefined today: the customer's number never reaches the browser. */
	to?: string;
	remoteName?: string;
	startedAt?: string;

	isMuted: boolean;
	isOnHold: boolean;
	micDenied: boolean;

	lastError: SoftphoneError | null;

	/** The call that just ended; survives the call being cleared, for wrap-up and redial. */
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
 * Identical in every tab; on a follower, controls relay to the leader. `dial` is not on
 * `ICallProvider` because it calls our backend and works from any tab.
 */
export interface SoftphoneFacade {
	answer(): Promise<boolean>;
	hangup(): Promise<boolean>;
	/** Returns the new hold state. Toggle only - the vendor SDK exposes no set-hold. */
	toggleHold(): Promise<boolean>;
	toggleMute(): Promise<boolean>;
	sendDtmf(digit: string): Promise<boolean>;
	dial(ticketId: string, connectionName?: string): Promise<unknown>;
	setAvailability(available: boolean): Promise<boolean>;
}

export interface BrowserCallStatus {
	provisioned: boolean;
	provider?: string;
	providerUserId?: string;
	virtualNumber?: string;
	dialReadyChecked?: boolean;
	/**
	 * The page's named connection, or the agent's own when none was named. Token and dials use it,
	 * so one page serves agents on different providers.
	 */
	connectionName?: string;
	/** Wins over the component's "Calling Library URL". */
	sdkUrl?: string;
}

export interface BrowserCallToken {
	token: string;
	providerUserId: string;
	/** Absent for providers whose credential does not expire on a clock (TeleCMI's does not). */
	expiresIn?: number;
	provider: string;
	region?: string;
}
