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

function Harness({ initial }: Readonly<{ initial: any }>) {
	const [value, setValue] = useState(initial);
	latest = value;
	return (
		<SchemaEditor
			value={value}
			onChange={v => {
				latest = v;
				setValue(v);
			}}
			schemaRepository={DUMMY_REPO}
		/>
	);
}

function render(initial: any) {
	act(() => {
		root.render(<Harness initial={initial} />);
	});
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
