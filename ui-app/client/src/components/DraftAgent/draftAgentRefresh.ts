import { getDataFromPath, setData } from '../../context/StoreContext';
import getPageDefinition from '../../Engine/pageDefinition';

/**
 * Show the agent's edits in the running draft app, the way the page editor
 * refetches its canvas when the sidekick saves.
 *
 * A changed PAGE is refreshed in place. On a draft host the new copy is fetched
 * (drafts are served `no-store`) and written over `Store.pageDefinition.<name>`,
 * which the render engine swaps in without unmounting, so the page's store,
 * filters and scroll survive. Elsewhere, or when the fetch fails, the cached
 * definition is dropped from `Store.pageDefinition` instead, and the engine,
 * which listens on that path, refetches and remounts. Anything that is read once when the app boots
 * (the application itself, the shell page, a theme or style, a UI function)
 * cannot be refreshed in place, so those ask for a full reload, which the
 * caller holds until the agent's run has finished: reloading mid-run would cut
 * the stream the person is watching.
 */

export interface ObjectChange {
	kind?: string;
	id?: string;
	name?: string;
	app_code?: string;
	operation?: string;
	draft?: boolean;
}

export type RefreshAction = 'none' | 'page' | 'reload';

const RELOAD_KINDS = new Set(['application', 'theme', 'style', 'function']);

/**
 * What a change calls for. Pure, so the rules can be tested.
 *
 * A change to another app is none of this page's business. A change with no app
 * code (surgical component writes do not repeat it) is assumed to be ours, since
 * the agent was pointed at this app.
 */
export function refreshActionFor(
	change: ObjectChange,
	appCode: string,
	cachedPages: Record<string, any>,
	shellPage?: string,
): { action: RefreshAction; pages: string[] } {
	if (change.app_code && appCode && change.app_code !== appCode)
		return { action: 'none', pages: [] };

	const kind = (change.kind ?? '').toLowerCase();
	if (RELOAD_KINDS.has(kind)) return { action: 'reload', pages: [] };
	if (kind !== 'page') return { action: 'none', pages: [] };

	if (shellPage && change.name === shellPage) return { action: 'reload', pages: [] };

	// Surgical writes (`/pages/{id}/components/{key}`) carry the id and no name, so
	// match on either.
	const pages = Object.entries(cachedPages ?? {})
		.filter(([name, def]) => name === change.name || (change.id && def?.id === change.id))
		.map(([name]) => name);

	if (shellPage && pages.includes(shellPage)) return { action: 'reload', pages: [] };
	return pages.length ? { action: 'page', pages } : { action: 'none', pages: [] };
}

/** Apply a change now; returns true when a full reload is owed. */
export function applyObjectChange(change: ObjectChange): boolean {
	const appCode = getDataFromPath('Store.application.appCode', []) ?? '';
	const cached = getDataFromPath('Store.pageDefinition', []) ?? {};
	const shellPage = getDataFromPath('Store.application.properties.shellPage', []);
	const { action, pages } = refreshActionFor(change, appCode, cached, shellPage);
	if (action === 'reload') return true;
	if (action === 'page') {
		if (globalThis.isDraftMode) swapInPlace(pages);
		else dropCached(pages);
	}
	return false;
}

function dropCached(pages: string[]) {
	const next = { ...(getDataFromPath('Store.pageDefinition', []) ?? {}) };
	for (const p of pages) delete next[p];
	// The engine listens on exactly this path: writing the map, not a child of
	// it, is what makes the page on screen refetch.
	setData('Store.pageDefinition', next);
}

// A single change is often several saves in a row (a component, then its
// styles, then the page's events). Each one is announced, so they are gathered
// for a moment and the page is fetched once.
const COALESCE_MS = 250;
const owed = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;

function swapInPlace(pages: string[]) {
	for (const p of pages) owed.add(p);
	if (timer) clearTimeout(timer);
	timer = setTimeout(async () => {
		timer = undefined;
		const names = Array.from(owed);
		owed.clear();
		const stale: string[] = [];
		for (const name of names) {
			try {
				const def = await getPageDefinition(name, undefined, undefined, true);
				if (def?.name === name) {
					setData(`Store.pageDefinition.${name}`, def);
					continue;
				}
			} catch {
				/* falls back to the refetch below */
			}
			stale.push(name);
		}
		if (stale.length) dropCached(stale);
	}, COALESCE_MS);
}
