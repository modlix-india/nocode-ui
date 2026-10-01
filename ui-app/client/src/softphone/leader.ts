import { shortUUID } from '../util/shortUUID';
import { asError } from './errors';
import { SoftphoneError, SoftphoneEvent, SoftphoneState } from './types';

/**
 * One tab per browser profile holds the SIP session; the rest mirror it. Without an election,
 * duplicate registrations make it non-deterministic which tab the provider rings.
 *
 * `navigator.locks` because the browser releases a held lock when the tab dies, even on a crash,
 * which a `localStorage` heartbeat gets wrong.
 */

const LOCK_NAME = 'softphone_leader';
const CHANNEL_NAME = 'softphone_sync';

const ANNOUNCE_INTERVAL_MS = 5_000;
const LEADER_STALE_MS = 15_000;
const RELAY_TIMEOUT_MS = 5_000;

/** Controls a follower can ask the leader to perform. `dial` is absent: it works from any tab. */
export type RelayAction =
	'answer' | 'hangup' | 'toggleHold' | 'toggleMute' | 'sendDtmf' | 'setAvailability';

type LeaderMessage =
	| { kind: 'OUTBOUND_PLACED'; ticketId: string }
	| { kind: 'OUTBOUND_FAILED' }
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
	onBecameLeader: () => void;
	onEvent: (event: SoftphoneEvent) => void;
	/** Leader only: a follower opened mid-call and wants the current state. */
	onStateRequest: () => SoftphoneState;
	onAction: (action: RelayAction, arg?: unknown) => Promise<unknown>;
	onSnapshot: (state: SoftphoneState) => void;
	/**
	 * Another tab placed an outbound call. Its SIP INVITE only arrives at the leader, which would
	 * otherwise treat that leg as an inbound call the agent has to answer by hand.
	 */
	onOutboundPlaced: (ticketId: string) => void;

	onOutboundFailed: () => void;

	/**
	 * The leader went quiet without releasing its lock. Reported only, never repaired: stealing
	 * the lock on a false positive would produce two registered tabs.
	 */
	onLeaderStale: () => void;
}

export class LeaderChannel {
	private readonly tabId = shortUUID();

	private channel?: BroadcastChannel;
	private handlers?: LeaderHandlers;

	private leader = false;
	private releaseLock?: () => void;
	/**
	 * Cancels a still-queued lock request. `releaseLock` exists only once granted, so without this
	 * a stopped follower's queued request could later be granted and hold the lock with no phone.
	 */
	private lockRequest?: AbortController;

	private announceTimer?: ReturnType<typeof setInterval>;
	private staleTimer?: ReturnType<typeof setInterval>;
	private requeueTimer?: ReturnType<typeof setTimeout>;
	private lastLeaderSeen = 0;
	private staleReported = false;

	private readonly pending = new Map<
		string,
		{
			resolve: (v: unknown) => void;
			reject: (e: SoftphoneError) => void;
			timer: ReturnType<typeof setTimeout>;
		}
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

		// No Web Locks: behave as a single tab rather than refuse to work, accepting that two tabs
		// on such a browser will both register.
		if (!navigator.locks) {
			this.becomeLeader();
			return;
		}

		this.requestLock();
		this.watchForStaleLeader();
	}

	/**
	 * Steps down, keeping the channel open, for a leader that cannot run a phone, so a tab that
	 * can register takes over instead of every follower relaying to a dead leader.
	 *
	 * @param requeueAfterMs re-queue for the lock after this long; omit to stop competing (for
	 * configuration failures that re-election would only repeat).
	 * @returns whether leadership was actually given up.
	 */
	resign(requeueAfterMs?: number): boolean {
		if (!this.leader) return false;

		// Without Web Locks there is no other candidate, so standing down would leave no phone.
		if (!navigator.locks) return false;

		this.leader = false;

		if (this.announceTimer) clearInterval(this.announceTimer);
		this.announceTimer = undefined;

		this.releaseLock?.();
		this.releaseLock = undefined;

		this.watchForStaleLeader();

		if (requeueAfterMs !== undefined)
			this.requeueTimer = setTimeout(() => {
				this.requeueTimer = undefined;
				if (this.handlers) this.requestLock();
			}, requeueAfterMs);

		return true;
	}

	private requestLock(): void {
		const request = new AbortController();
		this.lockRequest = request;

		navigator.locks
			.request(LOCK_NAME, { signal: request.signal }, () => {
				// The abort lost a race with the grant: release at once.
				if (request.signal.aborted || !this.handlers) return Promise.resolve();

				this.becomeLeader();
				// Held until stop() or resign(), or released by the browser if the tab dies.
				return new Promise<void>(resolve => {
					this.releaseLock = resolve;
				});
			})
			.catch(() => {
				/* The lock request was aborted, which only happens on teardown. */
			});
	}

	stop(): void {
		this.leader = false;

		if (this.announceTimer) clearInterval(this.announceTimer);
		if (this.staleTimer) clearInterval(this.staleTimer);
		if (this.requeueTimer) clearTimeout(this.requeueTimer);
		this.announceTimer = undefined;
		this.staleTimer = undefined;
		this.requeueTimer = undefined;

		for (const [, p] of this.pending) {
			clearTimeout(p.timer);
			p.reject({ code: 'RELAY_TIMEOUT', message: 'The softphone was shut down.' });
		}
		this.pending.clear();

		this.lockRequest?.abort();
		this.lockRequest = undefined;
		this.releaseLock?.();
		this.releaseLock = undefined;

		this.channel?.close();
		this.channel = undefined;
		this.handlers = undefined;
	}

	broadcastEvent(event: SoftphoneEvent): void {
		if (!this.leader) return;
		this.post({ kind: 'CALL_EVENT', event });
	}

	/**
	 * Asks the leader to perform a control and waits for its result. Never resolves
	 * optimistically: a reported hangup that never happened looks like a call that will not end.
	 */
	relay(action: RelayAction, arg?: unknown): Promise<unknown> {
		if (!this.channel)
			return Promise.reject<unknown>({
				code: 'RELAY_TIMEOUT',
				message: 'This tab cannot reach the tab holding the call.',
			} satisfies SoftphoneError);

		const id = shortUUID();

		return new Promise<unknown>((resolve, reject) => {
			const timer = setTimeout(() => {
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

	/**
	 * Not leader-gated: a follower can dial, and the leader must hear before the INVITE lands.
	 * BroadcastChannel does not echo to the sender, so the dialling tab records its own claim.
	 */
	announceOutboundDial(ticketId: string): void {
		this.post({ kind: 'OUTBOUND_PLACED', ticketId });
	}

	announceOutboundFailed(): void {
		this.post({ kind: 'OUTBOUND_FAILED' });
	}

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
		this.staleReported = false;

		if (this.staleTimer) clearInterval(this.staleTimer);
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

			case 'OUTBOUND_PLACED':
				handlers.onOutboundPlaced(message.ticketId);
				return;

			case 'OUTBOUND_FAILED':
				handlers.onOutboundFailed();
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

			default: {
				const unhandled: never = message;

				// Ignored, not thrown: after a deploy another tab may run newer code and send a
				// kind this build does not know.
				console.warn('Ignoring an unrecognised softphone tab message', unhandled);
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
					error: asError(error, 'RELAY_TIMEOUT', 'The control failed.'),
				}),
			);
	}
}
