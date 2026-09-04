import { Repository, Schema } from '@fincity/kirun-js';
import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import SchemaEditor from './SchemaEditor';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const DUMMY_REPO: Repository<Schema> = {
	find: async () => undefined,
	filter: async () => [],
};

let container: HTMLDivElement;
let root: Root;
let latest: any;

function Harness({ initial, readOnly }: Readonly<{ initial: any; readOnly?: boolean }>) {
	const [value, setValue] = useState(initial);
	latest = value;
	return (
		<SchemaEditor
			value={value}
			readOnly={readOnly}
			onChange={v => {
				latest = v;
				setValue(v);
			}}
			schemaRepository={DUMMY_REPO}
		/>
	);
}

function render(initial: any, readOnly?: boolean) {
	act(() => {
		root.render(<Harness initial={initial} readOnly={readOnly} />);
	});
}

function click(el: Element) {
	act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

/** Opens the per-node details card in COMPACT mode. */
function openDetails(name: string) {
	click(nodeRowByName(name)!.querySelector('[title^="All settings for this field"]')!);
}

function setInputValue(input: HTMLInputElement, text: string) {
	const setter = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		'value',
	)!.set!;
	act(() => {
		setter.call(input, text);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	});
	act(() => {
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
	});
}

function nodeRowByName(name: string): HTMLElement | undefined {
	return Array.from(container.querySelectorAll('._nodeRow')).find(
		r => (r.querySelector('input._nodeName') as HTMLInputElement)?.value === name,
	) as HTMLElement | undefined;
}

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const SAMPLE = {
	type: 'OBJECT',
	properties: {
		name: { type: 'STRING' },
		address: { type: 'OBJECT', properties: { city: { type: 'STRING' } } },
	},
	required: ['name'],
};

describe('SchemaEditor', () => {
	test('renders a row per property with type and required state', () => {
		render(SAMPLE);

		const nameRow = nodeRowByName('name')!;
		expect(nameRow).toBeDefined();
		expect((nameRow.querySelector('select._typeSelector') as HTMLSelectElement).value).toBe(
			'STRING',
		);
		expect((nameRow.querySelector('._requiredCheck input') as HTMLInputElement).checked).toBe(
			true,
		);

		const addressRow = nodeRowByName('address')!;
		expect(
			(addressRow.querySelector('._requiredCheck input') as HTMLInputElement).checked,
		).toBe(false);

		expect(nodeRowByName('city')).toBeDefined();
	});

	test('required checkbox syncs the parent required array', () => {
		render(SAMPLE);

		const checkbox = nodeRowByName('address')!.querySelector(
			'._requiredCheck input',
		) as HTMLInputElement;
		act(() => checkbox.click());
		expect(latest.required).toEqual(['name', 'address']);

		const nameCheckbox = nodeRowByName('name')!.querySelector(
			'._requiredCheck input',
		) as HTMLInputElement;
		act(() => nameCheckbox.click());
		expect(latest.required).toEqual(['address']);
	});

	test('add property via draft row', () => {
		render(SAMPLE);

		const rootRow = container.querySelector('._rootRow') as HTMLElement;
		const addButton = rootRow.querySelector('[title="Add property"]') as HTMLElement;
		act(() => addButton.dispatchEvent(new MouseEvent('click', { bubbles: true })));

		const draftInput = container.querySelector(
			'._draftRow input._nodeName',
		) as HTMLInputElement;
		expect(draftInput).toBeDefined();
		setInputValue(draftInput, 'age');

		expect(latest.properties.age).toEqual({ type: 'STRING' });
		expect(nodeRowByName('age')).toBeDefined();
	});

	test('type change writes scalar type', () => {
		render(SAMPLE);

		const select = nodeRowByName('name')!.querySelector(
			'select._typeSelector',
		) as HTMLSelectElement;
		const setter = Object.getOwnPropertyDescriptor(
			window.HTMLSelectElement.prototype,
			'value',
		)!.set!;
		act(() => {
			setter.call(select, 'INTEGER');
			select.dispatchEvent(new Event('change', { bubbles: true }));
		});

		expect(latest.properties.name.type).toBe('INTEGER');
	});

	test('multi-type schema shows Multiple without rewriting the value', () => {
		const multi = { type: 'OBJECT', properties: { flex: { type: ['STRING', 'INTEGER'] } } };
		render(multi);

		const select = nodeRowByName('flex')!.querySelector(
			'select._typeSelector',
		) as HTMLSelectElement;
		expect(select.value).toBe('_multiple_');
		expect(select.selectedOptions[0].textContent).toContain('Multiple');
		expect(latest.properties.flex.type).toEqual(['STRING', 'INTEGER']);
	});

	test('extended mode opens details for every node', () => {
		render(SAMPLE);
		expect(container.querySelector('._detailsCard')).toBeNull();

		const extendedButton = Array.from(container.querySelectorAll('._segmented button')).find(
			b => b.textContent === 'Extended',
		) as HTMLElement;
		act(() => extendedButton.click());

		expect(container.querySelectorAll('._detailsCard').length).toBeGreaterThanOrEqual(4);
		const summaries = Array.from(container.querySelectorAll('._detailsSection summary')).map(
			s => s.textContent,
		);
		expect(summaries).toContain('String Constraints');
	});

	test('compact details toggle opens one node card', () => {
		render(SAMPLE);

		const gear = nodeRowByName('name')!.querySelector(
			'[title="All settings for this field"]',
		) as HTMLElement;
		act(() => gear.dispatchEvent(new MouseEvent('click', { bubbles: true })));

		expect(container.querySelectorAll('._detailsCard').length).toBe(1);
	});

	test('the row shows what is set without opening anything', () => {
		render({
			type: 'OBJECT',
			properties: {
				email: { type: 'STRING', format: 'EMAIL', minLength: 3, defaultValue: 'a@b.c' },
				plain: { type: 'STRING' },
			},
		});

		const chips = Array.from(
			nodeRowByName('email')!.querySelectorAll('._rowSummary ._badge'),
		).map(e => e.textContent);
		expect(chips).toContain('default "a@b.c"');
		expect(chips).toContain('email');
		expect(chips).toContain('len 3+');

		// A bare field stays bare.
		expect(nodeRowByName('plain')!.querySelectorAll('._rowSummary ._badge')).toHaveLength(0);
	});

	test('a ref shows its target, not the word ref', () => {
		render({ type: 'OBJECT', properties: { a: { ref: 'myapp.Address' } } });
		const chip = nodeRowByName('a')!.querySelector('._rowSummary ._badge');
		expect(chip?.textContent).toBe('→ Address');
	});

	test('a ref no longer disables the type selector', () => {
		render({ type: 'OBJECT', properties: { a: { type: 'STRING', ref: 'myapp.Address' } } });
		const select = nodeRowByName('a')!.querySelector(
			'select._typeSelector',
		) as HTMLSelectElement;
		expect(select.disabled).toBe(false);
	});

	test('constraints stay visible and live under a ref', () => {
		render({
			type: 'OBJECT',
			properties: { a: { type: 'STRING', ref: 'myapp.Address', minLength: 3 } },
		});
		openDetails('a');

		const summaries = Array.from(container.querySelectorAll('._detailsSection summary')).map(
			s => s.textContent,
		);
		expect(summaries.some(s => s?.startsWith('String Constraints'))).toBe(true);
		// Composition is what a ref actually makes unreachable.
		const composition = Array.from(container.querySelectorAll('._detailsSection')).find(s =>
			s.querySelector('summary')?.textContent?.startsWith('Composition'),
		);
		expect(composition?.className).toContain('_inert');
	});

	test('enums mark the constraints inert, because the runtime returns at the enum check', () => {
		render({
			type: 'OBJECT',
			properties: { a: { type: 'STRING', enums: ['x'], minLength: 3 } },
		});
		openDetails('a');

		const stringSection = Array.from(container.querySelectorAll('._detailsSection')).find(s =>
			s.querySelector('summary')?.textContent?.startsWith('String Constraints'),
		);
		expect(stringSection?.className).toContain('_inert');
		expect(container.querySelector('._cardNote._inert')?.textContent).toContain(
			'Allowed values are set',
		);
	});

	test('object constraints open when the schema already carries them', () => {
		render({ type: 'OBJECT', properties: { a: { type: 'OBJECT', minProperties: 2 } } });
		openDetails('a');

		const objectSection = Array.from(container.querySelectorAll('._detailsSection')).find(s =>
			s.querySelector('summary')?.textContent?.startsWith('Object Constraints'),
		) as HTMLDetailsElement;
		expect(objectSection.open).toBe(true);
	});

	test('an enum value is added once, not twice', () => {
		render({ type: 'OBJECT', properties: { s: { type: 'STRING' } } });
		openDetails('s');

		const draft = container.querySelector('._enumDraft input') as HTMLInputElement;
		expect(draft).toBeDefined();
		setInputValue(draft, 'RED');
		// The blur that follows an Enter used to commit the same text a second time.
		act(() => {
			(container.querySelector('._enumDraft input') as HTMLInputElement).dispatchEvent(
				new FocusEvent('blur', { bubbles: true }),
			);
		});

		expect(latest.properties.s.enums).toEqual(['RED']);
		expect((container.querySelector('._enumDraft input') as HTMLInputElement).value).toBe('');
	});

	test('a rename onto an existing name is rejected, not silently kept', () => {
		render({ type: 'OBJECT', properties: { a: { type: 'STRING' }, b: { type: 'STRING' } } });

		const input = nodeRowByName('a')!.querySelector('input._nodeName') as HTMLInputElement;
		setInputValue(input, 'b');

		expect(Object.keys(latest.properties)).toEqual(['a', 'b']);
		expect(input.value).toBe('a');
	});

	test('readOnly disables the fields inside a details card', () => {
		render({ type: 'OBJECT', properties: { s: { type: 'STRING', minLength: 2 } } }, true);
		openDetails('s');

		const inputs = Array.from(
			container.querySelectorAll('._detailsCard input, ._detailsCard select'),
		) as Array<HTMLInputElement | HTMLSelectElement>;
		expect(inputs.length).toBeGreaterThan(0);
		expect(inputs.every(i => i.disabled)).toBe(true);
	});

	test('search reveals a match and tints its row without hiding the rest', () => {
		render(SAMPLE);

		const search = container.querySelector('input._searchInput') as HTMLInputElement;
		setInputValue(search, 'city');

		expect(nodeRowByName('city')!.className).toContain('_match');
		// Reveal keeps context on screen.
		expect(nodeRowByName('name')).toBeDefined();
		expect(container.querySelector('._matchCount')?.textContent).toBe('1 match');
	});

	test('narrowing hides everything that is not a match or its ancestor', () => {
		render(SAMPLE);

		setInputValue(container.querySelector('input._searchInput') as HTMLInputElement, 'city');
		click(container.querySelector('[title*="hide everything but the matches"]')!);

		expect(nodeRowByName('city')).toBeDefined();
		expect(nodeRowByName('address')).toBeDefined();
		expect(nodeRowByName('name')).toBeUndefined();
	});

	test('a match deeper than the default depth is revealed anyway', () => {
		render({
			type: 'OBJECT',
			properties: {
				a: {
					type: 'OBJECT',
					properties: { b: { type: 'OBJECT', properties: { deep: {} } } },
				},
			},
		});
		// depth 2 is past COMPACT's `depth < 2` default, so this row starts hidden.
		expect(nodeRowByName('deep')).toBeUndefined();

		setInputValue(container.querySelector('input._searchInput') as HTMLInputElement, 'deep');
		expect(nodeRowByName('deep')).toBeDefined();
	});

	test('clearing the search restores the user own expansion, not the search state', () => {
		render(SAMPLE);

		// Collapse address by hand.
		click(nodeRowByName('address')!.querySelector('._caret')!);
		expect(nodeRowByName('city')).toBeUndefined();

		const search = container.querySelector('input._searchInput') as HTMLInputElement;
		setInputValue(search, 'city');
		expect(nodeRowByName('city')).toBeDefined();

		setInputValue(search, '');
		// Search never wrote to the toggle set, so the manual collapse survives.
		expect(nodeRowByName('city')).toBeUndefined();
	});

	test('expand all opens past the depth default, and a caret still collapses one node', () => {
		render(SAMPLE);
		click(container.querySelector('[title="Expand all"]')!);
		expect(nodeRowByName('city')).toBeDefined();

		click(nodeRowByName('address')!.querySelector('._caret')!);
		expect(nodeRowByName('city')).toBeUndefined();
	});

	test('a details card sub-editor survives an active narrowing filter', () => {
		render({ type: 'OBJECT', properties: { a: { type: 'OBJECT', propertyNames: {} } } });

		setInputValue(container.querySelector('input._searchInput') as HTMLInputElement, 'a');
		click(container.querySelector('[title*="hide everything but the matches"]')!);
		openDetails('a');

		// propertyNames is not a path the search index walks, so it must not be filtered out.
		const labels = Array.from(
			container.querySelectorAll('._detailsCard ._nodeName._fixed'),
		).map(e => e.textContent);
		expect(labels).toContain('propertyNames');
	});

	test('the sample import opens and closes', () => {
		render(SAMPLE);
		expect(container.querySelector('._popupBackground')).toBeNull();

		click(container.querySelector('[title^="Paste a sample payload"]')!);
		expect(container.querySelector('._sampleImport')).toBeDefined();

		click(container.querySelector('._popupBackground')!);
		expect(container.querySelector('._popupBackground')).toBeNull();
	});

	test('the sample import is not offered when readOnly', () => {
		render(SAMPLE, true);
		expect(container.querySelector('[title^="Paste a sample payload"]')).toBeNull();
		// Navigation stays available.
		expect(container.querySelector('input._searchInput')).toBeDefined();
	});

	test('delete property removes it and its required entry', () => {
		render(SAMPLE);

		const trash = nodeRowByName('name')!.querySelector(
			'[title="Remove property"]',
		) as HTMLElement;
		act(() => trash.dispatchEvent(new MouseEvent('click', { bubbles: true })));

		expect(latest.properties.name).toBeUndefined();
		expect(latest.required).toBeUndefined();
		expect(nodeRowByName('name')).toBeUndefined();
	});
});
