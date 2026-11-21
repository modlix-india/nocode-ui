/**
 * CSV data import (CONTRACT 10) in jsdom against the sample data transport: Import data from
 * the editor's Data picker (preview, type override, save in parts, the new dataset picked as
 * the source), the dataset list (rename, delete with confirm) and "Dataset deleted" on a widget.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { datasetFunctions, listDatasets } from '../datasetApi';
import { fixtureTransport, resetFixtureDatasets } from '../fixtures/reportFixtures';
import { clearCatalogCache } from '../reportApi';
import { DatasetListDialog } from '../ui/Datasets';
import { useCatalog } from '../ui/hooks';
import { ReportEditorView } from '../ui/ReportEditorView';
import { ReportWidgetView } from '../ui/ReportWidgetView';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	clearCatalogCache();
	resetFixtureDatasets();
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});

async function settle(ms = 400, n = 8) {
	for (let i = 0; i < n; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

const fns = datasetFunctions('CxZump')!;
/** A sample transport call under fake timers (it waits 150 ms). */
async function run<T>(p: Promise<T>): Promise<T> {
	await settle(200, 2);
	return p;
}
const buttons = () => [...document.body.querySelectorAll('button')] as HTMLButtonElement[];
const button = (text: string) => {
	const b = buttons().find(e => e.textContent?.trim() === text);
	if (!b) throw new Error(`no button "${text}"`);
	return b;
};

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

async function pickFile(text: string, name = 'sales_q3.csv') {
	const input = document.body.querySelector('input[type="file"]') as HTMLInputElement;
	const file = new File([text], name, { type: 'text/csv' });
	Object.defineProperty(input, 'files', { value: [file], configurable: true });
	await act(async () => {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await settle(50);
}

function Harness() {
	const { catalog } = useCatalog(fixtureTransport, 'CxZump.reportCatalog');
	if (!catalog) return null;
	return (
		<ReportEditorView
			transport={fixtureTransport}
			catalog={catalog}
			runFunction="CxZump.reportRun"
			onSave={() => {}}
			datasets={fns}
		/>
	);
}

const CSV =
	'City,Amount,Sold on\n' +
	Array.from(
		{ length: 1200 },
		(_, i) => `${['Pune', 'Goa', 'Delhi'][i % 3]},${(i * 7) % 500},2026-0${(i % 9) + 1}-15`,
	).join('\n');

test('Import data from the Data picker: preview, override, save in parts, picked as the source', async () => {
	act(() => root.render(<Harness />));
	await settle();
	const data = () =>
		[...document.body.querySelectorAll('label')]
			.find(l => l.textContent?.startsWith('Data'))!
			.querySelector('select') as HTMLSelectElement;
	expect([...data().options].map(o => o.textContent)).toContain('Import data from CSV');
	setValue(data(), '__importData__');
	await settle();
	expect(document.body.textContent).toContain('Pick a CSV file');
	await pickFile(CSV);
	// Preview: 20 rows, inferred types.
	expect(document.body.querySelectorAll('._rpImport tbody tr').length).toBe(20);
	const typeOf = (h: string) =>
		document.body.querySelector(`select[aria-label="Type of ${h}"]`) as HTMLSelectElement;
	expect(typeOf('City').value).toBe('TEXT');
	expect(typeOf('Amount').value).toBe('NUMBER');
	expect(typeOf('Sold on').value).toBe('DATE');
	expect(
		(document.body.querySelector('._rpModal input._rpInput') as HTMLInputElement).value,
	).toBe('sales q3');
	// A number column read as dates shows how many would be left empty.
	setValue(typeOf('Amount'), 'DATE');
	expect(document.body.textContent).toMatch(/1,200 not dates/);
	setValue(typeOf('Amount'), 'NUMBER');
	const label = document.body.querySelector(
		'input[aria-label="Label of Amount"]',
	) as HTMLInputElement;
	setValue(label, 'Amount (INR)');

	await act(async () => button('Save data').click());
	expect(document.body.textContent).toMatch(/Saving sales q3: part \d of 2/);
	await settle(200, 20);
	expect(document.body.textContent).toContain('Saved sales q3 with 1,200 rows.');
	const list = await run(listDatasets(fixtureTransport, fns));
	expect(list).toHaveLength(1);
	expect(list[0].rowCount).toBe(1200);
	expect(list[0].columns.map(c => [c.slot, c.label, c.type])).toEqual([
		['s1', 'City', 'TEXT'],
		['n1', 'Amount (INR)', 'NUMBER'],
		['d1', 'Sold on', 'DATE'],
	]);
	act(() => button('Done').click());
	await settle(400, 12);
	// The catalog reloaded: the dataset is under "Your data" and is now the source.
	expect(data().value).toBe(`dataset:${list[0]._id}`);
	const groups = [...data().querySelectorAll('optgroup')].map(g => g.label);
	expect(groups).toEqual(['App data', 'Your data', 'Your files']);
	// Its fields are in the field list.
	expect(document.body.querySelector('._rpFields')!.textContent).toContain('Amount (INR)');
});

test('refuses a file without rows or over 10 MB', async () => {
	act(() =>
		root.render(
			<DatasetListDialog transport={fixtureTransport} fns={fns} onClose={() => {}} />,
		),
	);
	await settle();
	expect(document.body.textContent).toContain('No data yet.');
	act(() => button('Import data').click());
	await settle(50);
	await pickFile('only,a,header\n');
	expect(document.body.textContent).toContain('No rows found.');
	const input = document.body.querySelector('input[type="file"]') as HTMLInputElement;
	const big = { size: 11 * 1024 * 1024, name: 'big.csv' } as File;
	Object.defineProperty(input, 'files', { value: [big], configurable: true });
	await act(async () => {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	expect(document.body.textContent).toContain('larger than 10 MB');
});

test('the dataset list: rename and delete with a confirm; a widget on it shows Dataset deleted', async () => {
	await run(
		fixtureTransport.call(fns.save, {
			name: 'Stock',
			columns: [{ slot: 's1', label: 'Item', type: 'TEXT', csvHeader: 'Item' }],
			rows: [['a'], ['b']],
			part: 1,
			parts: 1,
		}),
	);
	act(() =>
		root.render(
			<DatasetListDialog transport={fixtureTransport} fns={fns} onClose={() => {}} />,
		),
	);
	await settle();
	expect(document.body.textContent).toContain('2 rows, 1 columns');
	act(() => button('Rename').click());
	setValue(
		document.body.querySelector('input[aria-label="New name"]') as HTMLInputElement,
		'Stock 2',
	);
	await act(async () => button('Save').click());
	await settle();
	expect((await run(listDatasets(fixtureTransport, fns)))[0].name).toBe('Stock 2');
	expect((await run(listDatasets(fixtureTransport, fns)))[0].rowCount).toBe(2);

	act(() => button('Delete').click());
	expect(document.body.textContent).toContain(
		'Delete Stock 2? Widgets on it will show Dataset deleted.',
	);
	await act(async () =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Delete')
			.pop()!
			.click(),
	);
	await settle();
	expect(await run(listDatasets(fixtureTransport, fns))).toEqual([]);
	expect(document.body.textContent).toContain('No data yet.');

	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction="CxZump.reportRun"
				spec={{
					v: 1,
					source: 'dataset:ds1',
					measures: [{ fn: 'COUNT', as: 'n' }],
					view: { type: 'KPI' },
				}}
				name="Stock"
			/>,
		),
	);
	await settle();
	expect(document.body.textContent).toContain('Dataset deleted');
});
