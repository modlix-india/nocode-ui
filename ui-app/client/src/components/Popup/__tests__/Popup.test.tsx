/**
 * Popup restoreFocus (opt-in): the element that had focus when the popup opened gets it back
 * when the popup closes; without the property focus is left alone (the old behaviour).
 *
 * REAL: the Popup component and its open / close effects. STUBBED: the store (one listener
 * per path), runEvent, style processing, helper overlays, Portal and Children.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../util/runEvent', () => ({ runEvent: jest.fn().mockResolvedValue(undefined) }));

const listeners = new Map<string, (path: string, value: any) => void>();
const storeValues = new Map<string, any>();
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
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
	getDataFromPath: (path: string) => storeValues.get(path),
	setData: (path: string, value: any) => {
		storeValues.set(path, value);
		listeners.get(path)?.(path, value);
	},
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../PopupStyles', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({ SubHelperComponent: () => null }));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../Portal', () => ({
	__esModule: true,
	default: ({ children }: any) => <div data-testid="portal">{children}</div>,
}));
jest.mock('../../Children', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../shortcuts/layerStack', () => ({
	pushLayer: () => 1,
	popLayer: () => undefined,
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'pop', properties, stylePropertiesWithPseudoStates: {} }),
}));

import popupDescriptor from '../Popup';

const Popup = popupDescriptor.component as React.FunctionComponent<any>;
const OPEN = 'Page.open';

function render(container: HTMLElement): Root {
	const root = createRoot(container);
	act(() => {
		root.render(
			<Popup
				definition={{
					key: 'pop',
					name: 'pop',
					type: 'Popup',
					bindingPath: { type: 'VALUE', value: OPEN },
				}}
				pageDefinition={{ eventFunctions: {}, translations: {} }}
				locationHistory={[]}
				context={{ pageName: 'testpage' }}
			/>,
		);
	});
	return root;
}

function setOpen(v: boolean) {
	act(() => {
		storeValues.set(OPEN, v);
		listeners.get(OPEN)?.(OPEN, v);
	});
}

describe('Popup restoreFocus', () => {
	let host: HTMLDivElement;
	let opener: HTMLButtonElement;
	let other: HTMLButtonElement;
	let root: Root;

	beforeEach(() => {
		storeValues.clear();
		listeners.clear();
		document.body.innerHTML = '';
		opener = document.createElement('button');
		opener.textContent = 'Create a lead form';
		other = document.createElement('button');
		other.textContent = 'something inside';
		host = document.createElement('div');
		document.body.append(opener, other, host);
	});

	afterEach(() => act(() => root.unmount()));

	it('gives focus back to the opener on close when restoreFocus is on', () => {
		properties = { designType: '_design1', modelTitle: 'New lead form', restoreFocus: true };
		root = render(host);
		opener.focus();
		setOpen(true);
		other.focus();
		setOpen(false);
		expect(document.activeElement).toBe(opener);
	});

	it('leaves focus alone without restoreFocus (old behaviour)', () => {
		properties = { designType: '_design1', modelTitle: 'New lead form' };
		root = render(host);
		opener.focus();
		setOpen(true);
		other.focus();
		setOpen(false);
		expect(document.activeElement).toBe(other);
	});

	it('does not throw or move focus when the opener is gone', () => {
		properties = { designType: '_design1', restoreFocus: true };
		root = render(host);
		opener.focus();
		setOpen(true);
		opener.remove();
		other.focus();
		setOpen(false);
		expect(document.activeElement).toBe(other);
	});
});

describe('Popup drawer (opt-in)', () => {
	let host: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		storeValues.clear();
		listeners.clear();
		document.body.innerHTML = '';
		host = document.createElement('div');
		document.body.append(host);
	});

	afterEach(() => act(() => root.unmount()));

	it('marks the backdrop as a drawer when drawer is on', () => {
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		setOpen(true);
		const backdrop = host.querySelector('.backdrop')!;
		expect(backdrop.classList.contains('_drawer')).toBe(true);
		expect(backdrop.classList.contains('_right_top')).toBe(true);
	});

	it('keeps the floating box without drawer (old behaviour)', () => {
		properties = { designType: '_design1', modalPosition: '_right_top' };
		root = render(host);
		setOpen(true);
		const backdrop = host.querySelector('.backdrop')!;
		expect(backdrop.classList.contains('_drawer')).toBe(false);
		expect(backdrop.className).toBe('backdrop _right_top');
	});
});

describe('Popup drawer closing (PLAT-1615)', () => {
	let host: HTMLDivElement;
	let root: Root;
	const realMatchMedia = globalThis.matchMedia;

	function reducedMotion(on: boolean) {
		(globalThis as any).matchMedia = (q: string) => ({
			matches: on && q.includes('prefers-reduced-motion'),
		});
	}

	beforeEach(() => {
		jest.useFakeTimers();
		storeValues.clear();
		listeners.clear();
		document.body.innerHTML = '';
		host = document.createElement('div');
		document.body.append(host);
		reducedMotion(false);
	});

	afterEach(() => {
		act(() => root.unmount());
		jest.useRealTimers();
		(globalThis as any).matchMedia = realMatchMedia;
	});

	function animationEnd() {
		const modal = host.querySelector('.modal')!;
		act(() => {
			modal.dispatchEvent(new Event('animationend', { bubbles: true }));
		});
	}

	it('keeps a drawer on screen, sliding out, until its animation ends', () => {
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		setOpen(true);
		setOpen(false);
		const backdrop = host.querySelector('.backdrop')!;
		expect(backdrop.classList.contains('_closing')).toBe(true);
		animationEnd();
		expect(host.querySelector('.backdrop')).toBeNull();
	});

	it('lets a drawer go after the fallback when animationend never comes', () => {
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		setOpen(true);
		setOpen(false);
		expect(host.querySelector('.backdrop')).not.toBeNull();
		act(() => {
			jest.advanceTimersByTime(400);
		});
		expect(host.querySelector('.backdrop')).toBeNull();
	});

	it('opens again cleanly when reopened while sliding out', () => {
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		setOpen(true);
		setOpen(false);
		setOpen(true);
		const backdrop = host.querySelector('.backdrop')!;
		expect(backdrop.classList.contains('_closing')).toBe(false);
		act(() => {
			jest.advanceTimersByTime(1000);
		});
		expect(host.querySelector('.backdrop')).not.toBeNull();
	});

	it('closes at once under reduced motion', () => {
		reducedMotion(true);
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		setOpen(true);
		setOpen(false);
		expect(host.querySelector('.backdrop')).toBeNull();
	});

	it('closes a non drawer popup at once (old behaviour)', () => {
		properties = { designType: '_design1', modalPosition: '_right_top' };
		root = render(host);
		setOpen(true);
		setOpen(false);
		expect(host.querySelector('.backdrop')).toBeNull();
	});

	it('does not slide anything out on the first render when closed', () => {
		properties = { designType: '_design1', modalPosition: '_right_top', drawer: true };
		root = render(host);
		expect(host.querySelector('.backdrop')).toBeNull();
	});
});
