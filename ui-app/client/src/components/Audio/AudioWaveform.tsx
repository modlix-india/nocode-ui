import React, { useEffect, useMemo, useRef, useState } from 'react';

/** Peaks kept per source; the bars drawn are resampled from these to fit the width. */
export const PEAK_BUCKETS = 800;

// Decoding expands the whole file into raw samples, so a very long recording stays on the bar.
export const MAX_WAVEFORM_DURATION = 60 * 60;

// A low decode rate keeps that expansion small; the shape of the peaks does not need more.
const DECODE_SAMPLE_RATE = 8000;
const MAX_CACHED_SOURCES = 50;
const DEFAULT_BAR_COUNT = 64;
const DEFAULT_BAR_WIDTH = 3;
const DEFAULT_BAR_GAP = 2;

/** peaks: the result once known; null when the source could not be decoded. */
type PeaksEntry = { promise: Promise<number[] | undefined>; peaks?: number[] | null };

// One entry per resolved source URL, shared by every player on the page.
const peaksCache = new Map<string, PeaksEntry>();

export function clearWaveformPeaksCache() {
	peaksCache.clear();
}

/** Peaks already known for a source: the array, null when it failed, undefined when not yet. */
export function cachedWaveformPeaks(url: string): number[] | null | undefined {
	return peaksCache.get(url)?.peaks;
}

/**
 * The absolute peak of every bucket across all channels, scaled so the loudest bucket is 1.
 */
export function computePeaks(channels: Array<ArrayLike<number>>, buckets: number): number[] {
	const length = channels[0]?.length ?? 0;
	if (!length || buckets < 1) return [];
	const count = Math.min(buckets, length);
	const peaks = new Array<number>(count).fill(0);
	for (const data of channels) {
		for (let b = 0; b < count; b++) {
			const end = Math.floor(((b + 1) * length) / count);
			let max = peaks[b];
			for (let i = Math.floor((b * length) / count); i < end; i++) {
				const v = Math.abs(data[i]);
				if (v > max) max = v;
			}
			peaks[b] = max;
		}
	}
	let top = 0;
	for (const p of peaks) if (p > top) top = p;
	return top > 0 ? peaks.map(p => p / top) : peaks;
}

/** Peaks resampled to the number of bars that fit, each bar the highest peak it covers. */
export function resamplePeaks(peaks: number[], count: number): number[] {
	if (!peaks.length || count < 1) return [];
	const out = new Array<number>(count);
	for (let i = 0; i < count; i++) {
		const start = Math.floor((i * peaks.length) / count);
		const end = Math.max(start + 1, Math.floor(((i + 1) * peaks.length) / count));
		let max = 0;
		for (let j = start; j < end && j < peaks.length; j++) if (peaks[j] > max) max = peaks[j];
		out[i] = max;
	}
	return out;
}

function makeDecodeContext(): { ctx: any; close: () => void } | undefined {
	const g = globalThis as any;
	const Offline = g.OfflineAudioContext ?? g.webkitOfflineAudioContext;
	if (Offline) {
		for (const rate of [DECODE_SAMPLE_RATE, 44100]) {
			try {
				return { ctx: new Offline(1, 1, rate), close: () => undefined };
			} catch {
				// An older engine refuses a low rate; the next one is the common default.
			}
		}
	}
	const Live = g.AudioContext ?? g.webkitAudioContext;
	if (!Live) return undefined;
	try {
		const ctx = new Live();
		return {
			ctx,
			close: () => {
				try {
					ctx.close?.()?.catch?.(() => undefined);
				} catch {
					// Nothing to release.
				}
			},
		};
	} catch {
		return undefined;
	}
}

function decode(ctx: any, data: ArrayBuffer): Promise<any> {
	// The promise form, with the callbacks too for engines that only call those.
	return new Promise((resolve, reject) => {
		const p = ctx.decodeAudioData(data, resolve, reject);
		if (p && typeof p.then === 'function') p.then(resolve, reject);
	});
}

async function fetchAndDecode(url: string): Promise<number[] | undefined> {
	if (typeof fetch !== 'function') return undefined;
	const made = makeDecodeContext();
	if (!made) return undefined;
	try {
		// The same URL the <audio> element plays: a secured file is already a blob URL here.
		const res = await fetch(url);
		if (!res.ok) return undefined;
		const audio = await decode(made.ctx, await res.arrayBuffer());
		const channels: Array<ArrayLike<number>> = [];
		for (let c = 0; c < (audio?.numberOfChannels ?? 0); c++)
			channels.push(audio.getChannelData(c));
		return computePeaks(channels, PEAK_BUCKETS);
	} finally {
		made.close();
	}
}

/**
 * The peaks of a source, fetched and decoded once per URL. Resolves undefined when they cannot be
 * produced (CORS, a refused format, no Web Audio); that answer is kept too, so the player stays
 * on the bar without asking again.
 */
export function loadWaveformPeaks(url: string): Promise<number[] | undefined> {
	const existing = peaksCache.get(url);
	if (existing) return existing.promise;

	const entry: PeaksEntry = { promise: Promise.resolve(undefined) };
	entry.promise = fetchAndDecode(url).then(
		peaks => {
			entry.peaks = peaks?.length ? peaks : null;
			return entry.peaks ?? undefined;
		},
		() => {
			entry.peaks = null;
			return undefined;
		},
	);
	peaksCache.set(url, entry);
	while (peaksCache.size > MAX_CACHED_SOURCES) {
		const oldest = peaksCache.keys().next();
		if (oldest.done) break;
		peaksCache.delete(oldest.value);
	}
	return entry.promise;
}

/**
 * Peaks for the player, or undefined while they load or when there are none: the caller shows
 * the seek bar then. Nothing is fetched for a stream or a source of unknown length.
 */
export function useWaveformPeaks(
	url: string | undefined,
	duration: number,
	enabled: boolean,
): number[] | undefined {
	const usable =
		enabled &&
		!!url &&
		Number.isFinite(duration) &&
		duration > 0 &&
		duration <= MAX_WAVEFORM_DURATION;
	const [, setLoaded] = useState(0);

	useEffect(() => {
		if (!usable || cachedWaveformPeaks(url!) !== undefined) return;
		let alive = true;
		loadWaveformPeaks(url!).then(() => {
			if (alive) setLoaded(Date.now());
		});
		return () => {
			alive = false;
		};
	}, [url, usable]);

	return usable ? (cachedWaveformPeaks(url!) ?? undefined) : undefined;
}

function readPx(style: CSSStyleDeclaration, name: string, fallback: number): number {
	const v = Number.parseFloat(style.getPropertyValue(name));
	return Number.isFinite(v) && v >= 0 ? v : fallback;
}

export function AudioWaveform({
	peaks,
	value,
	max,
	valueText,
	onSeek,
	onHover,
	style,
}: Readonly<{
	peaks: number[];
	value: number;
	max: number;
	valueText?: string;
	onSeek: (value: number) => void;
	onHover?: (clientX: number, rect: DOMRect) => void;
	style?: React.CSSProperties;
}>) {
	const ref = useRef<HTMLDivElement>(null);
	const draggingRef = useRef(false);
	const [barCount, setBarCount] = useState(DEFAULT_BAR_COUNT);
	const [dragValue, setDragValue] = useState<number | undefined>(undefined);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const measure = () => {
			const width = el.clientWidth;
			if (!width) return;
			const cs = getComputedStyle(el);
			const bar =
				readPx(cs, '--audio-waveform-bar-width', DEFAULT_BAR_WIDTH) || DEFAULT_BAR_WIDTH;
			const gap = readPx(cs, '--audio-waveform-bar-gap', DEFAULT_BAR_GAP);
			setBarCount(Math.max(1, Math.floor((width + gap) / (bar + gap))));
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const bars = useMemo(() => resamplePeaks(peaks, barCount), [peaks, barCount]);

	const shown = dragValue ?? value;
	const fraction = max > 0 ? Math.min(1, Math.max(0, shown / max)) : 0;

	const valueAt = (clientX: number) => {
		const rect = ref.current?.getBoundingClientRect();
		if (!rect?.width) return 0;
		return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * max;
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const page = Math.max(1, max / 10);
		const steps: Record<string, number> = {
			ArrowRight: 1,
			ArrowUp: 1,
			ArrowLeft: -1,
			ArrowDown: -1,
			PageUp: page,
			PageDown: -page,
		};
		let next: number | undefined;
		if (e.key in steps) next = value + steps[e.key];
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = max;
		if (next === undefined) return;
		e.preventDefault();
		onSeek(Math.min(max, Math.max(0, next)));
	};

	return (
		<div
			className="_waveform"
			ref={ref}
			role="slider"
			tabIndex={0}
			aria-label="Seek"
			aria-valuemin={0}
			aria-valuemax={max}
			aria-valuenow={Math.round(shown)}
			aria-valuetext={valueText}
			style={style}
			onKeyDown={onKeyDown}
			onPointerDown={e => {
				if (e.button) return;
				draggingRef.current = true;
				try {
					e.currentTarget.setPointerCapture?.(e.pointerId);
				} catch {
					// Capture is a nicety for dragging past the edge.
				}
				setDragValue(valueAt(e.clientX));
			}}
			onPointerMove={e => {
				if (onHover && ref.current) onHover(e.clientX, ref.current.getBoundingClientRect());
				if (draggingRef.current) setDragValue(valueAt(e.clientX));
			}}
			onPointerUp={e => {
				if (!draggingRef.current) return;
				draggingRef.current = false;
				setDragValue(undefined);
				onSeek(valueAt(e.clientX));
			}}
			onPointerCancel={() => {
				draggingRef.current = false;
				setDragValue(undefined);
			}}
		>
			{bars.map((peak, i) => (
				<span
					key={i}
					className={`_waveformBar${(i + 0.5) / bars.length <= fraction ? ' _played' : ''}`}
					style={{ height: `${Math.round(peak * 100)}%` }}
				/>
			))}
			<span className="_waveformCursor" style={{ left: `${fraction * 100}%` }} />
		</div>
	);
}
