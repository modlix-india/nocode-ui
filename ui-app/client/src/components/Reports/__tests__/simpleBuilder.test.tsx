/**
 * "List first, simple builder" (Kiran 2026-11-21) in jsdom against the sample data transport:
 * the four questions edit the spec, a spec they cannot show opens More options and saves intact,
 * the save dialog, the report cards (switch, menu) and New report / Edit / a prompt on the list
 * going to the page's builder.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { resetStore } from '../dashboardStore';
import { FIXTURE_CATALOG, fixtureTransport } from '../fixtures/reportFixtures';
import { clearCatalogCache, ReportTransport } from '../reportApi';
import {
	closeBuilder,
	openBuilder,
	registerEditor,
	registerLibrary,
	resetReportsPage,
	useReportsPage,
} from '../reportsPage';
import { ReportSpec } from '../reportTypes';
import { DashboardView } from '../ui/DashboardView';
import { ReportEditorView } from '../ui/ReportEditorView';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	resetStore();
	clearCatalogCache();
	resetReportsPage();
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
const buttons = () => [...document.body.querySelectorAll('button')] as HTMLButtonElement[];
const button = (text: string) => buttons().find(b => b.textContent?.trim() === text);
function choose(name: string, value: string) {
	const el = document.body.querySelector(`select[name="${name}"]`) as HTMLSelectElement;
	act(() => {
		Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, value);
		el.dispatchEvent(new Event('change', { bubbles: true }));
	});
}
const footSave = () =>
	[...document.body.querySelectorAll('._rpBuilderFoot button')].find(
		b => b.textContent === 'Save',
	) as HTMLButtonElement;

/** Runs of any spec answer an empty result, so every spec "passes" its dry run. */
const okTransport: ReportTransport = {
	...fixtureTransport,
	async call(fn, args) {
		if (/reportRun$/.test(fn))
			return [{ name: 'output', result: { result: { ok: true, columns: [], rows: [] } } }];
		return fixtureTransport.call(fn, args);
	},
};

describe('the simple builder', () => {
	it('the four questions edit the spec; More options is closed; Save asks for a name', async () => {
		const onSave = jest.fn();
		act(() =>
			root.render(
				<ReportEditorView
					transport={fixtureTransport}
					catalog={FIXTURE_CATALOG}
					runFunction="CxZump.reportRun"
					onSave={onSave}
					extra={<label className="_rpCheck">Group picker here</label>}
				/>,
			),
		);
		await settle(700);
		const more = document.body.querySelector('details._rpMoreOptions') as HTMLDetailsElement;
		expect(more.open).toBe(false);
		choose('segment', 'bookings');
		choose('by', 'd:assignedUserId');
		choose('period', 'THIS_QUARTER');
		await settle(700);
		expect(document.body.querySelector('._rpEditorSide ._rpMuted')?.textContent).toBe(
			'Count of bookings by RM, this quarter',
		);
		// Only chart types that fit: no Number for a split, no greyed grid.
		const types = [...document.body.querySelectorAll('._rpSuggest [role="radio"]')].map(
			b => b.textContent,
		);
		expect(types).not.toContain('Number');
		expect(types.length).toBeLessThanOrEqual(6);
		act(() => button('More')!.click());
		expect(document.body.querySelector('._rpTypes')).not.toBeNull();

		await act(async () => footSave().click());
		const dialog = document.body.querySelector('[aria-label="Save report"]') as HTMLElement;
		expect((dialog.querySelector('input') as HTMLInputElement).value).toBe(
			'Count of bookings by RM',
		);
		// The page's choices (group, dashboard) sit in the dialog.
		expect(dialog.textContent).toContain('Group picker here');
		act(() => button('Cancel')!.click());
		expect(document.body.querySelector('[aria-label="Save report"]')).toBeNull();
		expect(onSave).not.toHaveBeenCalled();
		await act(async () => footSave().click());
		await act(async () =>
			(
				document.body.querySelector('._rpModal button[type="submit"]') as HTMLButtonElement
			).click(),
		);
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Count of bookings by RM',
				spec: expect.objectContaining({
					segment: 'bookings',
					groupBy: [expect.objectContaining({ field: 'assignedUserId' })],
					filters: [expect.objectContaining({ period: 'THIS_QUARTER' })],
				}),
			}),
		);
	});

	it('a spec the questions cannot show opens More options and saves intact', async () => {
		const rich: ReportSpec = {
			v: 1,
			source: 'cases',
			measures: [
				{ fn: 'COUNT', as: 'n' },
				{ fn: 'SUM', field: 'agreementValue', as: 'v' },
			],
			groupBy: [
				{ field: 'assignedUserId', as: 'rm' },
				{ field: 'productId', as: 'p' },
			],
			filters: [{ field: 'status', op: 'IN', values: ['OPEN'] }],
			view: { type: 'GROUPED_BAR', x: 'rm', y: ['n', 'v'] },
		};
		const onSave = jest.fn();
		act(() =>
			root.render(
				<ReportEditorView
					transport={okTransport}
					catalog={FIXTURE_CATALOG}
					runFunction="CxZump.reportRun"
					initial={{ name: 'Rich', spec: rich, refreshMin: 0 }}
					onSave={onSave}
				/>,
			),
		);
		await settle(700);
		expect(
			(document.body.querySelector('details._rpMoreOptions') as HTMLDetailsElement).open,
		).toBe(true);
		expect(document.body.textContent).toContain(
			'This report also has more than one value, a colour split, filters: see More options.',
		);
		await act(async () => footSave().click());
		await act(async () =>
			(
				document.body.querySelector('._rpModal button[type="submit"]') as HTMLButtonElement
			).click(),
		);
		const saved = onSave.mock.calls[0][0].spec as ReportSpec;
		expect(saved.measures).toEqual(rich.measures);
		expect(saved.groupBy).toEqual(rich.groupBy);
		expect(saved.filters).toEqual(rich.filters);
		expect(saved.view.type).toBe('GROUPED_BAR');
	});
});

describe('the report list', () => {
	const lib = (extra: Record<string, any> = {}) => (
		<DashboardView
			transport={fixtureTransport}
			catalogFunction="CxZump.reportCatalog"
			runFunction="CxZump.reportRun"
			name={extra.name ?? 'cardtest'}
			editable
			mode="library"
			lockMode
			{...extra}
		/>
	);
	const counts = () => /(\d+) of 100 saved · (\d+) of 24/.exec(document.body.textContent ?? '')!;

	it('cards: preview, plain words, the On dashboard switch and the menu', async () => {
		act(() => root.render(lib()));
		await settle();
		const cards = document.body.querySelectorAll('._rpCard');
		expect(cards.length).toBe(4);
		const first = cards[0] as HTMLElement;
		expect(first.querySelector('._rpCardMini ._rpWidget._mini')).not.toBeNull();
		expect(first.querySelector('._rpCardBody ._rpMuted')?.textContent).toMatch(/^Count of /);
		const sw = first.querySelector('input[role="switch"]') as HTMLInputElement;
		expect(sw.checked).toBe(true);
		const onBefore = Number(counts()[2]);
		act(() => sw.click());
		expect(Number(counts()[2])).toBe(onBefore - 1);
		expect((first.querySelector('input[role="switch"]') as HTMLInputElement).checked).toBe(
			false,
		);
		act(() =>
			(first.querySelector('button[aria-label^="More for"]') as HTMLButtonElement).click(),
		);
		const items = [...document.body.querySelectorAll('[role="menuitem"]')].map(b =>
			b.textContent?.trim(),
		);
		expect(items).toEqual(['Edit', 'Duplicate', 'Copy or move', 'Delete']);
		const savedBefore = Number(counts()[1]);
		act(() => button('Duplicate')!.click());
		expect(Number(counts()[1])).toBe(savedBefore + 1);
		// One quiet Data button, one primary New report.
		expect(button('Data')).toBeDefined();
		expect(button('New report')?.className).toContain('_primary');
		expect(button('Add widget')).toBeUndefined();
	});

	it('New report, Edit and a prompt on the list go to the page builder when there is one', async () => {
		const onOpen = jest.fn();
		act(() => root.render(lib({ onOpenBuilder: onOpen, name: 'cardtest2' })));
		await settle();
		act(() => button('New report')!.click());
		expect(onOpen).toHaveBeenLastCalledWith({ prompt: undefined });
		act(() =>
			(
				document.body.querySelector('button[aria-label^="More for"]') as HTMLButtonElement
			).click(),
		);
		act(() => button('Edit')!.click());
		expect(onOpen).toHaveBeenLastCalledWith(
			expect.objectContaining({
				id: expect.any(String),
				value: expect.objectContaining({ name: expect.any(String) }),
			}),
		);
		expect(document.body.querySelector('._rpModal')).toBeNull();
	});

	it('the page store: the list and the editor take turns', () => {
		let state: any;
		function Probe() {
			state = useReportsPage('Ns');
			return null;
		}
		act(() => root.render(<Probe />));
		let offE: () => void = () => {};
		let offL: () => void = () => {};
		act(() => {
			offE = registerEditor('Ns');
			offL = registerLibrary('Ns');
		});
		expect([state.editors, state.libraries, state.open]).toEqual([1, 1, undefined]);
		act(() => openBuilder('Ns', { group: 'dashboard', prompt: 'bookings by RM' }));
		expect(state.open).toMatchObject({ group: 'dashboard', prompt: 'bookings by RM' });
		act(() => closeBuilder('Ns', 'Saved "X".'));
		expect([state.open, state.notice]).toEqual([undefined, 'Saved "X".']);
		act(() => openBuilder('Ns', { group: 'dashboard' }));
		act(() => offL());
		// Without a list the builder is not "open" (the editor shows as it always did).
		expect(state.open).toBeUndefined();
		act(() => offE());
	});
});
