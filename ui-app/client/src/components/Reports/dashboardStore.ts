import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { normalizeDoc, reconcile } from './dashboardModel';
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
 *
 * Report groups (CONTRACT 9): one document per group, `reports_<groupId>`. The P1a dashboard
 * was `reports_main`; the `dashboard` group takes it over once: when `reports_dashboard` is
 * absent and `reports_main` exists, the first load copies it (saved as `reports_dashboard`;
 * an existing `reports_dashboard` is never overwritten and `reports_main` is never deleted).
 */

/** The P1a document the `dashboard` group copies once (CONTRACT 9). */
export const LEGACY_DOC = 'reports_main';
export const MIGRATES_TO = 'reports_dashboard';

export const SAVE_DEBOUNCE_MS = 2000;

export type DocStatus = 'loading' | 'ready' | 'error';

export interface Entry {
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
	/** Copied from `reports_main` on this load: saved even when reconcile changed nothing. */
	migrated?: boolean;
	/** The group was deleted: never saved again. */
	dropped?: boolean;
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
	loadWithMigration(e).then(
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

/**
 * Reads the document; for `reports_dashboard` that is absent, `reports_main` when that one
 * holds a dashboard. A failed read of `reports_main` fails the load (retried), so a fresh seed
 * never takes the place of a dashboard that could not be read.
 */
async function loadWithMigration(e: Entry): Promise<any> {
	const raw = await e.transport.loadDoc(e.name);
	if (e.name !== MIGRATES_TO || normalizeDoc(raw)) return raw;
	const legacy = await e.transport.loadDoc(LEGACY_DOC);
	if (!normalizeDoc(legacy)) return raw;
	e.migrated = true;
	return legacy;
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
	if (!e.dirty || !e.doc || e.status !== 'ready' || e.dropped) return;
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
	if (r.changed || e.migrated) schedule(e);
	notify(e);
}

/**
 * The document of a group that may not be open on this page (Copy / Move to group, the
 * editor's "Save to group"), loaded and reconciled with `catalog` (that group's view of it).
 */
export function readyDoc(
	transport: ReportTransport,
	dashboardName: string,
	catalog: ReportCatalog | undefined,
): Promise<Entry> {
	const e = entryFor(transport, dashboardName);
	return new Promise<Entry>((resolve, reject) => {
		const check = () => {
			if (e.status === 'error') {
				e.listeners.delete(check);
				reject(new Error(e.error ?? 'That group could not be loaded.'));
				return true;
			}
			applyCatalog(e, catalog);
			if (e.status === 'ready' && e.doc) {
				e.listeners.delete(check);
				resolve(e);
				return true;
			}
			return false;
		};
		if (check()) return;
		e.listeners.add(check);
	});
}

/**
 * A deleted group: its pending save is cancelled, the entry is forgotten (a group made later
 * starts clean) and the stored document is deleted. A document that was never stored is fine.
 */
export async function dropDoc(transport: ReportTransport, dashboardName: string) {
	const name = docName(dashboardName);
	const byName = entries.get(transport);
	const e = byName?.get(name);
	if (e) {
		if (e.timer) clearTimeout(e.timer);
		e.timer = undefined;
		e.dirty = false;
		e.dropped = true;
		byName!.delete(name);
		notify(e);
	}
	try {
		await transport.deleteDoc?.(name);
	} catch {
		// Never stored (the group was never opened): nothing to delete.
	}
}

export function updateEntry(e: Entry, fn: (doc: DashboardDoc) => DashboardDoc) {
	if (!e.doc || e.status !== 'ready' || e.dropped) return;
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
