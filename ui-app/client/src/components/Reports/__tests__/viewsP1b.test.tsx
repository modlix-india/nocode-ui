/**
 * P1b in jsdom against the sample data transport: click-through (CONTRACT 8.0), View records,
 * compare, the mark menu, the shelves editor and import (8.1 to 8.3). chart.js is stubbed (no
 * canvas); the stub keeps the props so a mark click can be simulated.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => undefined,
}));
const chartProps: { current?: any } = {};
jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef((p: any, _ref) => {
		chartProps.current = p;
		return <div className="fakeChart" />;
	}),
}));

import { fixtureTransport, FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportWidgetView } from '../ui/ReportWidgetView';
import { ReportEditorView } from '../ui/ReportEditorView';
import { DashboardView } from '../ui/DashboardView';
import { resetStore } from '../dashboardStore';
import { clearCatalogCache } from '../reportApi';
import { reportFile } from '../reportExport';
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
	chartProps.current = undefined;
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});

async function settle(ms = 400, n = 6) {
	for (let i = 0; i < n; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

const button = (text: string | RegExp) =>
	[...host.querySelectorAll('button')].find(b =>
		typeof text === 'string' ? b.textContent?.trim() === text : text.test(b.textContent ?? ''),
	) as HTMLButtonElement | undefined;

const kpi = FIXTURE_CATALOG.defaults!.find(d => d.id === 'totalBookings')!.spec;
const RUN = 'CxZump.reportRun';

test('a KPI with a count link opens the cases list with the filter and period filled (click and Enter)', async () => {
	const nav = jest.fn();
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction={RUN}
				catalog={FIXTURE_CATALOG}
				spec={kpi}
				defaultId="totalBookings"
				dashboard={{ quick: { productId: ['p1'] } }}
				onNavigate={nav}
			/>,
		),
	);
	await settle();
	const tile = host.querySelector('._rpKpi[role="link"]') as HTMLElement;
	expect(tile).not.toBeNull();
	expect(tile.tabIndex).toBe(0);
	act(() => tile.click());
	expect(nav).toHaveBeenLastCalledWith(
		'/cases?dash=BOOKING&product=p1&from=2026-10-01&to=2026-12-31',
		false,
	);
	act(() => {
		tile.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
	});
	expect(nav).toHaveBeenCalledTimes(2);
	// A chart of the same source is no "View all" (that belongs under lists).
	expect(button(/View all/)).toBeUndefined();
});

test('My tasks: rows with a case open it, rows without do not; Load more appends pages', async () => {
	const nav = jest.fn();
	const tasks: ReportSpec = { v: 1, source: 'myTasks', params: { page: 0 }, view: { type: 'TABLE' } };
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction={RUN}
				catalog={FIXTURE_CATALOG}
				spec={tasks}
				onNavigate={nav}
			/>,
		),
	);
	await settle();
	expect(host.querySelectorAll('._rpTable tbody tr').length).toBe(20);
	expect(host.querySelectorAll('tr._rpLinkRow').length).toBe(16);
	const first = host.querySelector('tr._rpLinkRow') as HTMLElement;
	act(() => first.click());
	expect(nav).toHaveBeenCalledWith('/caseView/c1', false);
	act(() => button('Load more')!.click());
	await settle();
	expect(host.querySelectorAll('._rpTable tbody tr').length).toBe(40);
	act(() => button('Load more')!.click());
	await settle();
	expect(host.querySelectorAll('._rpTable tbody tr').length).toBe(45);
	expect(button('Load more')).toBeUndefined();
});

test('a table of cases shows "View all"; View records pages 100 at a time and rows open the case', async () => {
	const nav = jest.fn();
	const spec: ReportSpec = {
		v: 1,
		source: 'cases',
		measures: [{ fn: 'COUNT', as: 'n' }],
		groupBy: [{ field: 'productId', as: 'p' }],
		view: { type: 'TABLE' },
	};
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction={RUN}
				catalog={FIXTURE_CATALOG}
				spec={spec}
				onNavigate={nav}
			/>,
		),
	);
	await settle();
	// Aggregated rows have no case id: not links.
	expect(host.querySelectorAll('tr._rpLinkRow').length).toBe(0);
	act(() => button(/View all/)!.click());
	expect(nav).toHaveBeenLastCalledWith('/cases', false);
	act(() => (host.querySelector('[aria-label="More"]') as HTMLButtonElement).click());
	act(() => button('View records')!.click());
	await settle();
	const dialog = host.querySelector('[role="dialog"][aria-label$="records"]') as HTMLElement;
	expect(dialog.querySelectorAll('tbody tr').length).toBe(100);
	expect(dialog.textContent).toContain('1 to 100 of 230');
	expect([...dialog.querySelectorAll('th')].map(t => t.textContent)).not.toContain('_id');
	act(() => button(/Next/)!.click());
	await settle();
	expect(dialog.textContent).toContain('101 to 200 of 230');
	act(() => (dialog.querySelector('tbody tr') as HTMLElement).click());
	expect(nav).toHaveBeenLastCalledWith('/caseView/c101', false);
});

test('compare: the menu toggle adds a delta chip on the KPI; All time cannot compare', async () => {
	const quarter: ReportSpec = { ...kpi, filters: [{ field: 'bookedAt', period: 'THIS_QUARTER' }] };
	act(() =>
		root.render(
			<ReportWidgetView transport={fixtureTransport} runFunction={RUN} catalog={FIXTURE_CATALOG} spec={quarter} />,
		),
	);
	await settle();
	expect(host.querySelector('._rpDelta')).toBeNull();
	act(() => (host.querySelector('[aria-label="More"]') as HTMLButtonElement).click());
	act(() => button('Previous period')!.click());
	await settle();
	expect(host.querySelector('._rpDelta')?.textContent).toMatch(/%\s?vs previous period$/);

	act(() =>
		root.render(
			<ReportWidgetView transport={fixtureTransport} runFunction={RUN} catalog={FIXTURE_CATALOG} spec={{ ...kpi, name: 'x' } as any} key="b" />,
		),
	);
	await settle();
	act(() => (host.querySelector('[aria-label="More"]') as HTMLButtonElement).click());
	expect(button('Previous period')!.disabled).toBe(true);
	expect(host.textContent).toContain('All time cannot be compared');
});

test('the mark menu offers hierarchy drill, Filter dashboard and View records', async () => {
	const onCross = jest.fn();
	const spec: ReportSpec = {
		v: 1,
		source: 'cases',
		measures: [{ fn: 'COUNT', as: 'n' }],
		groupBy: [{ field: 'productId', as: 'p' }],
		view: { type: 'BAR', x: 'p' },
	};
	act(() =>
		root.render(
			<ReportWidgetView
				transport={fixtureTransport}
				runFunction={RUN}
				catalog={FIXTURE_CATALOG}
				spec={spec}
				onCrossFilter={onCross}
			/>,
		),
	);
	await settle();
	await settle();
	expect(chartProps.current?.onMarkClick).toBeDefined();
	act(() => chartProps.current.onMarkClick({ datasetIndex: 0, index: 0, x: 10, y: 10 }));
	const items = [...host.querySelectorAll('[role="menu"] ._rpMenuItem')].map(b => b.textContent);
	expect(items).toEqual(['Keep only', 'Exclude', 'Drill downunit', 'Filter dashboard', 'View data', 'View records']);
	act(() => button('Filter dashboard')!.click());
	expect(onCross).toHaveBeenCalledWith([{ field: 'productId', op: 'EQ', values: ['p1'], label: 'Project is Tower A' }]);
	act(() => chartProps.current.onMarkClick({ datasetIndex: 0, index: 0, x: 10, y: 10 }));
	act(() => button(/Drill down/)!.click());
	await settle();
	expect(host.querySelector('._rpCrumbs')?.textContent).toBe('All project/Tower A');
});

test('the shelves editor: tap a field, pick a shelf, undo with Ctrl+Z, Save as new', async () => {
	const onSave = jest.fn();
	const onSaveAsNew = jest.fn();
	act(() =>
		root.render(
			<ReportEditorView
				transport={fixtureTransport}
				catalog={FIXTURE_CATALOG}
				runFunction={RUN}
				initial={{ name: 'Mine', spec: kpi, refreshMin: 0 }}
				onSave={onSave}
				onSaveAsNew={onSaveAsNew}
			/>,
		),
	);
	await settle(700);
	const field = [...host.querySelectorAll('._rpField')].find(b => b.textContent === 'Project') as HTMLButtonElement;
	act(() => field.click());
	act(() => button('Columns')!.click());
	await settle(700);
	const cols = host.querySelector('[data-shelf="columns"]')!;
	expect(cols.textContent).toContain('Project');
	act(() => {
		host.querySelector('._rpEditor')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
	});
	await settle(700);
	expect(host.querySelector('[data-shelf="columns"]')!.textContent).not.toContain('Project');
	act(() => (host.querySelector('[aria-label^="Redo"]') as HTMLButtonElement).click());
	await settle(700);
	expect(host.querySelector('[data-shelf="columns"]')!.textContent).toContain('Project');
	await act(async () => button('Save as new')!.click());
	expect(onSaveAsNew).toHaveBeenCalledWith(
		expect.objectContaining({
			name: 'Mine',
			spec: expect.objectContaining({
				groupBy: [{ field: 'productId', as: 'productId' }],
				view: expect.objectContaining({ type: 'BAR', x: 'productId' }),
			}),
		}),
	);
	expect(onSave).not.toHaveBeenCalled();
	// Discard (no close handler here) puts the editor back to where it started.
	act(() => button('Discard')!.click());
	await settle(700);
	expect(host.querySelector('[data-shelf="columns"]')!.textContent).not.toContain('Project');
});

test('import a widget file into the library: checked, kept with the reason when refused', async () => {
	act(() =>
		root.render(
			<DashboardView
				transport={fixtureTransport}
				catalogFunction="CxZump.reportCatalog"
				runFunction={RUN}
				name="importtest"
				editable
				mode="library"
			/>,
		),
	);
	await settle();
	const before = host.querySelectorAll('._rpLibRow').length;
	const file = reportFile('CxZump', [
		{ id: 'a', name: 'Good one', spec: kpi },
		{ id: 'b', name: 'Bad one', spec: { ...kpi, source: 'nowhere' } },
	]);
	const input = host.querySelector('input[type="file"]') as HTMLInputElement;
	const f = new File([JSON.stringify(file)], 'w.json', { type: 'application/json' });
	Object.defineProperty(input, 'files', { value: [f], configurable: true });
	await act(async () => {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await settle(400, 10);
	const dialog = host.querySelector('[aria-label="Import widgets"]') as HTMLElement;
	expect(dialog.textContent).toContain('Good one');
	expect(dialog.textContent).toContain('Kept, not available: Unknown source nowhere');
	act(() => button('Import')!.click());
	await settle();
	expect(host.querySelectorAll('._rpLibRow').length).toBe(before + 2);
	expect(host.textContent).toContain('Imported 2 widgets.');
	expect(host.textContent).toContain('Not available: Unknown source nowhere');
});
