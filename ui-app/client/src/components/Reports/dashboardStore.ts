import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { reconcile } from './dashboardModel';
import { docName, ReportTransport } from './reportApi';
import { DashboardDoc, ReportCatalog } from './reportTypes';

/**
 * One dashboard document (`reports_<name>`) shared by every report component on the page
 * (a Dashboard in library mode and a ReportEditor on the Reports page edit the same one).
 *
 * Loaded once; reconciled with the catalog (seed on a first visit, New defaults, retired
 * defaults) as soon as both are in; saved 2 s after the last change, like
 * components/util/personalization.ts, and flushed when the page is hidden or left.
 * A document that failed to load is never saved over: a fresh seed would wipe the user's.
 */

export const SAVE_DEBOUNCE_MS = 2000;

export type DocStatus = 'loading' | 'ready' | 'error';

interface Entry {
	status: DocStatus;
	raw?: any;
	doc?: DashboardDoc;
	firstVisit?: boolean;
	error?: string;
	transport: ReportTransport;
	name: string;
	timer?: ReturnType<typeof setTimeout>;
	dirty: boolean;
	version: number;
	listeners: Set<() => void>;
}

const entries = new Map<ReportTransport, Map<string, Entry>>();

function notify(e: Entry) {
	e.version++;
	e.listeners.forEach(l => l());
}

function load(e: Entry) {
	e.status = 'loading';
	e.error = undefined;
	notify(e);
	e.transport.loadDoc(e.name).then(
		raw => {
			e.raw = raw ?? {};
			// Stay "loading" until a catalog reconciles it.
			notify(e);
		},
		err => {
			e.status = 'error';
			e.error = err?.message ?? 'Your dashboard could not be loaded.';
			notify(e);
		},
	);
}

export function entryFor(transport: ReportTransport, dashboardName: string | undefined): Entry {
	const name = docName(dashboardName);
	let byName = entries.get(transport);
	if (!byName) entries.set(transport, (byName = new Map()));
	let e = byName.get(name);
	if (!e) {
		e = { status: 'loading', transport, name, dirty: false, version: 0, listeners: new Set() };
		byName.set(name, e);
		load(e);
	}
	return e;
}

async function save(e: Entry) {
	if (e.timer) clearTimeout(e.timer);
	e.timer = undefined;
	if (!e.dirty || !e.doc || e.status !== 'ready') return;
	e.dirty = false;
	try {
		await e.transport.saveDoc(e.name, e.doc);
	} catch {
		// Kept dirty: the next change (or leaving the page) tries again.
		e.dirty = true;
	}
}

function schedule(e: Entry) {
	e.dirty = true;
	if (e.timer) clearTimeout(e.timer);
	e.timer = setTimeout(() => void save(e), SAVE_DEBOUNCE_MS);
}

/** Reconciles a loaded document with the catalog (once both are in). */
export function applyCatalog(e: Entry, catalog: ReportCatalog | undefined) {
	if (!catalog || e.status === 'error' || e.doc || e.raw === undefined) return;
	const r = reconcile(e.raw, catalog);
	e.doc = r.doc;
	e.firstVisit = r.firstVisit;
	e.status = 'ready';
	if (r.changed) schedule(e);
	notify(e);
}

export function updateEntry(e: Entry, fn: (doc: DashboardDoc) => DashboardDoc) {
	if (!e.doc || e.status !== 'ready') return;
	const next = fn(e.doc);
	if (next === e.doc) return;
	e.doc = next;
	schedule(e);
	notify(e);
}

/** Saves every pending document now (page hidden or left). */
export function flushAll() {
	entries.forEach(byName => byName.forEach(e => void save(e)));
}

/** For tests. */
export function resetStore() {
	entries.forEach(byName =>
		byName.forEach(e => {
			if (e.timer) clearTimeout(e.timer);
		}),
	);
	entries.clear();
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
	window.addEventListener('pagehide', flushAll);
	if (typeof document !== 'undefined')
		document.addEventListener?.('visibilitychange', () => {
			if (document.visibilityState === 'hidden') flushAll();
		});
}

export interface DashboardDocState {
	status: DocStatus;
	doc?: DashboardDoc;
	firstVisit?: boolean;
	error?: string;
	update: (fn: (doc: DashboardDoc) => DashboardDoc) => void;
	retry: () => void;
}

/** The shared document for a dashboard name, reconciled with `catalog` once it is in. */
export function useDashboardDoc(
	transport: ReportTransport | undefined,
	dashboardName: string | undefined,
	catalog: ReportCatalog | undefined,
): DashboardDocState {
	const [entry, setEntry] = useState<Entry | undefined>(undefined);
	useEffect(() => {
		setEntry(transport ? entryFor(transport, dashboardName) : undefined);
	}, [transport, dashboardName]);

	const subscribe = useCallback(
		(l: () => void) => {
			if (!entry) return () => {};
			entry.listeners.add(l);
			return () => entry.listeners.delete(l);
		},
		[entry],
	);
	useSyncExternalStore(
		subscribe,
		() => entry?.version ?? -1,
		() => -1,
	);

	useEffect(() => {
		if (entry) applyCatalog(entry, catalog);
	}, [entry, catalog, entry?.raw]);

	const update = useCallback(
		(fn: (doc: DashboardDoc) => DashboardDoc) => entry && updateEntry(entry, fn),
		[entry],
	);
	const retry = useCallback(() => {
		if (entry && entry.status === 'error') load(entry);
	}, [entry]);

	return {
		status: entry?.status ?? 'loading',
		doc: entry?.doc,
		firstVisit: entry?.firstVisit,
		error: entry?.error,
		update,
		retry,
	};
}
