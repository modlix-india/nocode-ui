/**
 * The schema form's number box used to parse every keystroke into its number state: parseInt for
 * any text without a ".", so "1e5" became 1 and the box was rewritten to "1", and a box the
 * browser reports as '' while it is half typed set the state to undefined, so Enter there
 * committed nothing. Escape did not put the text back when the number had not changed.
 *
 * REAL: NumberValueEditor, DraftNumberInput and kirun's SchemaValidator. A type="number" box
 * reports '' for text that is not a number yet: Chrome does for a lone "-", jsdom also for "12."
 * (Chrome reports "12." as "12"). typeInto sets validity.badInput for that keystroke, as Chrome
 * reports it.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { KIRunSchemaRepository, Schema } from '@fincity/kirun-js';
import { NumberValueEditor } from '../NumberValueEditor';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let committed: Array<number | undefined>;

beforeEach(() => {
	committed = [];
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

/** The form holds the committed value and passes it back, as SingleSchemaForm does. */
function Form({ initial, defaultValue }: Readonly<{ initial?: number; defaultValue?: number }>) {
	const [v, setV] = React.useState<number | undefined>(initial);
	return (
		<NumberValueEditor
			value={v}
			defaultValue={defaultValue}
			schema={Schema.ofDouble('amount')}
			schemaRepository={new KIRunSchemaRepository()}
			onChange={n => {
				committed.push(n);
				setV(n);
			}}
		/>
	);
}

async function render(props: Readonly<{ initial?: number; defaultValue?: number }> = {}) {
	await act(async () => root.render(<Form {...props} />));
}

function input(): HTMLInputElement {
	return container.querySelector('input')!;
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

async function typeInto(text: string): Promise<string> {
	const el = input();
	await act(async () => {
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

async function typeChars(text: string): Promise<string[]> {
	const seen: string[] = [];
	for (let i = 1; i <= text.length; i++) seen.push(await typeInto(text.substring(0, i)));
	return seen;
}

async function blur() {
	await act(async () => input().blur());
}

async function key(k: string) {
	await act(async () => {
		input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
	});
}

test.each(['12.3052', '0.05', '-33.86882'])(
	'%s is kept as typed and committed as a number on blur',
	async text => {
		await render();
		await act(async () => input().focus());
		const seen = await typeChars(text);
		seen.forEach((shown, i) => expect([text.substring(0, i + 1), '']).toContain(shown));
		expect(input().value).toBe(text);
		expect(committed).toEqual([]);
		await blur();
		expect(committed).toEqual([Number(text)]);
		expect(typeof committed[0]).toBe('number');
		expect(input().value).toBe(String(Number(text)));
	},
);

test('"1e5" is 100000, not parseInt\'s 1', async () => {
	await render();
	await act(async () => input().focus());
	await typeChars('1e5');
	expect(input().value).toBe('1e5');
	await blur();
	expect(committed).toEqual([100000]);
});

test('Enter on a half-typed "12." commits 12, not nothing', async () => {
	await render({ initial: 3 });
	await act(async () => input().focus());
	await typeInto('');
	await typeChars('12.');
	await key('Enter');
	expect(committed).toEqual([12]);
});

test('an emptied box commits undefined', async () => {
	await render({ initial: 7 });
	await act(async () => input().focus());
	await typeInto('');
	await blur();
	expect(committed).toEqual([undefined]);
	expect(input().value).toBe('');
});

test('a lone "-" left on blur commits undefined and clears the box', async () => {
	await render({ initial: 7 });
	await act(async () => input().focus());
	await typeInto('');
	await typeInto('-');
	await blur();
	expect(committed).toEqual([undefined]);
	expect(input().value).toBe('');
});

test('Escape puts the committed number back, even when the typed one equals it', async () => {
	await render({ initial: 12.3 });
	await act(async () => input().focus());
	await typeInto('12.30');
	expect(input().value).toBe('12.30');
	await key('Escape');
	expect(input().value).toBe('12.3');
	await typeInto('');
	await typeInto('-');
	await key('Escape');
	expect(input().value).toBe('12.3');
});

test('the default value is committed as undefined', async () => {
	await render({ defaultValue: 5 });
	await act(async () => input().focus());
	await typeInto('6');
	await typeInto('5');
	await blur();
	expect(committed).toEqual([undefined]);
	expect(input().value).toBe('5');
});

// ── an enum is a <select> ────────────────────────────────────────────────────
//
// The select had no onChange: React kept it on the value it was given, so an enum value could
// not be picked at all.

function EnumForm({
	initial,
	defaultValue,
}: Readonly<{ initial?: number; defaultValue?: number }>) {
	const [v, setV] = React.useState<number | undefined>(initial);
	return (
		<NumberValueEditor
			value={v}
			defaultValue={defaultValue}
			schema={Schema.ofDouble('amount').setEnums([10, 20.5, 30])}
			schemaRepository={new KIRunSchemaRepository()}
			onChange={n => {
				committed.push(n);
				setV(n);
			}}
		/>
	);
}

async function renderEnum(props: Readonly<{ initial?: number; defaultValue?: number }> = {}) {
	await act(async () => root.render(<EnumForm {...props} />));
}

function select(): HTMLSelectElement {
	return container.querySelector('select')!;
}

async function pick(value: string) {
	await act(async () => {
		select().value = value;
		select().dispatchEvent(new Event('change', { bubbles: true }));
	});
}

test('an enum shows None and its values, on the committed one', async () => {
	await renderEnum({ initial: 20.5 });
	expect(container.querySelector('input')).toBeNull();
	expect(Array.from(select().options).map(o => [o.value, o.text])).toEqual([
		['', 'None'],
		['10', '10'],
		['20.5', '20.5'],
		['30', '30'],
	]);
	expect(select().value).toBe('20.5');
});

test('picking an enum value commits that number', async () => {
	await renderEnum();
	expect(select().value).toBe('');
	await pick('30');
	expect(committed).toEqual([30]);
	expect(typeof committed[0]).toBe('number');
	expect(select().value).toBe('30');
	await pick('20.5');
	expect(committed).toEqual([30, 20.5]);
	expect(select().value).toBe('20.5');
});

test('picking None clears the value', async () => {
	await renderEnum({ initial: 10 });
	await pick('');
	expect(committed).toEqual([undefined]);
	expect(select().value).toBe('');
});

test('picking the default value commits undefined, as the box does', async () => {
	await renderEnum({ defaultValue: 10 });
	expect(select().value).toBe('10');
	await pick('30');
	await pick('10');
	expect(committed).toEqual([30, undefined]);
	expect(select().value).toBe('10');
});

test('the clear (x) clears a picked value', async () => {
	await renderEnum({ initial: 30 });
	await act(async () => container.querySelector<HTMLElement>('.fa-circle-xmark')!.click());
	expect(committed).toEqual([undefined]);
	expect(select().value).toBe('');
});
