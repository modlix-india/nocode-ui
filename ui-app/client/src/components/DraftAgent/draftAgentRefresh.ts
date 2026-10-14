import { getDataFromPath, setData } from '../../context/StoreContext';

/**
 * Show the agent's edits in the running draft app, the way the page editor
 * refetches its canvas when the sidekick saves.
 *
 * A changed PAGE is refreshed in place: its cached definition is dropped from
 * `Store.pageDefinition`, and the render engine, which listens on that path,
 * refetches the page it is showing. The draft host serves drafts `no-store`, so
 * the refetch is the new copy. Anything that is read once when the app boots
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
		const next = { ...cached };
		for (const p of pages) delete next[p];
		// The engine listens on exactly this path: writing the map, not a child of
		// it, is what makes the page on screen refetch.
		setData('Store.pageDefinition', next);
	}
	return false;
}
