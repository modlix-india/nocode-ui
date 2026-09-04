import { shortUUID } from '../util/shortUUID';
import { SoftphoneError, SoftphoneEvent, SoftphoneState } from './types';

/**
 * One tab per browser profile holds the SIP session; the rest mirror it.
 *
 * Agents keep several CRM tabs open. Two things go wrong without an election: the audio for a call
 * arrives in whichever tab happened to register, and duplicate registrations make it
 * non-deterministic which one the provider rings.
 *
 * `navigator.locks` is the right primitive because the browser releases a held lock when the tab
 * dies - including on a crash or a force quit, which is exactly the case a `localStorage`
 * heartbeat gets wrong and the case that leaves an agent unreachable.
 */

const LOCK_NAME = 'softphone_leader';
const CHANNEL_NAME = 'softphone_sync';

/** How often the leader says it is alive. */
const ANNOUNCE_INTERVAL_MS = 5_000;
/** How long a follower waits before it stops believing in the leader. */
const LEADER_STALE_MS = 15_000;
/** How long a relayed control waits for the leader to answer. */
const RELAY_TIMEOUT_MS = 5_000;

/** Controls a follower can ask the leader to perform. `dial` is absent: it works from any tab. */
export type RelayAction =
	'answer' | 'hangup' | 'toggleHold' | 'toggleMute' | 'sendDtmf' | 'setAvailability';

type LeaderMessage =
	| { kind: 'CALL_EVENT'; event: SoftphoneEvent }
	| { kind: 'LEADER_ANNOUNCE'; at: number }
	| { kind: 'STATE_REQUEST'; from: string }
	| { kind: 'STATE_SNAPSHOT'; to: string; state: SoftphoneState }
	| { kind: 'ACTION_REQUEST'; id: string; from: string; action: RelayAction; arg?: unknown }
	| {
			kind: 'ACTION_RESULT';
			id: string;
			to: string;
			ok: boolean;
			result?: unknown;
			error?: SoftphoneError;
	  };

export interface LeaderHandlers {
	/** This tab won the lock. Fetch a token and bring the phone up. */
	onBecameLeader: () => void;
	/** A normalised event arrived from the leader. Followers render from this. */
	onEvent: (event: SoftphoneEvent) => void;
	/** A follower wants the current picture, having opened mid-call. Leader only. */
	onStateRequest: () => SoftphoneState;
	/** A follower asked for a control. Leader only. */
	onAction: (action: RelayAction, arg?: unknown) => Promise<unknown>;
	/** The leader sent a full picture. Followers adopt it. */
	onSnapshot: (state: SoftphoneState) => void;
	/**
	 * The leader has gone quiet without releasing its lock.
	 *
	 * Worth surfacing rather than hiding: recovery is not available from here. Promotion needs the
	 * lock to actually release, and stealing it on a false positive would produce two registered
	 * tabs, which is the failure this class exists to prevent. So this reports a degraded phone; it
	 * does not repair one.
	 */
	onLeaderStale: () => void;
}

export class LeaderChannel {
	private readonly tabId = shortUUID();

	private channel?: BroadcastChannel;
	private handlers?: LeaderHandlers;

	private leader = false;
	private releaseLock?: () => void;

	private announceTimer?: ReturnType<typeof setInterval>;
	private staleTimer?: ReturnType<typeof setInterval>;
	private lastLeaderSeen = 0;
	private staleReported = false;

	private readonly pending = new Map<
		string,
		{ resolve: (v: unknown) => void; reject: (e: SoftphoneError) => void; timer: number }
	>();

	get isLeader(): boolean {
		return this.leader;
	}

	start(handlers: LeaderHandlers): void {
		this.handlers = handlers;

		if (typeof BroadcastChannel !== 'undefined') {
			this.channel = new BroadcastChannel(CHANNEL_NAME);
			this.channel.onmessage = e => this.receive(e.data as LeaderMessage);
		}

		// No Web Locks means one tab is all we can safely assume, so behave as a single tab rather
		// than refusing to work. Two tabs on such a browser will both register; that is a worse
		// outcome than not running at all only if calls matter less than tidiness, and they do not.
		if (!navigator.locks) {
			this.becomeLeader();
			return;
		}

		navigator.locks
			.request(LOCK_NAME, () => {
				this.becomeLeader();
				// Holding the lock *is* being the leader, so this promise never settles. It is
				// resolved by stop(), and released by the browser if this tab dies first.
				return new Promise<void>(resolve => {
					this.releaseLock = resolve;
				});
			})
			.catch(() => {
				/* The lock request was aborted, which only happens on teardown. */
			});

		this.watchForStaleLeader();
	}

	stop(): void {
		this.leader = false;

		if (this.announceTimer) clearInterval(this.announceTimer);
		if (this.staleTimer) clearInterval(this.staleTimer);
		this.announceTimer = undefined;
		this.staleTimer = undefined;

		for (const [, p] of this.pending) {
			clearTimeout(p.timer);
			p.reject({ code: 'RELAY_TIMEOUT', message: 'The softphone was shut down.' });
		}
		this.pending.clear();

		this.releaseLock?.();
		this.releaseLock = undefined;

		this.channel?.close();
		this.channel = undefined;
		this.handlers = undefined;
	}

	/** Leader only. Tells every follower what just happened. */
	broadcastEvent(event: SoftphoneEvent): void {
		if (!this.leader) return;
		this.post({ kind: 'CALL_EVENT', event });
	}

	/**
	 * Asks the leader to perform a control, and waits for it to say whether it worked.
	 *
	 * The waiting is the point. Resolving optimistically would report success for a hangup that
	 * never happened, which is indistinguishable to the agent from a call that will not end.
	 */
	relay(action: RelayAction, arg?: unknown): Promise<unknown> {
		if (!this.channel)
			return Promise.reject<unknown>({
				code: 'RELAY_TIMEOUT',
				message: 'This tab cannot reach the tab holding the call.',
			} satisfies SoftphoneError);

		const id = shortUUID();

		return new Promise<unknown>((resolve, reject) => {
			const timer = window.setTimeout(() => {
				this.pending.delete(id);
				reject({
					code: 'RELAY_TIMEOUT',
					message: 'The tab holding the call did not respond.',
				} satisfies SoftphoneError);
			}, RELAY_TIMEOUT_MS);

			this.pending.set(id, { resolve, reject, timer });
			this.post({ kind: 'ACTION_REQUEST', id, from: this.tabId, action, arg });
		});
	}

	/** Follower only. Asks for the current picture, so a tab opened mid-call shows the call. */
	requestSnapshot(): void {
		if (this.leader) return;
		this.post({ kind: 'STATE_REQUEST', from: this.tabId });
	}

	private becomeLeader(): void {
		this.leader = true;
		this.staleReported = false;

		if (this.staleTimer) clearInterval(this.staleTimer);
		this.staleTimer = undefined;

		this.announce();
		this.announceTimer = setInterval(() => this.announce(), ANNOUNCE_INTERVAL_MS);

		this.handlers?.onBecameLeader();
	}

	private announce(): void {
		this.post({ kind: 'LEADER_ANNOUNCE', at: Date.now() });
	}

	private watchForStaleLeader(): void {
		this.lastLeaderSeen = Date.now();
		this.staleTimer = setInterval(() => {
			if (this.leader) return;
			if (Date.now() - this.lastLeaderSeen < LEADER_STALE_MS) return;
			if (this.staleReported) return;
			this.staleReported = true;
			this.handlers?.onLeaderStale();
		}, ANNOUNCE_INTERVAL_MS);
	}

	private post(message: LeaderMessage): void {
		this.channel?.postMessage(message);
	}

	private receive(message: LeaderMessage): void {
		const handlers = this.handlers;
		if (!handlers) return;

		switch (message.kind) {
			case 'LEADER_ANNOUNCE':
				this.lastLeaderSeen = message.at;
				this.staleReported = false;
				return;

			case 'CALL_EVENT':
				if (!this.leader) handlers.onEvent(message.event);
				return;

			case 'STATE_REQUEST':
				if (this.leader)
					this.post({
						kind: 'STATE_SNAPSHOT',
						to: message.from,
						state: handlers.onStateRequest(),
					});
				return;

			case 'STATE_SNAPSHOT':
				if (!this.leader && message.to === this.tabId) handlers.onSnapshot(message.state);
				return;

			case 'ACTION_REQUEST':
				if (this.leader) this.performForFollower(message, handlers);
				return;

			case 'ACTION_RESULT': {
				if (message.to !== this.tabId) return;
				const p = this.pending.get(message.id);
				if (!p) return;
				this.pending.delete(message.id);
				clearTimeout(p.timer);
				if (message.ok) p.resolve(message.result);
				else
					p.reject(
						message.error ?? {
							code: 'RELAY_TIMEOUT',
							message: 'The control failed in the tab holding the call.',
						},
					);
				return;
			}
		}
	}

	private performForFollower(
		message: Extract<LeaderMessage, { kind: 'ACTION_REQUEST' }>,
		handlers: LeaderHandlers,
	): void {
		handlers
			.onAction(message.action, message.arg)
			.then(result =>
				this.post({
					kind: 'ACTION_RESULT',
					id: message.id,
					to: message.from,
					ok: true,
					result,
				}),
			)
			.catch((error: unknown) =>
				this.post({
					kind: 'ACTION_RESULT',
					id: message.id,
					to: message.from,
					ok: false,
					error: asSoftphoneError(error),
				}),
			);
	}
}

function asSoftphoneError(error: unknown): SoftphoneError {
	if (error && typeof error === 'object' && 'code' in error && 'message' in error)
		return error as SoftphoneError;
	return {
		code: 'RELAY_TIMEOUT',
		message: error instanceof Error ? error.message : 'The control failed.',
	};
}
