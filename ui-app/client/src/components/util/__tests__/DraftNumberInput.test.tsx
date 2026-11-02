/**
 * DraftNumberInput: the type="number" box the schema form, the markdown image size and the scene
 * editor use. Each of them used to parse every keystroke and write the number back. The browser
 * reports '' for an empty box or a lone "-" (jsdom also for "12."; Chrome reports that as "12").
 * Number('') is 0 and parseInt('') || 0 is 0, so the minus was wiped and an emptied box held 0.
 *
 * jsdom drops text that is not a valid number from a type="number" box, as Chrome does, but never
 * sets validity.badInput. typeInto sets it for that keystroke, the way Chrome reports a lone "-".
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { DraftNumberInput, completeNumber } from '../DraftNumberInput';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let reported: Array<number | undefined>;

beforeEach(() => {
	reported = [];
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

/** A parent that holds the number, as the editors do, and re-renders the box with it. */
function Holder({
	initial,
	integer,
	allowEmpty,
}: Readonly<{ initial?: number; integer?: boolean; allowEmpty?: boolean }>) {
	const [v, setV] = React.useState<number | undefined>(initial);
	return (
		<>
			<DraftNumberInput
				value={v}
				integer={integer}
				allowEmpty={allowEmpty}
				onNumber={n => {
					reported.push(n);
					setV(n);
				}}
			/>
			<span data-testid="held">{v === undefined ? 'undefined' : String(v)}</span>
		</>
	);
}

function render(props: Readonly<{ initial?: number; integer?: boolean; allowEmpty?: boolean }>) {
	act(() => root.render(<Holder {...props} />));
}

function input(): HTMLInputElement {
	return container.querySelector('input')!;
}

function held(): string {
	return container.querySelector('[data-testid="held"]')!.textContent!;
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

/** Sets the box's text the way a keystroke does and returns what the box shows after it. */
function typeInto(text: string): string {
	const el = input();
	act(() => {
		valueSetter.call(el, text);
		const badInput = text !== '' && el.value === '';
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

function focus() {
	act(() => input().focus());
}

function blur() {
	act(() => input().blur());
}

function key(k: string): boolean {
	let ev!: KeyboardEvent;
	act(() => {
		ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
		input().dispatchEvent(ev);
	});
	return ev.defaultPrevented;
}

describe('completeNumber', () => {
	test.each([
		['12', 12],
		['12.3052', 12.3052],
		['0.05', 0.05],
		['-33.86882', -33.86882],
		['.5', 0.5],
		['1e5', 100000],
		['-0', 0],
	])('%s is %p', (text, n) => expect(completeNumber(text)).toBe(n));

	test.each(['', '-', '12.', '-0.', '1e', 'abc', '1e999'])('%p is still being typed', text =>
		expect(completeNumber(text)).toBeUndefined(),
	);

	test('an integer takes no point or exponent', () => {
		expect(completeNumber('12', true)).toBe(12);
		expect(completeNumber('12.5', true)).toBeUndefined();
		expect(completeNumber('1e5', true)).toBeUndefined();
	});
});

describe('typing keeps the text', () => {
	test.each(['12.3052', '0.05', '-33.86882', '-0.05', '100'])(
		'%s is never rewritten and ends as its number',
		text => {
			render({ initial: 7 });
			focus();
			const seen = typeChars(text);
			// Each keystroke leaves either the typed text or (a partial number the browser hides)
			// an empty box; never a rewritten number.
			seen.forEach((shown, i) => expect([text.substring(0, i + 1), '']).toContain(shown));
			expect(input().value).toBe(text);
			expect(held()).toBe(String(Number(text)));
			for (const n of reported) expect(typeof n).toBe('number');
			blur();
			expect(held()).toBe(String(Number(text)));
		},
	);

	test('a lone "-" is not reported as 0 and the value stays', () => {
		render({ initial: 5 });
		focus();
		typeInto('');
		typeInto('-');
		expect(reported).toEqual([]);
		expect(held()).toBe('5');
		typeInto('-3');
		expect(reported).toEqual([-3]);
	});

	test('"12." is not reported as 0 (Number("") is 0)', () => {
		render({ initial: 5 });
		focus();
		typeChars('12.');
		expect(reported).toEqual([1, 12]);
	});

	test('"12.30" after "12.3" reports nothing new and keeps the zero', () => {
		render({ initial: 0 });
		focus();
		typeChars('12.30');
		expect(input().value).toBe('12.30');
		expect(reported).toEqual([1, 12, 12.3]);
		typeInto('12.305');
		expect(reported[reported.length - 1]).toBe(12.305);
	});
});

describe('empty', () => {
	test('without allowEmpty an emptied box reports nothing and shows the value on blur', () => {
		render({ initial: 42 });
		focus();
		expect(typeInto('')).toBe('');
		expect(reported).toEqual([]);
		blur();
		expect(input().value).toBe('42');
		expect(held()).toBe('42');
	});

	test('with allowEmpty an emptied box reports undefined and stays empty', () => {
		render({ initial: 42, allowEmpty: true });
		focus();
		typeInto('');
		expect(reported).toEqual([undefined]);
		blur();
		expect(input().value).toBe('');
		expect(held()).toBe('undefined');
	});

	test('a lone "-" left on blur: back to the value, or empty with allowEmpty', () => {
		render({ initial: 9 });
		focus();
		typeInto('');
		typeInto('-');
		blur();
		expect(input().value).toBe('9');

		act(() => root.unmount());
		root = createRoot(container);
		reported = [];
		render({ initial: 9, allowEmpty: true });
		focus();
		typeInto('-');
		blur();
		expect(reported).toEqual([undefined]);
		expect(input().value).toBe('');
	});
});

describe('integer', () => {
	test('refuses ".", ",", "e" and "+" keys and pasted decimals', () => {
		render({ initial: 3, integer: true });
		focus();
		expect(key('.')).toBe(true);
		expect(key(',')).toBe(true);
		expect(key('e')).toBe(true);
		expect(key('+')).toBe(true);
		expect(key('5')).toBe(false);
		expect(key('-')).toBe(false);
		typeInto('12');
		expect(typeInto('12.5')).toBe('12');
		expect(held()).toBe('12');
	});
});

describe('a value from outside', () => {
	function Outside() {
		const [v, setV] = React.useState<number | undefined>(1);
		return (
			<>
				<DraftNumberInput value={v} onNumber={n => setV(n)} />
				<button onClick={() => setV(99)}>set</button>
			</>
		);
	}

	test('replaces the typed text while focused', () => {
		act(() => root.render(<Outside />));
		focus();
		typeInto('12.30');
		act(() => container.querySelector('button')!.click());
		expect(input().value).toBe('99');
	});
});

test('Escape drops the typed text', () => {
	render({ initial: 4 });
	focus();
	typeInto('');
	typeInto('-');
	key('Escape');
	expect(input().value).toBe('4');
});
