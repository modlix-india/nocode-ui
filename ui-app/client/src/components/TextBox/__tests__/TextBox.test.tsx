/**
 * TextBox with valueType 'number' must never rewrite what the user is typing while the box has
 * focus. It used to parse every keystroke and write the number back, so "12.30" became "12.3"
 * before the next digit (typing 12.3052 gave 12.352), "0.05" lost its zeros and a leading "-" was
 * wiped. With a numberFormat the box also reformatted on every keystroke and refused "-".
 *
 * REAL: the component and CommonInputText (the input type, its change, focus, blur and keydown
 * wiring). STUBBED: the store (synchronous listeners, as the real one), runEvent, style
 * processing, validation and the helper overlays.
 *
 * jsdom drops text that is not a valid number from a type="number" box, as Chrome does, but never
 * sets validity.badInput. typeInto sets it for that keystroke, the way Chrome reports a lone "-".
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

const listeners = new Map<string, Set<(path: string, value: any) => void>>();
const storeValues = new Map<string, any>();
const writes: Array<{ path: string; value: any; deleteKey?: boolean }> = [];

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
	setData: (path: string, value: any, _context?: string, deleteKey?: boolean) => {
		writes.push({ path, value, deleteKey });
		if (deleteKey && value === undefined) storeValues.delete(path);
		else storeValues.set(path, value);
		listeners.get(path)?.forEach(cb => cb(path, value));
	},
}));

jest.mock('../../../context/TempStore', () => ({ makeTempPath: (p: string) => `temp.${p}` }));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../../util/validationProcessor', () => ({ validate: () => [] }));
jest.mock('../TextBoxStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../../shortcuts/useComponentShortcut', () => ({
	useComponentShortcut: () => ({}),
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({
		key: 'tb',
		properties,
		stylePropertiesWithPseudoStates: {},
	}),
}));

// Imported after the mocks. The default export is the Component descriptor.
import textBoxDescriptor from '../TextBox';
import { setData } from '../../../context/StoreContext';

const TextBox = textBoxDescriptor.component as React.FunctionComponent<any>;

// ── fixtures ─────────────────────────────────────────────────────────────────

const PATH = 'Page.amount';
const CHANGE_EVENT = 'onAmountChange';

const PAGE_DEFINITION = {
	name: 'testpage',
	translations: {},
	eventFunctions: { [CHANGE_EVENT]: { name: 'amountChanged', steps: {} } },
};

function numberProperties(overrides: Record<string, any> = {}) {
	return {
		valueType: 'number',
		numberType: 'DECIMAL',
		emptyValue: 'UNDEFINED',
		updateStoreImmediately: false,
		debounceTime: 0,
		removeKeyWhenEmpty: false,
		designType: '_default',
		onChange: CHANGE_EVENT,
		...overrides,
	};
}

let container: HTMLDivElement;
let root: Root;

function render(props: Record<string, any>) {
	properties = props;
	act(() =>
		root.render(
			<TextBox
				definition={{
					key: 'tb',
					name: 'amount',
					type: 'TextBox',
					bindingPath: { type: 'VALUE', value: PATH },
				}}
				pageDefinition={PAGE_DEFINITION}
				locationHistory={[]}
				context={{ pageName: 'testpage' }}
			/>,
		),
	);
}

function input(): HTMLInputElement {
	const el = container.querySelector<HTMLInputElement>('input');
	if (!el) throw new Error('no input rendered');
	return el;
}

function focus() {
	act(() => input().focus());
}

function blur() {
	act(() => input().blur());
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

/** Sets the box's text the way a keystroke does and returns what the box shows after it. */
function typeInto(text: string): string {
	const el = input();
	act(() => {
		valueSetter.call(el, text);
		const badInput = el.type === 'number' && text !== '' && el.value === '';
		if (badInput)
			Object.defineProperty(el, 'validity', {
				configurable: true,
				value: { badInput: true },
			});
		el.dispatchEvent(new Event('input', { bubbles: true }));
		if (badInput) delete (el as any).validity;
	});
	return input().value;
}

/** Types one character at a time; returns what the box showed after each one. */
function typeChars(text: string): string[] {
	const seen: string[] = [];
	for (let i = 1; i <= text.length; i++) seen.push(typeInto(text.substring(0, i)));
	return seen;
}

function writtenValues() {
	return writes.filter(w => w.path === PATH).map(w => w.value);
}

function expectOnlyNumbersStored() {
	for (const v of writtenValues()) expect(typeof v).toBe('number');
}

beforeEach(() => {
	listeners.clear();
	storeValues.clear();
	writes.length = 0;
	runEventMock.mockClear();
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	jest.useRealTimers();
});

// ── without numberFormat: a type="number" box ───────────────────────────────

describe.each([false, true])(
	'number box without numberFormat, updateStoreImmediately %s',
	updateStoreImmediately => {
		const props = (o: Record<string, any> = {}) =>
			numberProperties({ updateStoreImmediately, ...o });

		test('the box is type="number"', () => {
			render(props());
			expect(input().type).toBe('number');
		});

		test('typing 12.3052 keeps every digit, the trailing zero included', () => {
			render(props());
			focus();
			const seen = typeChars('12.3052');
			expect(seen[4]).toBe('12.30');
			expect(seen[5]).toBe('12.305');
			expect(input().value).toBe('12.3052');
			expect(storeValues.get(PATH)).toBe(updateStoreImmediately ? 12.3052 : undefined);
			blur();
			expect(storeValues.get(PATH)).toBe(12.3052);
			expect(input().value).toBe('12.3052');
			expectOnlyNumbersStored();
		});

		test('typing 0.05 keeps its zeros', () => {
			render(props());
			focus();
			const seen = typeChars('0.05');
			expect(seen[2]).toBe('0.0');
			expect(input().value).toBe('0.05');
			blur();
			expect(storeValues.get(PATH)).toBe(0.05);
			expectOnlyNumbersStored();
		});

		test('a leading "-" is not wiped and nothing is stored for it', () => {
			render(props());
			focus();
			typeInto('-');
			expect(writtenValues()).toEqual([]);
			typeChars('-33.86882');
			expect(input().value).toBe('-33.86882');
			blur();
			expect(storeValues.get(PATH)).toBe(-33.86882);
			expectOnlyNumbersStored();
		});

		test('"-" over a number keeps the last number in the store until blur', () => {
			storeValues.set(PATH, 5);
			render(props());
			expect(input().value).toBe('5');
			focus();
			typeInto('-');
			expect(storeValues.get(PATH)).toBe(5);
			blur();
			// The box is left empty, so the store is too.
			expect(storeValues.get(PATH)).toBeUndefined();
			expect(input().value).toBe('');
		});

		test('INTEGER refuses a decimal point', () => {
			render(props({ numberType: 'INTEGER' }));
			focus();
			typeChars('12');
			expect(typeInto('12.5')).toBe('12');
			const keydown = new KeyboardEvent('keydown', {
				key: '.',
				bubbles: true,
				cancelable: true,
			});
			act(() => {
				input().dispatchEvent(keydown);
			});
			expect(keydown.defaultPrevented).toBe(true);
			blur();
			expect(storeValues.get(PATH)).toBe(12);
			expectOnlyNumbersStored();
		});

		test('clearing stores the emptyValue', () => {
			render(props());
			focus();
			typeChars('5');
			typeInto('');
			expect(input().value).toBe('');
			if (updateStoreImmediately) {
				expect(writtenValues()).toEqual([5, undefined]);
			}
			blur();
			expect(input().value).toBe('');
			expect(storeValues.get(PATH)).toBeUndefined();
		});

		test('emptyValue ZERO: the box stays empty while focused and shows 0 after blur', () => {
			render(props({ emptyValue: 'ZERO' }));
			focus();
			typeChars('5');
			typeInto('');
			expect(input().value).toBe('');
			blur();
			expect(storeValues.get(PATH)).toBe(0);
			expect(input().value).toBe('0');
		});

		test('removeKeyWhenEmpty removes the key on clearing', () => {
			storeValues.set(PATH, 7);
			render(props({ removeKeyWhenEmpty: true }));
			focus();
			typeInto('');
			expect(writes[writes.length - 1]).toEqual({
				path: PATH,
				value: undefined,
				deleteKey: true,
			});
			expect(storeValues.has(PATH)).toBe(false);
		});

		test('blur shows the number: 12.30 becomes 12.3', () => {
			render(props());
			focus();
			typeChars('12.30');
			expect(input().value).toBe('12.30');
			blur();
			expect(input().value).toBe('12.3');
			expect(storeValues.get(PATH)).toBe(12.3);
		});

		test('the clear (x) button stores the emptyValue', () => {
			storeValues.set(PATH, 42);
			render(props());
			const clear = container.querySelector<HTMLElement>('._clearText');
			expect(clear).not.toBeNull();
			act(() => clear!.click());
			expect(storeValues.get(PATH)).toBeUndefined();
			expect(input().value).toBe('');
		});
	},
);

describe('number box, updateStoreImmediately', () => {
	test('stores each complete number and runs onChange for each', () => {
		render(numberProperties({ updateStoreImmediately: true }));
		focus();
		typeChars('12.30');
		// Nothing for "12.", which is still being typed; "12.30" stores 12.3 again.
		expect(writtenValues()).toEqual([1, 12, 12.3, 12.3]);
		expect(runEventMock).toHaveBeenCalledTimes(4);
	});

	test('debounceTime: one write of the number after the wait, the text untouched', () => {
		jest.useFakeTimers();
		render(numberProperties({ updateStoreImmediately: true, debounceTime: 300 }));
		focus();
		typeChars('12.30');
		expect(writtenValues()).toEqual([]);
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(writtenValues()).toEqual([12.3]);
		expect(input().value).toBe('12.30');
	});

	test('debounceTime: a debounced clear to undefined is stored', () => {
		jest.useFakeTimers();
		storeValues.set(PATH, 9);
		render(numberProperties({ updateStoreImmediately: true, debounceTime: 300 }));
		focus();
		typeInto('');
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(writtenValues()).toEqual([undefined]);
	});

	test('a different number written to the store while focused does show', () => {
		render(numberProperties({ updateStoreImmediately: true }));
		focus();
		typeChars('12.30');
		act(() => setData(PATH, 99, 'testpage'));
		expect(input().value).toBe('99');
	});
});

// ── with numberFormat: a type="text" box ────────────────────────────────────

describe.each([false, true])(
	'number box with numberFormat, updateStoreImmediately %s',
	updateStoreImmediately => {
		const props = (o: Record<string, any> = {}) =>
			numberProperties({ updateStoreImmediately, numberFormat: 'en-US', ...o });

		test('the box is type="text"', () => {
			render(props());
			expect(input().type).toBe('text');
		});

		test('en-US 1,234.50 is kept as typed and stored as 1234.5', () => {
			render(props());
			focus();
			const seen = typeChars('1,234.50');
			expect(seen).toEqual([
				'1',
				'1,',
				'1,2',
				'1,23',
				'1,234',
				'1,234.',
				'1,234.5',
				'1,234.50',
			]);
			expect(storeValues.get(PATH)).toBe(updateStoreImmediately ? 1234.5 : undefined);
			blur();
			expect(storeValues.get(PATH)).toBe(1234.5);
			expect(input().value).toBe('1,234.5');
			expectOnlyNumbersStored();
		});

		test('de-DE 1.234,50 is stored as 1234.5 and formatted on blur', () => {
			render(props({ numberFormat: 'de-DE' }));
			focus();
			typeChars('1.234,50');
			expect(input().value).toBe('1.234,50');
			blur();
			expect(storeValues.get(PATH)).toBe(1234.5);
			expect(input().value).toBe('1.234,5');
			expectOnlyNumbersStored();
		});

		test('trailing zeros after the decimal point can be typed: 12.305', () => {
			render(props());
			focus();
			const seen = typeChars('12.305');
			expect(seen[4]).toBe('12.30');
			expect(input().value).toBe('12.305');
			blur();
			expect(storeValues.get(PATH)).toBe(12.305);
		});

		test('typing 12.3052 keeps every digit while focused', () => {
			render(props());
			focus();
			typeChars('12.3052');
			expect(input().value).toBe('12.3052');
			blur();
			expect(storeValues.get(PATH)).toBe(12.3052);
		});

		test('0.05 keeps its zeros', () => {
			render(props());
			focus();
			const seen = typeChars('0.05');
			expect(seen).toEqual(['0', '0.', '0.0', '0.05']);
			blur();
			expect(storeValues.get(PATH)).toBe(0.05);
		});

		test('a leading "-" is accepted: -33.86882', () => {
			render(props());
			focus();
			const seen = typeChars('-33.86882');
			expect(seen[0]).toBe('-');
			expect(input().value).toBe('-33.86882');
			blur();
			expect(storeValues.get(PATH)).toBe(-33.86882);
			expectOnlyNumbersStored();
		});

		test('letters and a second decimal point are refused', () => {
			render(props());
			focus();
			typeChars('12.5');
			expect(typeInto('12.5a')).toBe('12.5');
			expect(typeInto('12.5.')).toBe('12.5');
			expect(typeInto('.')).toBe('12.5');
		});

		test('INTEGER refuses the decimal separator', () => {
			render(props({ numberType: 'INTEGER' }));
			focus();
			typeChars('1,234');
			expect(typeInto('1,234.')).toBe('1,234');
			blur();
			expect(storeValues.get(PATH)).toBe(1234);
		});

		test('de-DE INTEGER takes "." as grouping and refuses ","', () => {
			render(props({ numberFormat: 'de-DE', numberType: 'INTEGER' }));
			focus();
			typeChars('1.234');
			expect(typeInto('1.234,')).toBe('1.234');
			blur();
			expect(storeValues.get(PATH)).toBe(1234);
			expect(input().value).toBe('1.234');
		});

		test('clearing stores the emptyValue', () => {
			storeValues.set(PATH, 1234.5);
			render(props());
			expect(input().value).toBe('1,234.5');
			focus();
			typeInto('');
			blur();
			expect(storeValues.get(PATH)).toBeUndefined();
			expect(input().value).toBe('');
		});

		test('a stored number shows formatted, and editing it keeps the grouping', () => {
			storeValues.set(PATH, 1234.5);
			render(props());
			expect(input().value).toBe('1,234.5');
			focus();
			typeInto('1,234.56');
			expect(input().value).toBe('1,234.56');
			blur();
			expect(storeValues.get(PATH)).toBe(1234.56);
			expect(input().value).toBe('1,234.56');
		});

		test('a locale grouping with a space (fr-FR) can be edited', () => {
			storeValues.set(PATH, 1234.5);
			render(props({ numberFormat: 'fr-FR' }));
			const shown = input().value;
			expect(shown.replace(/\s/g, ' ')).toBe('1 234,5');
			focus();
			typeInto(shown + '6');
			blur();
			expect(storeValues.get(PATH)).toBe(1234.56);
		});
	},
);

describe('number box with numberFormat, store listener', () => {
	test('a value stored while not focused shows formatted', () => {
		render(numberProperties({ numberFormat: 'en-US' }));
		act(() => setData(PATH, 1234.5, 'testpage'));
		expect(input().value).toBe('1,234.5');
	});

	test('the echo of the typed number does not reformat the text', () => {
		render(numberProperties({ numberFormat: 'en-US', updateStoreImmediately: true }));
		focus();
		typeChars('1234.50');
		expect(storeValues.get(PATH)).toBe(1234.5);
		expect(input().value).toBe('1234.50');
		blur();
		expect(input().value).toBe('1,234.5');
	});
});

// ── a stored number is never shortened by being shown ───────────────────────
//
// Intl.NumberFormat shows at most 3 fraction digits by default: a stored 12.3052 showed as
// "12.305", and focusing then leaving the box stored 12.305.

describe.each([
	['en-US', '12.3052', '-33.86882', '1,234,567.891234'],
	['de-DE', '12,3052', '-33,86882', '1.234.567,891234'],
])('numberFormat %s, a stored number', (numberFormat, shown, negative, grouped) => {
	describe.each([false, true])('updateStoreImmediately %s', updateStoreImmediately => {
		const props = (o: Record<string, any> = {}) =>
			numberProperties({ updateStoreImmediately, numberFormat, ...o });

		test('shows every digit, and focus then blur stores nothing', () => {
			storeValues.set(PATH, 12.3052);
			render(props());
			expect(input().value).toBe(shown);
			focus();
			blur();
			expect(writtenValues()).toEqual([]);
			expect(runEventMock).not.toHaveBeenCalled();
			expect(storeValues.get(PATH)).toBe(12.3052);
			expect(input().value).toBe(shown);
		});

		test('keeps the grouping and the sign with every digit', () => {
			storeValues.set(PATH, -33.86882);
			render(props());
			expect(input().value).toBe(negative);
			act(() => setData(PATH, 1234567.891234, 'testpage'));
			expect(input().value).toBe(grouped);
			writes.length = 0;
			focus();
			blur();
			expect(writtenValues()).toEqual([]);
			expect(storeValues.get(PATH)).toBe(1234567.891234);
		});

		test('a digit typed and taken back again is not an edit', () => {
			storeValues.set(PATH, 12.3052);
			render(props());
			focus();
			typeInto(shown.slice(0, -1));
			if (!updateStoreImmediately) {
				typeInto(shown);
				blur();
				expect(writtenValues()).toEqual([]);
			} else {
				// The shortened number was stored while typing: the blur stores the box again.
				typeInto(shown);
				blur();
				expect(storeValues.get(PATH)).toBe(12.3052);
			}
			expect(input().value).toBe(shown);
		});

		test('an edit is still stored, with every digit shown after blur', () => {
			storeValues.set(PATH, 12.3052);
			render(props());
			focus();
			typeInto(shown + '7');
			blur();
			expect(storeValues.get(PATH)).toBe(12.30527);
			expect(input().value).toBe(shown + '7');
		});
	});
});

describe('a blur that follows no edit', () => {
	test('plain number box: focus then blur stores nothing', () => {
		storeValues.set(PATH, 12.3052);
		render(numberProperties());
		expect(input().value).toBe('12.3052');
		focus();
		blur();
		expect(writtenValues()).toEqual([]);
	});

	test('emptyValue ZERO: an untouched empty box stays unset', () => {
		render(numberProperties({ emptyValue: 'ZERO', numberFormat: 'en-US' }));
		focus();
		blur();
		expect(writtenValues()).toEqual([]);
		expect(input().value).toBe('');
	});

	test('editOn: confirming the stored number unedited stores nothing; an edit is stored', () => {
		jest.useFakeTimers();
		storeValues.set(PATH, 12.3052);
		render(numberProperties({ numberFormat: 'de-DE', designType: '_editOnReq' }));
		expect(input().value).toBe('12,3052');
		const click = (sel: string) => {
			const el = container.querySelector<HTMLElement>(sel);
			expect(el).not.toBeNull();
			act(() => el!.click());
		};
		click('._editRequestIcon');
		act(() => {
			jest.advanceTimersByTime(150);
		});
		focus();
		blur();
		click('._editConfirmIcon');
		expect(writes).toEqual([]);
		expect(storeValues.get(PATH)).toBe(12.3052);

		click('._editRequestIcon');
		focus();
		typeInto('12,30527');
		blur();
		click('._editConfirmIcon');
		expect(storeValues.get(PATH)).toBe(12.30527);
		expect(input().value).toBe('12,30527');
	});
});

// ── text boxes keep their behaviour ─────────────────────────────────────────

describe('text box', () => {
	test('updateStoreImmediately stores the text as typed', () => {
		render({ valueType: 'text', updateStoreImmediately: true, designType: '_default' });
		focus();
		typeChars('ab');
		expect(writtenValues()).toEqual(['a', 'ab']);
		expect(input().value).toBe('ab');
	});

	test('without updateStoreImmediately it stores on blur', () => {
		render({ valueType: 'text', designType: '_default' });
		focus();
		typeChars('ab');
		expect(writtenValues()).toEqual([]);
		blur();
		expect(writtenValues()).toEqual(['ab']);
	});
});
