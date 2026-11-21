import { shortUUID } from '../../util/shortUUID';
import { CatalogDefault, ReportCatalog } from './reportTypes';

/**
 * Report groups (CONTRACT section 9): each group is its own dashboard document
 * (`reports_<groupId>`, the P1a shape) with its own widgets, layout and defaults state.
 *
 * - App groups come from the catalog (`groups`, already trimmed to the caller); a catalog
 *   without `groups` has one implied group, `dashboard`. A default's `group` (missing =
 *   `dashboard`) says which group seeds it.
 * - User groups are private: personalization `reports_groups` =
 *   `{groups:[{id:"u_<random>",label,order}]}`, at most 10, labels 1 to 40 characters,
 *   unique per user (any case) and never an app group's label; ids start with `u_` so they
 *   never clash with an app group's id. User groups start empty (no defaults).
 *
 * Every function here is pure and returns a new value.
 */

export const DEFAULT_GROUP = 'dashboard';
export const USER_GROUPS_DOC = 'groups';
export const USER_GROUP_PREFIX = 'u_';
export const USER_GROUP_CAP = 10;
export const GROUP_LABEL_MAX = 40;

export interface GroupInfo {
	id: string;
	label: string;
	kind: 'app' | 'user';
	order: number;
}

export interface UserGroup {
	id: string;
	label: string;
	order: number;
}

/** `reports_groups`. */
export interface UserGroupsDoc {
	groups: UserGroup[];
}

export type GroupsResult =
	| { ok: true; doc: UserGroupsDoc; id?: string }
	| { ok: false; error: string };

export const GROUP_MESSAGES = {
	cap: `You can have at most ${USER_GROUP_CAP} groups of your own. Delete one first.`,
	empty: 'Give the group a name.',
	long: `A group name can have at most ${GROUP_LABEL_MAX} characters.`,
	taken: 'You already have a group with this name.',
	app: 'This name is used by a group of the app. Pick another.',
	gone: 'That group no longer exists.',
	notYours: 'Only your own groups can be renamed or deleted.',
};

export function isUserGroupId(id: string | undefined): boolean {
	return typeof id === 'string' && id.startsWith(USER_GROUP_PREFIX) && id.length > 2;
}

/** The group a catalog default seeds (missing = `dashboard`). */
export function groupOfDefault(d: CatalogDefault): string {
	const g = d?.group;
	return typeof g === 'string' && g.trim() ? g.trim() : DEFAULT_GROUP;
}

/**
 * The app's groups from the catalog, by `order` then id. No `groups` in the catalog: the one
 * implied `dashboard` group. `u_` ids and `groups` (the user groups document's own name) are
 * never app groups.
 */
export function appGroups(catalog: ReportCatalog | undefined): GroupInfo[] {
	if (!catalog) return [];
	const raw = catalog.groups;
	if (!raw || typeof raw !== 'object' || Array.isArray(raw))
		return [{ id: DEFAULT_GROUP, label: 'Dashboard', kind: 'app', order: 1 }];
	const out: GroupInfo[] = [];
	for (const [id, g] of Object.entries<any>(raw)) {
		if (!id || isUserGroupId(id) || id === USER_GROUPS_DOC || !g || typeof g !== 'object')
			continue;
		out.push({
			id,
			label: typeof g.label === 'string' && g.label.trim() ? g.label.trim() : id,
			kind: 'app',
			order: Number.isFinite(g.order) ? Number(g.order) : 1000,
		});
	}
	return out.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** Reads `reports_groups` defensively: bad entries, duplicates and extras past the cap go. */
export function normalizeUserGroups(raw: any): UserGroupsDoc {
	const list = Array.isArray(raw?.groups) ? raw.groups : [];
	const ids = new Set<string>();
	const labels = new Set<string>();
	const groups: UserGroup[] = [];
	for (const g of list) {
		if (groups.length >= USER_GROUP_CAP) break;
		if (!g || !isUserGroupId(g.id) || ids.has(g.id)) continue;
		const label = typeof g.label === 'string' ? g.label.trim() : '';
		if (!label || label.length > GROUP_LABEL_MAX || labels.has(label.toLowerCase())) continue;
		ids.add(g.id);
		labels.add(label.toLowerCase());
		groups.push({
			id: g.id,
			label,
			order: Number.isFinite(g.order) ? Number(g.order) : groups.length + 1,
		});
	}
	return { groups: groups.sort((a, b) => a.order - b.order) };
}

/** App groups first (by order), then the user's (by order): `Store.reports.<ns>.groups`. */
export function mergeGroups(app: GroupInfo[], user: UserGroupsDoc | undefined): GroupInfo[] {
	return [
		...app,
		...(user?.groups ?? []).map(g => ({
			id: g.id,
			label: g.label,
			kind: 'user' as const,
			order: g.order,
		})),
	];
}

/** Why a label cannot be used ('' when it can). `exceptId`: the group being renamed. */
export function labelError(
	label: string,
	user: UserGroupsDoc,
	app: GroupInfo[],
	exceptId?: string,
): string {
	const l = String(label ?? '').trim();
	if (!l) return GROUP_MESSAGES.empty;
	if (l.length > GROUP_LABEL_MAX) return GROUP_MESSAGES.long;
	const low = l.toLowerCase();
	if (app.some(g => g.label.toLowerCase() === low)) return GROUP_MESSAGES.app;
	if (user.groups.some(g => g.id !== exceptId && g.label.toLowerCase() === low))
		return GROUP_MESSAGES.taken;
	return '';
}

export function newUserGroupId(taken: { id: string }[]): string {
	let id = '';
	do
		id =
			USER_GROUP_PREFIX +
			shortUUID()
				.replace(/[^A-Za-z0-9]/g, '')
				.slice(0, 10);
	while (id.length <= 2 || taken.some(g => g.id === id));
	return id;
}

export function createUserGroup(
	user: UserGroupsDoc,
	label: string,
	app: GroupInfo[],
): GroupsResult {
	if (user.groups.length >= USER_GROUP_CAP) return { ok: false, error: GROUP_MESSAGES.cap };
	const err = labelError(label, user, app);
	if (err) return { ok: false, error: err };
	const id = newUserGroupId([...user.groups, ...app]);
	const order = user.groups.reduce((m, g) => Math.max(m, g.order), 0) + 1;
	return {
		ok: true,
		id,
		doc: { groups: [...user.groups, { id, label: label.trim(), order }] },
	};
}

export function renameUserGroup(
	user: UserGroupsDoc,
	id: string,
	label: string,
	app: GroupInfo[],
): GroupsResult {
	if (!isUserGroupId(id)) return { ok: false, error: GROUP_MESSAGES.notYours };
	if (!user.groups.some(g => g.id === id)) return { ok: false, error: GROUP_MESSAGES.gone };
	const err = labelError(label, user, app, id);
	if (err) return { ok: false, error: err };
	return {
		ok: true,
		id,
		doc: { groups: user.groups.map(g => (g.id === id ? { ...g, label: label.trim() } : g)) },
	};
}

export function deleteUserGroup(user: UserGroupsDoc, id: string): GroupsResult {
	if (!isUserGroupId(id)) return { ok: false, error: GROUP_MESSAGES.notYours };
	if (!user.groups.some(g => g.id === id)) return { ok: false, error: GROUP_MESSAGES.gone };
	return { ok: true, id, doc: { groups: user.groups.filter(g => g.id !== id) } };
}

const scoped = new WeakMap<ReportCatalog, Map<string, ReportCatalog>>();

/**
 * The catalog as one group sees it: only the defaults that group seeds (none for a user
 * group). A name that is no group at all (a P1a page's own `name`, e.g. `main`) keeps every
 * default, as before groups. Same input, same object (documents reconcile once per catalog).
 */
export function catalogForGroup(
	catalog: ReportCatalog | undefined,
	group: string | undefined,
): ReportCatalog | undefined {
	if (!catalog) return catalog;
	const g = String(group ?? '').trim() || DEFAULT_GROUP;
	let byGroup = scoped.get(catalog);
	if (!byGroup) scoped.set(catalog, (byGroup = new Map()));
	let c = byGroup.get(g);
	if (c) return c;
	if (isUserGroupId(g)) c = { ...catalog, defaults: [] };
	else if (appGroups(catalog).some(a => a.id === g))
		c = { ...catalog, defaults: (catalog.defaults ?? []).filter(d => groupOfDefault(d) === g) };
	else c = catalog;
	byGroup.set(g, c);
	return c;
}

/** The groups a Dashboard's `groups` property shows as tabs ([] = no tabs). */
export function tabGroups(prop: unknown, all: GroupInfo[]): GroupInfo[] {
	if (prop === undefined || prop === null || prop === '' || prop === 'none') return [];
	if (prop === 'all') return all;
	const ids = (
		Array.isArray(prop) ? prop : typeof prop === 'string' ? prop.split(',') : []
	)
		.map(e => String(e ?? '').trim())
		.filter(Boolean);
	return ids.map(id => all.find(g => g.id === id)).filter((g): g is GroupInfo => !!g);
}

/** The store key part for a namespace (`Store.reports.<ns>.groups`). */
export function storeKey(ns: string | undefined): string {
	return String(ns ?? '').replace(/[^A-Za-z0-9_]/g, '_');
}
