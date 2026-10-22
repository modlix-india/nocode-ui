/**
 * The optional open state binding on Popover. A calendar inside the panel is not an action
 * control, so a picked date left the panel open; the page now closes it by writing false to
 * the bound path, and the panel writes its own opening and closing back there.
 *
 * REAL: the Popover component. STUBBED: the store, Children (renders a marker per child),
 * Portal (renders inline), styles and helper overlays.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).isDesignMode = false;

const listeners = new Map<string, (path: string, value: any) => void>();
const storeValues = new Map<string, any>();
const writes: Array<[string, any]> = [];

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'page' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: (
		_pageName: string,
		callback: (path: string, value: any) => void,
		path: string,
	) => {
		listeners.set(path, callback);
		callback(path, storeValues.get(path));
		return () => listeners.delete(path);
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	setData: (path: string, value: any) => {
		writes.push([path, value]);
		storeValues.set(path, value);
		listeners.get(path)?.(path, value);
	},
}));

jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../PopoverStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../Portal', () => ({
	__esModule: true,
	default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../Children', () => ({
	__esModule: true,
	default: ({ renderableChildren }: any) => (
		<span className={'child-' + Object.keys(renderableChildren)[0]} />
	),
}));
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({
		key: 'pop',
		properties: { position: 'bottom-start', closeOnOutsideClick: true, closeOnInsideClick: true },
		stylePropertiesWithPseudoStates: {},
	}),
}));

import popoverDescriptor from '../Popover';

const Popover = popoverDescriptor.component as React.FunctionComponent<any>;

const OPEN_PATH = 'Page.pickerOpen';

function props(bindingPath?: any) {
	return {
		definition: {
			key: 'pop',
			type: 'Popover',
			name: 'Popover',
			children: { trig: true, panel: true },
			...(bindingPath ? { bindingPath } : {}),
		},
		pageDefinition: {
			translations: {},
			componentDefinition: {
				trig: { key: 'trig', type: 'Grid', displayOrder: 1 },
				panel: { key: 'panel', type: 'Grid', displayOrder: 2 },
			},
			eventFunctions: {},
		},
		locationHistory: [],
		context: { pageName: 'page' },
	};
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	listeners.clear();
	storeValues.clear();
	writes.length = 0;
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const panelOpen = () => !!container.querySelector('.child-panel');
const clickTrigger = () =>
	act(() => {
		(container.querySelector('.child-trig')!.parentElement as HTMLElement).click();
	});

test('without a binding the trigger toggles the panel and nothing is written', () => {
	act(() => root.render(<Popover {...props()} />));
	expect(panelOpen()).toBe(false);
	clickTrigger();
	expect(panelOpen()).toBe(true);
	clickTrigger();
	expect(panelOpen()).toBe(false);
	expect(writes).toEqual([]);
});

test('opening writes true, and the page closes it by writing false', () => {
	act(() => root.render(<Popover {...props({ type: 'VALUE', value: OPEN_PATH })} />));
	expect(panelOpen()).toBe(false);
	expect(writes).toEqual([]);

	clickTrigger();
	expect(panelOpen()).toBe(true);
	expect(storeValues.get(OPEN_PATH)).toBe(true);

	act(() => listeners.get(OPEN_PATH)!(OPEN_PATH, false));
	expect(panelOpen()).toBe(false);
	expect(writes).toEqual([[OPEN_PATH, true]]);
});

test('a true already in the store opens it, and closing by the trigger writes false', () => {
	storeValues.set(OPEN_PATH, true);
	act(() => root.render(<Popover {...props({ type: 'VALUE', value: OPEN_PATH })} />));
	expect(panelOpen()).toBe(true);
	clickTrigger();
	expect(panelOpen()).toBe(false);
	expect(storeValues.get(OPEN_PATH)).toBe(false);
});
