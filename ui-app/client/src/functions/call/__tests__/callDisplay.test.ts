/**
 * LZT-2161: the call bar's display values, computed once by the engine. The timer stops at the
 * provider's end, every tab shows the same seconds, a report of an earlier call never shows, and
 * a reload after the end shows no summary. Every field is always present and typed.
 */
import {
	CallDisplay,
	clockRuns,
	computeDisplay,
	DisplayLive,
	DisplayTicker,
	ringClock,
	sameDisplay,
	talkClock,
} from '../display';
import { CallState } from '../types';

const T0 = 1_793_800_000_000;
const sec = (n: number) => T0 + n * 1000;

type S = CallState & { ringAt?: number };

const live = (over: Partial<DisplayLive> = {}): DisplayLive => ({
	callLogId: 'log-2',
	direction: 'outbound',
	status: 'RINGING',
	terminal: false,
	at: sec(1),
	answeredAt: 0,
	connectionName: 'telecmiCalls',
	callerId: '+918000000428',
	dealId: 'deal-7',
	provider: 'TELECMI',
	customerDialCode: '91',
	customerPhoneNumber: '9740485795',
	...over,
});

function expectTyped(d: CallDisplay) {
	const types: Record<string, string> = {
		callId: 'string',
		callLogId: 'string',
		dealId: 'string',
		provider: 'string',
		phase: 'string',
		outbound: 'boolean',
		number: 'string',
		ringStartedAt: 'number',
		ringSec: 'number',
		ringText: 'string',
		talkStartedAt: 'number',
		talkSec: 'number',
		talkText: 'string',
		endedAt: 'number',
		final: 'boolean',
		endReason: 'string',
		connectionName: 'string',
		callerId: 'string',
		recordingFile: 'string',
		muted: 'boolean',
		held: 'boolean',
		otherTab: 'boolean',
		error: 'string',
	};
	expect(Object.keys(d).sort()).toEqual(Object.keys(types).sort());
	for (const [k, t] of Object.entries(types)) expect(typeof (d as any)[k]).toBe(t);
	expect(JSON.stringify(d)).not.toContain('null');
}

describe('LZT-2161: computeDisplay', () => {
	test('no state, idle, ready, away and error: no call fields, every field typed', () => {
		const cases: Array<[S | undefined, string]> = [
			[undefined, 'off'],
			[{ status: 'idle', muted: false }, 'off'],
			[{ status: 'registering', muted: false }, 'off'],
			[{ status: 'ready', muted: false }, 'ready'],
			[{ status: 'idle', muted: false, away: true }, 'away'],
			[{ status: 'error', muted: false, error: 'TeleCMI sign in failed' }, 'error'],
		];
		for (const [state, phase] of cases) {
			const d = computeDisplay(state, live(), true, sec(9));
			expectTyped(d);
			expect(d.phase).toBe(phase);
			expect(d).toMatchObject({ callId: '', callLogId: '', number: '', talkText: '', final: false });
		}
		expect(computeDisplay(cases[5][0], undefined, false, 0).error).toBe('TeleCMI sign in failed');
	});

	test('incoming call: rings, talks from the connect, and freezes at the end', () => {
		const ringing: S = {
			status: 'ringing',
			muted: false,
			direction: 'inbound',
			callId: 'c1',
			from: '+919740485795',
			ringAt: sec(0),
		};
		let d = computeDisplay(ringing, undefined, false, sec(7));
		expectTyped(d);
		expect(d).toMatchObject({
			phase: 'ringing',
			outbound: false,
			number: '+919740485795',
			ringSec: 7,
			ringText: '00:07',
			talkText: '',
		});
		expect(clockRuns(d)).toBe(true);

		const talking: S = { ...ringing, status: 'connected', startedAt: sec(10) };
		d = computeDisplay(talking, undefined, false, sec(75));
		expect(d).toMatchObject({ phase: 'talking', ringSec: 10, talkSec: 65, talkText: '01:05' });

		const ended: S = { ...talking, status: 'ended', endedAt: sec(100) };
		const atEnd = computeDisplay(ended, undefined, false, sec(100));
		const later = computeDisplay(ended, undefined, false, sec(4000));
		expect(atEnd).toMatchObject({ phase: 'ended', final: true, endedAt: sec(100), talkSec: 90 });
		// The seconds never move after the end (LZT-2124).
		expect(later).toEqual(atEnd);
		expect(clockRuns(atEnd)).toBe(false);
	});

	test('a call the agent placed: dialling until the server says answered, then talking', () => {
		const ownLeg: S = {
			status: 'ringing',
			muted: false,
			direction: 'outbound',
			ringBack: true,
			callId: 'leg1',
			from: '+918000000428',
			ringAt: sec(0),
		};
		let d = computeDisplay(ownLeg, live(), true, sec(3));
		expect(d).toMatchObject({
			phase: 'dialling',
			outbound: true,
			number: '+91 9740485795',
			callLogId: 'log-2',
			dealId: 'deal-7',
			provider: 'TELECMI',
			connectionName: 'telecmiCalls',
			callerId: '+918000000428',
		});

		// The agent's own leg connects first: still dialling, no talk time, the ring runs on.
		const legUp: S = { ...ownLeg, status: 'connected', startedAt: sec(2) };
		d = computeDisplay(legUp, live({ at: sec(4) }), true, sec(12));
		expect(d).toMatchObject({ phase: 'dialling', talkStartedAt: 0, talkText: '', ringSec: 12 });

		const answered = live({ status: 'IN_PROGRESS', at: sec(15), answeredAt: sec(15) });
		d = computeDisplay(legUp, answered, true, sec(75));
		expect(d).toMatchObject({ phase: 'talking', talkStartedAt: sec(15), talkSec: 60, ringSec: 15 });

		// Held shows as held, with the same talk clock.
		expect(computeDisplay({ ...legUp, held: true }, answered, true, sec(80)).phase).toBe('held');
	});

	test('the server end stops the clock at once, before the phone reports it, and its durations win', () => {
		const legUp: S = {
			status: 'connected',
			muted: false,
			direction: 'outbound',
			ringBack: true,
			callId: 'leg1',
			ringAt: sec(0),
			startedAt: sec(2),
		};
		const end = live({
			status: 'COMPLETED',
			terminal: true,
			at: sec(95),
			answeredAt: sec(15),
			talkDuration: 79,
			ringDuration: 14,
			recordingFile: 'rec/log-2.mp3',
		});
		const d = computeDisplay(legUp, end, true, sec(97));
		expect(d).toMatchObject({
			phase: 'ended',
			final: true,
			endedAt: sec(95),
			talkSec: 79,
			talkText: '01:19',
			ringSec: 14,
			recordingFile: 'rec/log-2.mp3',
		});
		expect(clockRuns(d)).toBe(false);
		// The phone's later end does not move it: the earlier end wins.
		const phoneEnded = computeDisplay(
			{ ...legUp, status: 'ended', endedAt: sec(97) },
			end,
			true,
			sec(200),
		);
		expect(phoneEnded).toMatchObject({ endedAt: sec(95), talkSec: 79, final: true });
	});

	test('a report that does not belong to the call up here never shows (an earlier call)', () => {
		const ringing: S = {
			status: 'ringing',
			muted: false,
			direction: 'inbound',
			callId: 'c9',
			from: '+919000000001',
			ringAt: sec(0),
		};
		const earlier = live({
			callLogId: 'log-1',
			status: 'COMPLETED',
			terminal: true,
			at: sec(-300),
			talkDuration: 400,
			recordingFile: 'rec/log-1.mp3',
			customerPhoneNumber: '9111111111',
		});
		const d = computeDisplay(ringing, earlier, false, sec(5));
		expect(d).toMatchObject({
			phase: 'ringing',
			final: false,
			callLogId: '',
			dealId: '',
			number: '+919000000001',
			recordingFile: '',
			connectionName: '',
			ringSec: 5,
		});
	});

	test('a reload after the end: the state has no call, so no summary shows', () => {
		// What a tab that opened after the end mirrors (skipEnded): ready, with the report still there.
		const after: S = { status: 'ready', muted: false, otherTab: true };
		const ended = live({ status: 'COMPLETED', terminal: true, at: sec(95), talkDuration: 79 });
		const d = computeDisplay(after, ended, true, sec(500));
		expectTyped(d);
		expect(d).toMatchObject({
			phase: 'ready',
			final: false,
			callLogId: '',
			talkText: '',
			recordingFile: '',
			otherTab: true,
		});
	});

	test('two tabs show the same seconds: the times come from the shared state, not the tab', () => {
		const owner: S = {
			status: 'connected',
			muted: false,
			direction: 'inbound',
			callId: 'c1',
			from: '+919740485795',
			ringAt: sec(0),
			startedAt: sec(6),
		};
		const follower: S = { ...owner, otherTab: true };
		const a = computeDisplay(owner, undefined, false, sec(42));
		const b = computeDisplay(follower, undefined, false, sec(42));
		expect({ ...b, otherTab: false }).toEqual(a);
		expect(b.otherTab).toBe(true);
	});

	test('an end with no time (never came up) is final and frozen, not counting to now', () => {
		const d = computeDisplay(
			{ status: 'ended', muted: false, callId: 'c2', direction: 'inbound', ringAt: sec(0) },
			undefined,
			false,
			sec(9999),
		);
		expect(d).toMatchObject({ phase: 'ended', final: true, ringSec: 0, talkSec: 0, endedAt: 0 });
	});

	test('a call lost with its tab shows why it ended; a live call never does', () => {
		const lost: S = {
			status: 'ended',
			muted: false,
			callId: 'c3',
			direction: 'inbound',
			startedAt: sec(0),
			endedAt: sec(30),
			endReason: 'pageClosed',
		};
		expect(computeDisplay(lost, undefined, false, sec(40))).toMatchObject({
			phase: 'ended',
			endReason: 'pageClosed',
			talkSec: 30,
		});
		const up: S = { ...lost, status: 'connected', endedAt: undefined };
		expect(computeDisplay(up, undefined, false, sec(40)).endReason).toBe('');
	});

	test('clock texts as the shell showed them', () => {
		expect(ringClock(0)).toBe('00:00');
		expect(ringClock(75)).toBe('01:15');
		expect(talkClock(59)).toBe('00:59');
		expect(talkClock(3600 + 61)).toBe('1:01:01');
		expect(talkClock(-5)).toBe('00:00');
	});
});

describe('LZT-2161: one engine clock', () => {
	test('runs only while a clock runs and stops at the end', () => {
		const started: Array<() => void> = [];
		let cancelled = 0;
		const ticks: number[] = [];
		const ticker = new DisplayTicker(
			() => ticks.push(1),
			f => {
				started.push(f);
				return started.length as any;
			},
			() => {
				cancelled++;
			},
		);
		const ringing = computeDisplay(
			{ status: 'ringing', muted: false, direction: 'inbound', callId: 'c1', ringAt: sec(0) },
			undefined,
			false,
			sec(1),
		);
		ticker.update(ringing);
		ticker.update(ringing);
		expect(started).toHaveLength(1);
		started[0]();
		expect(ticks).toHaveLength(1);
		const ended = computeDisplay(
			{ status: 'ended', muted: false, callId: 'c1', endedAt: sec(5), ringAt: sec(0) },
			undefined,
			false,
			sec(5),
		);
		ticker.update(ended);
		expect(cancelled).toBe(1);
		expect(ticker.running()).toBe(false);
		ticker.update(computeDisplay({ status: 'ready', muted: false }, undefined, false, sec(6)));
		expect(started).toHaveLength(1);
	});

	test('sameDisplay tells a change from a repeat', () => {
		const a = computeDisplay({ status: 'ready', muted: false }, undefined, false, 0);
		expect(sameDisplay(undefined, a)).toBe(false);
		expect(sameDisplay(a, { ...a })).toBe(true);
		expect(sameDisplay(a, { ...a, phase: 'away' })).toBe(false);
	});
});
