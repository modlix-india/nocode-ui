/**
 * Video (ADZ-1549/1550): "Controls on a dark scrim" puts the player controls on a dark fade, white, so they read on
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
