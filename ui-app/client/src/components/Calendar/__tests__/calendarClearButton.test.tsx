/**
 * Opt-in clear (X) inside a Calendar box (showClearButton, CXZ-1791). A From and a To date
 * filter each need their own X, for a typed date and for a picked one, and it must clear only
 * that box. Off by default: the box keeps its dropdown arrow and shows no X.
 *
 * REAL: LazyCalendar, CommonInputText, the date formatting and validateRangesAndSetData.
 * STUBBED: the store (synchronous listeners, as the real one), runEvent, style processing,
 * validation, the calendar map / dropdown and the helper overlays.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const runEventMock = jest.fn().mockResolvedValue(undefined);
jest.mock('../../util/runEvent', () => ({
	runEvent: (...args: any[]) => runEventMock(...args),
}));

const listeners = new Map<string, Set<(path: string, value: any) => void>>();
const storeValues = new Map<string, any>();

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({}) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListener: () => () => {},
	addListenerAndCallImmediately: (
		_pageName: string,
		callback: (path: string, value: any) => void,
		path: string,
	) => {
		if (!listeners.has(path)) listeners.set(path, new Set());
		listeners.get(path)!.add(callback);
		callback(path, storeValues.get(path));
		return () => listeners.get(path)?.delete(callback);
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	getDataFromPath: (path: string) => (path ? storeValues.get(path) : undefined),
	setData: (path: string, value: any) => {
		if (value === undefined) storeValues.delete(path);
		else storeValues.set(path, value);
		listeners.get(path)?.forEach(cb => cb(path, value));
	},
}));

jest.mock('../../../context/TempStore', () => ({ makeTempPath: (p: string) => `temp.${p}` }));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../../util/validationProcessor', () => ({ validate: () => [] }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../components/CalendarMap', () => ({ CalendarMap: () => null }));
jest.mock('../components/CalendarDropdown', () => ({ CalendarDropdown: () => null }));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'cal', properties, stylePropertiesWithPseudoStates: {} }),
}));

// Imported after the mocks.
import CalendarComponent from '../LazyCalendar';
import { setData } from '../../../context/StoreContext';

const FROM = 'Page.from';
const TO = 'Page.to';
const CHANGE_EVENT = 'datesChanged';
const PAGE_DEFINITION = {
	name: 'testpage',
	translations: {},
	eventFunctions: { [CHANGE_EVENT]: { name: 'loadStats', steps: {} } },
};

let container: HTMLDivElement;
let roots: Root[];

function calendarProps(overrides: Record<string, any> = {}) {
	return {
		dateType: 'startDate',
		storageFormat: 'YYYY-MM-DD',
		displayDateFormat: 'DD/MM/YYYY',
		multipleDateSeparator: ',',
		calendarDesignType: '_smallCalendar',
		designType: '_outlined',
		onChange: CHANGE_EVENT,
		...overrides,
	};
}

/** Renders one Calendar per binding path (From and To side by side), all with the same props. */
function render(props: Record<string, any>, paths: string[] = [FROM, TO]) {
	properties = props;
	roots = paths.map(path => {
		const host = document.createElement('div');
		host.dataset.path = path;
		container.appendChild(host);
		const root = createRoot(host);
		act(() =>
			root.render(
				<CalendarComponent
					definition={{
						key: `cal-${path}`,
						name: path,
						type: 'Calendar',
						bindingPath: { type: 'VALUE', value: path },
					}}
					pageDefinition={PAGE_DEFINITION as any}
					locationHistory={[]}
					context={{ pageName: 'testpage' } as any}
				/>,
			),
		);
		return root;
	});
}

function box(path: string): HTMLElement {
	const el = container.querySelector<HTMLElement>(`[data-path="${path}"]`);
	if (!el) throw new Error(`no box for ${path}`);
	return el;
}

function input(path: string): HTMLInputElement {
	return box(path).querySelector<HTMLInputElement>('input')!;
}

function clearIcon(path: string): HTMLElement | null {
	return box(path).querySelector<HTMLElement>('._clearText');
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

function typeInto(path: string, text: string) {
	const el = input(path);
	act(() => {
		valueSetter.call(el, text);
		el.dispatchEvent(new Event('input', { bubbles: true }));
	});
}

function pick(path: string, storageValue: string) {
	act(() => {
		setData(path, storageValue);
	});
}

function clickClear(path: string) {
	const icon = clearIcon(path);
	if (!icon) throw new Error(`no clear icon in ${path}`);
	act(() => icon.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

beforeEach(() => {
	listeners.clear();
	storeValues.clear();
	runEventMock.mockClear();
	container = document.createElement('div');
	document.body.appendChild(container);
});

afterEach(() => {
	act(() => roots.forEach(r => r.unmount()));
	container.remove();
});

describe('Calendar showClearButton', () => {
	test('off by default: the arrow stays and no X is shown, even with a date', () => {
		render(calendarProps());
		pick(FROM, '2026-11-29');
		expect(input(FROM).value).toBe('29/11/2026');
		expect(clearIcon(FROM)).toBeNull();
		expect(box(FROM).querySelector('.fa-angle-down')).not.toBeNull();
	});

	test('on: no X while empty, and the arrow is not drawn', () => {
		render(calendarProps({ showClearButton: true }));
		expect(clearIcon(FROM)).toBeNull();
		expect(clearIcon(TO)).toBeNull();
		expect(box(FROM).querySelector('.fa-angle-down')).toBeNull();
	});

	test('a picked From date gets an X that clears From only and runs On Change', () => {
		render(calendarProps({ showClearButton: true }));
		pick(FROM, '2026-11-29');
		pick(TO, '2026-11-30');
		expect(clearIcon(FROM)).not.toBeNull();
		expect(clearIcon(TO)).not.toBeNull();

		clickClear(FROM);

		expect(storeValues.has(FROM)).toBe(false);
		expect(storeValues.get(TO)).toBe('2026-11-30');
		expect(input(FROM).value).toBe('');
		expect(input(TO).value).toBe('30/11/2026');
		expect(clearIcon(FROM)).toBeNull();
		expect(clearIcon(TO)).not.toBeNull();
		expect(runEventMock).toHaveBeenCalledTimes(1);
	});

	test('a typed To date gets an X that clears To only', () => {
		render(calendarProps({ showClearButton: true }));
		pick(FROM, '2026-11-01');
		typeInto(TO, '30/11/2026');
		expect(storeValues.get(TO)).toBe('2026-11-30');
		expect(clearIcon(TO)).not.toBeNull();
		runEventMock.mockClear();

		clickClear(TO);

		expect(storeValues.has(TO)).toBe(false);
		expect(storeValues.get(FROM)).toBe('2026-11-01');
		expect(input(TO).value).toBe('');
		expect(runEventMock).toHaveBeenCalledTimes(1);
	});

	test('half typed text that is not a date yet is cleared too', () => {
		render(calendarProps({ showClearButton: true }), [FROM]);
		typeInto(FROM, '29/11');
		expect(storeValues.has(FROM)).toBe(false);
		expect(input(FROM).value).toBe('29/11');
		expect(clearIcon(FROM)).not.toBeNull();

		clickClear(FROM);

		expect(input(FROM).value).toBe('');
		expect(clearIcon(FROM)).toBeNull();
	});

	test('read only boxes show no X', () => {
		render(calendarProps({ showClearButton: true, readOnly: true }), [FROM]);
		pick(FROM, '2026-11-29');
		expect(clearIcon(FROM)).toBeNull();
	});
});
