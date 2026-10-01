import { setImmediate as realSetImmediate } from 'node:timers';
import { BroadcastChannel as NodeBroadcastChannel } from 'node:worker_threads';
import { LeaderChannel, LeaderHandlers, RelayAction } from '../leader';
import { INITIAL_STATE, SoftphoneEvent, SoftphoneState } from '../types';

/**
 * The leader/follower protocol is the least self-evident part of the softphone and the part whose
 * failures are quietest: a follower whose Hangup does nothing looks, to the agent, exactly like a
 * call that will not end.
 *
 * These tests drive two channels against one BroadcastChannel, the way two tabs would.
 */

/**
 * jsdom ships neither of the two browser primitives this protocol is built on, so both are stood
 * up here. `BroadcastChannel` is Node's own rather than a hand-rolled fake - it is the same spec,
 * including the part that matters most, that a sender never receives its own message.
 */

function installBroadcastChannel() {
	const had = 'BroadcastChannel' in globalThis;
	if (!had)
		(globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel =
			NodeBroadcastChannel;
	return () => {
		if (!had) delete (globalThis as unknown as { BroadcastChannel?: unknown }).BroadcastChannel;
	};
}

/**
 * The production fallback with no Web Locks is "assume a single tab and lead", which is right in a
 * browser without them but useless for testing two tabs. This stands in a lock manager that grants
 * the first caller and leaves the rest queued forever - what a real one does when the holder never
 * releases, which is exactly how leadership is held here.
 */
/** How many times the stub has granted the lock since it was installed. */
let lockGrants = 0;

function installLockManager({ ignoreAbort = false } = {}) {
	lockGrants = 0;
	const held = new Set<string>();
	const queued = new Map<string, Array<() => void>>();

	const grant = (name: string, callback: () => Promise<void>): Promise<void> => {
		held.add(name);
		lockGrants += 1;
		// A real LockManager holds the lock for as long as the callback's promise is pending and
		// releases it when that promise settles, handing the lock to the next waiter. Getting this
		// right in the stub is what makes "leader closes its tab, another is promoted" testable.
		return Promise.resolve(callback()).finally(() => {
			held.delete(name);
			const next = queued.get(name)?.shift();
			next?.();
		});
	};

	(navigator as unknown as { locks: unknown }).locks = {
		// What a real LockManager reports: which locks some tab holds right now.
		query: async () => ({ held: [...held].map(name => ({ name })), pending: [] }),
		// Both call shapes, as the real one: (name, callback) and (name, { signal }, callback). An
		// aborted request still queued leaves the queue and rejects, per the Web Locks spec.
		request: (
			name: string,
			optionsOrCallback: { signal?: AbortSignal } | (() => Promise<void>),
			maybeCallback?: () => Promise<void>,
		) => {
			const callback =
				typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback!;
			// `ignoreAbort` stands in for the grant winning a race with the abort.
			const signal =
				typeof optionsOrCallback === 'function' || ignoreAbort
					? undefined
					: optionsOrCallback.signal;
			if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
			if (!held.has(name)) return grant(name, callback);

			return new Promise<void>((resolve, reject) => {
				const waiters = queued.get(name) ?? [];
				const waiter = () => grant(name, callback).then(resolve, reject);
				waiters.push(waiter);
				queued.set(name, waiters);
				signal?.addEventListener('abort', () => {
					const at = waiters.indexOf(waiter);
					if (at >= 0) waiters.splice(at, 1);
					reject(new DOMException('Aborted', 'AbortError'));
				});
			});
		},
	};

	return () => {
		delete (navigator as unknown as { locks?: unknown }).locks;
	};
}

function handlers(over: Partial<LeaderHandlers> = {}): LeaderHandlers {
	return {
		onBecameLeader: () => {},
		onEvent: () => {},
		onStateRequest: () => ({ ...INITIAL_STATE }),
		onAction: async () => true,
		onSnapshot: () => {},
		onOutboundPlaced: () => {},
		onOutboundFailed: () => {},
		onLeaderStale: () => {},
		onLeaderBack: () => {},
		...over,
	};
}

/**
 * Waits for a condition rather than for a duration.
 *
 * BroadcastChannel delivery is asynchronous with no guaranteed timing, so a single `setTimeout(0)`
 * is a coin flip - it failed roughly one run in three here before this was polled instead.
 */
async function waitFor(condition: () => boolean, timeoutMs = 2_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (!condition()) {
		if (Date.now() > deadline) throw new Error('Timed out waiting for the expected state.');
		await new Promise(resolve => setTimeout(resolve, 5));
	}
}

describe('LeaderChannel', () => {
	let restoreLocks: () => void;
	let restoreChannel: () => void;
	let channels: LeaderChannel[];

	beforeEach(() => {
		restoreLocks = installLockManager();
		restoreChannel = installBroadcastChannel();
		channels = [];
	});

	afterEach(() => {
		channels.forEach(c => c.stop());
		restoreChannel();
		restoreLocks();
	});

	function open(over: Partial<LeaderHandlers> = {}): LeaderChannel {
		const channel = new LeaderChannel();
		channels.push(channel);
		channel.start(handlers(over));
		return channel;
	}

	it('elects exactly one leader', () => {
		const first = open();
		const second = open();
		const third = open();

		expect([first.isLeader, second.isLeader, third.isLeader].filter(Boolean)).toHaveLength(1);
		expect(first.isLeader).toBe(true);
	});

	it('leads immediately when the browser has no Web Locks', () => {
		restoreLocks();
		expect(open().isLeader).toBe(true);
	});

	it('keeps the post when there are no Web Locks, because nobody else can take it', () => {
		restoreLocks();
		const only = open();

		// Leadership there is assumed rather than won: no lock, no queue, no second candidate. A
		// tab that stood down would be left with no phone and nothing able to start one, so it
		// says plainly that it did not - and the registry leaves `isLeader` alone on that answer.
		expect(only.resign(1_000)).toBe(false);
		expect(only.isLeader).toBe(true);
	});

	it('relays a control to the leader and returns what it produced', async () => {
		const performed: Array<[RelayAction, unknown]> = [];
		open({
			onAction: async (action, arg) => {
				performed.push([action, arg]);
				return action === 'toggleMute' ? true : 'done';
			},
		});
		const follower = open();

		await expect(follower.relay('hangup')).resolves.toBe('done');
		await expect(follower.relay('sendDtmf', '5')).resolves.toBe('done');
		await expect(follower.relay('toggleMute')).resolves.toBe(true);

		expect(performed).toEqual([
			['hangup', undefined],
			['sendDtmf', '5'],
			['toggleMute', undefined],
		]);
	});

	it('rejects on the follower when the control fails on the leader', async () => {
		open({
			onAction: async () => {
				throw { code: 'NO_ACTIVE_CALL', message: 'There is no call in progress.' };
			},
		});
		const follower = open();

		await expect(follower.relay('hangup')).rejects.toMatchObject({ code: 'NO_ACTIVE_CALL' });
	});

	it('relays a failure that is not ours as a plain error, never the thrown object', async () => {
		open({
			onAction: async () => {
				throw {
					isAxiosError: true,
					code: 'ERR_NETWORK',
					message: 'Network Error',
					config: { headers: { Authorization: 'a-token' } },
				};
			},
		});
		const follower = open();

		await expect(follower.relay('hangup')).rejects.toEqual({
			code: 'RELAY_TIMEOUT',
			message: 'The control failed.',
		});
	});

	it('does not resolve one follower with another follower s result', async () => {
		open({ onAction: async (_action, arg) => `for-${String(arg)}` });
		const one = open();
		const two = open();

		const [first, second] = await Promise.all([
			one.relay('sendDtmf', '1'),
			two.relay('sendDtmf', '2'),
		]);

		expect(first).toBe('for-1');
		expect(second).toBe('for-2');
	});

	it('times out rather than hanging when the leader never answers', async () => {
		jest.useFakeTimers();
		try {
			open({ onAction: () => new Promise<unknown>(() => {}) });
			const follower = open();

			const pending = follower.relay('hangup');
			const assertion = expect(pending).rejects.toMatchObject({ code: 'RELAY_TIMEOUT' });

			await Promise.resolve();
			jest.advanceTimersByTime(10_000);
			await assertion;
		} finally {
			jest.useRealTimers();
		}
	});

	it('sends call events to followers and not back to the leader', async () => {
		const leaderSaw: SoftphoneEvent[] = [];
		const followerSaw: SoftphoneEvent[] = [];

		const leader = open({ onEvent: e => leaderSaw.push(e) });
		open({ onEvent: e => followerSaw.push(e) });

		leader.broadcastEvent({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });
		await waitFor(() => followerSaw.length > 0);

		expect(followerSaw).toEqual([{ type: 'INCOMING', callId: 'c1', from: '+919876543210' }]);
		// Once the follower has it, the leader would have it too if it were ever going to.
		expect(leaderSaw).toEqual([]);
	});

	it('gives a tab opened mid-call the current picture', async () => {
		const inCall: SoftphoneState = {
			...INITIAL_STATE,
			provisioned: true,
			registered: true,
			inCall: true,
			callId: 'c9',
			direction: 'inbound',
			from: '+919876543210',
		};

		open({ onStateRequest: () => inCall });

		let adopted: SoftphoneState | undefined;
		const follower = open({ onSnapshot: s => (adopted = s) });
		follower.requestSnapshot();
		await waitFor(() => adopted !== undefined);

		expect(adopted).toMatchObject({ inCall: true, callId: 'c9', from: '+919876543210' });
	});

	it('promotes a follower when the leader goes away', async () => {
		let promoted = false;

		const leader = open();
		const follower = open({ onBecameLeader: () => (promoted = true) });

		expect(leader.isLeader).toBe(true);
		expect(follower.isLeader).toBe(false);
		expect(promoted).toBe(false);

		leader.stop();
		await waitFor(() => follower.isLeader);

		// The lock is what carries leadership, so releasing it is what promotes the next tab -
		// which is also why a crashed tab recovers: the browser releases the lock for it.
		expect(follower.isLeader).toBe(true);
		expect(promoted).toBe(true);
	});

	it('does not hand the lock to a tab that stopped while it was waiting for it', async () => {
		let promoted = false;

		const leader = open();
		// A follower that stops - a logout, a restart - while its lock request is still queued.
		const stopped = open();
		stopped.stop();
		const waiting = open({ onBecameLeader: () => (promoted = true) });

		leader.stop();

		// The stopped tab's request was first in the queue. Granted, it held the lock with no phone
		// and no announcements, and no tab could ever lead again.
		await waitFor(() => waiting.isLeader);
		expect(promoted).toBe(true);
		expect(stopped.isLeader).toBe(false);

		// And not even briefly: its request left the queue when it stopped, so the lock went from
		// the leader straight to the waiting tab - two grants, not three.
		expect(lockGrants).toBe(2);
	});

	it('lets go at once of a lock granted to a tab that has already stopped', async () => {
		// The abort can lose the race with the grant. The stopped tab must then release the lock
		// straight away, not hold it with nothing behind it.
		restoreLocks();
		restoreLocks = installLockManager({ ignoreAbort: true });
		let promoted = false;

		const leader = open();
		const stopped = open();
		stopped.stop();
		const waiting = open({ onBecameLeader: () => (promoted = true) });

		leader.stop();

		await waitFor(() => waiting.isLeader);
		expect(promoted).toBe(true);
		expect(stopped.isLeader).toBe(false);
	});

	it('promotes another tab when the leader resigns, and keeps its channel usable', async () => {
		let promoted = 0;

		const leader = open();
		const follower = open({ onBecameLeader: () => (promoted += 1) });

		// A tab that wins the election but cannot bring a phone up resigns. Without this the lock
		// stays with a tab that has no phone, and every other tab dutifully relays its controls
		// there - so one tab's failure to register silently breaks calling in all of them.
		leader.resign();
		await waitFor(() => follower.isLeader);

		expect(leader.isLeader).toBe(false);
		expect(promoted).toBe(1);

		// Resigning is not shutting down: the resigned tab is a follower now, so it must still be
		// able to reach the new leader.
		await expect(leader.relay('hangup')).resolves.toBe(true);
	});

	it('fails pending controls when the softphone shuts down mid-relay', async () => {
		open({ onAction: () => new Promise<unknown>(() => {}) });
		const follower = open();

		const pending = follower.relay('hangup');
		const assertion = expect(pending).rejects.toMatchObject({ code: 'RELAY_TIMEOUT' });
		follower.stop();

		await assertion;
	});
});

/**
 * A leader whose tab is in the background: Chrome throttles its timers, to about once a minute after
 * a few minutes hidden, so its announcements stop, while message handlers (and its calls) keep
 * running. The leader here is a bare BroadcastChannel the test drives, holding the lock the way a
 * live tab would, so it can stay silent and still answer when asked.
 */
describe('LeaderChannel, a quiet leader', () => {
	let restoreLocks: () => void;
	let restoreChannel: () => void;
	let follower: LeaderChannel;
	let leaderTab: NodeBroadcastChannel;
	let requests: Array<{ kind: string; from?: string }>;

	/** BroadcastChannel delivery is not timer-driven, so it is waited for with real turns. */
	const delivered = async () => {
		for (let i = 0; i < 20; i++) await new Promise(resolve => realSetImmediate(resolve));
	};

	const advance = async (ms: number) => {
		for (let t = 0; t < ms; t += 1_000) {
			jest.advanceTimersByTime(1_000);
			await delivered();
		}
	};

	function startFollower(over: Partial<LeaderHandlers> = {}) {
		follower = new LeaderChannel();
		follower.start(handlers(over));
	}

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask'] });
		restoreLocks = installLockManager();
		restoreChannel = installBroadcastChannel();
		// Held, never released: the live leader tab.
		void navigator.locks.request('softphone_leader', () => new Promise<void>(() => {}));
		leaderTab = new NodeBroadcastChannel('softphone_sync');
		requests = [];
	});

	afterEach(() => {
		follower?.stop();
		leaderTab.close();
		restoreChannel();
		restoreLocks();
		jest.useRealTimers();
	});

	/** Answers state requests as a live leader does, without ever announcing. */
	function answerStateRequests() {
		leaderTab.onmessage = (e: unknown) => {
			const message = (e as { data: { kind: string; from?: string } }).data;
			requests.push(message);
			if (message.kind === 'STATE_REQUEST')
				leaderTab.postMessage({
					kind: 'STATE_SNAPSHOT',
					to: message.from,
					state: INITIAL_STATE,
				});
		};
	}

	function ignoreEverything() {
		leaderTab.onmessage = (e: unknown) => requests.push((e as { data: { kind: string } }).data);
	}

	it('does not report a leader that is only quiet, and adopts nothing from the check', async () => {
		answerStateRequests();
		const stale = jest.fn();
		const snapshot = jest.fn();
		startFollower({ onLeaderStale: stale, onSnapshot: snapshot });

		await advance(120_000);

		expect(requests.some(m => m.kind === 'STATE_REQUEST')).toBe(true);
		expect(stale).not.toHaveBeenCalled();
		// The check's reply proves the leader alive; it must not overwrite this tab's own state.
		expect(snapshot).not.toHaveBeenCalled();
	});

	it('reports a leader that answers nothing, once, and only after asking it', async () => {
		ignoreEverything();
		const stale = jest.fn();
		startFollower({ onLeaderStale: stale });

		await advance(15_000);
		expect(stale).not.toHaveBeenCalled();

		await advance(10_000);
		expect(requests.filter(m => m.kind === 'STATE_REQUEST')).toHaveLength(1);
		expect(stale).toHaveBeenCalledTimes(1);

		await advance(60_000);
		expect(stale).toHaveBeenCalledTimes(1);
	});

	it('says so when a leader it reported is heard from again, by any message only a leader sends', async () => {
		ignoreEverything();
		const back = jest.fn();
		startFollower({ onLeaderBack: back });

		await advance(25_000);
		expect(back).not.toHaveBeenCalled();

		// A call event, not an announcement: whatever the leader sends proves it alive.
		leaderTab.postMessage({ kind: 'CALL_EVENT', event: { type: 'MUTE', muted: true } });
		await delivered();

		expect(back).toHaveBeenCalledTimes(1);
	});
});

describe('LeaderChannel, no leader at all', () => {
	let restoreLocks: () => void;
	let restoreChannel: () => void;
	let channel: LeaderChannel | undefined;

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask'] });
		restoreLocks = installLockManager();
		restoreChannel = installBroadcastChannel();
	});

	afterEach(() => {
		channel?.stop();
		restoreChannel();
		restoreLocks();
		jest.useRealTimers();
	});

	it('reports no stale leader when the tab gave up and nobody holds the phone', async () => {
		const stale = jest.fn();
		channel = new LeaderChannel();
		channel.start(handlers({ onLeaderStale: stale }));
		await waitForRealTurns(() => channel!.isLeader);

		// What the registry does after the third failed start-up: step down and stop competing.
		expect(channel.resign()).toBe(true);

		for (let t = 0; t < 60_000; t += 1_000) {
			jest.advanceTimersByTime(1_000);
			await realTurns();
		}

		// The error that made it give up is the one the agent must see, not "stopped responding".
		expect(stale).not.toHaveBeenCalled();
	});
});

async function realTurns() {
	for (let i = 0; i < 20; i++) await new Promise(resolve => realSetImmediate(resolve));
}

async function waitForRealTurns(condition: () => boolean) {
	for (let i = 0; i < 50 && !condition(); i++) await realTurns();
	if (!condition()) throw new Error('Timed out waiting for the expected state.');
}
