import { INITIAL_STATE, SoftphoneError, SoftphoneState } from '../../../softphone/types';
import { detectTransitions, shouldRing } from '../softphoneTransitions';

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

describe('shouldRing', () => {
	it('rings in the tab holding the call', () => {
		expect(shouldRing(ringing, '/ring.mp3')).toBe(true);
	});

	it('stays silent in the other tabs', () => {
		// Otherwise every open CRM tab plays the same tone milliseconds apart.
		expect(shouldRing(state({ ...ringing, isLeader: false }), '/ring.mp3')).toBe(false);
	});

	it('does not ring the agent for a call the agent placed', () => {
		expect(shouldRing(state({ ...ringing, direction: 'outbound' }), '/ring.mp3')).toBe(false);
	});

	it('stays silent when no ringtone is configured', () => {
		expect(shouldRing(ringing, undefined)).toBe(false);
		expect(shouldRing(ringing, '')).toBe(false);
	});
});
