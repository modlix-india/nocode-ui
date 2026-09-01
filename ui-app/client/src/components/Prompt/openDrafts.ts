import { deepEqual, duplicate } from '@fincity/kirun-js';
import { PageDefinition } from '../../types/common';
import {
	addComponentToPageDefinition,
	removeComponentsFromPageDefinition,
	updateMultipleComponentsInPageDefinition,
	updatePageDefinitionProperties,
} from '../PageEditor/util/targetedPageUpdate';

/**
 * Objects the user has open and unsaved, and the changes the agent makes to them.
 *
 * The agent used to be blind in both directions: it read the saved version of
 * everything, so unsaved work on screen was invisible to it, and it wrote straight
 * through, so its changes were committed before anyone could look at them. This
 * module is the client half of the fix. It sends up what the user actually has in
 * front of them, and applies back the changes the agent chose to hold rather than
 * save.
 *
 * A surface declares only the objects it has a review UI for, which is why "held"
 * and "reviewable" are the same set: the page editor declares the page it draws on
 * its canvas, workspace declares the tabs it has open, and the plain chat page
 * declares nothing and behaves exactly as it always did.
 */

/** One thing the hosting surface has open, named by where its document lives. */
export interface DraftDescriptor {
	/** Store path of the document, e.g. `Page.pageDefinition`. */
	path: string;
	/** The object kind, when the surface knows it outright. */
	kind?: string;
	/**
	 * The collection path this object is saved to, e.g. `/api/core/storages`.
	 * An alternative to `kind` for a surface that has the API to hand but not a
	 * kind name, which is the usual case: the server resolves one from the other
	 * off the same table it uses for the intercept, so the mapping lives in one
	 * place and cannot drift.
	 */
	api?: string;
	/** Store path of the saved copy, when the surface already keeps one. */
	baselinePath?: string;
}

export interface OpenDraftPayload {
	kind: string;
	api?: string;
	id: string;
	name: string;
	app_code: string;
	dirty: boolean;
	doc?: any;
	overlay?: { changed: Record<string, any>; removed: string[]; fields: Record<string, any> };
}

export interface DraftPatch {
	changed?: Record<string, any>;
	removed?: string[];
	fields?: Record<string, any>;
	doc?: any;
}

// Page-level keys that say when a document was written rather than what is in it.
// Diffing them would make an untouched page look edited on every message.
const PAGE_META = new Set([
	'componentDefinition',
	'updatedAt',
	'updatedBy',
	'createdAt',
	'createdBy',
]);

/**
 * Describe an open page as its difference from the saved version.
 *
 * A real page reaches 1.4MB, so sending it whole with every message would put
 * megabytes on the wire to say "nothing has changed", which is the honest answer
 * most of the time. Comparing per component against the baseline is exact and
 * needs no hashing, so there is no risk of the two languages disagreeing about
 * how to canonicalise a number.
 */
export function pageOverlay(
	current: PageDefinition | undefined,
	baseline: PageDefinition | undefined,
): NonNullable<OpenDraftPayload['overlay']> {
	const cur: any = current ?? {};
	const base: any = baseline ?? {};
	const curComps = cur.componentDefinition ?? {};
	const baseComps = base.componentDefinition ?? {};

	const changed: Record<string, any> = {};
	for (const [key, comp] of Object.entries(curComps))
		if (!deepEqual(baseComps[key], comp)) changed[key] = comp;

	const removed = Object.keys(baseComps).filter(k => !(k in curComps));

	const fields: Record<string, any> = {};
	for (const [key, value] of Object.entries(cur))
		if (!PAGE_META.has(key) && !deepEqual(base[key], value)) fields[key] = value;

	return { changed, removed, fields };
}

/**
 * Read the open-drafts declaration, in either of the two shapes a surface has.
 *
 * An ARRAY of descriptors is the explicit form, for a surface that knows exactly
 * what it has open: the page editor declares one entry for the page on its canvas.
 *
 * A MAP of records is for a surface whose open objects already live in a keyed
 * store, which is how the workspace keeps its tabs. Each value contributes an
 * entry when it names an `api` (or `kind`) and holds a document under `draft`.
 * That saves deriving a parallel list on a page where authoring one is expensive,
 * and it picks up `loaded` as the baseline, which is more trustworthy than a
 * snapshot this component takes for itself.
 */
export function collectDescriptors(raw: any, basePath: string): DraftDescriptor[] {
	if (Array.isArray(raw)) return raw.filter(d => d?.path && (d.kind || d.api));
	if (!raw || typeof raw !== 'object') return [];

	const out: DraftDescriptor[] = [];
	for (const [key, record] of Object.entries<any>(raw)) {
		if (!record || typeof record !== 'object') continue;
		if (!record.api && !record.kind) continue;
		if (!record.draft) continue;
		out.push({
			path: `${basePath}.${key}.draft`,
			api: record.api,
			kind: record.kind,
			...(record.loaded ? { baselinePath: `${basePath}.${key}.loaded` } : {}),
		});
	}
	return out;
}

/**
 * Build the payload for one open object.
 *
 * Whether to send an overlay is decided by the document's SHAPE, not by its kind
 * name. A component tree is the thing that reaches 1.4MB, and anything else is a
 * form's worth of fields where the whole document is both smaller than describing
 * the difference and easier to be sure about. Keying on the shape means a future
 * type with a tree gets the right treatment without anyone remembering to add it
 * to a list.
 */
export function draftPayload(
	descriptor: DraftDescriptor,
	doc: any,
	baseline: any,
): OpenDraftPayload | undefined {
	if (!doc?.id) return undefined;

	const base = {
		kind: descriptor.kind ?? '',
		...(descriptor.api ? { api: descriptor.api } : {}),
		id: String(doc.id),
		name: doc.name ?? '',
		app_code: doc.appCode ?? '',
	};

	if (!doc.componentDefinition) {
		const dirty = !deepEqual(doc, baseline);
		// A clean document is byte-for-byte the saved one, so shipping it would be
		// paying to tell the server something it can already read. It still has to
		// be DECLARED, because declaring is what makes the agent's writes to it
		// wait for the user's Save rather than going straight to the database.
		return dirty ? { ...base, dirty, doc } : { ...base, dirty };
	}

	const overlay = pageOverlay(doc, baseline);
	const dirty =
		Object.keys(overlay.changed).length > 0 ||
		overlay.removed.length > 0 ||
		Object.keys(overlay.fields).length > 0;
	return { ...base, dirty, overlay };
}

/**
 * Which declared draft is this patch for?
 *
 * Keyed on the document's own id, because that is the one identifier both ends
 * already agree on. Kind is deliberately NOT the primary key: a surface that
 * declares its drafts from a keyed store names each by the API it saves to and
 * has no kind to give, so matching on kind silently dropped every one of those
 * patches while the server held the change perfectly well.
 *
 * `readDoc` is injected so this stays a pure function over the store rather than
 * reaching into it, which is what makes it testable.
 */
export function matchDescriptor(
	descriptors: DraftDescriptor[],
	patchData: { id?: string | number; kind?: string } | undefined,
	readDoc: (path: string) => any,
): DraftDescriptor | undefined {
	const wanted = patchData?.id !== undefined && patchData.id !== null
		? String(patchData.id)
		: undefined;

	if (wanted) {
		for (const d of descriptors)
			if (String(readDoc(d.path)?.id) === wanted) return d;
		return undefined;
	}

	return descriptors.find(d => d.kind && d.kind === patchData?.kind);
}

/**
 * Apply what the agent held into the copy on screen.
 *
 * Built on the targeted updaters rather than a clone-and-merge because the thing
 * being updated can be 1.4MB and this runs on every tool call the agent makes.
 * Returns the same object when the patch is empty, so an unchanged definition
 * cannot trip a store write and a pointless undo step.
 */
export function applyDraftPatch(current: any, patch: DraftPatch | undefined): any {
	if (!patch) return current;
	if (patch.doc !== undefined) return patch.doc;

	const changed = patch.changed ?? {};
	const removed = patch.removed ?? [];
	const fields = patch.fields ?? {};
	if (!Object.keys(changed).length && !removed.length && !Object.keys(fields).length)
		return current;

	let next: PageDefinition = current ?? ({ componentDefinition: {} } as PageDefinition);

	// Split by whether the component already exists. The multi-updater warns and
	// SKIPS a key it cannot find, so routing an added component through it would
	// drop it silently, which is the worst way to lose a change.
	const existing = next.componentDefinition ?? {};
	const updates = Object.entries(changed).filter(([key]) => key in existing);
	const additions = Object.entries(changed).filter(([key]) => !(key in existing));

	if (updates.length)
		next = updateMultipleComponentsInPageDefinition(
			next,
			updates.map(([componentKey, comp]) => ({ componentKey, updater: () => comp })),
		);

	for (const [key, comp] of additions)
		next = addComponentToPageDefinition(next, key, comp as any);

	if (removed.length) next = removeComponentsFromPageDefinition(next, removed);

	if (Object.keys(fields).length)
		next = updatePageDefinitionProperties(next, def => Object.assign(def, fields));

	return next;
}

/**
 * Snapshot a document to measure later changes against.
 *
 * Deliberately a deep copy: the store hands out live references, and a baseline
 * that moves with the thing it is measuring reports every page as clean.
 */
export function snapshotBaseline(doc: any): any {
	return doc ? duplicate(doc) : undefined;
}
