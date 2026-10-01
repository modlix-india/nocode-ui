import { INITIAL_STATE, SoftphoneError, SoftphoneState } from '../../../softphone/types';
import {
	awaitingConnectionBinding,
	changedKeys,
	detectTransitions,
	elapsedSince,
	formatDuration,
} from '../softphoneUtils';

function state(over: Partial<SoftphoneState> = {}): SoftphoneState {
	return { ...INITIAL_STATE, ...over };
}

const ringing = state({
	provisioned: true,
	registered: true,
	isLeader: true,
	inCall: true,
	callId: 'c1',
	direction: 'inbound',
	from: '+919876543210',
});

const connected = state({ ...ringing, startedAt: '2026-09-04T10:00:00.000Z' });

describe('detectTransitions', () => {
	it('fires nothing for the first state, which is a reading and not a change', () => {
		// The registry calls a new subscriber immediately with where things stand. Treating that as
		// a change would fire "call ended" on every page load, because no call is in progress.
		expect(detectTransitions(undefined, state())).toEqual([]);
		expect(detectTransitions(undefined, connected)).toEqual([]);
	});

	it('fires nothing when nothing changed', () => {
		expect(detectTransitions(connected, connected)).toEqual([]);
	});

	it('reports the phone coming online and going offline', () => {
		const offline = state({ provisioned: true });
		const online = state({ provisioned: true, registered: true });

		expect(detectTransitions(offline, online)).toEqual(['registrationChange']);
		expect(detectTransitions(online, offline)).toEqual(['registrationChange']);
	});

	it('reports an incoming call once, not on every update during it', () => {
		const idle = state({ provisioned: true, registered: true, isLeader: true });

		expect(detectTransitions(idle, ringing)).toEqual(['incomingCall']);

		const muted = state({ ...ringing, isMuted: true });
		expect(detectTransitions(ringing, muted)).toEqual([]);
	});

	it("does not report the agent's own outbound call as an incoming one", () => {
		const idle = state({ provisioned: true, registered: true, isLeader: true });
		const dialling = state({ ...idle, inCall: true, callId: 'c3', direction: 'outbound' });

		// `inCall` turns true as soon as the agent's own leg starts ringing, so this fired for a
		// call they had just placed themselves - a ringing toast, a ringtone and an Accept button
		// for their own dial.
		expect(detectTransitions(idle, dialling)).toEqual([]);
	});

	it('separates answering from ringing', () => {
		// An outbound call is already inCall while it rings, so `inCall` cannot mean "connected".
		// `startedAt` appearing is what means audio started.
		expect(detectTransitions(ringing, connected)).toEqual(['callConnected']);
	});

	it('reports a call ending', () => {
		const idle = state({ provisioned: true, registered: true, isLeader: true });
		expect(detectTransitions(connected, idle)).toEqual(['callEnded']);
	});

	it('reports a call that ends before it is answered', () => {
		const idle = state({ provisioned: true, registered: true, isLeader: true });
		// A missed call should still close whatever the incoming event opened, and must not claim
		// the call connected.
		expect(detectTransitions(ringing, idle)).toEqual(['callEnded']);
	});

	it('reports a new error but not the same one lingering', () => {
		const first: SoftphoneError = { code: 'MIC_DENIED', message: 'Blocked.' };
		const second: SoftphoneError = { code: 'DIAL_REJECTED', message: 'No number.' };

		const clean = state({ provisioned: true });
		const failed = state({ provisioned: true, lastError: first });

		expect(detectTransitions(clean, failed)).toEqual(['error']);

		// Same object, unrelated change: the agent has already been told.
		const stillFailed = state({ provisioned: true, lastError: first, registered: true });
		expect(detectTransitions(failed, stillFailed)).toEqual(['registrationChange']);

		const failedAgain = state({ provisioned: true, lastError: second });
		expect(detectTransitions(failed, failedAgain)).toEqual(['error']);
	});

	it('reports several transitions from one state change, in order', () => {
		const idle = state({ provisioned: true, isLeader: true });
		const answeredAtOnce = state({
			provisioned: true,
			isLeader: true,
			registered: true,
			inCall: true,
			callId: 'c2',
			startedAt: '2026-09-04T10:00:00.000Z',
		});

		expect(detectTransitions(idle, answeredAtOnce)).toEqual([
			'registrationChange',
			'incomingCall',
			'callConnected',
		]);
	});
});

describe('changedKeys', () => {
	it('writes every key on the first reading, so the store gets a full shape', () => {
		expect(changedKeys(undefined, state())).toEqual(Object.keys(state()));
	});

	it('writes nothing when nothing moved', () => {
		expect(changedKeys(connected, connected)).toEqual([]);
	});

	it('writes only what moved', () => {
		const muted = state({ ...connected, isMuted: true });

		// The point of the whole exercise: a caller-id label bound to `from` must not re-render
		// because the mute flag changed.
		expect(changedKeys(connected, muted)).toEqual(['isMuted']);
	});

	it('includes a key that became undefined, so the store deletes it', () => {
		const idle = state({ provisioned: true, registered: true, isLeader: true });

		// `from` going from a number to undefined has to be written, or a stale caller id stays
		// on screen after the call ends.
		expect(changedKeys(connected, idle)).toContain('from');
		expect(changedKeys(connected, idle)).toContain('startedAt');
	});

	it('treats an unchanged object field as unchanged', () => {
		const error = { code: 'MIC_DENIED' as const, message: 'Blocked.' };
		const first = state({ provisioned: true, lastError: error });
		const second = state({ provisioned: true, lastError: error, registered: true });

		// Reference comparison is only safe because the registry replaces these wholesale.
		expect(changedKeys(first, second)).toEqual(['registered']);
	});
});

describe('formatDuration', () => {
	it('pads to MM:SS', () => {
		expect(formatDuration(0)).toBe('00:00');
		expect(formatDuration(5)).toBe('00:05');
		expect(formatDuration(95)).toBe('01:35');
		expect(formatDuration(3599)).toBe('59:59');
	});

	it('switches to hours past the hour, so 01:01:04 is not shown as 61:04', () => {
		expect(formatDuration(3600)).toBe('01:00:00');
		expect(formatDuration(3664)).toBe('01:01:04');
	});

	it('never renders nonsense for nonsense input', () => {
		expect(formatDuration(-5)).toBe('00:00');
		expect(formatDuration(NaN)).toBe('00:00');
		expect(formatDuration(Infinity)).toBe('00:00');
	});
});

describe('elapsedSince', () => {
	const now = Date.parse('2026-09-07T12:00:00.000Z');

	it('counts from the moment audio started', () => {
		expect(elapsedSince('2026-09-07T11:58:25.000Z', now)).toEqual({
			seconds: 95,
			formatted: '01:35',
		});
	});

	it('reads zero before a call connects', () => {
		expect(elapsedSince(undefined, now)).toEqual({ seconds: 0, formatted: '00:00' });
	});

	it('does not trip over an unparseable timestamp', () => {
		// Better a zero clock than NaN:NaN on screen.
		expect(elapsedSince('not a date', now)).toEqual({ seconds: 0, formatted: '00:00' });
	});

	it('never counts backwards if the clock disagrees with the server', () => {
		expect(elapsedSince('2026-09-07T12:00:10.000Z', now).seconds).toBe(0);
	});
});

/**
 * When the Softphone waits for its connection, and when it starts at once.
 *
 * The case that matters is a binding that has not resolved yet: started then, the phone comes up on
 * the agent's own connection and is torn down again a moment later, when the binding names the one
 * the page meant.
 */
describe('awaitingConnectionBinding', () => {
	it('starts at once when the property is left blank, so the agent gets their own connection', () => {
		expect(awaitingConnectionBinding(undefined, undefined)).toBe(false);
		expect(awaitingConnectionBinding({}, undefined)).toBe(false);
		expect(awaitingConnectionBinding({ value: '' }, '')).toBe(false);
	});

	it('starts at once on a fixed connection name', () => {
		expect(awaitingConnectionBinding({ value: 'exotelConnection' }, 'exotelConnection')).toBe(
			false,
		);
	});

	it('waits while an expression binding has not resolved yet', () => {
		const bound = {
			location: { type: 'EXPRESSION' as const, expression: 'Store.selectedConnection' },
		};

		expect(awaitingConnectionBinding(bound, undefined)).toBe(true);
		expect(awaitingConnectionBinding(bound, '')).toBe(true);
	});

	it('waits while a store-path binding has not resolved yet', () => {
		const bound = { location: { type: 'VALUE' as const, value: 'Page.connectionName' } };

		expect(awaitingConnectionBinding(bound, undefined)).toBe(true);
	});

	it('starts once the binding names a connection', () => {
		// The render sequence of a binding that loads after the page: waits, then starts - once, on
		// the connection it names, and never on the agent's own in between.
		const bound = {
			location: { type: 'EXPRESSION' as const, expression: 'Store.selectedConnection' },
		};
		const renders = [undefined, '', 'telecmiCalls', 'telecmiCalls'];

		const startedOn = renders.filter(resolved => !awaitingConnectionBinding(bound, resolved));

		expect(startedOn).toEqual(['telecmiCalls', 'telecmiCalls']);
	});

	it('does not wait on a binding with nothing in it', () => {
		// An editor can leave an empty location behind; that is a blank property, not a binding.
		expect(
			awaitingConnectionBinding(
				{ location: { type: 'EXPRESSION', expression: '  ' } },
				undefined,
			),
		).toBe(false);
		expect(
			awaitingConnectionBinding({ location: { type: 'VALUE', value: '' } }, undefined),
		).toBe(false);
	});

	it('does not wait while getData supplies the fallback value for a null binding', () => {
		// getData hands the component the property's own value while the binding gives null or
		// undefined, so what arrives here is that value, and there is a connection to start on.
		expect(
			awaitingConnectionBinding(
				{
					value: 'exotelConnection',
					location: { type: 'EXPRESSION', expression: 'Store.selectedConnection' },
				},
				'exotelConnection',
			),
		).toBe(false);
	});

	it('waits on a binding that gives an empty string, fallback value or not', () => {
		// '' is not null to getData, so it returns the '' and never the fallback: the component
		// has no connection to start on, and the binding has not named one.
		expect(
			awaitingConnectionBinding(
				{
					value: 'exotelConnection',
					location: { type: 'EXPRESSION', expression: 'Store.selectedConnection' },
				},
				'',
			),
		).toBe(true);
	});
});
