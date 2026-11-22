/**
 * PLAT-1704: deleting a saved widget asks first (library rows and the widget menu), through
 * the same portal modal as a group delete.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { resetStore } from '../dashboardStore';
import { fixtureTransport } from '../fixtures/reportFixtures';
import { clearCatalogCache } from '../reportApi';
import { DashboardView } from '../ui/DashboardView';

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
	for (let i = 0; i < 8; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

const buttons = () => [...document.body.querySelectorAll('button')] as HTMLButtonElement[];
/** "N of 100 saved". */
const rows = () =>
	Number(
		/(\d+) of 100 saved/.exec(document.body.querySelector('._rpLib')?.textContent ?? '')?.[1],
	);

test('library Delete asks first; Cancel keeps the widget, Delete removes it', async () => {
	act(() =>
		root.render(
			<DashboardView
				transport={fixtureTransport}
				catalogFunction="CxZump.reportCatalog"
				runFunction="CxZump.reportRun"
				name="deleteconfirm"
				mode="library"
				lockMode
				editable
			/>,
		),
	);
	await settle();
	const before = rows();
	expect(before).toBeGreaterThan(0);
	const del = () => buttons().filter(b => b.textContent?.trim() === 'Delete');
	// Delete sits in the card's menu.
	const openMenu = () =>
		act(() =>
			(
				document.body.querySelector('button[aria-label^="More for"]') as HTMLButtonElement
			).click(),
		);
	openMenu();
	act(() => del()[0].click());
	const modal = document.body.querySelector('._rpModal[aria-label="Delete widget"]');
	expect(modal?.textContent).toMatch(/Delete the widget .+\? It goes from the dashboard/);
	expect(rows()).toBe(before);
	act(() =>
		buttons()
			.find(b => b.textContent?.trim() === 'Cancel')!
			.click(),
	);
	expect(document.body.querySelector('._rpModal')).toBeNull();
	expect(rows()).toBe(before);

	openMenu();
	act(() => del()[0].click());
	act(() => del().pop()!.click());
	await settle();
	expect(document.body.querySelector('._rpModal')).toBeNull();
	expect(rows()).toBe(before - 1);
});

test('the widget menu Delete asks first', async () => {
	act(() =>
		root.render(
			<DashboardView
				transport={fixtureTransport}
				catalogFunction="CxZump.reportCatalog"
				runFunction="CxZump.reportRun"
				name="deleteconfirm2"
				editable
			/>,
		),
	);
	await settle();
	const tiles = document.body.querySelectorAll('._rpTile').length;
	const more = document.body.querySelector('button[aria-label="More"]') as HTMLButtonElement;
	act(() => more.click());
	const item = buttons().find(b => b.textContent?.trim() === 'Delete');
	expect(item).toBeDefined();
	act(() => item!.click());
	expect(document.body.querySelector('._rpModal[aria-label="Delete widget"]')).not.toBeNull();
	expect(document.body.querySelectorAll('._rpTile').length).toBe(tiles);
	act(() =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Delete')
			.pop()!
			.click(),
	);
	await settle();
	expect(document.body.querySelectorAll('._rpTile').length).toBe(tiles - 1);
});
