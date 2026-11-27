/**
 * What each comparison of a condition row accepts (LZT-2783): number boxes drop
 * letters, "is between" reads the field's type and checks the order, "is one of"
 * is a list that follows the comparison, existing conditions still read.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

const mockPost = jest.fn();
jest.mock('axios', () => ({
	__esModule: true,
	default: { post: (...a: any[]) => mockPost(...a), get: jest.fn() },
}));
jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getDataFromPath: () => undefined,
}));

import {
	carryValue,
	conditionProblem,
	isNumberText,
	listOf,
	numberTyping,
	operatorKind,
	valueKindOf,
} from '../conditionValues';
import { ConditionBuilder } from '../FlowEditorPanel';
import { conditionToWords } from '../sentences';
import { ConditionGroup } from '../automationTypes';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('rules', () => {
	it('classifies the comparisons', () => {
		expect(operatorKind('GREATER_THAN')).toBe('numeric');
		expect(operatorKind('LESS_THAN_EQUAL')).toBe('numeric');
		expect(operatorKind('BETWEEN')).toBe('range');
		expect(operatorKind('IN')).toBe('multi');
		expect(operatorKind('LIKE')).toBe('text');
		expect(operatorKind('STRING_LOOSE_EQUAL')).toBe('text');
		expect(operatorKind('EQUALS')).toBe('single');
		expect(operatorKind('IS_NULL')).toBe('none');
		expect(operatorKind(undefined)).toBe('single');
	});

	it('drops letters from a number', () => {
		expect(numberTyping('1234ABCD')).toBe('1234');
		expect(numberTyping('abc')).toBe('');
		expect(numberTyping('-12.5.6')).toBe('-12.56');
		expect(numberTyping('1-2')).toBe('12');
		expect(numberTyping('{{trigger.amount}}')).toBe('{{trigger.amount}}');
	});

	it('knows a number text', () => {
		expect(isNumberText('12')).toBe(true);
		expect(isNumberText('-1.5')).toBe(true);
		expect(isNumberText('')).toBe(true);
		expect(isNumberText('{{trigger.amount}}')).toBe(true);
		expect(isNumberText('1234ABCD')).toBe(false);
		expect(isNumberText('-')).toBe(false);
	});

	it('reads the value kind from the catalog type', () => {
		expect(valueKindOf('INTEGER')).toBe('number');
		expect(valueKindOf('double')).toBe('number');
		expect(valueKindOf('DATE')).toBe('date');
		expect(valueKindOf('DATETIME')).toBe('datetime');
		expect(valueKindOf('STRING')).toBe('text');
		expect(valueKindOf(undefined)).toBe('text');
	});

	it('names what is wrong with a condition', () => {
		expect(conditionProblem('GREATER_THAN', '1234ABCD', undefined, 'text')).toMatch(/number/);
		expect(conditionProblem('GREATER_THAN', '100', undefined, 'text')).toBe('');
		expect(conditionProblem('BETWEEN', '5', '', 'number')).toMatch(/both/);
		expect(conditionProblem('BETWEEN', '9', '5', 'number')).toMatch(/must not be above/);
		expect(conditionProblem('BETWEEN', '5', '9', 'number')).toBe('');
		expect(conditionProblem('BETWEEN', '10', '9', 'number')).toMatch(/above/);
		expect(conditionProblem('BETWEEN', '2026-11-30', '2026-11-01', 'date')).toMatch(/above/);
		expect(conditionProblem('BETWEEN', 'a', 'f', 'text')).toBe('');
		expect(conditionProblem('IN', [], undefined, 'text')).toMatch(/at least one/);
		expect(conditionProblem('IN', ['a'], undefined, 'text')).toBe('');
	});

	it('reads a list or the comma text older conditions hold', () => {
		expect(listOf(['a', 'b'])).toEqual(['a', 'b']);
		expect(listOf('66, 67 ,')).toEqual(['66', '67']);
		expect(listOf('')).toEqual([]);
		expect(listOf(undefined)).toEqual([]);
	});

	it('carries the value when the comparison changes', () => {
		expect(carryValue('EQUALS', 'IN', 'Won')).toEqual(['Won']);
		expect(carryValue('EQUALS', 'IN', '')).toEqual([]);
		expect(carryValue('IN', 'EQUALS', ['Won', 'Lost'])).toBe('Won');
		expect(carryValue('IN', 'EQUALS', [])).toBe('');
		expect(carryValue('EQUALS', 'GREATER_THAN', 'abc')).toBe('');
		expect(carryValue('EQUALS', 'GREATER_THAN', '12')).toBe('12');
		expect(carryValue('GREATER_THAN', 'LESS_THAN', '12')).toBe('12');
		expect(carryValue('EQUALS', 'NOT_EQUALS', 'abc')).toBe('abc');
	});

	it('words a list and a range', () => {
		expect(
			conditionToWords(
				{
					operator: 'AND',
					conditions: [{ field: 'trigger.stage', operator: 'IN', value: ['Won', 'Lost'] }],
				},
				[{ path: 'trigger.stage', label: 'Stage' }],
			),
		).toBe('Stage is one of Won, Lost');
	});
});

describe('the condition row', () => {
	let host: HTMLElement;
	let root: Root;
	beforeEach(() => {
		mockPost.mockReset();
		mockPost.mockResolvedValue({ data: [] });
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
	});
	afterEach(() => {
		act(() => root.unmount());
		host.remove();
	});

	const vars = [
		{ path: 'trigger.dealId', label: 'Deal', type: 'STRING' },
		{ path: 'trigger.amount', label: 'Amount', type: 'INTEGER' },
		{ path: 'trigger.createdOn', label: 'Created', type: 'DATE' },
		{ path: 'trigger.name', label: 'Name', type: 'STRING' },
	];
	const render = (value: ConditionGroup, onChange: jest.Mock) =>
		act(async () => {
			root.render(
				<ConditionBuilder label="Only when" value={value} vars={vars} onChange={onChange} />,
			);
		});
	const g = (c: any): ConditionGroup => ({ operator: 'AND', conditions: [c] });
	const input = (label: string) =>
		host.querySelector(`[aria-label="${label}"]`) as HTMLInputElement;
	const type = (el: HTMLInputElement, text: string) =>
		act(async () => {
			const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
			set.call(el, text);
			el.dispatchEvent(new Event('input', { bubbles: true }));
		});

	it('keeps only the number of "1234ABCD" in a number comparison', async () => {
		const onChange = jest.fn();
		await render(g({ field: 'trigger.dealId', operator: 'GREATER_THAN', value: '' }), onChange);
		await type(input('Condition 1: value'), '1234ABCD');
		expect(onChange.mock.calls[0][0].conditions[0].value).toBe('1234');
	});

	it('shows a stored letter value with a message, and does not change it by itself', async () => {
		const onChange = jest.fn();
		await render(
			g({ field: 'trigger.dealId', operator: 'GREATER_THAN', value: 'abc' }),
			onChange,
		);
		expect(host.textContent).toContain('Enter a number.');
		expect(input('Condition 1: value').value).toBe('abc');
		expect(onChange).not.toHaveBeenCalled();
	});

	it('"is between" shows two boxes of the field type and checks their order', async () => {
		const onChange = jest.fn();
		await render(
			g({ field: 'trigger.createdOn', operator: 'BETWEEN', value: '2026-11-30', toValue: '2026-11-01' }),
			onChange,
		);
		expect(input('Condition 1: from').type).toBe('date');
		expect(input('Condition 1: up to').type).toBe('date');
		expect(host.textContent).toContain('must not be above');
		await render(
			g({ field: 'trigger.amount', operator: 'BETWEEN', value: '1', toValue: '' }),
			onChange,
		);
		expect(input('Condition 1: from').type).toBe('text');
		expect(input('Condition 1: from').getAttribute('inputmode')).toBe('decimal');
		expect(host.textContent).toContain('both ends');
	});

	it('"is one of" is a list: chips for stored values, Enter and commas add, x removes', async () => {
		const onChange = jest.fn();
		await render(
			g({ field: 'trigger.name', operator: 'IN', value: '66, 67' }),
			onChange,
		);
		const chips = host.querySelectorAll('._afChip');
		expect(chips.length).toBe(2);
		await type(input('Condition 1: values: add'), 'a, b');
		await act(async () => {
			input('Condition 1: values: add').dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
			);
		});
		expect(onChange.mock.calls.at(-1)![0].conditions[0].value).toEqual(['66', '67', 'a', 'b']);
		await act(async () => {
			(host.querySelector('[aria-label="Remove 66"]') as HTMLElement).click();
		});
		expect(onChange.mock.calls.at(-1)![0].conditions[0].value).toEqual(['67']);
	});

	it('changing the comparison to "is one of" and back carries the value', async () => {
		const onChange = jest.fn();
		await render(g({ field: 'trigger.name', operator: 'EQUALS', value: 'Won' }), onChange);
		const sel = host.querySelector('[aria-label="Condition 1: comparison"]') as HTMLSelectElement;
		await act(async () => {
			const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!;
			set.call(sel, 'IN');
			sel.dispatchEvent(new Event('change', { bubbles: true }));
		});
		expect(onChange.mock.calls.at(-1)![0].conditions[0]).toMatchObject({
			operator: 'IN',
			value: ['Won'],
		});
	});

	it('"is like" and "contains" take text with a hint about %', async () => {
		const onChange = jest.fn();
		await render(g({ field: 'trigger.name', operator: 'STRING_LOOSE_EQUAL', value: 'ash%' }), onChange);
		expect(input('Condition 1: value').placeholder).toMatch(/%/);
		expect(host.textContent).not.toContain('Enter some text');
	});
});
