import { duplicate } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { getCallProvider } from './registry';
import { CallAdapter, CallCredentials, CallState, CallStatePatch } from './types';

/**
 * The one call connection of this page session. Module level on purpose: a provider SDK holds
 * one registration per tab, and navigating between pages must not drop a call.
 *
 * Every change is written, whole, to the statePath given to Connect. Credentials go to the
 * adapter's register and nowhere else: not into the state, not into any storage.
 */

export const REGISTER_TIMEOUT_MS = 30000;

interface Session {
	provider: string;
	adapter: CallAdapter;
	statePath: string;
	pageName: string;
	state: CallState;
	/** Bumped on every Connect, so events from a replaced adapter are ignored. */
	generation: number;
}

let active: Session | undefined;
let generation = 0;

export class CallError extends Error {}

function idleState(): CallState {
	return { status: 'idle', muted: false };
}

function write(session: Session) {
	setData(session.statePath, duplicate(session.state), session.pageName);
}

const IN_CALL = new Set(['ringing', 'connected']);

/** Merges an adapter's report into the state, with the rules every provider shares. */
function apply(session: Session, patch: CallStatePatch) {
	const prev = session.state;
	let next: CallState = { ...prev, ...patch };

	// A new call starts clean: no mute, start time or error left from the last one.
	const newCall =
		patch.status === 'ringing' &&
		(!IN_CALL.has(prev.status) ||
			(patch.callId && prev.callId && patch.callId !== prev.callId));
	if (newCall) {
		next = {
			status: 'ringing',
			muted: false,
			callId: patch.callId,
			direction: patch.direction ?? prev.direction,
			from: patch.from,
			to: patch.to,
		};
	}

	if (next.status === 'connected' && prev.status !== 'connected' && !next.startedAt)
		next.startedAt = Date.now();
	if (next.status === 'ended') next.muted = false;

	session.state = next;
	write(session);
}

function current(): Session {
	if (!active) throw new CallError('No call connection. Run UIEngine.Call.Connect first.');
	return active;
}

function fail(session: Session, error: unknown, fatal = false): never {
	const message = error instanceof Error ? error.message : String(error ?? 'Call failed');
	apply(session, fatal ? { status: 'error', error: message } : { error: message });
	throw error instanceof CallError ? error : new CallError(message);
}

function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return Promise.race([
		p,
		new Promise<T>((_, reject) => {
			timer = setTimeout(() => reject(new CallError(message)), ms);
		}),
	]).finally(() => clearTimeout(timer));
}

export async function connect(
	provider: string,
	credentials: CallCredentials,
	statePath: string,
	pageName: string,
): Promise<CallState> {
	if (!statePath?.trim()) throw new CallError('statePath is required.');
	const factory = getCallProvider(provider);
	if (!factory) throw new CallError(`Unknown call provider "${provider}".`);
	if (!credentials || typeof credentials !== 'object')
		throw new CallError('credentials are required.');

	if (active) {
		if (IN_CALL.has(active.state.status))
			throw new CallError('A call is in progress. Hang up before connecting again.');
		await disconnect();
	}

	const session: Session = {
		provider: provider.trim().toLowerCase(),
		adapter: undefined as unknown as CallAdapter,
		statePath,
		pageName,
		state: { status: 'registering', muted: false },
		generation: ++generation,
	};
	active = session;
	write(session);

	try {
		session.adapter = await factory();
		session.adapter.onStateChange(patch => {
			if (active === session && session.generation === generation) apply(session, patch);
		});
		await session.adapter.load();
		await withTimeout(
			session.adapter.register(credentials),
			REGISTER_TIMEOUT_MS,
			'The call provider did not confirm the sign in.',
		);
	} catch (error) {
		if (active !== session) throw error;
		// The adapter may hold a half open connection; release it, keep the error state.
		try {
			await session.adapter?.disconnect();
		} catch {
			// Nothing more to release.
		}
		active = undefined;
		session.generation = -1;
		const message = error instanceof Error ? error.message : String(error);
		session.state = { status: 'error', muted: false, error: message };
		write(session);
		throw error instanceof CallError ? error : new CallError(message);
	}

	if (active === session && session.state.status === 'registering')
		apply(session, { status: 'ready', error: undefined });
	return session.state;
}

function checkCallId(session: Session, callId?: string) {
	if (callId && session.state.callId && callId !== session.state.callId)
		throw new CallError(`No call with id ${callId}.`);
}

export async function answer(callId?: string): Promise<CallState> {
	const session = current();
	if (session.state.status !== 'ringing' || session.state.direction !== 'inbound')
		throw new CallError('No incoming call to answer.');
	checkCallId(session, callId);
	try {
		await session.adapter.answer(callId || session.state.callId);
	} catch (e) {
		fail(session, e);
	}
	return session.state;
}

export async function hangup(callId?: string): Promise<CallState> {
	const session = current();
	if (!IN_CALL.has(session.state.status)) throw new CallError('No call to hang up.');
	checkCallId(session, callId);
	try {
		await session.adapter.hangup(callId || session.state.callId);
	} catch (e) {
		fail(session, e);
	}
	// Some SDKs report the end later, or not at all for a local hangup.
	if (IN_CALL.has(session.state.status)) apply(session, { status: 'ended' });
	return session.state;
}

export async function mute(on: boolean): Promise<CallState> {
	const session = current();
	if (session.state.status !== 'connected') throw new CallError('No connected call to mute.');
	try {
		await session.adapter.mute(!!on);
	} catch (e) {
		fail(session, e);
	}
	apply(session, { muted: !!on });
	return session.state;
}

export async function disconnect(): Promise<CallState> {
	const session = active;
	if (!session) return idleState();
	active = undefined;
	session.generation = -1;
	try {
		await session.adapter?.disconnect();
	} finally {
		session.state = idleState();
		write(session);
	}
	return session.state;
}

/** For tests. */
export function activeCallState(): CallState | undefined {
	return active?.state;
}
