import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import ChipText, { fromEditable, insertFieldAtCursor, toEditable } from '../ChipText';
import { errorInWords } from '../DocumentShell';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const labels: Record<string, string> = { 'case.customerName': 'Customer name', link: 'Link' };
const ctx = { labelOf: (p: string) => labels[p] ?? p };

describe('ChipText conversion', () => {
	it('shows each field as a named chip and writes it back as the same FreeMarker', () => {
		const v = '<p>Dear ${case.customerName!\'-\'}, <a href="${link}">open</a></p>';
		const el = document.createElement('div');
		el.innerHTML = toEditable(v, ctx);
		const chips = el.querySelectorAll('span[data-token]');
		// The field inside href stays as written; only the one in the text is a chip.
		expect(chips).toHaveLength(1);
		expect(chips[0].textContent).toBe('Customer name');
		expect(fromEditable(el)).toBe(v);
	});

	it('shows the value for the record in use when asked', () => {
		const el = document.createElement('div');
		el.innerHTML = toEditable("${case.customerName!'-'}", {
			...ctx,
			showData: true,
			data: { case: { customerName: 'Asha Rao' } },
		});
		expect(el.textContent).toBe('Asha Rao');
		el.innerHTML = toEditable("${case.customerName!''}", { ...ctx, showData: true, data: {} });
		expect(el.textContent).toBe('Customer name: empty');
	});
});

describe('ChipText editing', () => {
	let container: HTMLElement;
	let root: Root;
	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});
	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	it('does not re-render under the cursor when the same text comes back as a new copy', () => {
		const onChange = jest.fn();
		act(() =>
			root.render(
				<ChipText value="Hello" onChange={onChange} ctx={{ ...ctx, dataKey: '1' }} />,
			),
		);
		const el = container.querySelector('._chipText') as HTMLElement;
		const firstNode = el.firstChild;
		act(() => {
			el.innerHTML = 'Hello there';
			el.dispatchEvent(new Event('input', { bubbles: true }));
		});
		expect(onChange).toHaveBeenLastCalledWith('Hello there');
		const typedNode = el.firstChild;
		// The page store hands back a copy of the template: same text, same data key.
		act(() =>
			root.render(
				<ChipText
					value="Hello there"
					onChange={onChange}
					ctx={{ ...ctx, data: {}, dataKey: '1' }}
				/>,
			),
		);
		expect(el.firstChild).toBe(typedNode);
		expect(firstNode).not.toBeNull();
	});

	it('puts a picked field where the cursor was, written for the row inside a repeating table', () => {
		const onChange = jest.fn();
		act(() =>
			root.render(
				<ChipText
					value="Amount: "
					onChange={onChange}
					ctx={{ ...ctx, list: 'schedule', alias: 'row' }}
				/>,
			),
		);
		const el = container.querySelector('._chipText') as HTMLElement;
		// The cursor at the end of the text, as a click there leaves it.
		act(() => {
			const r = document.createRange();
			r.selectNodeContents(el);
			r.collapse(false);
			const sel = window.getSelection()!;
			sel.removeAllRanges();
			sel.addRange(r);
			el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		});
		act(() => {
			expect(insertFieldAtCursor("${schedule[0].amount!'-'}")).toBe(true);
		});
		expect(onChange).toHaveBeenLastCalledWith("Amount: ${row.amount!'-'}");
	});
});

describe('errors in plain words', () => {
	it('names the empty field and the record', () => {
		const e = errorInWords(
			'The following has evaluated to null or missing: unit.facing',
			p => (p === 'unit.facing' ? 'Facing' : p),
			'CX-1008',
		);
		expect(e.text).toContain('The field Facing (unit.facing) is empty for CX-1008');
		expect(e.paths).toEqual(['unit.facing']);
	});

	it('points at the line for a broken expression', () => {
		const e = errorInWords("expected '}' to close the interpolation on line 12", p => p, 'x');
		expect(e.text).toMatch(/^Line 12 of the HTML/);
	});
});
