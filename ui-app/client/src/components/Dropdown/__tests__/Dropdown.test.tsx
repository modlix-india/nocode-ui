/**
 * Two defects in the server-searched Dropdown, the shape every client picker in
 * appbuilder uses (isSearchable + onSearch + bindingPath2).
 *
 * 1. The debounce guard compared `searchText` against a ref that was being assigned
 *    the searchEvent OBJECT, not the text. After the first search the guard could
 *    never be false again, and since the effect's dependency list includes
 *    `locationHistory` and `props.pageDefinition` -- whose identity changes on any
 *    page re-render -- an unrelated re-render re-fired the search 500ms later with
 *    text that had not changed.
 *
 * 2. The arrow-key handler chose its list with `searchDropdownData?.length ||
 *    searchText`, missing the `&& !onSearch` that the panel's own copy of the same
 *    decision had. With an onSearch event the local filter effect returns early and
 *    `searchDropdownData` stays undefined, so the moment anything was typed the
 *    handler switched to an undefined list, cleared the hover key and returned.
 *    Keyboard navigation was dead in every server-searched dropdown.
 *
 * What is real here and what is stubbed matters for how much these tests prove.
 * REAL: the component, CommonInputText (so the keyup wiring and the `.compDropdown`
 * wrapper that the panel's geometry depends on are the genuine ones), getRenderData,
 * getSelectedKeys. STUBBED: the store, runEvent, style processing, and the helper
 * overlays. So these cover Dropdown's own logic and its wiring to the input, not the
 * store or the event engine.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ── stubs ────────────────────────────────────────────────────────────────────

const runEventMock = jest.fn().mockResolvedValue(undefined);
jest.mock('../../util/runEvent', () => ({
	runEvent: (...args: any[]) => runEventMock(...args),
}));

// One store listener per bound path, so a test can push a new value in the way the
// page does and watch the component follow it.
const listeners = new Map<string, (path: string, value: any) => void>();
const storeValues = new Map<string, any>();

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({}) },
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

jest.mock('../../../context/TempStore', () => ({ makeTempPath: (p: string) => p }));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../../util/validationProcessor', () => ({ validate: () => [] }));
jest.mock('../DropdownStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));

// The properties the component would otherwise resolve off the definition.
let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({
		key: 'dd',
		properties,
		stylePropertiesWithPseudoStates: {},
	}),
}));

// Imported after the mocks so the component picks them up. The module's default
// export is the Component DESCRIPTOR; the React component hangs off `.component`.
import dropdownDescriptor from '../Dropdown';

const Dropdown = dropdownDescriptor.component as React.FunctionComponent<any>;

// ── fixtures ─────────────────────────────────────────────────────────────────

const SEARCH_EVENT_KEY = 'searchEventKey';
const SELECTION_PATH = 'Page.pick';
const SEARCH_PATH = 'Page.searchText';

/** Three clients, the shape /api/security/clients/query returns. */
const CLIENTS = [
	{ code: 'CLIA', name: 'CLIENT A' },
	{ code: 'FIN', name: 'Fincity' },
	{ code: 'RAJAA', name: 'RajaAvinash' },
];

function serverSearchedProperties(overrides: Record<string, any> = {}) {
	return {
		data: CLIENTS,
		datatype: 'LIST_OF_OBJECTS',
		uniqueKeyType: 'KEY',
		uniqueKey: 'code',
		selectionType: 'KEY',
		selectionKey: 'code',
		labelKeyType: 'KEY',
		labelKey: 'name',
		isSearchable: true,
		onSearch: SEARCH_EVENT_KEY,
		designType: '_default',
		noFloat: true,
		placeholder: 'client',
		...overrides,
	};
}

function propsFor(pageDefinition: any) {
	return {
		definition: {
			key: 'dd',
			name: 'dataClient',
			type: 'Dropdown',
			bindingPath: { type: 'VALUE', value: SELECTION_PATH },
			bindingPath2: { type: 'VALUE', value: SEARCH_PATH },
		},
		pageDefinition,
		locationHistory: [],
		context: { pageName: 'testpage' },
	} as any;
}

function makePageDefinition() {
	return {
		name: 'testpage',
		translations: {},
		eventFunctions: { [SEARCH_EVENT_KEY]: { name: 'loadClients', steps: {} } },
	};
}

let container: HTMLDivElement;
let root: Root;
let pageDefinition: any;

function render() {
	act(() => root.render(<Dropdown {...propsFor(pageDefinition)} />));
}

/** The control's own input, the one CommonInputText holds the ref for. */
function controlInput(): HTMLInputElement {
	const input = container.querySelector<HTMLInputElement>('input');
	if (!input) throw new Error('no control input rendered');
	return input;
}

/** The panel opens on focus, and the search box only exists once it is open. */
function openPanel() {
	act(() => {
		controlInput().focus();
	});
}

/**
 * Type into the search box through the real input, using the native value setter so
 * React sees the change the way a keystroke produces it.
 */
function typeSearch(value: string) {
	if (!document.querySelector('._dropdownSearchBox')) openPanel();
	const box = document.querySelector<HTMLInputElement>('._dropdownSearchBox');
	if (!box) throw new Error('no search box rendered');
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
	act(() => {
		setter?.call(box, value);
		box.dispatchEvent(new Event('input', { bubbles: true }));
	});
}

/** Keyup on the control input; updDownHandler sits on the wrapper it bubbles to. */
function pressKey(key: string) {
	const input = controlInput();
	act(() => {
		input.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
	});
}

function elapseDebounce() {
	act(() => {
		jest.advanceTimersByTime(600);
	});
}

function hoveredLabels(): string[] {
	return Array.from(document.querySelectorAll('._dropdownItem._hover')).map(
		e => e.textContent?.trim() ?? '',
	);
}

function optionLabels(): string[] {
	return Array.from(document.querySelectorAll('._dropdownItem')).map(
		e => e.textContent?.trim() ?? '',
	);
}

beforeEach(() => {
	jest.useFakeTimers();
	runEventMock.mockClear();
	listeners.clear();
	storeValues.clear();
	properties = serverSearchedProperties();
	pageDefinition = makePageDefinition();
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	jest.useRealTimers();
});

// ── bug 1: the debounce guard ────────────────────────────────────────────────

describe('server-side search debounce', () => {
	it('does not search on mount, when nothing has been typed', () => {
		render();
		elapseDebounce();
		expect(runEventMock).not.toHaveBeenCalled();
	});

	it('searches once for a typed term', () => {
		render();
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock).toHaveBeenCalledTimes(1);
	});

	it('passes the search EVENT to runEvent, not something else', () => {
		render();
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock.mock.calls[0][0]).toBe(pageDefinition.eventFunctions[SEARCH_EVENT_KEY]);
	});

	/**
	 * The regression. props.pageDefinition is in the effect's dependency list, so a
	 * new identity re-runs the effect; the guard must recognise that the text has not
	 * changed. Before the fix the ref held the event object, so this searched again.
	 */
	it('does not search again when the page re-renders with the same text', () => {
		render();
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock).toHaveBeenCalledTimes(1);

		pageDefinition = makePageDefinition();
		render();
		elapseDebounce();

		expect(runEventMock).toHaveBeenCalledTimes(1);
	});

	it('searches again when the text actually changes', () => {
		render();
		typeSearch('FIN');
		elapseDebounce();
		typeSearch('FINCI');
		elapseDebounce();
		expect(runEventMock).toHaveBeenCalledTimes(2);
	});

	it('coalesces keystrokes inside the debounce window into one search', () => {
		render();
		typeSearch('F');
		act(() => {
			jest.advanceTimersByTime(200);
		});
		typeSearch('FI');
		act(() => {
			jest.advanceTimersByTime(200);
		});
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock).toHaveBeenCalledTimes(1);
	});

	it('searches again when the same term is retyped after being cleared', () => {
		render();
		typeSearch('FIN');
		elapseDebounce();
		typeSearch('');
		elapseDebounce();
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock).toHaveBeenCalledTimes(3);
	});

	it('never searches when no onSearch event is configured', () => {
		properties = serverSearchedProperties({ onSearch: undefined });
		render();
		typeSearch('FIN');
		elapseDebounce();
		expect(runEventMock).not.toHaveBeenCalled();
	});
});

// ── bug 2: arrow keys on a server-searched dropdown ──────────────────────────

describe('keyboard navigation', () => {
	it('opens the panel and hovers the first option on ArrowDown', () => {
		render();
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
	});

	/**
	 * The regression. With onSearch set, searchDropdownData is never populated, so a
	 * handler keying off `searchText` alone read an undefined list and cleared the
	 * hover key instead of moving it.
	 */
	it('still navigates after text is typed, with onSearch set', () => {
		render();
		pressKey('ArrowDown');
		typeSearch('anything');
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['Fincity']);
	});

	it('walks down the whole server-returned list with text typed', () => {
		render();
		pressKey('ArrowDown');
		typeSearch('anything');
		expect(optionLabels()).toEqual(['CLIENT A', 'Fincity', 'RajaAvinash']);

		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['Fincity']);
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['RajaAvinash']);
	});

	it('wraps around at the end of the list', () => {
		render();
		pressKey('ArrowDown');
		typeSearch('anything');
		pressKey('ArrowDown');
		pressKey('ArrowDown');
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
	});

	it('ArrowUp from the top wraps to the last option', () => {
		render();
		typeSearch('anything');
		pressKey('ArrowUp');
		expect(hoveredLabels()).toEqual(['RajaAvinash']);
	});

	it('Escape clears the hover and closes the panel', () => {
		render();
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
		pressKey('Escape');
		expect(optionLabels()).toEqual([]);
	});

	/**
	 * Without onSearch the LOCAL filter owns the list, and the typed text must still
	 * narrow it. This is the half of the shared decision that already worked, kept
	 * here so hoisting it into one place cannot regress the other caller.
	 */
	it('a locally-filtered dropdown still navigates only the matching options', () => {
		properties = serverSearchedProperties({ onSearch: undefined });
		render();
		pressKey('ArrowDown');
		typeSearch('Fin');
		expect(optionLabels()).toEqual(['Fincity']);
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['Fincity']);
	});
});
