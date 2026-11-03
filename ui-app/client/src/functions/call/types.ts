/**
 * Calls in the browser: the state a page binds to and the interface every provider adapter
 * implements. A new provider is one adapter file plus one entry in registry.ts.
 */

export type CallStatus =
	'idle' | 'registering' | 'ready' | 'ringing' | 'connected' | 'ended' | 'error';

export type CallDirection = 'inbound' | 'outbound';

/** What `UIEngine.Call.Connect` writes to its statePath. Never holds credentials. */
export interface CallState {
	status: CallStatus;
	callId?: string;
	direction?: CallDirection;
	from?: string;
	to?: string;
	muted: boolean;
	/** True while the connected call is on hold (the customer hears the provider's hold music). */
	held?: boolean;
	/**
	 * The call bar is collapsed to its pill. The user's choice, remembered per user in this browser
	 * and the same in every tab (set with `UIEngine.Call.View`).
	 */
	collapsed?: boolean;
	/** Epoch milliseconds when the call connected. */
	startedAt?: number;
	/** Epoch milliseconds when a connected or ringing call ended. */
	endedAt?: number;
	/** `pageClosed`: the tab holding the call closed or reloaded, which ends a browser call. */
	endReason?: 'pageClosed';
	/** True in a tab that only mirrors the call: another tab of the site holds its audio. */
	otherTab?: boolean;
	/** The user's call sounds setting (ring, ring back, end tone), remembered per user. */
	soundOn?: boolean;
	/** True while a ring is due and the browser blocks audio until the user taps the page. */
	audioBlocked?: boolean;
	/**
	 * True while the call in this browser is the leg of a call the user placed and the far end
	 * has not answered: the ring back plays instead of the incoming ring.
	 */
	ringBack?: boolean;
	/** Set when the tab holding the call cannot play sound and another tab of the site does. */
	soundTab?: string;
	/**
	 * True while the site has no notification answer from the user and the call card may offer
	 * "Allow call alerts" (run `UIEngine.Call.Alert` with `allow` from the click). Not offered
	 * again once answered, nor where notifications are not available. Always a boolean in a state
	 * this engine writes, so a page can tell an engine that has alerts.
	 */
	alertsOffer?: boolean;
	error?: string;
}

/** What an adapter reports; the session merges it into the state. */
export type CallStatePatch = Partial<CallState>;

export type CallStateListener = (patch: CallStatePatch) => void;

/** Whatever the page passed to Connect. Each adapter documents the keys it reads. */
export type CallCredentials = Record<string, any>;

export interface CallAdapter {
	/** Loads the provider's SDK. Called once, by Connect, before register. */
	load(): Promise<void>;
	/** Signs in and registers. Resolves when the provider says the agent can take calls. */
	register(credentials: CallCredentials): Promise<void>;
	answer(callId?: string): Promise<void> | void;
	hangup(callId?: string): Promise<void> | void;
	mute(on: boolean): Promise<void> | void;
	/** Puts the connected call on hold (`on` true) or takes it off hold. Optional per provider. */
	hold?(on: boolean): Promise<void> | void;
	/** Signs out and releases the SDK's connection. */
	disconnect(): Promise<void> | void;
	/** Called once, before register. The adapter reports SDK events through it. */
	onStateChange(listener: CallStateListener): void;
}

export type CallAdapterFactory = () => CallAdapter | Promise<CallAdapter>;
