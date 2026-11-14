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
// The option-row template: shows which child it renders and the row it is given as Parent.
jest.mock('../../Children', () => ({
	__esModule: true,
	default: ({ renderableChildren, locationHistory }: any) => {
		const last = locationHistory[locationHistory.length - 1];
		const loc = last?.location;
		return (
			<span className="_childRow">
				{Object.keys(renderableChildren).join(',')}@{loc?.value ?? loc?.expression}
			</span>
		);
	},
}));

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

// ── the label of a selection the loaded data does not contain ────────────────

describe('label of a selection outside the data', () => {
	/** A server search answers with a list that no longer holds the selected row. */
	function serverAnswers(rows: any[]) {
		properties = { ...properties, data: rows };
		render();
	}

	function pick(label: string) {
		openPanel();
		const option = Array.from(document.querySelectorAll('._dropdownItem')).find(
			e => e.textContent?.trim() === label,
		);
		if (!option) throw new Error(`no option ${label}`);
		act(() => {
			option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		});
	}

	it('shows the label of a selection in the data', () => {
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		expect(controlInput().value).toBe('Fincity');
	});

	/** Reported: select, then search for something else; the box went blank. */
	it('keeps the label after a search drops the selected row', () => {
		render();
		pick('Fincity');
		expect(storeValues.get(SELECTION_PATH)).toBe('FIN');
		expect(controlInput().value).toBe('Fincity');

		serverAnswers([{ code: 'RAJAA', name: 'RajaAvinash' }]);
		expect(controlInput().value).toBe('Fincity');
	});

	it('keeps the label when the page reloads the list without the row', () => {
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		serverAnswers([CLIENTS[0]]);
		expect(controlInput().value).toBe('Fincity');
	});

	it('follows a new label for the same id when the data carries one', () => {
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		serverAnswers([{ code: 'FIN', name: 'Fincity Renamed' }]);
		expect(controlInput().value).toBe('Fincity Renamed');
	});

	/** Reported: an id bound before its row is in the first page has no label at all. */
	it('is blank for an unknown id without selectedData', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		render();
		expect(controlInput().value).toBe('');
	});

	it('uses selectedData, given as a single object, for an id outside the data', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		properties = serverSearchedProperties({ selectedData: { code: 'ZZZ', name: 'Zebra' } });
		render();
		expect(controlInput().value).toBe('Zebra');
	});

	it('uses selectedData given as a list', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		properties = serverSearchedProperties({
			selectedData: [{ code: 'ZZZ', name: 'Zebra' }],
		});
		render();
		expect(controlInput().value).toBe('Zebra');
	});

	it('does not add selectedData to the options shown', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		properties = serverSearchedProperties({ selectedData: { code: 'ZZZ', name: 'Zebra' } });
		render();
		openPanel();
		expect(optionLabels()).toEqual(['CLIENT A', 'Fincity', 'RajaAvinash']);
	});

	it('forgets the old label once the selection changes', () => {
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		act(() => listeners.get(SELECTION_PATH)?.(SELECTION_PATH, 'ZZZ'));
		expect(controlInput().value).toBe('');
	});

	it('names every multi-selected value, including ones outside the data', () => {
		storeValues.set(SELECTION_PATH, ['FIN', 'ZZZ']);
		properties = serverSearchedProperties({
			isMultiSelect: true,
			showMultipleSelectedValues: true,
			selectedData: [{ code: 'ZZZ', name: 'Zebra' }],
		});
		render();
		expect(controlInput().value).toBe('Fincity, Zebra');
	});

	/** Object-shaped data selected by INDEX stores the map key, so selectedData keeps it. */
	it('uses selectedData in an OBJECT_OF_OBJECTS dropdown selected by INDEX', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		properties = serverSearchedProperties({
			data: { CLIA: CLIENTS[0], FIN: CLIENTS[1] },
			datatype: 'OBJECT_OF_OBJECTS',
			uniqueKeyType: 'INDEX',
			selectionType: 'INDEX',
			selectedData: { ZZZ: { code: 'ZZZ', name: 'Zebra' } },
		});
		render();
		expect(controlInput().value).toBe('Zebra');
	});

	it('uses a bare row as selectedData in an OBJECT_OF_OBJECTS dropdown selected by KEY', () => {
		storeValues.set(SELECTION_PATH, 'ZZZ');
		properties = serverSearchedProperties({
			data: { CLIA: CLIENTS[0], FIN: CLIENTS[1] },
			datatype: 'OBJECT_OF_OBJECTS',
			selectedData: { code: 'ZZZ', name: 'Zebra' },
		});
		render();
		expect(controlInput().value).toBe('Zebra');
	});

	it('counts every multi-selected value, including ones outside the data', () => {
		storeValues.set(SELECTION_PATH, ['FIN', 'ZZZ']);
		properties = serverSearchedProperties({ isMultiSelect: true });
		render();
		expect(controlInput().value).toBe('2 Items  selected');
	});
});

// ── open direction and height ────────────────────────────────────────────────

describe('open direction and height', () => {
	// jsdom has no layout, so the field's box, the window height and the list's natural
	// height are supplied here. Both the control wrapper and the portal that anchors the
	// panel carry .compDropdown and sit on the field, which is what the panel measures.
	let field = { top: 0, bottom: 0 };
	let natural = 0;
	const originalRect = HTMLElement.prototype.getBoundingClientRect;
	const originalInnerHeight = window.innerHeight;

	beforeEach(() => {
		HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
			const r = this.classList.contains('compDropdown')
				? { top: field.top, bottom: field.bottom, left: 0, right: 240 }
				: { top: 0, bottom: 0, left: 0, right: 0 };
			return {
				...r,
				x: r.left,
				y: r.top,
				width: r.right - r.left,
				height: r.bottom - r.top,
				toJSON: () => r,
			} as DOMRect;
		};
		Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
			configurable: true,
			get(this: HTMLElement) {
				return this.classList.contains('_dropdownContainer') ? natural : 0;
			},
		});
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 746 });
	});

	afterEach(() => {
		HTMLElement.prototype.getBoundingClientRect = originalRect;
		delete (HTMLElement.prototype as any).scrollHeight;
		Object.defineProperty(window, 'innerHeight', {
			configurable: true,
			value: originalInnerHeight,
		});
	});

	const panel = () => document.querySelector<HTMLElement>('._dropdownContainer')!;

	/**
	 * The regression (QA-0051): a 2417px role list on a field halfway down a 746px window
	 * flipped above with no height limit and started 2000px above the top of the window.
	 */
	it('opens above with the list capped to the room above when that side is bigger', () => {
		field = { top: 381, bottom: 421 };
		natural = 2417;
		render();
		openPanel();
		expect(panel().classList.contains('_atBottom')).toBe(true);
		expect(panel().style.maxHeight).toBe(`${381 - 8}px`);
		expect(panel().style.overflowY).toBe('auto');
	});

	it('stays below and caps the list when there is more room below', () => {
		field = { top: 100, bottom: 140 };
		natural = 2417;
		render();
		openPanel();
		expect(panel().classList.contains('_atBottom')).toBe(false);
		expect(panel().style.maxHeight).toBe(`${746 - 140 - 8}px`);
	});

	it('leaves a list that fits below alone', () => {
		field = { top: 100, bottom: 140 };
		natural = 200;
		render();
		openPanel();
		expect(panel().classList.contains('_atBottom')).toBe(false);
		expect(panel().style.maxHeight).toBe('');
	});

	// ADZ-1432 / ADZ-1449: a wizard field low in the window opened its list upward over the
	// section above, or downward over the sticky Continue bar.
	describe('openBelow and listBottomGap', () => {
		let scrollTop = 0;
		beforeEach(() => {
			scrollTop = 0;
			container.style.overflowY = 'auto';
			Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2000 });
			Object.defineProperty(container, 'clientHeight', { configurable: true, value: 746 });
			Object.defineProperty(container, 'scrollTop', {
				configurable: true,
				get: () => scrollTop,
				set: (v: number) => {
					scrollTop = v;
				},
			});
		});

		it('without openBelow still flips above (old behaviour kept)', () => {
			field = { top: 560, bottom: 600 };
			natural = 245;
			render();
			openPanel();
			expect(panel().classList.contains('_atBottom')).toBe(true);
			expect(scrollTop).toBe(0);
		});

		it('scrolls the page up to make room, then opens below', () => {
			properties = serverSearchedProperties({ openBelow: true });
			field = { top: 560, bottom: 600 };
			natural = 245;
			render();
			openPanel();
			// room below was 746 - 600 - 8 = 138; the list needs 245
			expect(scrollTop).toBe(245 - 138);
			field = { top: 560 - 107, bottom: 600 - 107 };
			act(() => {
				window.dispatchEvent(new Event('scroll'));
			});
			expect(panel().classList.contains('_atBottom')).toBe(false);
			expect(panel().style.maxHeight).toBe('');
		});

		it('does not close on the mouse leave its own scroll caused', () => {
			properties = serverSearchedProperties({ openBelow: true, closeOnMouseLeave: true });
			field = { top: 560, bottom: 600 };
			natural = 245;
			render();
			openPanel();
			expect(scrollTop).toBeGreaterThan(0);
			const wrapper = container.querySelector('.compDropdown')!;
			act(() => {
				wrapper.dispatchEvent(
					new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
				);
				jest.advanceTimersByTime(500);
			});
			expect(document.querySelector('._dropdownContainer')).not.toBeNull();
		});

		it('keeps listBottomGap free under the list', () => {
			properties = serverSearchedProperties({ openBelow: true, listBottomGap: 72 });
			field = { top: 100, bottom: 140 };
			natural = 2417;
			Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 746 });
			render();
			openPanel();
			expect(panel().classList.contains('_atBottom')).toBe(false);
			expect(panel().style.maxHeight).toBe(`${746 - 140 - 72}px`);
		});

		it('lengthens a page that cannot scroll far enough with a spacer under the field', () => {
			properties = serverSearchedProperties({ openBelow: true });
			Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 800 });
			field = { top: 650, bottom: 690 };
			natural = 245;
			render();
			openPanel();
			// room below 746 - 690 - 8 = 48, need 197; the page could scroll 54 only, so the
			// spacer adds the missing 143 in the flow, after the field in its container
			const spacer = document.querySelector<HTMLElement>('._dropdownRoomSpacer');
			expect(spacer).not.toBeNull();
			expect(spacer!.style.height).toBe(`${197 - 54}px`);
			expect(spacer!.parentElement).toBe(container);
			act(() => {
				controlInput().blur();
			});
			expect(document.querySelector('._dropdownRoomSpacer')).toBeNull();
		});

		it('opens above only when no usable room can be made below', () => {
			properties = serverSearchedProperties({ openBelow: true });
			Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 746 });
			field = { top: 650, bottom: 690 };
			natural = 245;
			render();
			openPanel();
			expect(scrollTop).toBe(0);
			expect(panel().classList.contains('_atBottom')).toBe(true);
		});
	});
});

describe('focusSearchOnOpen', () => {
	it('puts the cursor in the search box when the list opens', () => {
		properties = serverSearchedProperties({ focusSearchOnOpen: true, searchLabel: 'Search' });
		render();
		openPanel();
		const box = document.querySelector<HTMLInputElement>('._dropdownSearchBox');
		expect(box).not.toBeNull();
		expect(document.activeElement).toBe(box);
		expect(box!.placeholder).toBe('Search');
		// the list stays open although the control's own input lost the focus
		expect(optionLabels()).toEqual(['CLIENT A', 'Fincity', 'RajaAvinash']);
	});

	it('leaves the focus on the control by default', () => {
		render();
		openPanel();
		expect(document.activeElement).toBe(controlInput());
	});

	it('still navigates with the arrow keys from the search box', () => {
		properties = serverSearchedProperties({ focusSearchOnOpen: true });
		render();
		openPanel();
		const box = document.querySelector<HTMLInputElement>('._dropdownSearchBox')!;
		act(() => {
			box.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }));
		});
		expect(hoveredLabels()).toEqual(['CLIENT A']);
	});
});

describe('child as the option row template', () => {
	const ACCOUNTS = [
		{ code: 'A1', name: 'Cityville', ext: '852565919728055' },
		{ code: 'A2', name: 'Raja IRA', ext: '1061033056474626' },
	];

	function renderWithChild(dataProperty?: any) {
		const props = propsFor(pageDefinition);
		props.definition.children = { rowTpl: true };
		if (dataProperty) props.definition.properties = { data: dataProperty };
		act(() => root.render(<Dropdown {...props} />));
	}

	const childRows = () =>
		Array.from(document.querySelectorAll('._dropdownItem ._childRow')).map(e => e.textContent);

	beforeEach(() => {
		properties = serverSearchedProperties({
			data: ACCOUNTS,
			onSearch: undefined,
			selectionOptionTickType: 'TICK',
		});
	});

	it('allows exactly one child in the editor', () => {
		expect(dropdownDescriptor.allowedChildrenType?.get('')).toBe(1);
	});

	it('renders the child once per option, on that row of bound data', () => {
		renderWithChild({ location: { type: 'VALUE', value: 'Page.accounts' } });
		openPanel();
		expect(childRows()).toEqual(['rowTpl@Page.accounts[0]', 'rowTpl@Page.accounts[1]']);
		expect(document.querySelectorAll('._dropdownItemLabel')).toHaveLength(0);
	});

	it('mirrors literal data to a default-data path and points the rows there', () => {
		renderWithChild({ value: ACCOUNTS });
		openPanel();
		expect(storeValues.get('Store.defaultData.testpage.dd')).toBe(ACCOUNTS);
		expect(childRows()).toEqual([
			'rowTpl@Store.defaultData.testpage.dd[0]',
			'rowTpl@Store.defaultData.testpage.dd[1]',
		]);
	});

	it('mirrors data from an expression too, since a Parent path cannot extend one', () => {
		renderWithChild({
			location: { type: 'EXPRESSION', expression: 'Page.pxOpt ? Page.pxOpt : Page.pixels' },
		});
		openPanel();
		expect(storeValues.get('Store.defaultData.testpage.dd')).toBe(ACCOUNTS);
		expect(childRows()).toEqual([
			'rowTpl@Store.defaultData.testpage.dd[0]',
			'rowTpl@Store.defaultData.testpage.dd[1]',
		]);
	});

	it('keeps the row on its own data entry when a search filters the list', () => {
		renderWithChild({ location: { type: 'VALUE', value: 'Page.accounts' } });
		typeSearch('Raja');
		expect(childRows()).toEqual(['rowTpl@Page.accounts[1]']);
	});

	it('uses the key of object data as the row path', () => {
		properties = serverSearchedProperties({
			data: { a1: ACCOUNTS[0], a2: ACCOUNTS[1] },
			datatype: 'OBJECT_OF_OBJECTS',
			onSearch: undefined,
		});
		renderWithChild({ location: { type: 'VALUE', value: 'Page.accounts' } });
		openPanel();
		expect(childRows()).toEqual(['rowTpl@Page.accounts.a1', 'rowTpl@Page.accounts.a2']);
	});

	it('still selects the row on mouse down, and draws no tick of its own', () => {
		renderWithChild({ location: { type: 'VALUE', value: 'Page.accounts' } });
		openPanel();
		const rows = document.querySelectorAll('._dropdownItem');
		act(() => {
			rows[1].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		});
		expect(storeValues.get(SELECTION_PATH)).toBe('A2');
		expect(controlInput().value).toBe('Raja IRA');
		openPanel();
		expect(document.querySelector('._dropdownItem._selected ._childRow')).not.toBeNull();
		expect(document.querySelectorAll('._dropdownCheckIcon')).toHaveLength(0);
	});

	it('still selects with the arrow keys and Enter', () => {
		renderWithChild({ location: { type: 'VALUE', value: 'Page.accounts' } });
		openPanel();
		pressKey('ArrowDown');
		pressKey('Enter');
		expect(storeValues.get(SELECTION_PATH)).toBe('A1');
	});

	it('renders the label rows as before without a child', () => {
		render();
		openPanel();
		expect(optionLabels()).toEqual(['Cityville', 'Raja IRA']);
		expect(document.querySelectorAll('._childRow')).toHaveLength(0);
	});
});

// ── a Dropdown whose row moved in a repeater ─────────────────────────────────

/**
 * Reported on leadzump addProduct (QA-0087): the duplicate-deal rules repeater re-sorts
 * after every save, so a row's Dropdown is re-rendered with its binding at another index.
 * The subscription effect did not return the listener's remover, so the listener on the
 * OLD index stayed alive and the row kept showing whatever row now sat there: editing
 * rule 2 painted rules 3 and 4 (both had passed through index 1) with rule 2's values.
 */
describe('binding path that moves to another index', () => {
	function renderBoundTo(path: string) {
		const props = propsFor(pageDefinition);
		props.definition.bindingPath = { type: 'VALUE', value: path };
		act(() => root.render(<Dropdown {...props} />));
	}

	beforeEach(() => {
		properties = serverSearchedProperties({ isSearchable: false, onSearch: undefined });
	});

	it('stops listening on the old path once the binding moves', () => {
		storeValues.set('Page.rows[1].pick', 'FIN');
		storeValues.set('Page.rows[2].pick', 'CLIA');
		renderBoundTo('Page.rows[1].pick');
		expect(controlInput().value).toBe('Fincity');

		renderBoundTo('Page.rows[2].pick');
		expect(controlInput().value).toBe('CLIENT A');
		expect(listeners.has('Page.rows[1].pick')).toBe(false);
	});

	it('does not show the value written to the row that now holds its old index', () => {
		storeValues.set('Page.rows[1].pick', 'FIN');
		storeValues.set('Page.rows[2].pick', 'CLIA');
		renderBoundTo('Page.rows[1].pick');
		renderBoundTo('Page.rows[2].pick');

		act(() => {
			storeValues.set('Page.rows[1].pick', 'RAJAA');
			listeners.get('Page.rows[1].pick')?.('Page.rows[1].pick', 'RAJAA');
		});
		expect(controlInput().value).toBe('CLIENT A');
	});
});

describe('accessible name (opt-in)', () => {
	beforeEach(() => {
		properties = serverSearchedProperties({ isSearchable: false, onSearch: undefined });
	});

	it('adds no aria-label by default', () => {
		render();
		expect(controlInput().hasAttribute('aria-label')).toBe(false);
	});

	it('names the input with accessibleName', () => {
		properties = { ...properties, accessibleName: 'Instagram account' };
		render();
		expect(controlInput().getAttribute('aria-label')).toBe('Instagram account');
	});
});

describe('announced as a dropdown (combobox + listbox)', () => {
	beforeEach(() => {
		properties = serverSearchedProperties({ isSearchable: false, onSearch: undefined });
	});

	function listbox(): HTMLElement {
		const el = document.querySelector<HTMLElement>('[role=listbox]');
		if (!el) throw new Error('no listbox rendered');
		return el;
	}

	it('marks the input as a collapsed combobox that pops up a listbox', () => {
		render();
		const input = controlInput();
		expect(input.getAttribute('role')).toBe('combobox');
		expect(input.getAttribute('aria-haspopup')).toBe('listbox');
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(input.getAttribute('aria-controls')).toBeTruthy();
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
	});

	it('is expanded while the list is open, and the list is the one it controls', () => {
		render();
		openPanel();
		const input = controlInput();
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(listbox().id).toBe(input.getAttribute('aria-controls'));
		expect(listbox().hasAttribute('aria-multiselectable')).toBe(false);
		const options = listbox().querySelectorAll('[role=option]');
		expect(options).toHaveLength(3);
		options.forEach(o => expect(o.id).toBeTruthy());
	});

	it('reports the selected option with aria-selected', () => {
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		openPanel();
		const selected = Array.from(listbox().querySelectorAll('[aria-selected=true]')).map(e =>
			e.textContent?.trim(),
		);
		expect(selected).toEqual(['Fincity']);
		expect(listbox().querySelectorAll('[aria-selected=false]')).toHaveLength(2);
	});

	it('points aria-activedescendant at the option the arrow keys reach', () => {
		render();
		pressKey('ArrowDown');
		pressKey('ArrowDown');
		const input = controlInput();
		const activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(document.getElementById(activeId!)?.textContent?.trim()).toBe('Fincity');
	});

	it('goes back to collapsed on Escape', () => {
		render();
		openPanel();
		pressKey('Escape');
		const input = controlInput();
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
		expect(document.querySelector('[role=listbox]')).toBeNull();
	});

	it('marks a multi-select list as multiselectable', () => {
		properties = { ...properties, isMultiSelect: true };
		render();
		openPanel();
		expect(listbox().getAttribute('aria-multiselectable')).toBe('true');
	});
});

describe('disabled options (opt-in)', () => {
	const USED = [
		{ code: 'CLIA', name: 'CLIENT A' },
		{ code: 'FIN', name: 'Fincity', used: true },
		{ code: 'RAJAA', name: 'RajaAvinash' },
	];

	beforeEach(() => {
		properties = serverSearchedProperties({
			isSearchable: false,
			onSearch: undefined,
			data: USED,
		});
	});

	function item(label: string): HTMLElement {
		const el = Array.from(document.querySelectorAll<HTMLElement>('._dropdownItem')).find(
			e => e.textContent?.trim() === label,
		);
		if (!el) throw new Error(`no option ${label}`);
		return el;
	}

	// A real click reaches the row with the mouse inside the panel, which keeps the
	// window mousedown handler from taking it as a click outside.
	function mouseDown(label: string) {
		act(() => {
			item(label).dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
			);
		});
		act(() => {
			item(label).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		});
	}

	it('disables nothing by default, even with a truthy field in the data', () => {
		render();
		openPanel();
		expect(document.querySelectorAll('._dropdownItem._disabled')).toHaveLength(0);
		expect(document.querySelectorAll('[aria-disabled]')).toHaveLength(0);
		mouseDown('Fincity');
		expect(storeValues.get(SELECTION_PATH)).toBe('FIN');
	});

	it('greys and marks the option whose disabledOptionKey is truthy', () => {
		properties = { ...properties, disabledOptionKey: 'used' };
		render();
		openPanel();
		expect(item('Fincity').classList.contains('_disabled')).toBe(true);
		expect(item('Fincity').getAttribute('aria-disabled')).toBe('true');
		expect(item('CLIENT A').classList.contains('_disabled')).toBe(false);
		expect(item('CLIENT A').hasAttribute('aria-disabled')).toBe(false);
	});

	it('does not select a disabled option on click, but still selects the others', () => {
		properties = { ...properties, disabledOptionKey: 'used' };
		render();
		openPanel();
		mouseDown('Fincity');
		expect(storeValues.get(SELECTION_PATH)).toBeUndefined();
		mouseDown('RajaAvinash');
		expect(storeValues.get(SELECTION_PATH)).toBe('RAJAA');
	});

	it('skips a disabled option with the arrow keys, both ways', () => {
		properties = { ...properties, disabledOptionKey: 'used' };
		render();
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual(['RajaAvinash']);
		pressKey('ArrowUp');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
		pressKey('Enter');
		expect(storeValues.get(SELECTION_PATH)).toBe('CLIA');
	});

	it('wraps past a disabled last option', () => {
		properties = {
			...properties,
			data: [
				{ code: 'CLIA', name: 'CLIENT A' },
				{ code: 'FIN', name: 'Fincity', used: true },
			],
			disabledOptionKey: 'used',
		};
		render();
		pressKey('ArrowUp');
		expect(hoveredLabels()).toEqual(['CLIENT A']);
	});

	it('hovers nothing when every option is disabled', () => {
		properties = { ...properties, disabledOptionValues: ['CLIA', 'FIN', 'RAJAA'] };
		render();
		pressKey('ArrowDown');
		expect(hoveredLabels()).toEqual([]);
		pressKey('Enter');
		expect(storeValues.get(SELECTION_PATH)).toBeUndefined();
	});

	it('does not highlight a disabled option under the mouse', () => {
		properties = { ...properties, disabledOptionKey: 'used' };
		render();
		openPanel();
		act(() => {
			item('Fincity').dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
			);
		});
		expect(hoveredLabels()).toEqual([]);
	});

	it('disables by selection value with disabledOptionValues, a list or one value', () => {
		properties = { ...properties, disabledOptionValues: ['FIN', 'RAJAA'] };
		render();
		openPanel();
		expect(
			Array.from(document.querySelectorAll('[aria-disabled=true]')).map(e =>
				e.textContent?.trim(),
			),
		).toEqual(['Fincity', 'RajaAvinash']);

		properties = { ...properties, disabledOptionValues: 'CLIA' };
		render();
		expect(
			Array.from(document.querySelectorAll('[aria-disabled=true]')).map(e =>
				e.textContent?.trim(),
			),
		).toEqual(['CLIENT A']);
	});

	it('works on a list of strings through disabledOptionValues', () => {
		properties = {
			...properties,
			data: ['Exotel', 'TeleCMI', 'Ozonetel'],
			datatype: 'LIST_OF_STRINGS',
			uniqueKeyType: 'KEY',
			selectionType: 'KEY',
			labelKeyType: 'OBJECT',
			disabledOptionValues: ['TeleCMI'],
		};
		render();
		openPanel();
		expect(item('TeleCMI').getAttribute('aria-disabled')).toBe('true');
		mouseDown('TeleCMI');
		expect(storeValues.get(SELECTION_PATH)).toBeUndefined();
		mouseDown('Ozonetel');
		expect(storeValues.get(SELECTION_PATH)).toBe('Ozonetel');
	});

	it('still shows the label of a selection that is disabled', () => {
		properties = { ...properties, disabledOptionKey: 'used' };
		storeValues.set(SELECTION_PATH, 'FIN');
		render();
		expect(controlInput().value).toBe('Fincity');
	});
});

describe('closeOnSelect (opt-in)', () => {
	beforeEach(() => {
		properties = serverSearchedProperties({ isSearchable: false, onSearch: undefined });
	});

	function mouseDown(label: string) {
		const el = Array.from(document.querySelectorAll<HTMLElement>('._dropdownItem')).find(
			e => e.textContent?.trim() === label,
		);
		if (!el) throw new Error(`no option ${label}`);
		act(() => {
			el.dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
			);
		});
		act(() => {
			el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		});
	}

	it('closes the list after a pick by default (old behaviour)', () => {
		render();
		openPanel();
		mouseDown('Fincity');
		expect(storeValues.get(SELECTION_PATH)).toBe('FIN');
		expect(optionLabels()).toEqual([]);
	});

	it('keeps the list open after a pick when closeOnSelect is false', () => {
		properties = { ...properties, closeOnSelect: false };
		render();
		openPanel();
		mouseDown('Fincity');
		expect(storeValues.get(SELECTION_PATH)).toBe('FIN');
		expect(optionLabels()).toEqual(['CLIENT A', 'Fincity', 'RajaAvinash']);
		mouseDown('RajaAvinash');
		expect(storeValues.get(SELECTION_PATH)).toBe('RAJAA');
		expect(optionLabels().length).toBe(3);
	});

	it('still closes on Escape when closeOnSelect is false', () => {
		properties = { ...properties, closeOnSelect: false };
		render();
		openPanel();
		mouseDown('Fincity');
		pressKey('Escape');
		expect(optionLabels()).toEqual([]);
	});
});

// ADZ-1665: an ad account filter with 22 accounts was a list as narrow as its field,
// each account on 2 to 3 lines and its ID cut off. The props below are all opt-in.
describe('wide, grouped one-line list (opt-in)', () => {
	const ACCOUNTS = [
		{ _id: 'a1', n: 'Cityville by Fincity', id: '852565919728055', g: 'Meta' },
		{ _id: 'a2', n: 'Modlix Dev', id: '108-212-2237', g: 'Google' },
		{ _id: 'a3', n: 'Purva Prepaid', id: '1234133553808527', g: 'Meta' },
		{ _id: 'a4', n: 'CoEvolve Misty Shores', id: '934-405-3819', g: 'Google' },
	];

	function accountProps(overrides: Record<string, any> = {}) {
		return serverSearchedProperties({
			data: ACCOUNTS,
			uniqueKey: '_id',
			selectionKey: '_id',
			labelKey: 'n',
			onSearch: undefined,
			...overrides,
		});
	}

	const rows = () => Array.from(document.querySelectorAll<HTMLElement>('._dropdownItem'));
	const labels = () =>
		rows().map(r => r.querySelector('._dropdownItemLabel')?.textContent?.trim() ?? '');
	const headers = () =>
		Array.from(document.querySelectorAll('._dropdownGroupHeader')).map(e => e.textContent);
	const panel = () => document.querySelector<HTMLElement>('._dropdownContainer')!;

	it('keeps the old list without the new props', () => {
		properties = accountProps();
		render();
		openPanel();
		expect(panel().classList.contains('_richList')).toBe(false);
		expect(headers()).toEqual([]);
		expect(document.querySelector('._dropdownItemSecondary')).toBeNull();
		expect(document.querySelector('._dropdownTickSlot')).toBeNull();
		expect(labels()).toEqual(ACCOUNTS.map(a => a.n));
		expect(panel().style.width).toBe('');
		expect(panel().style.left).toBe('');
		typeSearch('zzz');
		expect(document.querySelector('._dropdownNoMatch')).toBeNull();
		// the ID is not searched without optionSecondaryKey
		typeSearch('934-405');
		expect(labels()).toEqual([]);
	});

	it('groups options under "<group> · <count>" headers, in first-seen order', () => {
		properties = accountProps({ optionGroupKey: 'g' });
		render();
		openPanel();
		expect(headers()).toEqual(['Meta · 2', 'Google · 2']);
		expect(labels()).toEqual([
			'Cityville by Fincity',
			'Purva Prepaid',
			'Modlix Dev',
			'CoEvolve Misty Shores',
		]);
		// the headers are not options
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(4);
	});

	it('walks the grouped order with the arrow keys', () => {
		properties = accountProps({ optionGroupKey: 'g' });
		render();
		openPanel();
		pressKey('ArrowDown');
		pressKey('ArrowDown');
		expect(
			document.querySelector('._dropdownItem._hover ._dropdownItemLabel')?.textContent,
		).toBe('Purva Prepaid');
	});

	it('counts only the options a search leaves, and drops empty groups', () => {
		properties = accountProps({ optionGroupKey: 'g' });
		render();
		typeSearch('purva');
		expect(headers()).toEqual(['Meta · 1']);
		expect(labels()).toEqual(['Purva Prepaid']);
	});

	it('shows the secondary text on the right and searches it too', () => {
		properties = accountProps({ optionSecondaryKey: 'id' });
		render();
		openPanel();
		expect(panel().classList.contains('_richList')).toBe(true);
		expect(
			Array.from(document.querySelectorAll('._dropdownItemSecondary')).map(e => e.textContent),
		).toEqual(ACCOUNTS.map(a => a.id));
		typeSearch('934-405');
		expect(labels()).toEqual(['CoEvolve Misty Shores']);
		typeSearch('cityville');
		expect(labels()).toEqual(['Cityville by Fincity']);
	});

	it('bolds the matching letters with highlightSearchMatch, case-insensitive', () => {
		properties = accountProps({ optionSecondaryKey: 'id', highlightSearchMatch: true });
		render();
		typeSearch('PURVA');
		expect(
			Array.from(document.querySelectorAll('._dropdownMatch')).map(e => e.textContent),
		).toEqual(['Purva']);
		expect(labels()).toEqual(['Purva Prepaid']);
		typeSearch('108-212');
		expect(document.querySelector('._dropdownItemSecondary ._dropdownMatch')?.textContent).toBe(
			'108-212',
		);
	});

	it('does not bold anything without highlightSearchMatch', () => {
		properties = accountProps({ optionSecondaryKey: 'id' });
		render();
		typeSearch('purva');
		expect(document.querySelector('._dropdownMatch')).toBeNull();
	});

	it('says nothing matches with noMatchText, the typed text in place of {search}', () => {
		properties = accountProps({ noMatchText: 'No accounts match "{search}"' });
		render();
		openPanel();
		expect(document.querySelector('._dropdownNoMatch')).toBeNull();
		typeSearch('zzz');
		expect(document.querySelector('._dropdownNoMatch')?.textContent).toBe(
			'No accounts match "zzz"',
		);
		typeSearch('');
		expect(document.querySelector('._dropdownNoMatch')).toBeNull();
		expect(labels()).toHaveLength(4);
	});

	it('marks the picked option and keeps a tick slot on every row', () => {
		storeValues.set(SELECTION_PATH, 'a3');
		properties = accountProps({ optionSecondaryKey: 'id', selectionOptionTickType: 'TICK' });
		render();
		openPanel();
		const picked = rows().find(r => r.classList.contains('_selected'))!;
		expect(picked.querySelector('._dropdownItemLabel')?.textContent).toBe('Purva Prepaid');
		expect(picked.querySelector('._dropdownTickSlot ._dropdownCheckIcon')).not.toBeNull();
		expect(document.querySelectorAll('._dropdownTickSlot')).toHaveLength(4);
		expect(document.querySelectorAll('._dropdownCheckIcon')).toHaveLength(1);
	});

	describe('listWidth and listAlign', () => {
		const originalRect = HTMLElement.prototype.getBoundingClientRect;
		const originalWidth = window.innerWidth;
		let field = { left: 900, right: 1045 };

		beforeEach(() => {
			HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
				const r = this.classList.contains('compDropdown')
					? { top: 100, bottom: 140, left: field.left, right: field.right }
					: { top: 0, bottom: 0, left: 0, right: 0 };
				return {
					...r,
					x: r.left,
					y: r.top,
					width: r.right - r.left,
					height: r.bottom - r.top,
					toJSON: () => r,
				} as DOMRect;
			};
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
		});

		afterEach(() => {
			HTMLElement.prototype.getBoundingClientRect = originalRect;
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
		});

		it('is as wide as the field without listWidth', () => {
			properties = accountProps();
			render();
			openPanel();
			expect(panel().style.width).toBe('');
		});

		it('opens 420px wide, left edges lined up by default', () => {
			field = { left: 900, right: 1045 };
			properties = accountProps({ listWidth: 420 });
			render();
			openPanel();
			expect(panel().style.width).toBe('420px');
			expect(panel().style.left).toBe('0px');
		});

		it('lines up the right edges with listAlign RIGHT', () => {
			field = { left: 900, right: 1045 };
			properties = accountProps({ listWidth: 420, listAlign: 'RIGHT' });
			render();
			openPanel();
			expect(panel().style.width).toBe('420px');
			expect(panel().style.left).toBe(`${145 - 420}px`);
		});

		it('stays inside a phone-wide window', () => {
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
			field = { left: 200, right: 374 };
			properties = accountProps({ listWidth: 420, listAlign: 'RIGHT' });
			render();
			openPanel();
			expect(panel().style.width).toBe(`${390 - 16}px`);
			// the list starts 8px from the window's left edge
			expect(panel().style.left).toBe(`${8 - 200}px`);
		});

		it('is never narrower than the field', () => {
			field = { left: 100, right: 700 };
			properties = accountProps({ listWidth: 420, listAlign: 'RIGHT' });
			render();
			openPanel();
			expect(panel().style.width).toBe('600px');
			expect(panel().style.left).toBe('0px');
		});
	});
});

describe('splitSearchMatches', () => {
	const { splitSearchMatches } = require('../Dropdown');
	it('splits out every case-insensitive match', () => {
		expect(splitSearchMatches('Purva Sparkling Purva', 'purva')).toEqual([
			{ text: 'Purva', match: true },
			{ text: ' Sparkling ', match: false },
			{ text: 'Purva', match: true },
		]);
	});
	it('returns the text plain for an empty-matching or invalid pattern', () => {
		expect(splitSearchMatches('abc', 'x*')).toEqual([{ text: 'abc', match: false }]);
		expect(splitSearchMatches('a(b', '(')).toEqual([{ text: 'a(b', match: false }]);
	});
});
