import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { STORE_PREFIX } from '../../constants';
import { setData } from '../../context/StoreContext';
import { dropDoc } from './dashboardStore';
import {
	appGroups,
	createUserGroup,
	deleteUserGroup,
	GroupInfo,
	GroupsResult,
	mergeGroups,
	normalizeUserGroups,
	renameUserGroup,
	storeKey,
	USER_GROUPS_DOC,
	UserGroupsDoc,
} from './groupsModel';
import { docName, ReportTransport } from './reportApi';
import { ReportCatalog } from './reportTypes';

/**
 * The user's report groups (`reports_groups`), shared by every report component on the page,
 * and the merged list `[{id,label,kind,order}]` (app groups, then the user's) kept at
 * `Store.reports.<appNamespace>.groups` so other parts of the page (the side menu) follow
 * every change live (CONTRACT 9).
 *
 * Group changes are rare and other pages read them: each one is saved at once (not debounced)
 * and rolled back when the save fails. Changes run one after another.
 */

export type GroupsStatus = 'loading' | 'ready' | 'error';

interface GroupsEntry {
	status: GroupsStatus;
	user: UserGroupsDoc;
	error?: string;
	transport: ReportTransport;
	ns: string;
	/** The app groups of the catalog, once a component with the catalog has it. */
	app?: GroupInfo[];
	version: number;
	listeners: Set<() => void>;
	queue: Promise<unknown>;
}

const entries = new Map<ReportTransport, Map<string, GroupsEntry>>();

export function groupsStorePath(ns: string): string {
	return `${STORE_PREFIX}.reports.${storeKey(ns)}.groups`;
}

export function mergedGroups(e: GroupsEntry): GroupInfo[] {
	return mergeGroups(e.app ?? [], e.status === 'ready' ? e.user : undefined);
}

function publish(e: GroupsEntry) {
	if (!e.ns || (e.status === 'loading' && !e.app)) return;
	setData(groupsStorePath(e.ns), mergedGroups(e));
}

function notify(e: GroupsEntry) {
	e.version++;
	publish(e);
	e.listeners.forEach(l => l());
}

function load(e: GroupsEntry) {
	e.status = 'loading';
	e.error = undefined;
	e.version++;
	e.listeners.forEach(l => l());
	e.transport.loadDoc(docName(USER_GROUPS_DOC)).then(
		raw => {
			e.user = normalizeUserGroups(raw);
			e.status = 'ready';
			notify(e);
		},
		err => {
			e.status = 'error';
			e.error = err?.message ?? 'Your groups could not be loaded.';
			notify(e);
		},
	);
}

export function groupsEntryFor(transport: ReportTransport, ns: string): GroupsEntry {
	let byNs = entries.get(transport);
	if (!byNs) entries.set(transport, (byNs = new Map()));
	let e = byNs.get(ns);
	if (!e) {
		e = {
			status: 'loading',
			user: { groups: [] },
			transport,
			ns,
			version: 0,
			listeners: new Set(),
			queue: Promise.resolve(),
		};
		byNs.set(ns, e);
		load(e);
	}
	return e;
}

/** The catalog's app groups (trimmed to the caller) join the merged list. */
export function setAppGroups(e: GroupsEntry, catalog: ReportCatalog | undefined) {
	if (!catalog) return;
	const app = appGroups(catalog);
	if (JSON.stringify(app) === JSON.stringify(e.app)) return;
	e.app = app;
	notify(e);
}

function change(
	e: GroupsEntry,
	fn: (user: UserGroupsDoc, app: GroupInfo[]) => GroupsResult,
	after?: (r: GroupsResult & { ok: true }) => Promise<void>,
): Promise<GroupsResult> {
	const run = async (): Promise<GroupsResult> => {
		if (e.status !== 'ready')
			return { ok: false, error: e.error ?? 'Your groups are still loading.' };
		const before = e.user;
		const r = fn(before, e.app ?? []);
		if (!r.ok) return r;
		e.user = r.doc;
		notify(e);
		try {
			await e.transport.saveDoc(docName(USER_GROUPS_DOC), r.doc);
		} catch {
			e.user = before;
			notify(e);
			return { ok: false, error: 'Your groups could not be saved. Try again.' };
		}
		if (after) await after(r);
		return r;
	};
	const p = e.queue.then(run, run);
	e.queue = p.catch(() => undefined);
	return p;
}

export function createGroup(e: GroupsEntry, label: string) {
	return change(e, (u, app) => createUserGroup(u, label, app));
}

export function renameGroup(e: GroupsEntry, id: string, label: string) {
	return change(e, (u, app) => renameUserGroup(u, id, label, app));
}

/** Deletes a user group and its document (`reports_<id>`). */
export function deleteGroup(e: GroupsEntry, id: string) {
	return change(
		e,
		u => deleteUserGroup(u, id),
		() => dropDoc(e.transport, id),
	);
}

/** For tests. */
export function resetGroupsStore() {
	entries.clear();
}

export interface ReportGroupsState {
	status: GroupsStatus;
	error?: string;
	/** App groups (once the catalog is in), then the user's. */
	all: GroupInfo[];
	user: UserGroupsDoc;
	app: GroupInfo[];
	create: (label: string) => Promise<GroupsResult>;
	rename: (id: string, label: string) => Promise<GroupsResult>;
	remove: (id: string) => Promise<GroupsResult>;
	retry: () => void;
}

const NOT_READY: GroupsResult = { ok: false, error: 'Your groups are still loading.' };

/** The page's report groups for an app namespace; publishes the merged list to the store. */
export function useReportGroups(
	transport: ReportTransport | undefined,
	ns: string,
	catalog: ReportCatalog | undefined,
): ReportGroupsState {
	const [entry, setEntry] = useState<GroupsEntry | undefined>(undefined);
	useEffect(() => {
		setEntry(transport ? groupsEntryFor(transport, ns) : undefined);
	}, [transport, ns]);
	const subscribe = useCallback(
		(l: () => void) => {
			if (!entry) return () => {};
			entry.listeners.add(l);
			return () => entry.listeners.delete(l);
		},
		[entry],
	);
	const version = useSyncExternalStore(
		subscribe,
		() => entry?.version ?? -1,
		() => -1,
	);
	useEffect(() => {
		if (entry) setAppGroups(entry, catalog);
	}, [entry, catalog]);

	const create = useCallback(
		(label: string) => (entry ? createGroup(entry, label) : Promise.resolve(NOT_READY)),
		[entry],
	);
	const rename = useCallback(
		(id: string, label: string) =>
			entry ? renameGroup(entry, id, label) : Promise.resolve(NOT_READY),
		[entry],
	);
	const remove = useCallback(
		(id: string) => (entry ? deleteGroup(entry, id) : Promise.resolve(NOT_READY)),
		[entry],
	);
	const retry = useCallback(() => {
		if (entry && entry.status === 'error') load(entry);
	}, [entry]);

	const app = useMemo(() => appGroups(catalog), [catalog]);
	const user = entry?.user ?? { groups: [] };
	const status = entry?.status ?? 'loading';
	const all = useMemo(
		() => mergeGroups(app, status === 'ready' ? user : undefined),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[app, user, status, version],
	);
	return { status, error: entry?.error, all, user, app, create, rename, remove, retry };
}
