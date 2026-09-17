/**
 * The board model, and the one thing worth understanding about this component.
 *
 * Two axes, each carrying exactly one thing:
 *
 *     HORIZONTAL   objects of one kind, side by side as COLUMNS
 *     VERTICAL     the kinds, stacked as BANDS
 *
 * A band is a `kind`. A column is an entry in the app plan's `objects` map. A
 * card is one entry in that object's own blueprint: a section of a page, a
 * field of a storage, a step of a function.
 *
 * ── Why this file exists at all ──────────────────────────────────────────
 *
 * The board does NOT need a blueprint to render. On the day this ships no app
 * has one, and SiteZump alone has hundreds of live sites older than the
 * feature, so "an app with no plan" is not a fallback to handle, it is the
 * whole estate.
 *
 * So the model is built by MERGING two independent sources:
 *
 *   definitions   always present. The page list gives columns; a page's root
 *                 component's direct children give cards; the storage list
 *                 gives the next band.
 *   blueprint     may be absent, partly absent, or whole. It fills in each
 *                 card's description, purpose, feature and status.
 *
 * A card with no plan still renders, titled by what it IS. A plan fills in the
 * second line. That is the entire relationship, and keeping it in one pure
 * function is what lets the component be useful before any backend work lands.
 *
 * ── Two kinds of line, never conflated ───────────────────────────────────
 *
 * `describes` is DERIVED — what a section is, which a model can read off the
 * components. Cheap, per card, freely recomputed.
 * `purpose` is STATED by a person — what it is FOR, which is not in the
 * components and which no derivation may ever overwrite.
 *
 * See `nocode-saas/docs/blueprint.md` §5 for the reasoning.
 */

import { ComponentDefinition } from '../../types/common';

/** Which band a column sits in. One per object kind the board draws. */
export type BoardKind =
	| 'page'
	| 'storage'
	| 'function'
	| 'uifunction'
	| 'uripath'
	| 'template'
	| 'notification'
	| 'theme'
	| 'style'
	/**
	 * Not an object kind either, and the reason the app plan has to carry more
	 * than a manifest.
	 *
	 * A favicon somebody asked for is a real commitment with nothing to hang on:
	 * there is no overridable document for a picture, so there is no `blueprint`
	 * field anywhere that could hold "make a cinnamon roll in a circle, flat,
	 * two colours". It lives in the app's own plan or it lives nowhere, and
	 * nowhere means the request is lost the moment the conversation scrolls.
	 */
	| 'asset'
	/**
	 * Two bands that are not object kinds.
	 *
	 * `delivery` is what happens when the plan is built — the address it answers
	 * on, who can see it. `boundary` is what was asked for and is NOT part of a
	 * site: a request for customer logins is a real thing somebody said, and
	 * dropping it out of the plan because the product cannot do it is how the
	 * same conversation happens again in three weeks. Both come from the app's
	 * own plan rather than from any object, which is why they have no columns to
	 * open and nothing to add to.
	 */
	| 'delivery'
	| 'boundary';

/**
 * Per-entry agreement between the plan and the definition.
 *
 * `pending` and `drifted` point in OPPOSITE directions and must never be
 * conflated: pending means the plan moved and Apply moves the definition;
 * drifted means the definition moved and Update moves the plan. A background
 * process that got these the wrong way round would silently revert hand edits.
 */
export type CardStatus = 'clean' | 'pending' | 'drifted' | 'none';

export interface BoardCard {
	/** Stable identity. The blueprint entry uid when planned, else the component key. */
	uid: string;
	/** What it is called. From the plan when planned, else the definition's own name. */
	title: string;
	/** The one line under the title. `purpose` wins over `describes`; empty when neither. */
	description: string;
	/** True when the line came from a person rather than a derivation. */
	stated: boolean;
	/** Shell rather than content: a nav bar, a footer. Rendered quieter. */
	chrome: boolean;
	status: CardStatus;
	/** The feature this belongs to, when one claims it. */
	feature?: string;
	/** The link back into the definition. A key, not a path, so a move does not break it. */
	componentKey?: string;
	order: number;
	/** True when nothing in the plan describes this; it exists only in the definition. */
	unplanned: boolean;
}

export interface BoardColumn {
	uid: string;
	kind: BoardKind;
	/** The object's own name, e.g. a page name. What the platform calls it. */
	name: string;
	/** What to show as the heading. The plan's label when it has one, else `name`. */
	title: string;
	purpose: string;
	feature?: string;
	/** True when the plan says this should exist but no definition does yet. */
	planned: boolean;
	cards: BoardCard[];
	order: number;
}

export interface BoardBand {
	kind: BoardKind;
	heading: string;
	subLine?: string;
	columns: BoardColumn[];
}

export interface BoardModel {
	title: string;
	description: string;
	features: Array<{ uid: string; name: string; intent?: string; count: number }>;
	bands: BoardBand[];
	/** True when no blueprint was supplied at all. Drives the empty offer. */
	unplannedApp: boolean;
}

/** What the host hands in. Everything except `appBlueprint` comes from definitions. */
export interface BoardSources {
	appName?: string;
	/**
	 * What a person calls this app, when the host knows it.
	 *
	 * Separate from `appName`, which is the CODE and is identity: it addresses
	 * the app in every call this board's host makes. Titling the board with it
	 * put "crumbco" at the top of a screen that Site Settings, one click away,
	 * calls Crumb Company. A plan's own `title` still wins over both, because
	 * somebody wrote that down on purpose.
	 */
	appTitle?: string;
	appBlueprint?: any;
	/**
	 * The sites this person could plan, for when none has been chosen.
	 *
	 * AI Studio is reachable from the account rail, outside any one site, so
	 * arriving with no app is an ordinary first step rather than a broken link.
	 * The board cannot guess which site was meant and must not: planning the
	 * wrong one is a worse outcome than asking.
	 *
	 * Either shape the platform hands back is accepted — `name`/`title` from a
	 * ui Application document, `appCode`/`appName` from a security row — because
	 * the alternative is mapping an array in KIRun to rename two keys.
	 */
	apps?: Array<{
		name?: string;
		title?: string;
		description?: string;
		appCode?: string;
		appName?: string;
		/**
		 * Whatever date the row came with, used as the tile's second line the way
		 * the account screen's project tiles use theirs. Read straight off the
		 * platform row under either spelling, again to avoid mapping an array in
		 * KIRun for the sake of one key.
		 */
		updatedAt?: string;
		createdAt?: string;
	}>;
	/**
	 * The sites this person opened last, newest first once sorted by `at`.
	 *
	 * A map keyed by app code rather than a list, for the same reason the plan
	 * uses keyed maps: appending to a list and trimming it is several steps of
	 * array work in KIRun, while writing one key is one step and is idempotent —
	 * opening the same site twice updates it instead of adding it again.
	 *
	 * Shown ONLY when no site is chosen. Once you are in one, a row of other
	 * sites is clutter on a screen that is about this one.
	 */
	recents?: {
		[appCode: string]: { name?: string; title?: string; at?: string | number };
	};
	/**
	 * A planning sweep the host started, as the service reports it.
	 *
	 * Writing a plan for a real site is one model call per object, which is
	 * minutes rather than a moment, so it runs as a job and this is what a poll
	 * came back with. Every step is named BEFORE it runs, so this is never a
	 * spinner: it says which object is being read and what is still to come.
	 *
	 * Absent when nothing is running, which is the ordinary state.
	 */
	progress?: {
		job?: string;
		/** running | done | failed */
		state?: string;
		done?: number;
		total?: number;
		failed?: number;
		error?: string;
		current?: { kind?: string; name?: string; label?: string; detail?: string };
		steps?: Array<{
			kind?: string;
			name?: string;
			label?: string;
			/** waiting | working | done | failed */
			state?: string;
			detail?: string;
			seconds?: number;
		}>;
	};
	/**
	 * Every object the app has, keyed by kind: what `/api/ai/blueprint/objects`
	 * answers with.
	 *
	 * One source for all nine kinds rather than a named list per kind. The two
	 * named lists below came first and still work, but adding seven more of them
	 * would have meant seven more fetches and seven more stores hand-authored in
	 * the host page — seven more places for the list of kinds to fall out of step
	 * with the sweep that plans them.
	 *
	 * Rows carry what a list route carries: name, title, description. Everything
	 * a column needs to draw its CARDS arrives later, through `loaded`.
	 */
	objects?: {
		[kind: string]: Array<{
			name: string;
			title?: string;
			description?: string;
			[field: string]: any;
		}>;
	};
	pages?: Array<{
		name: string;
		rootComponent?: string;
		componentDefinition?: { [key: string]: ComponentDefinition };
		blueprint?: any;
	}>;
	storages?: Array<{ name: string; schema?: any; blueprint?: any }>;
	/**
	 * Detail fetched lazily, keyed by object name.
	 *
	 * The platform's only list route is the LRO projection, which carries names
	 * and ids but no `componentDefinition` and no `blueprint` — deliberately, so
	 * a list of forty pages does not ship forty 1.4MB documents. So a column
	 * renders from the list immediately and its cards arrive when it is opened.
	 * Merging here rather than mutating `pages` keeps the KIRun side to one
	 * SetStore at a known path.
	 *
	 * Nested by kind, then by name, because a name alone is not unique across
	 * kinds: a site with a `blog` page and a `blog` storage stored both
	 * documents at the same key, and opening the second redrew the first column
	 * with the other object's parts.
	 *
	 * Nested rather than a `<kind>:<name>` key, because the host writes this
	 * through a store path built by concatenation and a store path is split on
	 * `.` and then parsed as an expression — a segment carrying a colon is a
	 * ternary with nothing after it. Two identifier segments parse.
	 *
	 * A flat `loaded[name]` is still read, for a host that has not been updated.
	 */
	loaded?: { [kindOrName: string]: any };
	/**
	 * Per-entry status supplied by the host, which OVERRIDES what the component
	 * works out for itself.
	 *
	 * For a page section the component derives this from `componentVersions`
	 * against `blueprint.reconciled`, both of which arrive on the same document
	 * the cards are drawn from (see `driftOf`). This is for the kinds of object
	 * that carry no per-entry fingerprint, where only the host can say.
	 */
	status?: { [uid: string]: CardStatus };
}

const BAND_HEADINGS: Record<BoardKind, string> = {
	page: 'The pages',
	storage: 'What gets kept',
	function: 'Work it does on the server',
	uifunction: 'Work it does in the browser',
	uripath: 'What it answers when something calls it',
	template: 'What it sends',
	notification: 'When it tells somebody',
	theme: 'The look',
	style: 'Styling on top of the look',
	asset: 'Pictures and files it needs',
	delivery: 'When you build it',
	boundary: 'Asked for, and not part of a site',
};

const BAND_SUBLINES: Partial<Record<BoardKind, string>> = {
	storage: 'What this app collects and holds on to.',
	function: 'Steps that run away from the browser, where a key or a total can be trusted.',
	uripath: 'An address something outside this site can call, and what answers.',
	notification: 'Who hears about it, and through which channel.',
};

/**
 * Every kind that is an OBJECT, in the order the bands stack.
 *
 * Mirrors `BOARD_KINDS` in `nocode-ai/app/services/blueprint/objects.py`, which
 * is what the sweep plans and what `/objects` lists. The two lists have to
 * agree: a kind swept but not drawn is tokens spent on something nobody reads,
 * and a kind drawn but not swept is a band of cards that never says anything.
 *
 * `delivery` and `boundary` are deliberately absent — they are read off the
 * app's own plan rather than off any object.
 */
export const OBJECT_KINDS: BoardKind[] = [
	'page',
	'storage',
	'function',
	'uifunction',
	'uripath',
	'template',
	'notification',
	'theme',
	'style',
];

/**
 * Where one kind's parts live in its plan, and the field linking an entry back
 * to the definition it describes.
 *
 * Mirrors `PLAN_COLLECTION` in `nocode-ai/.../compose.py`. The link field is
 * never an index or a position: a section is matched by `componentKey`, a
 * storage field by `name`, a function step by its statement name — each of
 * which survives the thing being moved, where "the third one" does not.
 */
const PLAN_COLLECTION: Partial<Record<BoardKind, [string, string]>> = {
	page: ['sections', 'componentKey'],
	storage: ['fields', 'name'],
	function: ['steps', 'step'],
	uifunction: ['steps', 'step'],
	uripath: ['steps', 'step'],
	template: ['parts', 'part'],
	notification: ['channels', 'channel'],
};

/** A kind with no table of its own plans its parts under `parts`, keyed by `part`. */
const DEFAULT_COLLECTION: [string, string] = ['parts', 'part'];

export function collectionFor(kind: BoardKind): [string, string] {
	return PLAN_COLLECTION[kind] ?? DEFAULT_COLLECTION;
}

/**
 * The parts of one object, read off its definition rather than its plan.
 *
 * This is the half that needs no AI call and no plan: a function's steps and a
 * template's parts are already named in the document, so a column draws its
 * cards the moment it is opened and a plan fills in the line underneath.
 *
 * A theme and a style have no parts here on purpose. Their parts are variables,
 * and a couple of hundred cards each saying what its own name says is not a
 * board anybody reads.
 */
export function definitionParts(kind: BoardKind, row: any): string[] {
	switch (kind) {
		case 'function':
		case 'uifunction':
			return Object.keys(row?.definition?.steps ?? {});
		case 'uripath':
			return Object.keys(row?.pathDefinition?.steps ?? {});
		case 'template':
			return Object.keys(row?.templateParts ?? {});
		case 'notification':
			return Object.keys(row?.channelDetails ?? {});
		default:
			return [];
	}
}

/**
 * Component types that are shell rather than content.
 *
 * A nav bar and a footer appear identically on every column, so they are drawn
 * quieter and do not compete with what actually differs between pages. Matched
 * on the NAME rather than the type, because in Modlix both are ordinary Grids.
 */
const CHROME_NAME = /^(nav|navbar|nav bar|header|topbar|top bar|footer|foot)$/i;

function isChrome(def: ComponentDefinition | undefined): boolean {
	if (!def) return false;
	return CHROME_NAME.test((def.name ?? '').trim());
}

/**
 * Turn a component key into something readable.
 *
 * Generated keys are uuid-ish, and a page authored by hand often leaves a
 * section called "Grid" or "_grid3". Neither is worth showing, so an unhelpful
 * name falls back to the type. This is deliberately dumb: naming a section
 * properly is a derivation, which costs tokens and is explicit.
 */
export function readableName(def: ComponentDefinition | undefined, index: number): string {
	const raw = (def?.name ?? '').trim();
	const unhelpful = !raw || /^_?(grid|comp|component)\d*$/i.test(raw) || raw === def?.key;
	if (!unhelpful) return raw;
	return def?.type ? `${def.type} ${index + 1}` : `Section ${index + 1}`;
}

/** The direct children of a root, in display order. These are a page's sections. */
export function sectionsOf(page: {
	rootComponent?: string;
	componentDefinition?: { [key: string]: ComponentDefinition };
}): ComponentDefinition[] {
	const defs = page.componentDefinition;
	const rootKey = page.rootComponent;
	if (!defs || !rootKey) return [];
	const root = defs[rootKey];
	if (!root?.children) return [];

	return Object.entries(root.children)
		.filter(([, on]) => on)
		.map(([key]) => defs[key])
		.filter((d): d is ComponentDefinition => !!d)
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/** Keyed maps carry `order`; arrays are never used in a blueprint (see §3 of the doc). */
function byOrder<T extends { order?: number }>(
	map: { [k: string]: T } | undefined,
): Array<[string, T]> {
	if (!map) return [];
	return Object.entries(map).sort((a, b) => (a[1]?.order ?? 0) - (b[1]?.order ?? 0));
}

/**
 * Merge one page's definition and plan into a column.
 *
 * The plan is matched to the definition by `componentKey`. A planned entry with
 * no matching component is still shown (it is "planned, not built"); a
 * component with no planned entry is shown as unplanned, which is the normal
 * state for every existing site.
 */
/**
 * Does this card's plan entry still agree with what is built?
 *
 * Three states, and the two that are not `clean` point in OPPOSITE directions.
 * `pending` means the plan is ahead and resolving it BUILDS something.
 * `drifted` means the definition is ahead and resolving it MOVES THE PLAN.
 * Never collapse them: an "update" that picked the wrong direction would
 * overwrite the very edit it was meant to record.
 *
 * Derived here rather than fetched. The fingerprint is `componentVersions`,
 * which the platform already maintains and which arrives on the same document
 * the cards are drawn from, so asking a service for it would be a round trip to
 * be told something already in hand — and would show a card in one state while
 * the definition beside it said another.
 *
 * It is per ENTRY and never the document version, because a blueprint is a field
 * ON the object it describes: editing the plan bumps the same `version` counter
 * that editing the page bumps, so a document-level comparison cannot tell "the
 * page changed" from "the plan changed".
 *
 * A host-supplied status still wins (see `BoardSources.status`), for the kinds
 * of object that have no per-entry fingerprint of their own.
 */
function driftOf(page: any, uid: string, componentKey?: string): CardStatus {
	// No plan entry at all: nothing to agree or disagree with.
	if (!componentKey) return 'none';
	const agreed = page?.blueprint?.reconciled?.[uid];
	const live = page?.componentVersions?.[componentKey];
	// One comparison covers every case worth distinguishing. Never reconciled
	// (`agreed` absent) reads as drifted and needs no fourth word: there too the
	// definition is what is real and the plan has not been checked against it.
	// A legacy page with no version tracking has both absent, so it reads clean
	// rather than marking every card on it as edited by somebody.
	return agreed === live ? 'clean' : 'drifted';
}

function pageColumn(
	page: NonNullable<BoardSources['pages']>[number],
	index: number,
	status: BoardSources['status'],
	appObject?: any,
): BoardColumn {
	const plan = page.blueprint?.plan;
	const sections = byOrder<any>(plan?.sections);
	const byComponentKey = new Map<string, [string, any]>();
	for (const entry of sections) {
		const ck = entry[1]?.componentKey;
		if (ck) byComponentKey.set(ck, entry);
	}

	const defs = sectionsOf(page);
	const cards: BoardCard[] = [];
	const usedPlanKeys = new Set<string>();

	defs.forEach((def, i) => {
		const planned = byComponentKey.get(def.key);
		if (planned) usedPlanKeys.add(planned[0]);
		const uid = planned ? planned[0] : def.key;
		const p = planned?.[1];
		const purpose = (p?.purpose ?? '').trim();
		const describes = (p?.describes ?? '').trim();
		cards.push({
			uid,
			title: p?.name?.trim() || readableName(def, i),
			description: purpose || describes,
			stated: !!purpose,
			chrome: isChrome(def),
			status: status?.[uid] ?? driftOf(page, uid, planned ? def.key : undefined),
			feature: p?.feature,
			componentKey: def.key,
			order: p?.order ?? (i + 1) * 1000,
			unplanned: !planned,
		});
	});

	// Planned but not built: the plan names a section no component answers to.
	for (const [uid, p] of sections) {
		if (usedPlanKeys.has(uid)) continue;
		cards.push({
			uid,
			title: p?.name?.trim() || 'Untitled',
			description: (p?.purpose ?? p?.describes ?? '').trim(),
			stated: !!p?.purpose,
			chrome: false,
			status: status?.[uid] ?? 'pending',
			feature: p?.feature,
			order: p?.order ?? 999000,
			unplanned: false,
		});
	}

	cards.sort((a, b) => a.order - b.order);

	return {
		uid: appObject?.uid ?? page.name,
		kind: 'page',
		name: page.name,
		title: appObject?.name?.trim() || page.name,
		purpose: (appObject?.purpose ?? plan?.intent ?? appObject?.summary ?? '').trim(),
		feature: appObject?.feature,
		planned: false,
		cards,
		order: appObject?.order ?? (index + 1) * 1000,
	};
}

function storageColumn(
	storage: NonNullable<BoardSources['storages']>[number],
	index: number,
	status: BoardSources['status'],
	appObject?: any,
): BoardColumn {
	const plan = storage.blueprint?.plan;
	const planned = byOrder<any>(plan?.fields);

	// A storage's cards are its fields. The schema is the definition side; the
	// plan supplies each field's `why`, which is the part worth having.
	const schemaProps: string[] = storage.schema?.properties
		? Object.keys(storage.schema.properties)
		: [];
	const plannedByName = new Map<string, [string, any]>();
	for (const e of planned) if (e[1]?.name) plannedByName.set(e[1].name, e);

	const cards: BoardCard[] = [];
	const used = new Set<string>();

	schemaProps.forEach((fieldName, i) => {
		const p = plannedByName.get(fieldName);
		if (p) used.add(p[0]);
		const uid = p ? p[0] : `${storage.name}.${fieldName}`;
		// The same two fields a page section uses, and for the same reason: a
		// person's `purpose` outranks a derived `describes`, and only the first
		// counts as stated. This read `why` for a while, which is not a field
		// anything writes — so every storage field rendered as a bare name
		// however well the plan described it.
		const purpose = (p?.[1]?.purpose ?? '').trim();
		const describes = (p?.[1]?.describes ?? '').trim();
		cards.push({
			uid,
			title: fieldName,
			description: purpose || describes,
			stated: !!purpose,
			chrome: false,
			status: status?.[uid] ?? (p ? 'clean' : 'none'),
			componentKey: undefined,
			order: p?.[1]?.order ?? (i + 1) * 1000,
			unplanned: !p,
		});
	});

	for (const [uid, p] of planned) {
		if (used.has(uid)) continue;
		cards.push({
			uid,
			title: p?.name ?? 'Untitled',
			description: (p?.purpose ?? p?.describes ?? '').trim(),
			stated: !!p?.purpose,
			chrome: false,
			status: status?.[uid] ?? 'pending',
			order: p?.order ?? 999000,
			unplanned: false,
		});
	}

	cards.sort((a, b) => a.order - b.order);

	return {
		uid: appObject?.uid ?? storage.name,
		kind: 'storage',
		name: storage.name,
		title: appObject?.name?.trim() || storage.name,
		purpose: (appObject?.purpose ?? plan?.grain ?? appObject?.summary ?? '').trim(),
		feature: appObject?.feature,
		planned: false,
		cards,
		order: appObject?.order ?? (index + 1) * 1000,
	};
}

/**
 * Kinds whose cards come only from their plan, never from their definition.
 *
 * A theme's parts are its variables and there are a couple of hundred of them,
 * so a planned entry that matches no definition part is NOT "planned, not
 * built" here — it is the one card that describes the theme itself.
 */
const KINDS_WITHOUT_PARTS = new Set<BoardKind>(['theme', 'style']);

/**
 * One column for any kind that is not a page or a storage.
 *
 * Those two have their own builders because their parts are read in ways
 * nothing else shares — a component tree with per-component version
 * fingerprints, and a JSON schema. Everything else is the same shape: a map of
 * named parts on the definition, a keyed map of entries in the plan, matched on
 * one link field.
 */
function partsColumn(
	kind: BoardKind,
	row: any,
	index: number,
	status: BoardSources['status'],
	appObject?: any,
): BoardColumn {
	const [collection, matchOn] = collectionFor(kind);
	const plan = row.blueprint?.plan;
	const planned = byOrder<any>(plan?.[collection]);

	const byKey = new Map<string, [string, any]>();
	for (const entry of planned) {
		const key = entry[1]?.[matchOn];
		if (key) byKey.set(String(key), entry);
	}

	const cards: BoardCard[] = [];
	const used = new Set<string>();

	definitionParts(kind, row).forEach((partKey, i) => {
		const p = byKey.get(partKey);
		if (p) used.add(p[0]);
		const uid = p ? p[0] : `${row.name}.${partKey}`;
		const purpose = (p?.[1]?.purpose ?? '').trim();
		const describes = (p?.[1]?.describes ?? '').trim();
		cards.push({
			uid,
			title: (p?.[1]?.name ?? '').trim() || partKey,
			description: purpose || describes,
			stated: !!purpose,
			chrome: false,
			status: status?.[uid] ?? (p ? 'clean' : 'none'),
			order: p?.[1]?.order ?? (i + 1) * 1000,
			unplanned: !p,
		});
	});

	const leftoverStatus: CardStatus = KINDS_WITHOUT_PARTS.has(kind) ? 'clean' : 'pending';
	for (const [uid, p] of planned) {
		if (used.has(uid)) continue;
		cards.push({
			uid,
			title: (p?.name ?? '').trim() || p?.[matchOn] || 'Untitled',
			description: (p?.purpose ?? p?.describes ?? '').trim(),
			stated: !!p?.purpose,
			chrome: false,
			status: status?.[uid] ?? leftoverStatus,
			order: p?.order ?? 999000,
			unplanned: false,
		});
	}

	cards.sort((a, b) => a.order - b.order);

	return {
		uid: appObject?.uid ?? `${kind}:${row.name}`,
		kind,
		name: row.name,
		title: (appObject?.name ?? '').trim() || row.title?.trim() || row.name,
		purpose: (appObject?.purpose ?? plan?.intent ?? appObject?.summary ?? row.description ?? '').trim(),
		feature: appObject?.feature,
		planned: false,
		cards,
		order: appObject?.order ?? (index + 1) * 1000,
	};
}

/**
 * The cards of an object that does not exist yet.
 *
 * A blueprint is a FIELD on a document, so a page nobody has created has
 * nowhere of its own to keep its plan — and "we are going to add a blog list
 * page" is not worth much without the sections it is supposed to have. So the
 * app plan carries them, under `spec`, in exactly the shape that page's own
 * plan will take once the page exists: building it is then a move rather than a
 * rewrite, and there is never a moment where the two shapes have to be kept in
 * step with each other.
 *
 * Every card here is `pending` by definition. Nothing is built.
 */
function specCards(kind: BoardKind, object: any): BoardCard[] {
	const [collection, matchOn] = collectionFor(kind);
	return byOrder<any>(object?.spec?.[collection]).map(([uid, e], i) => ({
		uid,
		title: (e?.name ?? '').trim() || e?.[matchOn] || 'Untitled',
		description: (e?.purpose ?? e?.describes ?? '').trim(),
		stated: !!e?.purpose,
		chrome: false,
		status: 'pending' as CardStatus,
		order: e?.order ?? (i + 1) * 1000,
		unplanned: false,
	}));
}

/**
 * Build the board.
 *
 * Pure, so it is unit-testable without a store, a page or a network call, and
 * so the "no blueprint anywhere" path is the one the tests exercise first.
 */
export function buildBoard(sources: BoardSources): BoardModel {
	const appPlan = sources.appBlueprint?.plan;
	const objects = byOrder<any>(appPlan?.objects);

	// The app plan's `objects` map is the INDEX: it names every object and its
	// purpose, so the rail and every relation render without opening a single
	// object blueprint. That is what makes a large app cheap to draw.
	const objectByName = new Map<string, any>();
	for (const [uid, o] of objects) {
		if (o?.name) objectByName.set(`${o.kind ?? 'page'}:${o.name}`, { ...o, uid });
	}

	// A listed object carries only its name until its detail is fetched, so the
	// lazily loaded document is merged over the list row here.
	//
	// Kind AND name. A site with a `blog` page and a `blog` storage put both
	// documents at the same key, so opening the second overwrote the first and
	// one column redrew itself with the other's parts.
	const detail = (kind: BoardKind, name: string) =>
		sources.loaded?.[kind]?.[name] ?? sources.loaded?.[name] ?? undefined;

	// Every kind the app has, from the generic `objects` map when the host sends
	// one and from the two named lists otherwise. Both shapes are accepted
	// because `pages` and `storages` predate the rest and a host that only knows
	// those two must keep working.
	const rowsFor = (kind: BoardKind): any[] => {
		const generic = sources.objects?.[kind];
		if (generic?.length) return generic;
		if (kind === 'page') return sources.pages ?? [];
		if (kind === 'storage') return sources.storages ?? [];
		return [];
	};

	const columnsByKind = new Map<BoardKind, BoardColumn[]>();
	for (const kind of OBJECT_KINDS) {
		const columns = rowsFor(kind).map((row, i) => {
			const merged = { ...row, ...detail(kind, row.name) };
			const appObject = objectByName.get(`${kind}:${row.name}`);
			if (kind === 'page') return pageColumn(merged, i, sources.status, appObject);
			if (kind === 'storage') return storageColumn(merged, i, sources.status, appObject);
			return partsColumn(kind, merged, i, sources.status, appObject);
		});
		columnsByKind.set(kind, columns);
	}

	// Objects the plan says should exist but nothing answers to. Showing these
	// is how "planned, not built" stays visible instead of being forgotten.
	const seen = new Set<string>();
	for (const [kind, columns] of columnsByKind)
		for (const column of columns) seen.add(`${kind}:${column.name}`);

	for (const [uid, o] of objects) {
		const kind = (o?.kind ?? 'page') as BoardKind;
		const key = `${kind}:${o?.name}`;
		// Assets are never columns. They are handled as their own band below,
		// because one column per favicon is a board about nothing else.
		if (!o?.name || kind === 'asset' || seen.has(key)) continue;
		// A plan naming a kind the board does not draw still has to land
		// somewhere visible, or "planned, not built" would be true and invisible.
		const band = columnsByKind.get(kind) ?? columnsByKind.get('page')!;
		band.push({
			uid,
			kind: columnsByKind.has(kind) ? kind : 'page',
			name: o.name,
			title: o.name,
			purpose: (o.purpose ?? o.summary ?? '').trim(),
			feature: o.feature,
			planned: true,
			cards: specCards(kind, o),
			order: o.order ?? 999000,
		});
	}

	const bands: BoardBand[] = [];
	for (const kind of OBJECT_KINDS) {
		const columns = columnsByKind.get(kind) ?? [];
		if (!columns.length) continue;
		columns.sort((a, b) => a.order - b.order);
		bands.push({
			kind,
			heading: BAND_HEADINGS[kind],
			subLine: BAND_SUBLINES[kind],
			columns,
		});
	}

	// ── Things to be MADE, which are never documents ─────────────────
	//
	// A favicon, a logo, a hero photograph. There is no overridable record for a
	// picture, so there is no `blueprint` field anywhere that could hold "a
	// cinnamon roll in a circle, flat, two colours" — the app's own plan is the
	// only place it can live, and anywhere else means the request is lost the
	// moment the conversation scrolls.
	//
	// One column rather than one per asset: a board where the favicon gets the
	// same width as the home page is a board about the favicon.
	const assetCards: BoardCard[] = objects
		.filter(([, o]) => o?.kind === 'asset')
		.map(([uid, o], i) => {
			const asset = o.asset ?? {};
			const use = (asset.use ?? o.name ?? '').trim();
			return {
				uid,
				title: use || 'A picture',
				description: (o.purpose ?? asset.intent ?? '').trim(),
				stated: !!(o.purpose ?? asset.intent),
				chrome: false,
				// `assetId` is the whole test. Until a file exists this is a
				// request somebody made and nobody has acted on.
				status: (asset.assetId ? 'clean' : 'pending') as CardStatus,
				order: o.order ?? (i + 1) * 1000,
				unplanned: false,
			};
		});
	if (assetCards.length)
		bands.push({
			kind: 'asset',
			heading: BAND_HEADINGS.asset,
			subLine: 'Nothing here is a page. These are files somebody still has to make.',
			columns: [
				{
					uid: 'asset:tomake',
					kind: 'asset',
					name: 'assets',
					title: 'To be made',
					purpose: '',
					planned: false,
					cards: assetCards,
					order: 1000,
				},
			],
		});

	// ── What happens when it is built ────────────────────────────────
	//
	// Read off the app plan's own `delivery` and `security`, both of which the
	// schema already carries. Worth a band rather than a settings screen: the
	// address a site answers on and who can read it are decisions, and a plan
	// that records every section of the home page but not whether the thing is
	// public is missing the two facts a customer asks about first.
	const deliveryCards: BoardCard[] = [];
	const domains = byOrder<any>(appPlan?.delivery?.domains);
	domains.forEach(([uid, d], i) => {
		const host = (d?.host ?? d?.domain ?? d?.name ?? '').trim();
		if (!host) return;
		deliveryCards.push({
			uid,
			title: host,
			description: (d?.purpose ?? d?.note ?? '').trim(),
			stated: !!d?.purpose,
			chrome: false,
			status: 'none',
			order: d?.order ?? (i + 1) * 1000,
			unplanned: false,
		});
	});

	const audience = byOrder<any>(appPlan?.security?.access);
	const audienceCards: BoardCard[] = audience.map(([uid, a], i) => ({
		uid,
		title: (a?.who ?? a?.name ?? 'Everyone').trim(),
		description: (a?.purpose ?? a?.note ?? '').trim(),
		stated: !!a?.purpose,
		chrome: false,
		status: 'none' as CardStatus,
		order: a?.order ?? (i + 1) * 1000,
		unplanned: false,
	}));

	const deliveryColumns: BoardColumn[] = [];
	if (deliveryCards.length)
		deliveryColumns.push({
			uid: 'delivery:address',
			kind: 'delivery',
			name: 'address',
			title: 'The address',
			purpose: '',
			planned: false,
			cards: deliveryCards,
			order: 1000,
		});
	if (audienceCards.length)
		deliveryColumns.push({
			uid: 'delivery:audience',
			kind: 'delivery',
			name: 'audience',
			title: 'Who sees it',
			purpose: '',
			planned: false,
			cards: audienceCards,
			order: 2000,
		});
	if (deliveryColumns.length)
		bands.push({ kind: 'delivery', heading: BAND_HEADINGS.delivery, columns: deliveryColumns });

	// ── Asked for, and not part of a site ────────────────────────────
	//
	// A decision the plan RECORDED as rejected. The point of keeping it on the
	// board rather than answering it in the conversation and moving on is that
	// the conversation scrolls away and the question comes back: somebody asks
	// for customer logins, is told a site has no accounts, and asks again three
	// weeks later. On the board it stays put, with the reason attached and the
	// route out of it named.
	// `decisions` is a SIBLING of `plan` in the schema, not part of it: a
	// decision is about the object, not one of its parts. Reading it off the
	// plan found nothing and the band silently never appeared.
	const declined = byOrder<any>(sources.appBlueprint?.decisions).filter(
		([, d]) => (d?.status ?? 'active') === 'rejected',
	);
	if (declined.length)
		bands.push({
			kind: 'boundary',
			heading: BAND_HEADINGS.boundary,
			subLine:
				'A site is pages anyone can read. The moment something needs people to sign in and have their own data it is an application, and App Builder is where those get made. Your plan goes with you.',
			columns: declined.map(([uid, d], i) => ({
				uid,
				kind: 'boundary' as BoardKind,
				name: uid,
				title: (d?.choice ?? 'Asked for').trim(),
				purpose: (d?.because ?? '').trim(),
				planned: true,
				cards: [
					{
						uid: `${uid}.why`,
						title: (d?.choice ?? 'Asked for').trim(),
						description: (d?.because ?? '').trim(),
						stated: true,
						chrome: false,
						status: 'none' as CardStatus,
						order: 1000,
						unplanned: false,
					},
				],
				order: d?.order ?? (i + 1) * 1000,
			})),
		});

	// Features cut ACROSS bands, so they are a lens rather than a band of their
	// own. The count is what each claims, which is also what "leave this out"
	// would remove.
	const claimed = new Map<string, number>();
	for (const band of bands)
		for (const col of band.columns) {
			if (col.feature) claimed.set(col.feature, (claimed.get(col.feature) ?? 0) + 1);
			for (const card of col.cards)
				if (card.feature) claimed.set(card.feature, (claimed.get(card.feature) ?? 0) + 1);
		}

	const features = byOrder<any>(appPlan?.features).map(([uid, f]) => ({
		uid,
		name: f?.name ?? 'Untitled',
		intent: f?.intent,
		count: claimed.get(uid) ?? 0,
	}));

	return {
		title: (appPlan?.title ?? sources.appTitle ?? sources.appName ?? '').trim(),
		description: (appPlan?.intent ?? '').trim(),
		features,
		bands,
		unplannedApp: !sources.appBlueprint,
	};
}

/**
 * The date on a site tile, from either of the two shapes that reach it.
 *
 * The recents document carries an ISO string, because that is what
 * System.Date.GetCurrentTimestamp hands a page. A platform row carries epoch
 * SECONDS as a number. `new Date` reads neither in the other's shape: handed
 * the string "1789560982" it answers Invalid Date, and handed 1789560982 as
 * milliseconds it answers 1970. The first of those is how every search result
 * came out captioned with an app code, the component having quietly decided
 * none of them had a date.
 *
 * Undefined rather than a guess when it is neither, so the caller can show
 * something true instead of a confident wrong date.
 */
export function tileDate(raw: string): Date | undefined {
	const text = (raw ?? '').trim();
	if (!text) return undefined;
	const asNumber = Number(text);
	let date: Date;
	if (Number.isFinite(asNumber)) {
		// Seconds or milliseconds. 1e12 is 2001 read as milliseconds and the
		// year 33658 read as seconds, so no real timestamp is ambiguous.
		date = new Date(asNumber < 1e12 ? asNumber * 1000 : asNumber);
	} else {
		date = new Date(text);
	}
	return Number.isNaN(date.getTime()) ? undefined : date;
}
