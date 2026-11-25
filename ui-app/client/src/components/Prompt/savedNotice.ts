/**
 * The words of the per-turn "what was saved, and where" notice.
 *
 * Two lines used to read "In the draft, waiting for Publish: page deals" and
 * "Live already, not waiting for review: serverfunction LeadZumpV2.saveDealGender"
 * under one reply, which testers read as the app contradicting itself (QA-0464).
 * Both were true: the agent drafts every change to an object that exists, and a
 * NEW object (a collection POST) cannot wait in a draft, because the draft surface
 * has nothing live to publish it over, so it is created live, and every later
 * change to it in a drafting turn goes to the draft. The notice now says which
 * case each object is, in plain words, with readable kind names.
 */

export interface SavedObject {
	kind: string;
	name: string;
	draft: boolean;
	/** Created by this turn (a POST), as opposed to an existing object changed. */
	created?: boolean;
}

const KIND_WORDS: Record<string, string> = {
	serverfunction: 'server function',
	function: 'function',
	eventdefinition: 'event definition',
	eventaction: 'event action',
	uripath: 'URL path',
	page: 'page',
	theme: 'theme',
	style: 'style',
	schema: 'schema',
	storage: 'storage',
	connection: 'connection',
	template: 'template',
	notification: 'notification',
	application: 'app settings',
};

export function kindWord(kind: string): string {
	return KIND_WORDS[kind] ?? kind;
}

/**
 * The kinds the notice is about: the platform objects the app builder writes (the kinds
 * nocode-ai's draft registry names from a definition API path). Other agents use the same
 * `object_changed` event as a page signal with their own kinds (AdZump: productPick,
 * targeting, campaignPlan, ...), and those are not app definitions saved live, so they get
 * no notice (ADZ-2242: "The product is X" in the AdZump chat showed "Saved live, with no
 * Publish step: productPick X").
 */
const BUILDER_KINDS = new Set<string>([
	...Object.keys(KIND_WORDS),
	'profile',
	'role',
	'user',
	'client',
	'department',
	'designation',
]);

export function isBuilderObject(kind: string): boolean {
	return BUILDER_KINDS.has(kind);
}

function list(objects: SavedObject[]): string {
	return objects.map(o => `${kindWord(o.kind)} ${o.name}`.trim()).join(', ');
}

/** The notice's lines, in the order they show. Empty when nothing was saved. */
export function savedNoticeLines(objects: SavedObject[]): string[] {
	// The rule (Kiran, 2026-10-21): a new object's first version is live, because a
	// create cannot wait in a draft; every later change to it in a drafting turn is
	// a draft. So one object can be both, and is then named once, with the draft.
	const key = (o: SavedObject) => `${o.kind}\u0000${o.name}`;
	const draftedKeys = new Set(objects.filter(o => o.draft).map(key));
	const createdKeys = new Set(objects.filter(o => !o.draft && o.created).map(key));
	const seen = new Set<string>();
	const once = (o: SavedObject) => (seen.has(key(o)) ? false : (seen.add(key(o)), true));

	const drafted = objects.filter(o => o.draft).filter(once);
	const created = objects
		.filter(o => !o.draft && o.created && !draftedKeys.has(key(o)))
		.filter(once);
	const live = objects
		.filter(o => !o.draft && !o.created && !createdKeys.has(key(o)))
		.filter(once);

	const label = (o: SavedObject) =>
		`${kindWord(o.kind)} ${o.name}`.trim() +
		(createdKeys.has(key(o)) ? ' (new: its first version is live, these changes wait)' : '');
	const lines: string[] = [];
	if (drafted.length)
		lines.push(
			`Saved to the draft. Nobody sees it until you Publish: ${drafted.map(label).join(', ')}`,
		);
	if (created.length)
		lines.push(
			`New, so its first version is live (a new object cannot wait in a draft): ${list(created)}`,
		);
	if (live.length) lines.push(`Saved live, with no Publish step: ${list(live)}`);
	return lines;
}
