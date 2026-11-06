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
