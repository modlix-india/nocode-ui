/**
 * Video (ADZ-1549/1550, ADZ-1581): "Controls on a dark scrim" puts the player controls on a dark fade, white, so they read on
 * any picture and in any theme. Off (the default) keeps the controls exactly as before.
 * STUBBED: the store, styles, helper overlays and URL helpers.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: (
		_p: string,
		cb: (path: string, v: any) => void,
		path: string,
	) => {
		cb(path, undefined);
		return () => {};
	},
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({ SubHelperComponent: () => null }));
jest.mock('../../util/getSrcUrl', () => ({ __esModule: true, default: (s: string) => s }));
// ADZ-1581: secured files are fetched with the sign-in token (stubbed: a blob URL per address)
const fetched: string[] = [];
jest.mock('../../util/secureImage', () => ({
	__esModule: true,
	default: (src: string) => {
		fetched.push(src);
		return Promise.resolve('blob:' + src.split('/').pop());
	},
	isSecuredUrl: (url: string | undefined) => !!url && url.includes('api/files/secured'),
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, key: 'vid', stylePropertiesWithPseudoStates: {} }),
}));

import Video from '../Video';
import { propertiesDefinition } from '../videoProperties';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

const Comp = Video.component as any;
const BASE = {
	src: '/a.mp4',
	designType: '_videoDesign1',
	colorScheme: '_primary',
	showSeekBar: true,
	showPlaypause: true,
	showTime: true,
	showAudioControls: true,
	showFullScreenButton: true,
};
const renderAndHover = () => {
	act(() => {
		root.render(
			<Comp
				definition={{ key: 'vid' }}
				context={{ pageName: 'p' }}
				locationHistory={[]}
				pageDefinition={{ eventFunctions: {} }}
			/>,
		);
	});
	const comp = host.querySelector('.compVideo')!;
	act(() => {
		comp.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
	});
	return host.querySelector('._videoControlsContainer');
};

test('the property is off by default', () => {
	const def = propertiesDefinition.find(p => p.name === 'controlsOnScrim');
	expect(def?.defaultValue).toBe(false);
});

test('without the property the controls carry no scrim (unchanged behaviour)', () => {
	properties = { ...BASE };
	const controls = renderAndHover();
	expect(controls).not.toBeNull();
	expect(controls!.classList.contains('_scrim')).toBe(false);
});

test('with the property the controls sit on the scrim', () => {
	properties = { ...BASE, controlsOnScrim: true };
	const controls = renderAndHover();
	expect(controls!.classList.contains('_scrim')).toBe(true);
	expect(controls!.querySelector('._playIcon')).not.toBeNull();
});

// ── ADZ-1581: "Play secured files" ─────────────────────────────────────────────────────────────────────────────

const SECURED = '/api/files/secured/file/FIN/_withInClient/adzumptwo/creative-uploads/tour.mp4';
const SECURED_POSTER =
	'/api/files/secured/file/FIN/_withInClient/adzumptwo/creative-uploads/tour.jpg';
const render = () =>
	act(() => {
		root.render(
			<Comp
				definition={{ key: 'vid' }}
				context={{ pageName: 'p' }}
				locationHistory={[]}
				pageDefinition={{ eventFunctions: {} }}
			/>,
		);
	});
const flush = () => act(async () => {});

test('secured source: off by default', () => {
	const def = propertiesDefinition.find(p => p.name === 'securedSource');
	expect(def?.defaultValue).toBe(false);
});

test('without the property a secured address goes to the player as given (unchanged behaviour)', async () => {
	fetched.length = 0;
	properties = { ...BASE, src: SECURED, poster: SECURED_POSTER };
	render();
	await flush();
	expect(host.querySelector('source')!.getAttribute('src')).toBe(SECURED);
	expect(host.querySelector('video')!.getAttribute('poster')).toBe(SECURED_POSTER);
	expect(fetched).toEqual([]);
});

test('with the property a secured video and poster play from the fetched files', async () => {
	fetched.length = 0;
	properties = { ...BASE, src: SECURED, poster: SECURED_POSTER, securedSource: true };
	render();
	await flush();
	expect(fetched.sort()).toEqual([SECURED, SECURED_POSTER].sort());
	expect(host.querySelector('source')!.getAttribute('src')).toBe('blob:tour.mp4');
	expect(host.querySelector('video')!.getAttribute('poster')).toBe('blob:tour.jpg');
});

test('with the property a public address is not fetched', async () => {
	fetched.length = 0;
	properties = {
		...BASE,
		src: 'https://cdn.example.com/a.mp4',
		poster: '/a.jpg',
		securedSource: true,
	};
	render();
	await flush();
	expect(fetched).toEqual([]);
	expect(host.querySelector('source')!.getAttribute('src')).toBe('https://cdn.example.com/a.mp4');
	expect(host.querySelector('video')!.getAttribute('poster')).toBe('/a.jpg');
});

// ── LZT-2295: full screen with the scrim: controls come back on any activity ───────────────────────────────────

describe('full screen controls', () => {
	let fsElement: Element | null = null;
	beforeAll(() => {
		Object.defineProperty(document, 'fullscreenElement', {
			configurable: true,
			get: () => fsElement,
		});
	});
	afterEach(() => {
		fsElement = null;
		jest.useRealTimers();
	});

	const enterFullScreen = () => {
		fsElement = host.querySelector('.compVideo');
		act(() => {
			document.dispatchEvent(new Event('fullscreenchange'));
		});
	};
	const leaveWindow = () =>
		act(() => {
			host.querySelector('.compVideo')!.dispatchEvent(
				new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }),
			);
		});
	const setPlaying = (playing: boolean) => {
		const v = host.querySelector('video') as HTMLVideoElement;
		Object.defineProperty(v, 'paused', { configurable: true, get: () => !playing });
		Object.defineProperty(v, 'ended', { configurable: true, get: () => false });
	};
	const controls = () => host.querySelector('._videoControlsContainer');

	test('with the scrim a pointer leave in full screen does not hide the controls', () => {
		properties = { ...BASE, controlsOnScrim: true };
		renderAndHover();
		enterFullScreen();
		leaveWindow();
		expect(controls()).not.toBeNull();
	});

	test('with the scrim the controls hide after idle while playing and come back on move, tap and key', () => {
		jest.useFakeTimers();
		properties = { ...BASE, controlsOnScrim: true };
		renderAndHover();
		setPlaying(true);
		enterFullScreen();
		expect(controls()).not.toBeNull();
		act(() => {
			jest.advanceTimersByTime(3100);
		});
		expect(controls()).toBeNull();

		act(() => {
			document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
		});
		expect(controls()).not.toBeNull();

		act(() => {
			jest.advanceTimersByTime(3100);
		});
		expect(controls()).toBeNull();
		act(() => {
			document.body.dispatchEvent(new Event('touchstart', { bubbles: true }));
		});
		expect(controls()).not.toBeNull();

		act(() => {
			jest.advanceTimersByTime(3100);
		});
		expect(controls()).toBeNull();
		act(() => {
			document.body.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
			);
		});
		expect(controls()).not.toBeNull();
	});

	test('with the scrim the controls stay while the video is paused in full screen', () => {
		jest.useFakeTimers();
		properties = { ...BASE, controlsOnScrim: true };
		renderAndHover();
		setPlaying(false);
		enterFullScreen();
		act(() => {
			jest.advanceTimersByTime(10000);
		});
		expect(controls()).not.toBeNull();
	});

	test('after leaving full screen the activity listeners are gone (hover behaviour again)', () => {
		jest.useFakeTimers();
		properties = { ...BASE, controlsOnScrim: true };
		renderAndHover();
		enterFullScreen();
		fsElement = null;
		act(() => {
			document.dispatchEvent(new Event('fullscreenchange'));
		});
		leaveWindow();
		expect(controls()).toBeNull();
		act(() => {
			document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
		});
		expect(controls()).toBeNull();
	});

	test('without the scrim full screen keeps the old hover behaviour (unchanged)', () => {
		jest.useFakeTimers();
		properties = { ...BASE };
		renderAndHover();
		enterFullScreen();
		leaveWindow();
		expect(controls()).toBeNull();
		act(() => {
			document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
			jest.advanceTimersByTime(5000);
		});
		expect(controls()).toBeNull();
	});
});

// ── ADZ-1673: the seek bar and the timer agree (both round the playing time like the bar's max) ──────────────

describe('seek bar position', () => {
	const play = (duration: number, currentTime: number) => {
		properties = { ...BASE };
		render();
		const v = host.querySelector('video') as HTMLVideoElement;
		Object.defineProperty(v, 'duration', { configurable: true, get: () => duration });
		Object.defineProperty(v, 'currentTime', { configurable: true, get: () => currentTime });
		act(() => {
			v.dispatchEvent(new Event('loadedmetadata'));
		});
		act(() => {
			v.dispatchEvent(new Event('timeupdate'));
		});
		act(() => {
			host.querySelector('.compVideo')!.dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true }),
			);
		});
		return host.querySelector('input#seek') as HTMLInputElement;
	};

	test('at the end of a video with a part second the thumb is at the end', () => {
		const seek = play(8.6, 8.6);
		expect(seek.max).toBe('9');
		expect(seek.value).toBe('9');
	});

	test('mid play the bar matches the timer second', () => {
		const seek = play(8.6, 4.6);
		expect(seek.value).toBe('5');
		expect(host.textContent).toContain('00:05');
	});

	test('a whole second video still runs 0 to its length', () => {
		expect(play(10, 0).value).toBe('0');
		expect(play(10, 10).value).toBe('10');
	});
});
