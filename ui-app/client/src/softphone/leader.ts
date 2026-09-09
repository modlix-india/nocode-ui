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
	 * Another tab placed an outbound call.
	 *
	 * Dialling is a backend call and works from any tab, but the SIP INVITE for it only ever
	 * arrives at the leader. Without being told, the leader sees that leg as an ordinary inbound
	 * call - labels it inbound, and leaves the agent to answer their own dial by hand.
	 */
	onOutboundPlaced: (ticketId: string) => void;

	/** That dial did not happen after all, so the claim it made should be dropped. */
	onOutboundFailed: () => void;

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
	/** Set only between a resign and this tab's next attempt at the lock. */
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

		// No Web Locks means one tab is all we can safely assume, so behave as a single tab rather
		// than refusing to work. Two tabs on such a browser will both register; that is a worse
		// outcome than not running at all only if calls matter less than tidiness, and they do not.
		if (!navigator.locks) {
			this.becomeLeader();
			return;
		}

		this.requestLock();
		this.watchForStaleLeader();
	}

	/**
	 * Steps down without shutting the channel down, for a tab that won the election but cannot
	 * actually run a phone.
	 *
	 * Holding the lock with no phone is worse than not holding it: every other tab stays a
	 * follower and relays its controls to a leader that can neither place nor answer a call, so
	 * one tab's failure becomes every tab's. Releasing it lets a tab that can register take over.
	 *
	 * @param requeueAfterMs go back in the queue for the lock after this long. Omitted, this tab
	 * stops competing - right when the failure is configuration rather than a blip, since being
	 * re-elected every few seconds would only repeat it.
	 * @returns whether leadership was actually given up, so the caller's own state can agree.
	 */
	resign(requeueAfterMs?: number): boolean {
		if (!this.leader) return false;

		// Nothing to hand over on a browser with no Web Locks. Leadership there is not won, it is
		// assumed - there is no queue and no other candidate - so standing down would leave this
		// tab without a phone and nobody in a position to start one. The failure is on the state
		// either way; a reload is the recovery.
		if (!navigator.locks) return false;

		this.leader = false;

		if (this.announceTimer) clearInterval(this.announceTimer);
		this.announceTimer = undefined;

		this.releaseLock?.();
		this.releaseLock = undefined;

		// A follower again, so the stale-leader watch matters again: whoever takes the lock next
		// might go quiet too.
		this.watchForStaleLeader();

		if (requeueAfterMs !== undefined)
			this.requeueTimer = setTimeout(() => {
				this.requeueTimer = undefined;
				if (this.handlers) this.requestLock();
			}, requeueAfterMs);

		return true;
	}

	private requestLock(): void {
		navigator.locks
			.request(LOCK_NAME, () => {
				this.becomeLeader();
				// Holding the lock *is* being the leader, so this promise never settles. It is
				// resolved by stop() or resign(), and released by the browser if this tab dies
				// first.
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
	 * Tells every other tab that this one just placed a call.
	 *
	 * Not leader-gated, unlike `broadcastEvent`: the point is that a follower can dial, and the
	 * leader has to hear about it before the INVITE lands. BroadcastChannel does not echo to the
	 * sender, so the dialling tab records its own claim directly.
	 */
	announceOutboundDial(ticketId: string): void {
		this.post({ kind: 'OUTBOUND_PLACED', ticketId });
	}

	/** Withdraws a claim announced for a dial that then failed. */
	announceOutboundFailed(): void {
		this.post({ kind: 'OUTBOUND_FAILED' });
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
				// Exhaustiveness: a new message kind without a case here is a compile error.
				const unhandled: never = message;

				// Ignored rather than thrown, for the reason this channel exists at all: messages
				// come from another tab, which after a deploy may be running newer code and
				// sending a kind this build has never heard of. This runs inside the channel's
				// onmessage, where a throw is an unhandled error rather than anything actionable.
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
