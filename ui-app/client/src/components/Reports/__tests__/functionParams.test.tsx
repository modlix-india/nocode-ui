/**
 * PLAT-1705: a function source's options as simple inputs (no JSON box), writing the same
 * `spec.params` as before.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { FIXTURE_CATALOG, fixtureTransport } from '../fixtures/reportFixtures';
import { clearCatalogCache, ReportTransport } from '../reportApi';
import { ReportCatalog, ReportSpec } from '../reportTypes';
import { editableParams, paramLabel, setParam } from '../ui/FunctionParams';
import { ReportEditorView } from '../ui/ReportEditorView';

const CATALOG: ReportCatalog = {
	...FIXTURE_CATALOG,
	sources: {
		...FIXTURE_CATALOG.sources,
		tasks: {
			kind: 'FUNCTION',
			function: 'CxZump.taskList',
			label: 'Tasks',
			paging: { param: 'page', size: 20 },
			params: { mine: true, status: 'OPEN', size: 20, page: 0, productId: '' },
			columns: { title: { path: 'title', label: 'Task', kind: 'DIMENSION' } },
		},
	},
};

/** The sample transport, but runs of the test's own function source answer an empty table. */
const transport: ReportTransport = {
	...fixtureTransport,
	async call(fn, args) {
		if (/reportRun$/.test(fn) && args?.spec?.source === 'tasks')
			return [
				{
					name: 'output',
					result: {
						result: {
							ok: true,
							columns: [{ key: 'title', label: 'Task', kind: 'DIMENSION' }],
							rows: [],
						},
					},
				},
			];
		return fixtureTransport.call(fn, args);
	},
};

describe('helpers', () => {
	it('keys: allowedParams, else params, never the paging param', () => {
		expect(editableParams(CATALOG.sources.tasks)).toEqual([
			'mine',
			'status',
			'size',
			'productId',
		]);
		expect(
			editableParams({ ...CATALOG.sources.tasks, allowedParams: ['page', 'status'] }),
		).toEqual(['status']);
	});
	it('labels from a catalog field, else words', () => {
		expect(paramLabel('productId', CATALOG)).toBe('Project');
		expect(paramLabel('waitingForMe', CATALOG)).toBe('Waiting for me');
	});
	it('only set values are kept; none is undefined', () => {
		expect(setParam(undefined, 'a', 1)).toEqual({ a: 1 });
		expect(setParam({ a: 1 }, 'a', '')).toBeUndefined();
		expect(setParam({ a: 1, b: false }, 'a', undefined)).toEqual({ b: false });
	});
});

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	clearCatalogCache();
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});
async function settle(ms = 300, n = 8) {
	for (let i = 0; i < n; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}
function setValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
	const proto =
		el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
	act(() => {
		Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
		el.dispatchEvent(
			new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }),
		);
	});
}

test('the editor shows inputs for a function source and writes spec.params', async () => {
	const saved: ReportSpec[] = [];
	act(() =>
		root.render(
			<ReportEditorView
				transport={transport}
				catalog={CATALOG}
				runFunction="CxZump.reportRun"
				initial={{
					name: 'T',
					spec: { v: 1, source: 'tasks', view: { type: 'TABLE' } },
					refreshMin: 0,
				}}
				onSave={v => {
					saved.push(v.spec);
				}}
			/>,
		),
	);
	await settle();
	expect(document.body.textContent).not.toContain('Parameters (JSON)');
	const q = (n: string) =>
		document.body.querySelector(`[name="${n}"]`) as HTMLInputElement & HTMLSelectElement;
	expect(q('mine').tagName).toBe('SELECT');
	expect(q('size').type).toBe('number');
	expect(q('page')).toBeNull();
	// productId is a catalog field: a select of its values.
	expect(q('productId').tagName).toBe('SELECT');
	expect([...q('productId').options].length).toBeGreaterThan(1);
	setValue(q('mine'), 'false');
	setValue(q('size'), '5');
	setValue(q('status'), q('status').options[1].value);
	setValue(q('productId'), q('productId').options[1].value);
	await settle(600);
	const save = [...document.body.querySelectorAll('button')].find(
		b => b.textContent === 'Save',
	) as HTMLButtonElement;
	await act(async () => save.click());
	expect(saved[0].params).toEqual({
		mine: false,
		size: 5,
		status: q('status').options[1].value,
		productId: q('productId').options[1].value,
	});
	setValue(q('mine'), '');
	setValue(q('size'), '');
	setValue(q('status'), '');
	setValue(q('productId'), '');
	await settle(600);
	await act(async () => save.click());
	expect(saved[1].params).toBeUndefined();
});
