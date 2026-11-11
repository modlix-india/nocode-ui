/**
 * Audio _audioDesign5 (waveform, opt-in): peaks drawn once they decode, the seek bar while they
 * load or when they cannot be made, one fetch per source, click and keyboard seeking. Designs 1
 * to 4 keep the seek bar and fetch nothing.
 *
 * REAL: the Audio component, AudioWaveform and its peaks cache. STUBBED: the store, style
 * processing, helper overlays, the style component, fetch and OfflineAudioContext.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../AudioStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({ SubHelperComponent: () => null }));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../util/useSecureSrc', () => ({ useSecureSrc: (src: string) => src }));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'aud', properties, stylePropertiesWithPseudoStates: {} }),
}));

import audioDescriptor from '../Audio';
import {
	cachedWaveformPeaks,
	clearWaveformPeaksCache,
	computePeaks,
	resamplePeaks,
} from '../AudioWaveform';

const Audio = audioDescriptor.component as React.FunctionComponent<any>;
const SRC = 'https://files.example/call-1.mp3';

const fetchMock = jest.fn();
let decodeImpl: (data: ArrayBuffer) => Promise<any>;

class FakeOfflineAudioContext {
	decodeAudioData(data: ArrayBuffer) {
		return decodeImpl(data);
	}
}

function decodedBuffer() {
	const samples = new Float32Array(1600);
	for (let i = 0; i < samples.length; i++) samples[i] = i < 800 ? 0.1 : 0.8;
	return { numberOfChannels: 1, getChannelData: () => samples };
}

const BASE_PROPS = {
	src: SRC,
	designType: '_audioDesign5',
	colorScheme: '_primary',
	showSeekBar: true,
	showTime: true,
	showPlayPause: true,
	seekTimeTextOnHover: true,
};

let container: HTMLDivElement;
let roots: Root[] = [];

function render(target: HTMLElement = container) {
	const root = createRoot(target);
	roots.push(root);
	act(() => {
		root.render(
			<Audio
				definition={{ key: 'aud', name: 'aud', type: 'Audio' }}
				pageDefinition={{ eventFunctions: {}, translations: {} }}
				locationHistory={[]}
				context={{ pageName: 'testpage' }}
			/>,
		);
	});
	return target;
}

/** The <audio> learns its length: what the browser does once metadata is in. */
function loadMetadata(target: HTMLElement, duration = 120) {
	const audio = target.querySelector('audio')!;
	let current = 0;
	Object.defineProperty(audio, 'duration', { configurable: true, get: () => duration });
	Object.defineProperty(audio, 'currentTime', {
		configurable: true,
		get: () => current,
		set: (v: number) => {
			current = v;
		},
	});
	act(() => {
		audio.dispatchEvent(new Event('loadedmetadata'));
	});
	return audio;
}

async function settle() {
	await act(async () => {
		for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
	});
}

beforeEach(() => {
	properties = { ...BASE_PROPS };
	clearWaveformPeaksCache();
	fetchMock.mockReset();
	fetchMock.mockImplementation(async () => ({
		ok: true,
		arrayBuffer: async () => new ArrayBuffer(8),
	}));
	decodeImpl = async () => decodedBuffer();
	(globalThis as any).fetch = fetchMock;
	(globalThis as any).OfflineAudioContext = FakeOfflineAudioContext;
	container = document.createElement('div');
	document.body.appendChild(container);
});

afterEach(() => {
	act(() => roots.forEach(r => r.unmount()));
	roots = [];
	document.body.innerHTML = '';
	delete (globalThis as any).OfflineAudioContext;
});

describe('Audio _audioDesign5 waveform', () => {
	test('renders the waveform once the peaks resolve, the seek bar before that', async () => {
		render();
		expect(container.querySelector('input#seek')).not.toBeNull();
		expect(container.querySelector('._waveform')).toBeNull();

		loadMetadata(container);
		await settle();

		const wave = container.querySelector('._waveform') as HTMLElement;
		expect(wave).not.toBeNull();
		expect(container.querySelector('input#seek')).toBeNull();
		expect(wave.getAttribute('role')).toBe('slider');
		expect(wave.getAttribute('aria-valuemax')).toBe('120');
		expect(wave.getAttribute('tabindex')).toBe('0');
		const bars = wave.querySelectorAll('._waveformBar');
		expect(bars.length).toBeGreaterThan(0);
		// The quiet first half is drawn lower than the loud second half.
		expect((bars[0] as HTMLElement).style.height).toBe('13%');
		expect((bars[bars.length - 1] as HTMLElement).style.height).toBe('100%');
		expect(fetchMock).toHaveBeenCalledWith(SRC);
		// Design 1's theme values (colour scheme included) apply to it too.
		const root = container.querySelector('.comp.compAudio')!;
		expect(root.className).toContain('_audioDesign1 _audioDesign5');
		expect(root.className).toContain('_primary');
	});

	test('falls back to the seek bar when decoding fails', async () => {
		decodeImpl = () => Promise.reject(new Error('EncodingError'));
		render();
		loadMetadata(container);
		await settle();

		expect(container.querySelector('._waveform')).toBeNull();
		expect(container.querySelector('input#seek')).not.toBeNull();
		expect(cachedWaveformPeaks(SRC)).toBeNull();
	});

	test('falls back to the seek bar when the fetch is refused (CORS)', async () => {
		fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
		render();
		loadMetadata(container);
		await settle();

		expect(container.querySelector('._waveform')).toBeNull();
		expect(container.querySelector('input#seek')).not.toBeNull();
	});

	test('falls back to the seek bar without Web Audio', async () => {
		delete (globalThis as any).OfflineAudioContext;
		render();
		loadMetadata(container);
		await settle();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(container.querySelector('input#seek')).not.toBeNull();
	});

	test('fetches nothing for a stream of unknown length', async () => {
		render();
		loadMetadata(container, Infinity);
		await settle();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(container.querySelector('._waveform')).toBeNull();
		expect(container.querySelector('input#seek')).not.toBeNull();
	});

	test('reuses the cached peaks for the same source', async () => {
		render();
		loadMetadata(container);
		await settle();
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const second = document.createElement('div');
		document.body.appendChild(second);
		render(second);
		loadMetadata(second);
		await settle();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(second.querySelector('._waveform')).not.toBeNull();
	});

	test('a click on the waveform seeks to that point', async () => {
		render();
		const audio = loadMetadata(container);
		await settle();

		const wave = container.querySelector('._waveform') as HTMLElement;
		wave.getBoundingClientRect = () =>
			({ left: 100, top: 0, width: 200, height: 40, right: 300, bottom: 40 }) as DOMRect;

		act(() => {
			wave.dispatchEvent(
				new MouseEvent('pointerdown', { bubbles: true, clientX: 150, button: 0 }),
			);
			wave.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 150 }));
		});

		expect(audio.currentTime).toBe(30);
		expect(container.querySelector('._timeElapsed')!.textContent).toBe('00:30');
	});

	test('a drag previews and seeks where it is let go', async () => {
		render();
		const audio = loadMetadata(container);
		await settle();

		const wave = container.querySelector('._waveform') as HTMLElement;
		wave.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 200, height: 40, right: 200, bottom: 40 }) as DOMRect;

		act(() => {
			wave.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 20 }));
			wave.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100 }));
		});
		expect(wave.getAttribute('aria-valuenow')).toBe('60');
		expect(audio.currentTime).toBe(0);

		act(() => {
			wave.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 160 }));
		});
		expect(audio.currentTime).toBe(96);
	});

	test('arrow, Home and End keys seek', async () => {
		render();
		const audio = loadMetadata(container);
		await settle();

		const wave = container.querySelector('._waveform') as HTMLElement;
		const key = (k: string) =>
			act(() => {
				wave.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: k }));
			});

		key('ArrowRight');
		expect(audio.currentTime).toBe(1);
		key('End');
		expect(audio.currentTime).toBe(120);
		key('Home');
		expect(audio.currentTime).toBe(0);
	});

	test('designs 1 to 4 keep the seek bar and fetch nothing', async () => {
		for (const designType of [
			'_audioDesign1',
			'_audioDesign2',
			'_audioDesign3',
			'_audioDesign4',
		]) {
			properties = { ...BASE_PROPS, designType, colorScheme: '_quaternary' };
			const target = document.createElement('div');
			document.body.appendChild(target);
			render(target);
			loadMetadata(target);
			await settle();

			expect(target.querySelector('input#seek')).not.toBeNull();
			expect(target.querySelector('._waveform')).toBeNull();
			expect(target.querySelector('.comp.compAudio')!.className).toBe(
				`comp compAudio ${designType} _quaternary`,
			);
		}
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('waveform peaks', () => {
	test('computePeaks takes the loudest sample per bucket across channels, scaled to 1', () => {
		const left = [0, 0.2, -0.5, 0.1];
		const right = [0.1, 0, 0, -1];
		expect(computePeaks([left, right], 2)).toEqual([0.2, 1]);
		expect(computePeaks([[0, 0]], 4)).toEqual([0, 0]);
		expect(computePeaks([], 4)).toEqual([]);
	});

	test('resamplePeaks keeps the highest peak each bar covers', () => {
		expect(resamplePeaks([0.1, 0.9, 0.3, 0.4], 2)).toEqual([0.9, 0.4]);
		expect(resamplePeaks([0.5, 1], 4)).toEqual([0.5, 0.5, 1, 1]);
	});
});
