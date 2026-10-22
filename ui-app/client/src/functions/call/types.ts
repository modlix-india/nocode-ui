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
	/** Epoch milliseconds when the call connected. */
	startedAt?: number;
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
	/** Signs out and releases the SDK's connection. */
	disconnect(): Promise<void> | void;
	/** Called once, before register. The adapter reports SDK events through it. */
	onStateChange(listener: CallStateListener): void;
}

export type CallAdapterFactory = () => CallAdapter | Promise<CallAdapter>;
