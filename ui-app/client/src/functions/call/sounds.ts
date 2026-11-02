import { getDataFromPath } from '../../context/StoreContext';
import { CallState } from './types';

/**
 * Call sounds: the incoming ring, the ring back while the far end is being dialled and a short
 * tone when a call ends. One controller per tab, driven by the call session on every state
 * change, so the sound follows the call on every page and never depends on what a page shows.
 *
 * Who hears it: the session asks only the tab that holds the call (the owner, or the only tab),
 * and only for calls the provider rings in THIS browser. A call routed to a phone never reaches
 * the browser SDK, so it never rings here.
 *
 * Browsers block audio until the person has interacted with the page. Then the controller
 * reports "blocked" (the session writes `audioBlocked: true` to the call state, so the page can
 * offer "Tap to enable sound") and starts the moment any click or key press lets audio play.
 *
 * Audio goes through WebAudio: the ring file is fetched (same origin), the ring back and the
 * end tone are generated here, so there is no third party audio and no media CSP to allow.
 */

export type Tone = 'incoming' | 'ringBack' | 'end';

/** The ring the soft phone test page already used. Missing or broken: a generated ring plays. */
export const DEFAULT_RINGTONE_URL = '/api/files/static/file/SYSTEM/jslib/exotelBundle/ringtone.wav';
/**
 * An incoming ring starts this late, so the browser leg of a call the user placed (click to call
 * rings the browser first and the page answers it at once) never blips the incoming ring.
 */
export const INCOMING_RING_DELAY_MS = 700;
/** After Answer is pressed the ring stays quiet this long while the provider confirms. */
export const ANSWERING_QUIET_MS = 15000;
/** A ring file shorter than this gets RING_PAUSE_S of silence after it in the loop. */
export const RING_LOOP_MIN_S = 2.5;
export const RING_PAUSE_S = 2;
/** localStorage key prefix; the user id follows. Holds 'off' while sounds are off. */
export const SOUND_KEY = 'modlix.call.sound';

const IN_CALL = new Set(['ringing', 'connected']);

// ---------------------------------------------------------------- generated tones

type Part = [seconds: number, freqs: number[]];

function render(rate: number, parts: Part[], gain: number): Float32Array {
	const total = parts.reduce((n, [s]) => n + Math.round(s * rate), 0);
	const out = new Float32Array(total);
	const fade = Math.round(0.01 * rate);
	let at = 0;
	for (const [seconds, freqs] of parts) {
		const n = Math.round(seconds * rate);
		if (freqs.length)
			for (let i = 0; i < n; i++) {
				let v = 0;
				for (const f of freqs) v += Math.sin((2 * Math.PI * f * i) / rate);
				const edge = Math.min(1, i / fade, (n - 1 - i) / fade);
				out[at + i] = (v / freqs.length) * gain * Math.max(0, edge);
			}
		at += n;
	}
	return out;
}

/** One loop (or the whole tone, for `end`) as mono samples at the given rate. */
export function toneSamples(tone: Tone | 'ringFallback', rate: number): Float32Array {
	if (tone === 'ringBack')
		// The double ring heard while a number is dialled: 400+450 Hz, on .4 off .2 on .4 off 2.
		return render(
			rate,
			[
				[0.4, [400, 450]],
				[0.2, []],
				[0.4, [400, 450]],
				[2, []],
			],
			0.3,
		);
	if (tone === 'end')
		// Three short falling beeps, once.
		return render(
			rate,
			[
				[0.12, [660]],
				[0.06, []],
				[0.12, [550]],
				[0.06, []],
				[0.16, [440]],
			],
			0.3,
		);
	// Incoming ring when the ring file cannot be played: a trill, twice, then a pause.
	const trill: Part[] = [];
	for (let i = 0; i < 12; i++) trill.push([0.05, [i % 2 ? 1100 : 880]]);
	return render(rate, [...trill, [0.3, []], ...trill, [1.8, []]], 0.3);
}

// ---------------------------------------------------------------- the speaker

export type PlayResult = 'playing' | 'blocked' | 'stopped';

/** What the controller needs from the browser. Tests pass a fake. */
export interface SoundOut {
	/** Starts the tone (after stopping any other). 'stopped': stop() came first. */
	play(tone: Tone, loop: boolean): Promise<PlayResult>;
	stop(): void;
	/** Tries to let audio play now; call it from a click. Resolves true when it can. */
	unlock(): Promise<boolean>;
	/** Runs when a click or key press anywhere lets audio play. */
	onUnlocked(cb: () => void): void;
	setRingtone(url: string): void;
	/** Downloads the ring file ahead of the first call (no audio, no autoplay prompt). */
	prefetch?(): void;
}

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function createWebAudioOut(): SoundOut {
	let ctx: AudioContext | undefined;
	let source: AudioBufferSourceNode | undefined;
	let seq = 0;
	let ringtone = DEFAULT_RINGTONE_URL;
	let buffers = new Map<Tone, Promise<AudioBuffer>>();
	let ringData: Promise<ArrayBuffer> | undefined;
	let unlocked: (() => void) | undefined;
	let listening = false;

	const context = (): AudioContext | undefined => {
		if (ctx) return ctx;
		if (typeof window === 'undefined') return undefined;
		const C = (window as any).AudioContext ?? (window as any).webkitAudioContext;
		if (!C) return undefined;
		try {
			ctx = new C() as AudioContext;
		} catch {
			return undefined;
		}
		const c = ctx;
		c.onstatechange = () => {
			if (c.state === 'running') unlocked?.();
		};
		return c;
	};

	const running = async (ms: number) => {
		const c = context();
		if (!c) return false;
		if (c.state === 'running') return true;
		// Without a user gesture resume() stays pending: wait a moment, then call it blocked.
		await Promise.race([c.resume().catch(() => undefined), wait(ms)]);
		return (c.state as string) === 'running';
	};

	const generated = (c: AudioContext, tone: Tone | 'ringFallback') => {
		const samples = toneSamples(tone, c.sampleRate);
		const b = c.createBuffer(1, samples.length, c.sampleRate);
		b.getChannelData(0).set(samples);
		return b;
	};

	// A short ring file (the shared one is 1.5 s) would loop as one long ring: add the pause a
	// phone leaves between rings.
	const withPause = (c: AudioContext, b: AudioBuffer): AudioBuffer => {
		if (b.duration >= RING_LOOP_MIN_S) return b;
		const total = Math.round((b.duration + RING_PAUSE_S) * b.sampleRate);
		const out = c.createBuffer(b.numberOfChannels, total, b.sampleRate);
		for (let ch = 0; ch < b.numberOfChannels; ch++)
			out.getChannelData(ch).set(b.getChannelData(ch));
		return out;
	};

	const decode = (c: AudioContext, data: ArrayBuffer) =>
		new Promise<AudioBuffer>((resolve, reject) => {
			// The callback form also works in older Safari.
			const p = c.decodeAudioData(data, resolve, reject) as any;
			p?.then?.(resolve, reject);
		});

	const download = (): Promise<ArrayBuffer> => {
		if (!ringData) {
			ringData = fetch(ringtone, { credentials: 'same-origin' }).then(r => {
				if (!r.ok) throw new Error(`ringtone ${r.status}`);
				return r.arrayBuffer();
			});
			// A failed download is not kept: the next call tries again (and plays the generated ring).
			ringData.catch(() => (ringData = undefined));
		}
		return ringData;
	};

	const buffer = (c: AudioContext, tone: Tone): Promise<AudioBuffer> => {
		let b = buffers.get(tone);
		if (!b) {
			b =
				tone === 'incoming'
					? download()
							.then(d => decode(c, d.slice(0)))
							.then(b => withPause(c, b))
							.catch(() => generated(c, 'ringFallback'))
					: Promise.resolve(generated(c, tone));
			buffers.set(tone, b);
		}
		return b;
	};

	const listen = () => {
		if (listening || typeof document === 'undefined') return;
		listening = true;
		// Any click or key press lets audio play: resume, then start what was blocked. Not only
		// on statechange, which some browsers skip when the context never really suspended.
		const gesture = () => {
			const c = context();
			if (!c) return;
			if (c.state === 'running') return unlocked?.();
			c.resume()
				.then(() => {
					if (c.state === 'running') unlocked?.();
				})
				.catch(() => undefined);
		};
		for (const ev of ['pointerdown', 'keydown', 'touchend'])
			document.addEventListener(ev, gesture, { capture: true, passive: true });
	};

	const stop = () => {
		seq++;
		const s = source;
		source = undefined;
		if (!s) return;
		try {
			s.stop();
		} catch {
			// Already stopped.
		}
		try {
			s.disconnect();
		} catch {
			// Not connected.
		}
	};

	return {
		async play(tone, loop) {
			stop();
			const mine = seq;
			listen();
			if (!(await running(300))) return mine === seq ? 'blocked' : 'stopped';
			const c = ctx!;
			const b = await buffer(c, tone);
			if (mine !== seq) return 'stopped';
			const s = c.createBufferSource();
			s.buffer = b;
			s.loop = loop;
			s.connect(c.destination);
			s.onended = () => {
				if (source === s) source = undefined;
			};
			s.start();
			source = s;
			return 'playing';
		},
		stop,
		unlock() {
			listen();
			return running(1000);
		},
		onUnlocked(cb) {
			unlocked = cb;
			listen();
		},
		setRingtone(url) {
			if (!url || url === ringtone) return;
			ringtone = url;
			buffers = new Map();
			ringData = undefined;
		},
		prefetch() {
			if (typeof fetch === 'function') download().catch(() => undefined);
		},
	};
}

// ---------------------------------------------------------------- the controller

export function localStore(): Storage | undefined {
	try {
		return typeof localStorage === 'undefined' ? undefined : localStorage;
	} catch {
		return undefined;
	}
}

/** A localStorage key for the signed in user: the prefix, then the user id. */
export function userKey(prefix: string = SOUND_KEY): string {
	let id: any;
	try {
		id = getDataFromPath('Store.auth.user.id', []);
	} catch {
		id = undefined;
	}
	return id === undefined || id === null || id === '' ? prefix : `${prefix}.${id}`;
}

/** The loop a call state asks for, before the incoming delay and the answer quiet. */
export function loopFor(state: CallState | undefined): Tone | undefined {
	if (!state) return undefined;
	if (state.status === 'ringing')
		return state.ringBack || state.direction === 'outbound' ? 'ringBack' : 'incoming';
	if (state.status === 'connected' && state.ringBack) return 'ringBack';
	return undefined;
}

export class CallSounds {
	private out?: SoundOut;
	private readonly makeOut: () => SoundOut;
	private last?: CallState;
	private here = false;
	/** The loop asked for and its call; `blocked` while the browser refuses to play it. */
	private loop?: { tone: Tone; callId?: string; blocked?: boolean };
	private blocked = false;
	private ringing?: { callId?: string; since: number };
	private quiet?: { callId?: string; until: number };
	private endedCall?: string;
	private timer?: ReturnType<typeof setTimeout>;
	private preview = false;
	private ringtone?: string;
	/** The session rewrites `audioBlocked` in the call state when it changes. */
	onBlocked: (blocked: boolean) => void = () => {};

	constructor(makeOut: () => SoundOut = createWebAudioOut) {
		this.makeOut = makeOut;
	}

	private speaker(): SoundOut {
		if (!this.out) {
			this.out = this.makeOut();
			if (this.ringtone) this.out.setRingtone(this.ringtone);
			this.out.onUnlocked(() => {
				if (this.loop?.blocked) this.start(this.loop.tone, this.loop.callId);
			});
		}
		return this.out;
	}

	/** The user's setting, remembered in this browser per user. On unless turned off. */
	isOn(): boolean {
		try {
			return localStore()?.getItem(userKey()) !== 'off';
		} catch {
			return true;
		}
	}

	setOn(on: boolean) {
		try {
			if (on) localStore()?.removeItem(userKey());
			else localStore()?.setItem(userKey(), 'off');
		} catch {
			// Storage blocked: the setting lasts for this page only, through the call state.
		}
	}

	/** True while a ring is due here and the browser does not let it play. */
	isBlocked(): boolean {
		return this.blocked;
	}

	/** The tab holds calls: fetch the ring file now so the first ring starts on time. */
	prefetch() {
		this.speaker().prefetch?.();
	}

	setRingtone(url: string) {
		if (!url) return;
		this.ringtone = url;
		this.out?.setRingtone(url);
	}

	/** Answer was pressed for this call: no incoming ring while the provider confirms. */
	quietFor(callId: string | undefined, ms = ANSWERING_QUIET_MS) {
		this.quiet = { callId, until: Date.now() + ms };
		this.refresh();
	}

	unquiet() {
		this.quiet = undefined;
		this.refresh();
	}

	/** From a click: lets audio play and starts the loop that was blocked. */
	async unlock(): Promise<boolean> {
		const ok = await this.speaker().unlock();
		if (ok && this.loop?.blocked) this.start(this.loop.tone, this.loop.callId);
		return ok;
	}

	/** The soft phone test page: plays a tone with no call; `stop` ends it. */
	async previewTone(tone: Tone | 'stop'): Promise<PlayResult> {
		this.clearTimer();
		this.stopLoop();
		if (tone === 'stop') {
			if (this.preview) this.speaker().stop();
			this.preview = false;
			this.refresh();
			return 'stopped';
		}
		this.preview = tone !== 'end';
		return this.speaker().play(tone, tone !== 'end');
	}

	/** The call state changed in this tab. `here`: this tab plays the call's sounds. */
	update(state: CallState | undefined, here: boolean) {
		const prev = this.last;
		this.last = state;
		this.here = here;
		const status = state?.status;
		if (status === 'ringing') {
			if (prev?.status !== 'ringing' || this.ringing?.callId !== state!.callId)
				this.ringing = { callId: state!.callId, since: Date.now() };
		} else this.ringing = undefined;
		if (
			this.quiet &&
			(status !== 'ringing' ||
				(this.quiet.callId && state!.callId && this.quiet.callId !== state!.callId))
		)
			this.quiet = undefined;
		if (here && (status === 'ringing' || status === 'connected')) this.preview = false;

		const ended =
			!!prev &&
			IN_CALL.has(prev.status) &&
			status === 'ended' &&
			state!.endReason !== 'pageClosed' &&
			(!prev.callId || !state!.callId || prev.callId === state!.callId) &&
			(state!.callId === undefined || this.endedCall !== state!.callId);
		if (ended) this.endedCall = state!.callId;

		if (ended && here && this.on(state)) {
			this.clearTimer();
			this.stopLoop();
			this.preview = false;
			this.speaker()
				.play('end', false)
				.catch(() => undefined);
			return;
		}
		this.refresh();
	}

	private on(state: CallState | undefined) {
		return state?.soundOn ?? this.isOn();
	}

	/** Starts, keeps or stops the loop for the last state. */
	refresh() {
		this.clearTimer();
		if (this.preview) return;
		const state = this.last;
		let tone = this.here && this.on(state) ? loopFor(state) : undefined;
		if (tone === 'incoming') {
			const now = Date.now();
			const from = Math.max(
				(this.ringing?.since ?? now) + INCOMING_RING_DELAY_MS,
				this.quiet?.until ?? 0,
			);
			if (from > now) {
				tone = undefined;
				this.timer = setTimeout(() => this.refresh(), from - now);
			}
		}
		if (!tone) return this.stopLoop();
		if (this.loop && this.loop.tone === tone && this.loop.callId === state?.callId) return;
		this.start(tone, state?.callId);
	}

	private report(blocked: boolean) {
		if (this.blocked === blocked) return;
		this.blocked = blocked;
		this.onBlocked(blocked);
	}

	private start(tone: Tone, callId?: string) {
		const loop: { tone: Tone; callId?: string; blocked?: boolean } = { tone, callId };
		this.loop = loop;
		this.speaker()
			.play(tone, true)
			.then(r => {
				if (this.loop !== loop || r === 'stopped') return;
				loop.blocked = r === 'blocked';
				this.report(loop.blocked);
			})
			.catch(() => undefined);
	}

	private stopLoop() {
		const had = this.loop;
		this.loop = undefined;
		if (had) this.out?.stop();
		this.report(false);
	}

	private clearTimer() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
	}

	/** Stops everything (Disconnect). */
	reset() {
		this.clearTimer();
		this.last = undefined;
		this.here = false;
		this.ringing = undefined;
		this.quiet = undefined;
		if (this.preview) this.out?.stop();
		this.preview = false;
		this.stopLoop();
	}

	/** For tests: the loop playing now. */
	playingTone(): Tone | undefined {
		return this.loop && !this.loop.blocked ? this.loop.tone : undefined;
	}
}
