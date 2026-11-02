/**
 * Call sounds in one tab, with a fake provider and a fake speaker: the incoming ring (late start,
 * stops on answer, decline and remote end), the ring back for a call the user placed, the end
 * tone once, the per user on/off setting, blocked audio and the test page preview.
 */
import { FunctionExecutionParameters } from '@fincity/kirun-js';

const writes: Array<{ path: string; value: any }> = [];
jest.mock('../../../context/StoreContext', () => ({
	setData: (path: string, value: any) => writes.push({ path, value }),
	getDataFromPath: (path: string) => (path === 'Store.auth.user.id' ? 110 : undefined),
}));

import { Answer, Connect, Hangup, Sound } from '..';
import { registerCallProvider, unregisterCallProvider } from '../registry';
import * as session from '../session';
import {
	CallSounds,
	createWebAudioOut,
	INCOMING_RING_DELAY_MS,
	loopFor,
	PlayResult,
	SOUND_KEY,
	SoundOut,
	Tone,
	toneSamples,
} from '../sounds';
import { CallAdapter, CallStateListener } from '../types';

class FakeAdapter implements CallAdapter {
	listener: CallStateListener = () => {};
	load = jest.fn(async () => {});
	register = jest.fn(async () => {});
	answer = jest.fn();
	hangup = jest.fn();
	mute = jest.fn();
	disconnect = jest.fn();
	onStateChange(l: CallStateListener) {
		this.listener = l;
	}
	emit(patch: any) {
		this.listener(patch);
	}
}

/** Records what was played; `blocked` makes play() answer as a browser without a user tap. */
class FakeOut implements SoundOut {
	played: string[] = [];
	loop?: Tone;
	blocked = false;
	unlockAllowed = true;
	private unlocked?: () => void;
	async play(tone: Tone, loop: boolean): Promise<PlayResult> {
		this.loop = undefined;
		if (this.blocked) return 'blocked';
		this.played.push(loop ? tone : `${tone} once`);
		if (loop) this.loop = tone;
		return 'playing';
	}
	stop() {
		this.loop = undefined;
	}
	async unlock() {
		if (!this.unlockAllowed) return false;
		this.blocked = false;
		this.unlocked?.();
		return true;
	}
	onUnlocked(cb: () => void) {
		this.unlocked = cb;
	}
	setRingtone = jest.fn();
}

let adapter: FakeAdapter;
let out: FakeOut;

function context(args: Record<string, any>) {
	return {
		getArguments: () => new Map(Object.entries(args)),
		getValuesMap: () => new Map([['Page.', { getPageName: () => 'shell' }]]),
	} as unknown as FunctionExecutionParameters;
}

async function exec(fn: any, args: Record<string, any> = {}) {
	const o = await fn.internalExecute(context(args));
	const er = o.allResults()[0];
	return { event: er.getName(), result: Object.fromEntries(er.getResult()) as any };
}

const flush = async () => {
	for (let i = 0; i < 20; i++) await Promise.resolve();
};
const last = () => writes[writes.length - 1].value;

async function ring(patch: any = {}) {
	adapter.emit({
		status: 'ringing',
		direction: 'inbound',
		callId: 'c1',
		from: '+9198',
		...patch,
	});
	await flush();
}

async function after(ms: number) {
	jest.advanceTimersByTime(ms);
	await flush();
}

beforeEach(async () => {
	jest.useFakeTimers();
	await session.disconnect();
	localStorage.clear();
	writes.length = 0;
	out = new FakeOut();
	session.useCallSounds(new CallSounds(() => out));
	registerCallProvider('fake', () => (adapter = new FakeAdapter()));
	await exec(new Connect(), {
		provider: 'fake',
		credentials: { userId: 'a', password: 'p' },
		statePath: 'Store.call',
	});
});

afterEach(async () => {
	await session.disconnect();
	jest.useRealTimers();
});

afterAll(() => unregisterCallProvider('fake'));

describe('tones', () => {
	test('the ring back is a 3 s double ring, the end tone is short, both quiet enough', () => {
		const rate = 8000;
		const rb = toneSamples('ringBack', rate);
		const end = toneSamples('end', rate);
		const ring = toneSamples('ringFallback', rate);
		expect(rb.length).toBe(3 * rate);
		expect(end.length / rate).toBeLessThan(1);
		expect(ring.length / rate).toBeGreaterThan(3);
		for (const s of [rb, end, ring]) {
			const peak = s.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
			expect(peak).toBeGreaterThan(0.1);
			expect(peak).toBeLessThanOrEqual(0.301);
		}
		// Silence at the end of a ring back loop: the gap between double rings.
		expect(rb.slice(-rate).every(v => v === 0)).toBe(true);
	});

	test('which loop a state asks for', () => {
		expect(loopFor({ status: 'ringing', direction: 'inbound', muted: false })).toBe('incoming');
		expect(loopFor({ status: 'ringing', direction: 'outbound', muted: false })).toBe(
			'ringBack',
		);
		expect(
			loopFor({ status: 'ringing', direction: 'inbound', ringBack: true, muted: false }),
		).toBe('ringBack');
		expect(loopFor({ status: 'connected', ringBack: true, muted: false })).toBe('ringBack');
		expect(loopFor({ status: 'connected', muted: false })).toBeUndefined();
		expect(loopFor({ status: 'ended', muted: false })).toBeUndefined();
		expect(loopFor({ status: 'ready', muted: false })).toBeUndefined();
	});
});

describe('incoming ring', () => {
	test('starts after a short delay and stops the moment Answer is pressed', async () => {
		await ring();
		expect(out.loop).toBeUndefined();
		await after(INCOMING_RING_DELAY_MS);
		expect(out.loop).toBe('incoming');
		expect(last()).toMatchObject({ status: 'ringing', soundOn: true, audioBlocked: false });

		const r = await exec(new Answer(), {});
		expect(r.event).toBe('output');
		expect(out.loop).toBeUndefined();
		// The provider confirms later; the ring does not come back meanwhile.
		await after(5000);
		expect(out.loop).toBeUndefined();
		adapter.emit({ status: 'connected' });
		await after(1000);
		expect(out.loop).toBeUndefined();
		expect(out.played).toEqual(['incoming']);
	});

	test('a failed answer (microphone blocked) lets the ring go on', async () => {
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		const gum = jest.fn(async () => {
			throw Object.assign(new Error('denied'), { name: 'NotAllowedError' });
		});
		Object.defineProperty(navigator, 'mediaDevices', {
			configurable: true,
			value: { getUserMedia: gum },
		});
		const r = await exec(new Answer(), {});
		Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
		expect(r.event).toBe('error');
		await flush();
		expect(out.loop).toBe('incoming');
	});

	test('decline stops the ring and plays the end tone once', async () => {
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		await exec(new Hangup(), {});
		await flush();
		expect(out.loop).toBeUndefined();
		expect(out.played).toEqual(['incoming', 'end once']);
		adapter.emit({ status: 'ended' });
		await after(2000);
		expect(out.played).toEqual(['incoming', 'end once']);
	});

	test('the caller hanging up (missed call) stops the ring, one end tone', async () => {
		await ring();
		await after(INCOMING_RING_DELAY_MS + 3000);
		adapter.emit({ status: 'ended' });
		await after(5000);
		expect(out.loop).toBeUndefined();
		expect(out.played).toEqual(['incoming', 'end once']);
	});

	test('a call answered before the delay never rings (the leg of a placed call)', async () => {
		await ring();
		await exec(new Answer(), { ringBack: true });
		await flush();
		expect(last()).toMatchObject({ ringBack: true });
		expect(out.loop).toBe('ringBack');
		await after(INCOMING_RING_DELAY_MS * 3);
		expect(out.played).toEqual(['ringBack']);
	});
});

describe('ring back', () => {
	test('a placed call: ring back through the answered browser leg until the far end answers', async () => {
		await ring();
		await exec(new Answer(), { ringBack: true });
		adapter.emit({ status: 'connected' });
		await after(4000);
		expect(out.loop).toBe('ringBack');

		await exec(new Sound(), { ringBack: false });
		await flush();
		expect(out.loop).toBeUndefined();
		expect(last()).toMatchObject({ status: 'connected', ringBack: false });

		adapter.emit({ status: 'ended' });
		await flush();
		expect(out.played).toEqual(['ringBack', 'end once']);
	});

	test('a placed call that fails: ring back stops, end tone once', async () => {
		await ring();
		await exec(new Answer(), { ringBack: true });
		adapter.emit({ status: 'connected' });
		await flush();
		adapter.emit({ status: 'ended' });
		await after(3000);
		expect(out.loop).toBeUndefined();
		expect(out.played).toEqual(['ringBack', 'end once']);
	});

	test('a call the browser dials (outbound ringing) rings back until connected', async () => {
		await ring({ direction: 'outbound' });
		expect(out.loop).toBe('ringBack');
		adapter.emit({ status: 'connected' });
		await flush();
		expect(out.loop).toBeUndefined();
	});

	test("the next call starts without the last one's ring back", async () => {
		await ring();
		await exec(new Answer(), { ringBack: true });
		adapter.emit({ status: 'ended' });
		await ring({ callId: 'c2' });
		expect(last().ringBack).toBeUndefined();
		await after(INCOMING_RING_DELAY_MS);
		expect(out.loop).toBe('incoming');
	});
});

describe('sound on and off', () => {
	test('off silences the ring at once, is remembered per user, on brings it back', async () => {
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		expect(out.loop).toBe('incoming');

		const r = await exec(new Sound(), { on: false });
		expect(r.result.state).toMatchObject({ status: 'ringing', soundOn: false });
		expect(out.loop).toBeUndefined();
		expect(localStorage.getItem(`${SOUND_KEY}.110`)).toBe('off');

		adapter.emit({ status: 'ended' });
		await flush();
		expect(out.played).toEqual(['incoming']);

		// A new call keeps the setting (read back from storage).
		await ring({ callId: 'c2' });
		await after(INCOMING_RING_DELAY_MS);
		expect(last()).toMatchObject({ status: 'ringing', soundOn: false });
		expect(out.loop).toBeUndefined();

		await exec(new Sound(), { on: true });
		await flush();
		expect(out.loop).toBe('incoming');
		expect(localStorage.getItem(`${SOUND_KEY}.110`)).toBeNull();
	});

	test('the strings true and false from an expression work too', async () => {
		await exec(new Sound(), { on: 'false' });
		expect(last().soundOn).toBe(false);
		await exec(new Sound(), { on: 'true' });
		expect(last().soundOn).toBe(true);
	});
});

describe('blocked audio', () => {
	test('a ring the browser blocks shows audioBlocked; a tap starts it', async () => {
		out.blocked = true;
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		expect(out.loop).toBeUndefined();
		expect(last()).toMatchObject({ status: 'ringing', audioBlocked: true });

		await exec(new Sound(), { unlock: true });
		await flush();
		expect(out.loop).toBe('incoming');
		expect(last()).toMatchObject({ status: 'ringing', audioBlocked: false });
	});

	test('the tap starts the ring even when the browser sends no unlock event', async () => {
		out.blocked = true;
		(out as any).onUnlocked = () => undefined;
		session.useCallSounds(new CallSounds(() => out));
		await ring({ callId: 'c9' });
		await after(INCOMING_RING_DELAY_MS);
		expect(last().audioBlocked).toBe(true);
		out.blocked = false;
		await exec(new Sound(), { unlock: true });
		await flush();
		expect(out.loop).toBe('incoming');
		expect(last().audioBlocked).toBe(false);
	});

	test('audioBlocked clears when the call stops ringing', async () => {
		out.blocked = true;
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		expect(last().audioBlocked).toBe(true);
		adapter.emit({ status: 'ended' });
		await flush();
		expect(last()).toMatchObject({ status: 'ended', audioBlocked: false });
	});
});

describe('no sound', () => {
	test('a call shown as ended after a reload plays no end tone', async () => {
		await ring();
		adapter.emit({ status: 'ended', endReason: 'pageClosed' });
		await after(2000);
		expect(out.played).toEqual([]);
	});

	test('Disconnect stops a ring', async () => {
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		await session.disconnect();
		expect(out.loop).toBeUndefined();
	});
});

describe('preview (test page)', () => {
	test('plays each tone with no call, stop ends it; an unknown name is an error', async () => {
		await exec(new Sound(), { preview: 'incoming' });
		expect(out.loop).toBe('incoming');
		await exec(new Sound(), { preview: 'stop' });
		expect(out.loop).toBeUndefined();
		await exec(new Sound(), { preview: 'end' });
		expect(out.played).toEqual(['incoming', 'end once']);
		const r = await exec(new Sound(), { preview: 'bell' });
		expect(r.event).toBe('error');
	});

	test('a custom ring file goes to the speaker', async () => {
		await exec(new Sound(), { ringtone: '/api/files/static/file/X/ring.mp3' });
		await ring();
		await after(INCOMING_RING_DELAY_MS);
		expect(out.setRingtone).toHaveBeenCalledWith('/api/files/static/file/X/ring.mp3');
	});
});

describe('web audio speaker', () => {
	let allow: boolean;
	let ctxs: FakeCtx[];

	class FakeCtx {
		state = 'suspended';
		sampleRate = 8000;
		destination = {};
		onstatechange: (() => void) | null = null;
		sources: any[] = [];
		constructor() {
			ctxs.push(this);
			if (allow) this.state = 'running';
		}
		resume() {
			if (!allow) return new Promise<void>(() => {});
			this.state = 'running';
			this.onstatechange?.();
			return Promise.resolve();
		}
		createBuffer(channels: number, length: number, rate: number) {
			const data = Array.from({ length: channels }, () => new Float32Array(length));
			return {
				numberOfChannels: channels,
				length,
				sampleRate: rate,
				duration: length / rate,
				getChannelData: (i: number) => data[i],
			};
		}
		createBufferSource() {
			const src = {
				buffer: null as any,
				loop: false,
				connect: jest.fn(),
				disconnect: jest.fn(),
				start: jest.fn(),
				stop: jest.fn(),
				onended: null,
			};
			this.sources.push(src);
			return src;
		}
		decodeAudioData(_d: ArrayBuffer, ok: (b: any) => void) {
			const b = this.createBuffer(2, 1.5 * this.sampleRate, this.sampleRate);
			ok(b);
			return Promise.resolve(b);
		}
	}

	beforeEach(() => {
		allow = true;
		ctxs = [];
		(window as any).AudioContext = FakeCtx;
	});
	afterEach(() => {
		delete (window as any).AudioContext;
		delete (global as any).fetch;
	});

	const settle = async () => {
		await after(1000);
		await after(1000);
	};

	test('the ring file plays in a loop with a pause added after a short ring', async () => {
		const fetchMock = jest.fn(async () => ({
			ok: true,
			arrayBuffer: async () => new ArrayBuffer(8),
		}));
		(global as any).fetch = fetchMock;
		const sp = createWebAudioOut();
		sp.prefetch?.();
		const r = sp.play('incoming', true);
		await settle();
		expect(await r).toBe('playing');
		const src = ctxs[0].sources[0];
		expect(src.loop).toBe(true);
		expect(src.start).toHaveBeenCalled();
		expect(src.buffer.duration).toBeCloseTo(3.5);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		sp.stop();
		expect(src.stop).toHaveBeenCalled();
	});

	test('a missing ring file plays the generated ring', async () => {
		(global as any).fetch = jest.fn(async () => ({ ok: false, status: 404 }));
		const sp = createWebAudioOut();
		const r = sp.play('incoming', true);
		await settle();
		expect(await r).toBe('playing');
		expect(ctxs[0].sources[0].buffer.duration).toBeCloseTo(3.3, 1);
	});

	test('blocked until a click: play answers blocked, the click starts what was asked', async () => {
		allow = false;
		const sp = createWebAudioOut();
		const unlocked = jest.fn();
		sp.onUnlocked(unlocked);
		const r = sp.play('ringBack', true);
		await settle();
		expect(await r).toBe('blocked');
		expect(ctxs[0].sources).toHaveLength(0);

		allow = true;
		document.dispatchEvent(new Event('pointerdown'));
		await flush();
		expect(unlocked).toHaveBeenCalled();
		const again = sp.play('ringBack', true);
		await settle();
		expect(await again).toBe('playing');
	});

	test('stop before the tone is ready cancels it', async () => {
		const sp = createWebAudioOut();
		const r = sp.play('end', false);
		sp.stop();
		await settle();
		expect(await r).toBe('stopped');
		expect(ctxs[0]?.sources ?? []).toHaveLength(0);
	});
});
