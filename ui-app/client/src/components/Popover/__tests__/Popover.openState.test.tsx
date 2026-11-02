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
		properties: {
			position: 'bottom-start',
			closeOnOutsideClick: true,
			closeOnInsideClick: true,
		},
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

describe('scrolling while open', () => {
	const rect = (top: number, left: number, h: number, w: number) =>
		({
			top,
			left,
			bottom: top + h,
			right: left + w,
			x: left,
			y: top,
			width: w,
			height: h,
		}) as DOMRect;
	const trigger = () => container.querySelector('.child-trig')!.parentElement as HTMLElement;
	const panel = () => container.querySelector('.compPopover.popover') as HTMLElement;
	const scroll = (target: EventTarget) =>
		act(() => {
			target.dispatchEvent(new Event('scroll'));
		});

	test('the panel follows its trigger', () => {
		act(() => root.render(<Popover {...props()} />));
		jest.spyOn(container, 'getBoundingClientRect').mockImplementation(() =>
			rect(0, 0, 400, 800),
		);
		let triggerTop = 100;
		jest.spyOn(trigger(), 'getBoundingClientRect').mockImplementation(() =>
			rect(triggerTop, 20, 30, 30),
		);
		clickTrigger();
		jest.spyOn(panel(), 'getBoundingClientRect').mockImplementation(() => rect(0, 0, 50, 80));
		scroll(container);
		const before = parseFloat(panel().style.top);
		triggerTop = 60;
		scroll(container);
		expect(panelOpen()).toBe(true);
		expect(parseFloat(panel().style.top)).toBe(before - 40);
	});

	test('it closes once the trigger leaves the scrolled area', () => {
		act(() => root.render(<Popover {...props()} />));
		jest.spyOn(container, 'getBoundingClientRect').mockImplementation(() =>
			rect(50, 0, 400, 800),
		);
		let triggerTop = 100;
		jest.spyOn(trigger(), 'getBoundingClientRect').mockImplementation(() =>
			rect(triggerTop, 20, 30, 30),
		);
		clickTrigger();
		scroll(container);
		expect(panelOpen()).toBe(true);
		triggerTop = 10;
		scroll(container);
		expect(panelOpen()).toBe(false);
	});

	test('it closes once the trigger slides under something pinned over it', () => {
		act(() => root.render(<Popover {...props()} />));
		jest.spyOn(container, 'getBoundingClientRect').mockImplementation(() =>
			rect(0, 0, 400, 800),
		);
		jest.spyOn(trigger(), 'getBoundingClientRect').mockImplementation(() =>
			rect(20, 20, 30, 30),
		);
		const header = document.createElement('div');
		document.body.appendChild(header);
		let covered = false;
		const original = (document as any).elementFromPoint;
		(document as any).elementFromPoint = () => (covered ? header : trigger());
		try {
			clickTrigger();
			scroll(container);
			expect(panelOpen()).toBe(true);
			covered = true;
			scroll(container);
			expect(panelOpen()).toBe(false);
		} finally {
			(document as any).elementFromPoint = original;
			header.remove();
		}
	});
});
