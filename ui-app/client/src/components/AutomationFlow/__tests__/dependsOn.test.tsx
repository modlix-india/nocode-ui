/**
 * Dependent option lists (LZT-2763): a trigger field with `dependsOn` asks its
 * options function with the sibling's value as the body, per (function, arg),
 * re-fetches when the sibling changes and drops a chosen value no longer listed.
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

import { loadOptions, stableArgs } from '../automationApi';
import { ConditionBuilder } from '../FlowEditorPanel';
import { variablesFor } from '../sentences';
import { Catalog, ConditionGroup } from '../automationTypes';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const ref = { namespace: 'NS', name: 'stagesFor' };
const answer = (labels: string[]) => ({
	data: labels.map(l => ({ label: l, value: l.toLowerCase() })),
});
const flush = () => act(async () => void (await new Promise(r => setTimeout(r, 0))));

beforeEach(() => {
	mockPost.mockReset();
});

describe('loadOptions args', () => {
	it('posts {} without args and the args object when given', async () => {
		mockPost.mockResolvedValue(answer(['A']));
		await loadOptions({ namespace: 'N1', name: 'f' }, 'app');
		expect(mockPost.mock.calls[0][1]).toEqual({});
		await loadOptions({ namespace: 'N1', name: 'g' }, 'app', { productId: 'p1' });
		expect(mockPost.mock.calls[1][1]).toEqual({ productId: 'p1' });
		expect(mockPost.mock.calls[1][0]).toBe('api/core/function/execute/N1/g');
	});

	it('caches per function and per argument, key order irrelevant', async () => {
		mockPost.mockResolvedValue(answer(['A']));
		const r = { namespace: 'N2', name: 'f' };
		await loadOptions(r, 'app');
		await loadOptions(r, 'app');
		await loadOptions(r, 'app', {});
		expect(mockPost).toHaveBeenCalledTimes(1);
		await loadOptions(r, 'app', { a: 1, b: 2 });
		await loadOptions(r, 'app', { b: 2, a: 1 });
		expect(mockPost).toHaveBeenCalledTimes(2);
		await loadOptions(r, 'app', { a: 2, b: 2 });
		expect(mockPost).toHaveBeenCalledTimes(3);
		expect(stableArgs({ b: 2, a: 1 })).toBe(stableArgs({ a: 1, b: 2 }));
		expect(stableArgs(undefined)).toBe('');
	});
});

describe('catalog to variable', () => {
	it('carries dependsOn as the sibling path, and leaves other fields alone', () => {
		const catalog: Catalog = {
			appCode: 'a',
			triggers: [
				{
					key: 't',
					title: 'T',
					sentence: 's',
					fields: [
						{
							name: 'productId',
							label: 'Product',
							options: { namespace: 'NS', name: 'p' },
						},
						{ name: 'stage', label: 'Stage', options: ref, dependsOn: 'productId' },
					],
				},
			],
			actions: [],
		} as any;
		const vars = variablesFor({ trigger: { key: 't' } } as any, catalog);
		expect(vars[0]).not.toHaveProperty('dependsOn');
		expect(vars[1].dependsOn).toBe('trigger.productId');
	});
});

describe('ConditionBuilder with a dependent field', () => {
	let host: HTMLElement;
	let root: Root;
	let appCode = '';
	let n = 0;
	beforeEach(() => {
		appCode = `cond${n++}`; // the options cache outlives a test
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
	});
	afterEach(() => {
		act(() => root.unmount());
		host.remove();
	});

	const vars = [
		{
			path: 'trigger.productId',
			label: 'Product',
			options: { namespace: 'NS', name: 'prods' },
		},
		{ path: 'trigger.stage', label: 'Stage', options: ref, dependsOn: 'trigger.productId' },
	];
	const group = (productId: string, stage: string): ConditionGroup => ({
		operator: 'AND',
		conditions: [
			{ field: 'trigger.productId', operator: 'EQUALS', value: productId },
			{ field: 'trigger.stage', operator: 'EQUALS', value: stage },
		],
	});
	const render = (value: ConditionGroup, onChange: jest.Mock) =>
		act(async () => {
			root.render(
				<ConditionBuilder
					label="Only when"
					value={value}
					vars={vars}
					appCode={appCode}
					onChange={onChange}
				/>,
			);
		});
	const stageBodies = () =>
		mockPost.mock.calls.filter(c => c[0].endsWith('/stagesFor')).map(c => c[1]);

	beforeEach(() => {
		mockPost.mockImplementation((url: string, body: any) => {
			if (url.endsWith('/stagesFor'))
				return Promise.resolve(
					body.productId === 'p2' ? answer(['Won', 'Lost']) : answer(['New', 'Won']),
				);
			return Promise.resolve(answer(['P1', 'P2']));
		});
	});

	it('sends the sibling value, re-fetches on change, clears a value no longer listed', async () => {
		const onChange = jest.fn();
		await render(group('p1', 'new'), onChange);
		await flush();
		expect(stageBodies()).toEqual([{ productId: 'p1' }]);
		expect(onChange).not.toHaveBeenCalled();

		await render(group('p2', 'new'), onChange);
		await flush();
		expect(stageBodies()).toEqual([{ productId: 'p1' }, { productId: 'p2' }]);
		expect(onChange).toHaveBeenCalledTimes(1);
		const next = onChange.mock.calls[0][0];
		expect(next.conditions[1].value).toBe('');
		expect(next.conditions[0].value).toBe('p2');
	});

	it('keeps the chosen value when the new list still holds it', async () => {
		const onChange = jest.fn();
		await render(group('p1', 'won'), onChange);
		await flush();
		await render(group('p2', 'won'), onChange);
		await flush();
		expect(stageBodies().length).toBe(2);
		expect(onChange).not.toHaveBeenCalled();
	});

	it('calls the function with an empty argument when no sibling is chosen', async () => {
		const onChange = jest.fn();
		await render(
			{
				operator: 'AND',
				conditions: [{ field: 'trigger.stage', operator: 'EQUALS', value: '' }],
			},
			onChange,
		);
		await flush();
		expect(stageBodies()).toEqual([{}]);
	});

	it('a field without dependsOn posts {} and never clears', async () => {
		const onChange = jest.fn();
		const g: ConditionGroup = {
			operator: 'AND',
			conditions: [{ field: 'trigger.productId', operator: 'EQUALS', value: 'gone' }],
		};
		await render(g, onChange);
		await flush();
		const prodBodies = mockPost.mock.calls.filter(c => c[0].endsWith('/prods')).map(c => c[1]);
		expect(prodBodies).toEqual([{}]);
		expect(onChange).not.toHaveBeenCalled();
	});
});
