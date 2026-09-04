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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BroadcastChannel: NodeBroadcastChannel } = require('node:worker_threads');

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
function installLockManager() {
	const held = new Set<string>();
	const queued = new Map<string, Array<() => void>>();

	const grant = (name: string, callback: () => Promise<void>): Promise<void> => {
		held.add(name);
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
		request: (name: string, callback: () => Promise<void>) => {
			if (!held.has(name)) return grant(name, callback);

			return new Promise<void>((resolve, reject) => {
				const waiters = queued.get(name) ?? [];
				waiters.push(() => grant(name, callback).then(resolve, reject));
				queued.set(name, waiters);
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
		onLeaderStale: () => {},
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

	it('fails pending controls when the softphone shuts down mid-relay', async () => {
		open({ onAction: () => new Promise<unknown>(() => {}) });
		const follower = open();

		const pending = follower.relay('hangup');
		const assertion = expect(pending).rejects.toMatchObject({ code: 'RELAY_TIMEOUT' });
		follower.stop();

		await assertion;
	});
});
