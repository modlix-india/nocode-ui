/**
 * Image (ADZ-1499): a secured picture is fetched before it shows. When the source changes while an older fetch is
 * still out (a repeater row that now holds another picture), the older answer can arrive last. With "Ignore a late
 * picture" on it is dropped; without it the old behaviour stays (the last answer wins).
 * STUBBED: the store, styles, helper overlays, the router, URL helpers and the secured fetch.
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
jest.mock('../../util/runEvent', () => ({ runEvent: jest.fn() }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({}) }));
jest.mock('../../util/getHref', () => ({ getHref: (s: string) => s }));
jest.mock('../../util/getSrcUrl', () => ({
	__esModule: true,
	default: (s: string) => s,
	getSrcSet: () => undefined,
	getSizesFromStyle: () => undefined,
}));

// one pending fetch per secured url, answered by the test in any order
const pending = new Map<string, (v: string) => void>();
jest.mock('../../util/secureImage', () => ({
	__esModule: true,
	default: (src: string) => new Promise<string>(res => pending.set(src, res)),
	isSecuredUrl: (src?: string) => !!src && src.startsWith('/secured/'),
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, key: 'img', stylePropertiesWithPseudoStates: {} }),
}));

import Image from '../Image';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	pending.clear();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

const Comp = Image.component as any;
const render = () =>
	act(() => {
		root.render(
			<Comp
				definition={{ key: 'img' }}
				context={{ pageName: 'p' }}
				locationHistory={[]}
				pageDefinition={{ eventFunctions: {} }}
			/>,
		);
	});
const answer = (src: string, blob: string) =>
	act(async () => {
		pending.get(src)!(blob);
		await Promise.resolve();
	});
const shown = () => host.querySelector('img')?.getAttribute('src');

test('without the property the last answer wins, even an old one (unchanged behaviour)', async () => {
	properties = { src: '/secured/a.jpg' };
	render();
	properties = { src: '/secured/b.jpg' };
	render();
	await answer('/secured/b.jpg', 'blob:b');
	expect(shown()).toBe('blob:b');
	await answer('/secured/a.jpg', 'blob:a');
	expect(shown()).toBe('blob:a');
});

test('Ignore a late picture: an answer for a source no longer shown is dropped', async () => {
	properties = { src: '/secured/a.jpg', ignoreLateSource: true };
	render();
	properties = { src: '/secured/b.jpg', ignoreLateSource: true };
	render();
	await answer('/secured/b.jpg', 'blob:b');
	await answer('/secured/a.jpg', 'blob:a');
	expect(shown()).toBe('blob:b');
});

test('Ignore a late picture: a public source is not overwritten by an older secured answer', async () => {
	properties = { src: '/secured/a.jpg', ignoreLateSource: true };
	render();
	properties = { src: 'https://cdn.example.com/b.jpg', ignoreLateSource: true };
	render();
	expect(shown()).toBe('https://cdn.example.com/b.jpg');
	await answer('/secured/a.jpg', 'blob:a');
	expect(shown()).toBe('https://cdn.example.com/b.jpg');
});

test('Ignore a late picture: the current source still shows when it answers', async () => {
	properties = { src: '/secured/a.jpg', ignoreLateSource: true };
	render();
	await answer('/secured/a.jpg', 'blob:a');
	expect(shown()).toBe('blob:a');
});
