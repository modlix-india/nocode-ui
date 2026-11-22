import { useCallback, useSyncExternalStore } from 'react';
import type { EditorValue } from './ui/ReportEditorView';

/**
 * "List first, simple builder" (Kiran 2026-11-21): when a ReportLibrary and a ReportEditor of the
 * same app share a page (the Reports page), the page opens on the list and the editor shows only
 * while a report is being made or edited ("New report", Edit, a prompt typed on the list, or a
 * `?spec=` link); Back, Cancel and Save return to the list. Alone, each keeps its own behaviour
 * (an editor by itself is always open; a library by itself edits in its own dialog). Pages need
 * no change: the two find each other here, per app namespace.
 */

export interface BuilderRequest {
	/** The report group the report belongs to (saved into). */
	group: string;
	/** Edit this saved widget (else a new report). */
	id?: string;
	value?: EditorValue;
	/** A prompt typed on the list, sent to the AI when the builder opens. */
	prompt?: string;
	seq: number;
}

interface PageState {
	editors: number;
	libraries: number;
	open?: BuilderRequest;
	/** A line for the list after a save ("Saved ..."). */
	notice?: string;
	version: number;
}

const pages = new Map<string, PageState>();
const listeners = new Map<string, Set<() => void>>();
let seq = 0;

function stateOf(ns: string): PageState {
	let s = pages.get(ns);
	if (!s) pages.set(ns, (s = { editors: 0, libraries: 0, version: 0 }));
	return s;
}

function emit(ns: string) {
	const s = stateOf(ns);
	pages.set(ns, { ...s, version: s.version + 1 });
	listeners.get(ns)?.forEach(l => l());
}

function register(ns: string, key: 'editors' | 'libraries'): () => void {
	const s = stateOf(ns);
	pages.set(ns, { ...s, [key]: s[key] + 1 });
	emit(ns);
	return () => {
		const t = stateOf(ns);
		const next = { ...t, [key]: Math.max(0, t[key] - 1) };
		if (!next.editors || !next.libraries) delete next.open;
		pages.set(ns, next);
		emit(ns);
	};
}

export const registerEditor = (ns: string) => register(ns, 'editors');
export const registerLibrary = (ns: string) => register(ns, 'libraries');

export function openBuilder(ns: string, req: Omit<BuilderRequest, 'seq'>) {
	const s = stateOf(ns);
	pages.set(ns, { ...s, open: { ...req, seq: ++seq }, notice: undefined });
	emit(ns);
}

export function closeBuilder(ns: string, notice?: string) {
	const s = stateOf(ns);
	pages.set(ns, { ...s, open: undefined, notice });
	emit(ns);
}

export function clearNotice(ns: string) {
	const s = stateOf(ns);
	if (!s.notice) return;
	pages.set(ns, { ...s, notice: undefined });
	emit(ns);
}

/** For tests. */
export function resetReportsPage() {
	pages.clear();
}

export function useReportsPage(ns: string): PageState {
	const subscribe = useCallback(
		(l: () => void) => {
			let set = listeners.get(ns);
			if (!set) listeners.set(ns, (set = new Set()));
			set.add(l);
			return () => {
				set!.delete(l);
			};
		},
		[ns],
	);
	return useSyncExternalStore(
		subscribe,
		() => stateOf(ns),
		() => stateOf(ns),
	);
}
