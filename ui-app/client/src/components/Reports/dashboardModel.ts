import { shortUUID } from '../../util/shortUUID';
import {
	addItem,
	clampItem,
	compact,
	flowLayout,
	placeAtTop,
	resolveLayout,
	sortLayout,
} from './dashboardLayout';
import { cloneSpec } from './reportSpecUtil';
import {
	CatalogDefault,
	DASHBOARD_CAPS,
	DashboardDoc,
	LayoutItem,
	ReportCatalog,
	ReportSpec,
	SavedWidget,
} from './reportTypes';

/**
 * The personalization document behind a dashboard (`reports_<name>`, CONTRACT section 5):
 * `{widgets:{id:{name,spec,refreshMin,defaultId?,edited?}}, layout:[{id,x,y,w,h,isNew?}],
 *   seenDefaults:[defaultId]}`.
 *
 * - remove = off the dashboard (out of `layout`), still in the library (`widgets`);
 * - delete = gone from both;
 * - duplicate = a copy under a new id (the user's own widget), on the dashboard when the
 *   original is.
 *
 * Defaults per app (plan section 3):
 * - first visit (no document): every default in the catalog (already trimmed to the caller)
 *   is placed, and all of their ids go into `seenDefaults`;
 * - a default whose id is not in `seenDefaults` is added at the top with `isNew` ("New"
 *   badge, Keep / Remove) and its id goes into `seenDefaults` at once, so a removed default
 *   never returns by itself (it stays in the library to add again);
 * - an unedited default widget follows the catalog's current spec and name by `defaultId`;
 *   editing copies the spec and sets `edited`; a default gone from the catalog disappears
 *   where it was unedited.
 *
 * Every function returns a NEW document (or an error) and never mutates its input.
 */

export const DEFAULT_TILE = { w: 4, h: 3 };

export type DocResult = { ok: true; doc: DashboardDoc; id?: string } | { ok: false; error: string };

export const CAP_MESSAGES = {
	dashboard: `A dashboard holds at most ${DASHBOARD_CAPS.onDashboard} widgets. Remove one first.`,
	saved: `You can keep at most ${DASHBOARD_CAPS.saved} saved widgets. Delete one first.`,
	gone: 'That widget no longer exists.',
};

export function emptyDoc(): DashboardDoc {
	return { widgets: {}, layout: [], seenDefaults: [] };
}

export function catalogDefaults(catalog: ReportCatalog | undefined): CatalogDefault[] {
	return (catalog?.defaults ?? []).filter(d => d && typeof d.id === 'string' && d.id && d.spec);
}

function defaultById(catalog: ReportCatalog | undefined, id: string | undefined) {
	if (!id) return undefined;
	return catalogDefaults(catalog).find(d => d.id === id);
}

function referenceTo(d: CatalogDefault): SavedWidget {
	return {
		name: d.name,
		spec: cloneSpec(d.spec),
		refreshMin: d.refreshMin ?? 0,
		defaultId: d.id,
	};
}

function tileOf(id: string, d?: CatalogDefault): LayoutItem {
	return clampItem({
		id,
		x: 0,
		y: 0,
		w: d?.layout?.w ?? DEFAULT_TILE.w,
		h: d?.layout?.h ?? DEFAULT_TILE.h,
	});
}

export function newWidgetId(taken?: Record<string, unknown>): string {
	let id = '';
	do
		id =
			'w' +
			shortUUID()
				.replace(/[^A-Za-z0-9]/g, '')
				.slice(0, 12);
	while (!id || (taken && taken[id] !== undefined));
	return id;
}

/** First visit: every catalog default, in catalog order, flowed onto the grid. */
export function seedDoc(catalog: ReportCatalog | undefined): DashboardDoc {
	const doc = emptyDoc();
	const tiles: LayoutItem[] = [];
	for (const d of catalogDefaults(catalog)) {
		if (Object.keys(doc.widgets).length >= DASHBOARD_CAPS.saved) break;
		const id = doc.widgets[d.id] ? newWidgetId(doc.widgets) : d.id;
		doc.widgets[id] = referenceTo(d);
		if (tiles.length < DASHBOARD_CAPS.onDashboard) tiles.push(tileOf(id, d));
		doc.seenDefaults.push(d.id);
	}
	doc.layout = flowLayout(tiles);
	return doc;
}

/** Reads a stored document defensively: unknown ids, duplicates and bad sizes are dropped. */
export function normalizeDoc(raw: any): DashboardDoc | undefined {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
	if (!raw.widgets && !raw.layout && !raw.seenDefaults) return undefined;
	const widgets: Record<string, SavedWidget> = {};
	for (const [id, w] of Object.entries<any>(raw.widgets ?? {})) {
		if (!w || typeof w !== 'object') continue;
		const hasSpec = !!w.spec && typeof w.spec === 'object';
		if (!hasSpec && !w.defaultId) continue;
		widgets[id] = {
			name: typeof w.name === 'string' && w.name ? w.name : 'Untitled',
			spec: hasSpec ? w.spec : undefined,
			refreshMin: Number.isFinite(w.refreshMin) ? w.refreshMin : 0,
			...(w.defaultId ? { defaultId: String(w.defaultId) } : {}),
			...(w.edited ? { edited: true } : {}),
			...(typeof w.importError === 'string' && w.importError
				? { importError: w.importError }
				: {}),
		};
	}
	const seen = new Set<string>();
	const layout: LayoutItem[] = [];
	for (const it of Array.isArray(raw.layout) ? raw.layout : []) {
		if (!it || typeof it.id !== 'string' || !widgets[it.id] || seen.has(it.id)) continue;
		seen.add(it.id);
		layout.push(clampItem(it));
	}
	const seenDefaults = Array.isArray(raw.seenDefaults)
		? [...new Set<string>(raw.seenDefaults.filter((e: any) => typeof e === 'string'))]
		: Object.values(widgets)
				.map(w => w.defaultId)
				.filter((e): e is string => !!e);
	return {
		widgets,
		layout: resolveLayout(layout.slice(0, DASHBOARD_CAPS.onDashboard)),
		seenDefaults,
	};
}

/**
 * Brings a loaded document in line with the catalog. No document (a first visit): seeded.
 * Otherwise unedited defaults the catalog no longer has are dropped, and defaults never
 * seen are added at the top as "New". `changed` says whether the result must be saved.
 */
export function reconcile(
	raw: any,
	catalog: ReportCatalog | undefined,
): { doc: DashboardDoc; changed: boolean; firstVisit: boolean } {
	const loaded = normalizeDoc(raw);
	if (!loaded) return { doc: seedDoc(catalog), changed: true, firstVisit: true };
	const defaults = catalogDefaults(catalog);
	const live = new Set(defaults.map(d => d.id));
	let changed = false;

	const widgets = { ...loaded.widgets };
	for (const [id, w] of Object.entries(widgets)) {
		if (w.defaultId && !w.edited && !live.has(w.defaultId)) {
			delete widgets[id];
			changed = true;
		}
	}
	let layout = loaded.layout.filter(l => widgets[l.id]);
	if (layout.length !== loaded.layout.length) {
		layout = compact(layout);
		changed = true;
	}

	const seen = new Set(loaded.seenDefaults);
	const fresh: LayoutItem[] = [];
	for (const d of defaults) {
		if (seen.has(d.id)) continue;
		seen.add(d.id);
		changed = true;
		if (Object.keys(widgets).length >= DASHBOARD_CAPS.saved) continue;
		const id = widgets[d.id] ? newWidgetId(widgets) : d.id;
		widgets[id] = referenceTo(d);
		if (layout.length + fresh.length < DASHBOARD_CAPS.onDashboard)
			fresh.push({ ...tileOf(id, d), isNew: true });
	}
	// Packed like every stored layout, so the next load finds it unchanged.
	if (fresh.length) layout = resolveLayout(placeAtTop(layout, fresh));

	if (!changed && normalizedEqual(raw, loaded))
		return { doc: loaded, changed, firstVisit: false };
	return {
		doc: { widgets, layout, seenDefaults: [...seen] },
		changed: true,
		firstVisit: false,
	};
}

/** Whether the stored layout already is the normalized one (same tiles, same spots, any order). */
function normalizedEqual(raw: any, doc: DashboardDoc): boolean {
	if (!Array.isArray(raw?.layout) || !Array.isArray(raw?.seenDefaults)) return false;
	if (raw.layout.length !== doc.layout.length) return false;
	const key = (l: any) => `${l.id}:${l.x}:${l.y}:${l.w}:${l.h}:${l.isNew ? 1 : 0}`;
	const stored = new Set(raw.layout.map(key));
	return doc.layout.every(l => stored.has(key(l)));
}

/** What a widget shows now: an unedited default follows the catalog by `defaultId`. */
export interface ResolvedWidget {
	id: string;
	name: string;
	spec: ReportSpec;
	refreshMin: number;
	defaultId?: string;
	/** An unedited default (follows the app's spec). */
	byReference: boolean;
}

export function resolveWidget(
	doc: DashboardDoc,
	id: string,
	catalog: ReportCatalog | undefined,
): ResolvedWidget | undefined {
	const w = doc.widgets[id];
	if (!w) return undefined;
	if (w.defaultId && !w.edited) {
		const d = defaultById(catalog, w.defaultId);
		if (!d) return catalog ? undefined : w.spec ? base(w, false) : undefined;
		return {
			id,
			name: d.name,
			spec: d.spec,
			refreshMin: w.refreshMin ?? 0,
			defaultId: d.id,
			byReference: true,
		};
	}
	if (!w.spec) return undefined;
	return base(w, false);

	function base(sw: SavedWidget, byReference: boolean): ResolvedWidget {
		return {
			id,
			name: sw.name,
			spec: sw.spec,
			refreshMin: sw.refreshMin ?? 0,
			defaultId: sw.defaultId,
			byReference,
		};
	}
}

export function onDashboard(doc: DashboardDoc, id: string): boolean {
	return doc.layout.some(l => l.id === id);
}

/** Saves a new widget to the library, and places it on the dashboard when asked. */
export function addWidget(
	doc: DashboardDoc,
	widget: SavedWidget,
	opts?: { toDashboard?: boolean; id?: string; w?: number; h?: number },
): DocResult {
	if (Object.keys(doc.widgets).length >= DASHBOARD_CAPS.saved)
		return { ok: false, error: CAP_MESSAGES.saved };
	if (opts?.toDashboard && doc.layout.length >= DASHBOARD_CAPS.onDashboard)
		return { ok: false, error: CAP_MESSAGES.dashboard };
	const id = opts?.id && !doc.widgets[opts.id] ? opts.id : newWidgetId(doc.widgets);
	const next: DashboardDoc = { ...doc, widgets: { ...doc.widgets, [id]: widget } };
	if (opts?.toDashboard)
		next.layout = addItem(doc.layout, id, opts.w ?? DEFAULT_TILE.w, opts.h ?? DEFAULT_TILE.h);
	return { ok: true, doc: next, id };
}

/**
 * Changes a widget. A new spec or name on an unedited default copies the spec and sets
 * `edited` (it is the user's own from then on); the refresh interval is a per-user setting
 * and keeps the reference.
 */
export function editWidget(
	doc: DashboardDoc,
	id: string,
	patch: { name?: string; spec?: ReportSpec; refreshMin?: number },
	catalog: ReportCatalog | undefined,
): DocResult {
	const w = doc.widgets[id];
	if (!w) return { ok: false, error: CAP_MESSAGES.gone };
	const next: SavedWidget = { ...w };
	if (patch.refreshMin !== undefined) next.refreshMin = patch.refreshMin;
	const touchesContent = patch.spec !== undefined || patch.name !== undefined;
	if (touchesContent) {
		if (w.defaultId && !w.edited) {
			const current = resolveWidget(doc, id, catalog);
			next.spec = cloneSpec(patch.spec ?? current?.spec ?? w.spec);
			next.name = patch.name ?? current?.name ?? w.name;
			next.edited = true;
		} else {
			if (patch.spec !== undefined) next.spec = cloneSpec(patch.spec);
			if (patch.name !== undefined) next.name = patch.name;
		}
		// Edited after an import that was refused: the user's fix gets a fresh run.
		if (patch.spec !== undefined) delete next.importError;
	}
	return { ok: true, doc: { ...doc, widgets: { ...doc.widgets, [id]: next } }, id };
}

export function addToDashboard(doc: DashboardDoc, id: string): DocResult {
	if (!doc.widgets[id]) return { ok: false, error: CAP_MESSAGES.gone };
	if (onDashboard(doc, id)) return { ok: true, doc, id };
	if (doc.layout.length >= DASHBOARD_CAPS.onDashboard)
		return { ok: false, error: CAP_MESSAGES.dashboard };
	return {
		ok: true,
		doc: { ...doc, layout: addItem(doc.layout, id, DEFAULT_TILE.w, DEFAULT_TILE.h) },
		id,
	};
}

/** Off the dashboard; the widget stays in the library. Also the "Remove" of a New default. */
export function removeFromDashboard(doc: DashboardDoc, id: string): DashboardDoc {
	return { ...doc, layout: compact(doc.layout.filter(l => l.id !== id)) };
}

/** "Keep" on a New default: the badge goes. */
export function keepNew(doc: DashboardDoc, id: string): DashboardDoc {
	return {
		...doc,
		layout: doc.layout.map(l =>
			l.id === id && l.isNew ? clampItem({ ...l, isNew: false }) : l,
		),
	};
}

/** Gone: out of the library and off the dashboard. A default's id stays seen. */
export function deleteWidget(doc: DashboardDoc, id: string): DashboardDoc {
	const widgets = { ...doc.widgets };
	delete widgets[id];
	return { ...doc, widgets, layout: compact(doc.layout.filter(l => l.id !== id)) };
}

export function duplicateWidget(
	doc: DashboardDoc,
	id: string,
	catalog: ReportCatalog | undefined,
): DocResult {
	const r = resolveWidget(doc, id, catalog);
	if (!r) return { ok: false, error: CAP_MESSAGES.gone };
	const copy: SavedWidget = {
		name: `${r.name} (copy)`,
		spec: cloneSpec(r.spec),
		refreshMin: r.refreshMin,
	};
	const tile = doc.layout.find(l => l.id === id);
	const wantTile = !!tile && doc.layout.length < DASHBOARD_CAPS.onDashboard;
	return addWidget(doc, copy, { toDashboard: wantTile, w: tile?.w, h: tile?.h });
}

/** Catalog defaults with no widget following them: offered in the library to add again. */
export function defaultsNotInLibrary(
	doc: DashboardDoc,
	catalog: ReportCatalog | undefined,
): CatalogDefault[] {
	const following = new Set(
		Object.values(doc.widgets)
			.filter(w => w.defaultId && !w.edited)
			.map(w => w.defaultId),
	);
	return catalogDefaults(catalog).filter(d => !following.has(d.id));
}

/** Adds a catalog default from the library, by reference. */
export function addDefault(
	doc: DashboardDoc,
	def: CatalogDefault,
	toDashboard: boolean,
): DocResult {
	const r = addWidget(doc, referenceTo(def), {
		toDashboard,
		id: def.id,
		w: def.layout?.w,
		h: def.layout?.h,
	});
	if (!r.ok) return r;
	const seen = r.doc.seenDefaults.includes(def.id)
		? r.doc.seenDefaults
		: [...r.doc.seenDefaults, def.id];
	return { ...r, doc: { ...r.doc, seenDefaults: seen } };
}

/**
 * "Reset to defaults": the dashboard shows exactly the app's current defaults again, by
 * reference. Widgets the user made or edited stay in the library, off the dashboard (an
 * edited default that held a default's id moves to a new id so nothing is lost).
 */
export function resetDoc(doc: DashboardDoc, catalog: ReportCatalog | undefined): DashboardDoc {
	const own: Record<string, SavedWidget> = {};
	for (const [id, w] of Object.entries(doc.widgets)) {
		if (w.defaultId && !w.edited) continue;
		own[id] = w;
	}
	const seeded = seedDoc(catalog);
	const widgets: Record<string, SavedWidget> = { ...seeded.widgets };
	for (const [id, w] of Object.entries(own)) {
		if (Object.keys(widgets).length >= DASHBOARD_CAPS.saved) break;
		widgets[widgets[id] ? newWidgetId({ ...widgets, ...own }) : id] = w;
	}
	return {
		widgets,
		layout: seeded.layout,
		seenDefaults: [...new Set([...doc.seenDefaults, ...seeded.seenDefaults])],
	};
}

/** Layout changes from the grid (drag, resize, phone move up / down). */
export function withLayout(doc: DashboardDoc, layout: LayoutItem[]): DashboardDoc {
	return { ...doc, layout };
}

/** Dashboard order for the phone (one column) and the library list. */
export function orderedIds(doc: DashboardDoc): string[] {
	return sortLayout(doc.layout).map(l => l.id);
}
