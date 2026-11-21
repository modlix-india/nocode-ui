/**
 * The widget, dashboard and editor views rendered in jsdom against the sample data transport
 * (shaped like CONTRACT section 3). STUBBED: the store (theme palette), and chart.js (jsdom has
 * no canvas; canvas views are covered by reportChartConfig.test.ts).
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => undefined,
}));
jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { fixtureTransport, FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportWidgetView } from '../ui/ReportWidgetView';
import { DashboardView } from '../ui/DashboardView';
import { ReportEditorView, tidySpec, measureAs } from '../ui/ReportEditorView';
import { resetStore } from '../dashboardStore';
import { clearCatalogCache } from '../reportApi';
import { ReportSpec } from '../reportTypes';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	resetStore();
	clearCatalogCache();
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});

async function settle(ms = 400) {
	for (let i = 0; i < 6; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

const kpi = FIXTURE_CATALOG.defaults!.find(d => d.id === 'totalBookings')!.spec;
const bar = FIXTURE_CATALOG.defaults!.find(d => d.id === 'salesPerformance')!.spec;

test('a KPI widget runs, shows the number in the catalog locale and "Updated"', async () => {
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction="CxZump.reportRun"
				catalog={FIXTURE_CATALOG}
				spec={kpi}
				name="Total bookings"
			/>,
		),
	);
	expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
	await settle();
	expect(host.querySelector('._rpKpiValue')?.textContent).toMatch(/^\d/);
	expect(host.textContent).toContain('Updated');
	expect(host.querySelector('._rpTitle')?.textContent).toBe('Total bookings');
});

test('the type picker greys out views that do not fit, and switching does not run again', async () => {
	const spy = jest.spyOn(fixtureTransport, 'call');
	const onSpecChange = jest.fn();
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction="CxZump.reportRun"
				catalog={FIXTURE_CATALOG}
				spec={bar}
				editable
				onSpecChange={onSpecChange}
			/>,
		),
	);
	await settle();
	const runs = spy.mock.calls.length;
	act(() => (host.querySelector('[aria-label="Chart type"]') as HTMLButtonElement).click());
	const kpiBtn = [...host.querySelectorAll('._rpType')].find(
		b => b.textContent === 'Number',
	) as HTMLButtonElement;
	expect(kpiBtn.className).toContain('_off');
	act(() => kpiBtn.click());
	expect(host.querySelector('._rpReason')?.textContent).toBe(
		'Number needs a single number: remove the group by',
	);
	const table = [...host.querySelectorAll('._rpType')].find(
		b => b.textContent === 'Table',
	) as HTMLButtonElement;
	act(() => table.click());
	expect(onSpecChange).toHaveBeenCalledWith(
		expect.objectContaining({ view: expect.objectContaining({ type: 'TABLE' }) }),
	);
	await settle();
	expect(spy.mock.calls.length).toBe(runs);
	spy.mockRestore();
});

test('not editable: a type switch lasts for the session and shows the new view', async () => {
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction="CxZump.reportRun"
				catalog={FIXTURE_CATALOG}
				spec={bar}
			/>,
		),
	);
	await settle();
	act(() => (host.querySelector('[aria-label="Chart type"]') as HTMLButtonElement).click());
	const table = [...host.querySelectorAll('._rpType')].find(
		b => b.textContent === 'Table',
	) as HTMLButtonElement;
	act(() => table.click());
	expect(host.querySelector('._rpTable')).not.toBeNull();
	expect(host.querySelectorAll('._rpTable tbody tr').length).toBeGreaterThan(0);
});

test('a runner error shows the message and Try again', async () => {
	const bad: ReportSpec = { ...kpi, view: { type: 'PIE' } };
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction="CxZump.reportRun"
				catalog={FIXTURE_CATALOG}
				spec={bad}
			/>,
		),
	);
	await settle();
	expect(host.querySelector('[role="alert"]')?.textContent).toContain('Try again');
});

test('the dashboard seeds the app defaults on a first visit and saves them', async () => {
	const save = jest.spyOn(fixtureTransport, 'saveDoc');
	act(() =>
		root.render(
			<DashboardView
				transport={fixtureTransport}
				catalogFunction="CxZump.reportCatalog"
				runFunction="CxZump.reportRun"
				name="viewtest"
				editable
			/>,
		),
	);
	await settle();
	const titles = [...host.querySelectorAll('._rpTitle')].map(e => e.textContent);
	expect(titles).toEqual(
		expect.arrayContaining([
			'Total bookings',
			'Total EOIs',
			'Sales performance',
			'Customer acquisition',
		]),
	);
	expect(host.textContent).toContain('Reset to defaults');
	expect(host.querySelector('select')).not.toBeNull();
	await settle(2500);
	expect(save).toHaveBeenCalledWith(
		'reports_viewtest',
		expect.objectContaining({
			seenDefaults: ['totalBookings', 'totalEois', 'salesPerformance', 'customerAcquisition'],
		}),
	);
	// The library lists every saved widget.
	const lib = [...host.querySelectorAll('button')].find(b =>
		b.textContent?.includes('Library'),
	) as HTMLButtonElement;
	act(() => lib.click());
	expect(host.querySelectorAll('._rpLibRow').length).toBe(4);
	save.mockRestore();
});

test('the editor validates with a dry run, previews, and saves', async () => {
	const onSave = jest.fn();
	act(() =>
		root.render(
			<ReportEditorView
				transport={fixtureTransport}
				catalog={FIXTURE_CATALOG}
				runFunction="CxZump.reportRun"
				onSave={onSave}
			/>,
		),
	);
	await settle(700);
	const save = [...host.querySelectorAll('button')].find(
		b => b.textContent === 'Save',
	) as HTMLButtonElement;
	expect(save.disabled).toBe(true);
	const name = host.querySelector('input._rpInput') as HTMLInputElement;
	await act(async () => {
		const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
		setter.call(name, 'My count');
		name.dispatchEvent(new Event('input', { bubbles: true }));
	});
	await settle(700);
	expect(host.querySelector('._rpEditorPreview ._rpKpiValue')).not.toBeNull();
	expect(save.disabled).toBe(false);
	await act(async () => save.click());
	expect(onSave).toHaveBeenCalledWith(
		expect.objectContaining({
			name: 'My count',
			spec: expect.objectContaining({ source: 'cases' }),
		}),
	);
});

test('tidySpec keeps view keys valid and the type fitting', () => {
	const s = tidySpec(
		{
			v: 1,
			source: 'cases',
			measures: [{ fn: 'COUNT', as: 'n' }],
			groupBy: [{ field: 'assignedUserId', as: 'rm' }],
			view: { type: 'KPI', y: ['gone'] },
		},
		FIXTURE_CATALOG,
	);
	expect(s.view).toEqual({ type: 'BAR', x: 'rm' });
	expect(measureAs('SUM', 'agreementValue', new Set(['sum_agreementValue']))).toBe(
		'sum_agreementValue_2',
	);
});

describe('the runner leaves null values out of the output', () => {
	const sparse = (out: any) => ({
		call: async () => [{ name: 'output', result: { result: out } }],
		loadDoc: async () => ({}),
		saveDoc: async () => {},
	});

	test('a KPI whose SUM had no values shows a dash; no period, no crash', async () => {
		const t = sparse({
			ok: true,
			columns: [
				{ key: 'value', label: 'Value', kind: 'MEASURE', format: 'MONEY', currency: 'INR' },
			],
			rows: [{}],
		});
		act(() =>
			root.render(
				<ReportWidgetView
					transport={t}
					runFunction="X.reportRun"
					catalog={FIXTURE_CATALOG}
					spec={kpi}
				/>,
			),
		);
		await settle();
		expect(host.querySelector('._rpKpiValue')?.textContent).toBe('-');
		expect(host.querySelector('[role="alert"]')).toBeNull();
	});

	test('a table shows a missing cell blank and the picker follows the runner fits', async () => {
		const t = sparse({
			ok: true,
			columns: [
				{ key: 'rm', label: 'RM', kind: 'DIMENSION' },
				{ key: 'rm_label', hidden: true },
				{ key: 'bookings', label: 'Bookings', kind: 'MEASURE' },
			],
			rows: [
				{ rm: 'u1', rm_label: 'Asha', bookings: 3 },
				{ rm: 'u2', rm_label: 'Ravi' },
			],
			fits: { PIE: { ok: false, reason: 'Runner says no pie here' } },
		});
		const tableSpec: ReportSpec = { ...bar, view: { type: 'TABLE' } };
		act(() =>
			root.render(
				<ReportWidgetView
					transport={t}
					runFunction="X.reportRun"
					catalog={FIXTURE_CATALOG}
					spec={tableSpec}
				/>,
			),
		);
		await settle();
		const cells = [...host.querySelectorAll('._rpTable tbody tr')].map(tr =>
			[...tr.querySelectorAll('td')].map(td => td.textContent),
		);
		expect(cells).toEqual([
			['Asha', '3'],
			['Ravi', ''],
		]);
		act(() => (host.querySelector('[aria-label="Chart type"]') as HTMLButtonElement).click());
		const pie = [...host.querySelectorAll('._rpType')].find(
			b => b.textContent === 'Pie',
		) as HTMLButtonElement;
		expect(pie.className).toContain('_off');
		expect(pie.title).toBe('Runner says no pie here');
	});
});
