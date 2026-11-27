import React, { useRef } from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const store: Record<string, any> = {};
const listeners: Array<{ cb: () => void; paths: string[] }> = [];
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: (path: string) => store[path],
	setData: () => undefined,
	addListener: (_page: any, cb: () => void, ...paths: string[]) => {
		const entry = { cb, paths };
		listeners.push(entry);
		return () => listeners.splice(listeners.indexOf(entry), 1);
	},
}));

import { themeChartLook, useChartTheme } from '../reportTheme';

let seen: any;
function Probe() {
	const ref = useRef<HTMLDivElement>(null);
	seen = useChartTheme(ref, undefined);
	return <div ref={ref} />;
}

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	for (const k of Object.keys(store)) delete store[k];
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

test('a theme without the variable, or with an unknown value, has no look', () => {
	expect(themeChartLook()).toBe('default');
	store['Theme.reportChartLook'] = 'sparkles';
	expect(themeChartLook()).toBe('default');
	store['Theme.reportChartLook'] = 'dotMatrix';
	expect(themeChartLook()).toBe('dotMatrix');
});

test('switching the theme re-reads the look (and the palette)', async () => {
	store['Theme.chartPrimaryDataColor1'] = '#111111';
	await act(async () => root.render(<Probe />));
	expect(seen.look).toBe('default');
	expect(seen.palette[0]).toBe('#111111');
	expect(listeners.some(l => l.paths.includes('Store.theme'))).toBe(true);

	store['Theme.reportChartLook'] = 'dotMatrix';
	store['Theme.chartPrimaryDataColor1'] = '#E8EAEC';
	await act(async () => {
		listeners.filter(l => l.paths.includes('Store.theme')).forEach(l => l.cb());
		await new Promise(r => setTimeout(r, 50));
	});
	expect(seen.look).toBe('dotMatrix');
	expect(seen.palette[0]).toBe('#E8EAEC');
});

test('the listener goes away with the widget', async () => {
	await act(async () => root.render(<Probe />));
	const before = listeners.length;
	act(() => root.unmount());
	expect(listeners.length).toBe(before - 1);
	root = createRoot(host);
});
