/**
 * CXZ-2098: "Reset to defaults" on the Dashboard brings the dashboard back to how it first opened,
 * the widgets AND the filter bar. Before, it only reset the widgets: a tester with a Period and a
 * Project picked pressed Reset and "nothing changed".
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
	runs = [];
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
const button = (text: string, exact = false) =>
	buttons().find(b =>
		exact ? b.textContent?.trim() === text : (b.textContent ?? '').includes(text),
	)!;
const period = () => document.body.querySelector('select._rpSelect') as HTMLSelectElement;
/** The report runs the widgets asked for (the fixture data does not echo the period). */
let runs: string[] = [];
const spyTransport = {
	...fixtureTransport,
	async call(fn: string, args: any) {
		if (/reportRun$/.test(fn)) runs.push(JSON.stringify(args?.spec ?? args));
		return fixtureTransport.call(fn, args);
	},
} as typeof fixtureTransport;

/** A native select change the way React listens for it. */
function pick(select: HTMLSelectElement, value: string) {
	const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!;
	act(() => {
		set.call(select, value);
		select.dispatchEvent(new Event('change', { bubbles: true }));
	});
}

async function openDashboard(name: string) {
	act(() =>
		root.render(
			<DashboardView
				transport={spyTransport}
				catalogFunction="CxZump.reportCatalog"
				runFunction="CxZump.reportRun"
				name={name}
				editable
			/>,
		),
	);
	await settle();
}

test('the Period filter starts empty and Reset to defaults clears it again', async () => {
	await openDashboard('resetfilters1');
	expect(period().value).toBe('');
	expect(runs.length).toBeGreaterThan(0);
	expect(runs.some(r => r.includes('LAST_QUARTER'))).toBe(false);

	pick(period(), 'LAST_QUARTER');
	await settle();
	expect(period().value).toBe('LAST_QUARTER');
	expect(runs.some(r => r.includes('LAST_QUARTER'))).toBe(true);

	act(() => button('Reset to defaults').click());
	expect(document.body.textContent).toMatch(/Reset to the app defaults\?/);
	// Asking is not resetting yet.
	expect(period().value).toBe('LAST_QUARTER');

	runs = [];
	act(() => button('Reset', true).click());
	await settle();
	expect(document.body.textContent).not.toMatch(/Reset to the app defaults\?/);
	expect(period().value).toBe('');
	// The widgets ran again without the period.
	expect(runs.length).toBeGreaterThan(0);
	expect(runs.some(r => r.includes('LAST_QUARTER'))).toBe(false);
});

test('Cancel on the Reset question keeps the filters', async () => {
	await openDashboard('resetfilters2');
	pick(period(), 'LAST_QUARTER');
	await settle();
	act(() => button('Reset to defaults').click());
	act(() => button('Cancel', true).click());
	await settle();
	expect(period().value).toBe('LAST_QUARTER');
	expect(document.body.textContent).not.toMatch(/Reset to the app defaults\?/);
});
