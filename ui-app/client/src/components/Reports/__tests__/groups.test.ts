/**
 * Report groups (CONTRACT section 9): the groups model (app groups, user groups, label rules,
 * caps), each group's view of the catalog, Copy / Move to group, the one-time
 * `reports_main` -> `reports_dashboard` copy, and the shared store list
 * `Store.reports.<ns>.groups` kept current on every change.
 */
import { getDataFromPath } from '../../../context/StoreContext';
import { addWidget, copyWidgetTo, emptyDoc, seedDoc } from '../dashboardModel';
import { dropDoc, entryFor, readyDoc, resetStore, SAVE_DEBOUNCE_MS } from '../dashboardStore';
import {
	appGroups,
	catalogForGroup,
	createUserGroup,
	deleteUserGroup,
	GROUP_LABEL_MAX,
	GROUP_MESSAGES,
	labelError,
	mergeGroups,
	normalizeUserGroups,
	renameUserGroup,
	tabGroups,
	USER_GROUP_CAP,
	UserGroupsDoc,
} from '../groupsModel';
import {
	createGroup,
	deleteGroup,
	groupsEntryFor,
	groupsStorePath,
	renameGroup,
	resetGroupsStore,
	setAppGroups,
} from '../groupsStore';
import { FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportTransport } from '../reportApi';
import { DASHBOARD_CAPS, DashboardDoc, ReportCatalog, ReportSpec } from '../reportTypes';

const spec: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	view: { type: 'KPI' },
};

const CATALOG: ReportCatalog = {
	...FIXTURE_CATALOG,
	groups: {
		dashboard: { label: 'Dashboard', order: 1 },
		sales: { label: 'Sales', order: 2 },
	},
	defaults: [
		{ id: 'a', name: 'A', spec },
		{ id: 'b', name: 'B', spec, group: 'dashboard' },
		{ id: 's1', name: 'S1', spec, group: 'sales' },
	],
};

/** A transport over an in-memory personalization map; failures on demand. */
function memTransport(seed: Record<string, any> = {}) {
	const docs = new Map<string, any>(Object.entries(seed));
	const t = {
		docs,
		failSave: false,
		failLoad: new Set<string>(),
		saves: [] as string[],
		deletes: [] as string[],
		async call() {
			return [];
		},
		async loadDoc(name: string) {
			if (t.failLoad.has(name)) throw new Error('read failed');
			return docs.has(name) ? JSON.parse(JSON.stringify(docs.get(name))) : {};
		},
		async saveDoc(name: string, doc: any) {
			if (t.failSave) throw new Error('write failed');
			t.saves.push(name);
			docs.set(name, JSON.parse(JSON.stringify(doc)));
		},
		async deleteDoc(name: string) {
			t.deletes.push(name);
			if (!docs.has(name)) throw new Error('500');
			docs.delete(name);
		},
	};
	return t as typeof t & ReportTransport;
}

async function flush() {
	for (let i = 0; i < 5; i++) await Promise.resolve();
}

beforeEach(() => {
	resetStore();
	resetGroupsStore();
});

describe('groups model', () => {
	test('app groups from the catalog by order; none in the catalog = the implied dashboard', () => {
		expect(appGroups(CATALOG).map(g => [g.id, g.label, g.kind])).toEqual([
			['dashboard', 'Dashboard', 'app'],
			['sales', 'Sales', 'app'],
		]);
		expect(appGroups({ ...CATALOG, groups: undefined })).toEqual([
			{ id: 'dashboard', label: 'Dashboard', kind: 'app', order: 1 },
		]);
		// u_ ids and the user groups document's own name are never app groups.
		expect(
			appGroups({ ...CATALOG, groups: { u_x: { label: 'X' }, groups: { label: 'G' } } }),
		).toEqual([]);
		expect(appGroups(undefined)).toEqual([]);
	});

	test('label rules: 1 to 40 characters, unique per user in any case, never an app label', () => {
		const app = appGroups(CATALOG);
		const user: UserGroupsDoc = { groups: [{ id: 'u_1', label: 'Personal', order: 1 }] };
		expect(labelError('  ', user, app)).toBe(GROUP_MESSAGES.empty);
		expect(labelError('x'.repeat(GROUP_LABEL_MAX + 1), user, app)).toBe(GROUP_MESSAGES.long);
		expect(labelError('x'.repeat(GROUP_LABEL_MAX), user, app)).toBe('');
		expect(labelError('personal', user, app)).toBe(GROUP_MESSAGES.taken);
		expect(labelError('SALES', user, app)).toBe(GROUP_MESSAGES.app);
		// Renaming a group to its own name (another case) is fine.
		expect(labelError('PERSONAL', user, app, 'u_1')).toBe('');
	});

	test('create: u_ ids, next order, trimmed label; at most 10', () => {
		const app = appGroups(CATALOG);
		let user: UserGroupsDoc = { groups: [] };
		for (let i = 0; i < USER_GROUP_CAP; i++) {
			const r = createUserGroup(user, ` Group ${i} `, app);
			if (!r.ok) throw new Error(r.error);
			expect(r.id).toMatch(/^u_[A-Za-z0-9]+$/);
			user = r.doc;
		}
		expect(user.groups.map(g => g.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(user.groups[0].label).toBe('Group 0');
		expect(new Set(user.groups.map(g => g.id)).size).toBe(USER_GROUP_CAP);
		expect(createUserGroup(user, 'One more', app)).toEqual({
			ok: false,
			error: GROUP_MESSAGES.cap,
		});
	});

	test("rename and delete only touch the user's own groups", () => {
		const app = appGroups(CATALOG);
		const user: UserGroupsDoc = {
			groups: [
				{ id: 'u_1', label: 'Personal', order: 1 },
				{ id: 'u_2', label: 'Team', order: 2 },
			],
		};
		const r = renameUserGroup(user, 'u_1', 'Mine', app);
		expect(r.ok && r.doc.groups[0].label).toBe('Mine');
		expect(renameUserGroup(user, 'u_1', 'team', app)).toEqual({
			ok: false,
			error: GROUP_MESSAGES.taken,
		});
		expect(renameUserGroup(user, 'dashboard', 'X', app)).toEqual({
			ok: false,
			error: GROUP_MESSAGES.notYours,
		});
		expect(renameUserGroup(user, 'u_9', 'X', app)).toEqual({
			ok: false,
			error: GROUP_MESSAGES.gone,
		});
		const d = deleteUserGroup(user, 'u_2');
		expect(d.ok && d.doc.groups.map(g => g.id)).toEqual(['u_1']);
		expect(deleteUserGroup(user, 'sales').ok).toBe(false);
	});

	test('a stored reports_groups is read defensively', () => {
		const doc = normalizeUserGroups({
			groups: [
				{ id: 'u_b', label: 'B', order: 2 },
				{ id: 'u_a', label: 'A', order: 1 },
				{ id: 'nope', label: 'Bad id' },
				{ id: 'u_b', label: 'Dup id' },
				{ id: 'u_c', label: 'a' },
				{ id: 'u_d', label: '' },
				...Array.from({ length: 12 }, (_, i) => ({ id: `u_x${i}`, label: `X${i}` })),
			],
		});
		expect(doc.groups.slice(0, 2).map(g => g.id)).toEqual(['u_a', 'u_b']);
		expect(doc.groups.length).toBe(USER_GROUP_CAP);
		expect(normalizeUserGroups(undefined)).toEqual({ groups: [] });
		expect(normalizeUserGroups({ groups: 'x' })).toEqual({ groups: [] });
	});

	test("merged list: app groups, then the user's", () => {
		const all = mergeGroups(appGroups(CATALOG), {
			groups: [{ id: 'u_1', label: 'Personal', order: 1 }],
		});
		expect(all).toEqual([
			{ id: 'dashboard', label: 'Dashboard', kind: 'app', order: 1 },
			{ id: 'sales', label: 'Sales', kind: 'app', order: 2 },
			{ id: 'u_1', label: 'Personal', kind: 'user', order: 1 },
		]);
		expect(tabGroups('none', all)).toEqual([]);
		expect(tabGroups(undefined, all)).toEqual([]);
		expect(tabGroups('all', all)).toBe(all);
		expect(tabGroups('u_1, dashboard, gone', all).map(g => g.id)).toEqual(['u_1', 'dashboard']);
		expect(tabGroups(['sales'], all).map(g => g.id)).toEqual(['sales']);
	});

	test('each group sees only its defaults; user groups none; a P1a name keeps them all', () => {
		expect(catalogForGroup(CATALOG, 'dashboard')!.defaults!.map(d => d.id)).toEqual(['a', 'b']);
		expect(catalogForGroup(CATALOG, 'sales')!.defaults!.map(d => d.id)).toEqual(['s1']);
		expect(catalogForGroup(CATALOG, 'u_1')!.defaults).toEqual([]);
		expect(catalogForGroup(CATALOG, 'main')).toBe(CATALOG);
		// Stable: the same object for the same catalog and group.
		expect(catalogForGroup(CATALOG, 'sales')).toBe(catalogForGroup(CATALOG, 'sales'));
		// App groups seed their own defaults, user groups start empty.
		expect(Object.keys(seedDoc(catalogForGroup(CATALOG, 'sales')).widgets)).toEqual(['s1']);
		expect(seedDoc(catalogForGroup(CATALOG, 'u_1'))).toEqual(emptyDoc());
	});
});

describe('Copy / Move to group', () => {
	const source = seedDoc(catalogForGroup(CATALOG, 'dashboard'));

	test("the widget as it shows becomes the user's own in the target, on its dashboard", () => {
		const r = copyWidgetTo(source, 'a', catalogForGroup(CATALOG, 'dashboard'), emptyDoc());
		if (!r.ok) throw new Error(r.error);
		expect(r.placed).toBe('dashboard');
		const w = r.doc.widgets[r.id];
		expect(w).toEqual({ name: 'A', spec, refreshMin: 0 });
		expect(w.defaultId).toBeUndefined();
		expect(r.doc.layout.map(l => l.id)).toEqual([r.id]);
		// The source is untouched (Move deletes it there afterwards).
		expect(source.widgets.a).toBeDefined();
	});

	test('target dashboard full: into its library; target library full: refused', () => {
		let full: DashboardDoc = emptyDoc();
		for (let i = 0; i < DASHBOARD_CAPS.onDashboard; i++) {
			const r = addWidget(full, { name: `w${i}`, spec }, { toDashboard: true });
			if (!r.ok) throw new Error(r.error);
			full = r.doc;
		}
		const r = copyWidgetTo(source, 'a', CATALOG, full);
		expect(r.ok && r.placed).toBe('library');
		for (let i = DASHBOARD_CAPS.onDashboard; i < DASHBOARD_CAPS.saved; i++) {
			const a = addWidget(full, { name: `w${i}`, spec });
			if (!a.ok) throw new Error(a.error);
			full = a.doc;
		}
		const refused = copyWidgetTo(source, 'a', CATALOG, full);
		expect(refused.ok).toBe(false);
		expect(copyWidgetTo(source, 'nope', CATALOG, emptyDoc()).ok).toBe(false);
	});

	test('a widget only in the library lands in the target library', () => {
		const lib = addWidget(source, { name: 'Lib', spec });
		if (!lib.ok) throw new Error(lib.error);
		const r = copyWidgetTo(lib.doc, lib.id!, CATALOG, emptyDoc());
		expect(r.ok && r.placed).toBe('library');
	});
});

describe('one-time reports_main -> reports_dashboard (CONTRACT 9)', () => {
	const main = { widgets: { w1: { name: 'Mine', spec } }, layout: [], seenDefaults: ['a', 'b'] };
	const cat = catalogForGroup(CATALOG, 'dashboard');

	test('reports_dashboard absent, reports_main there: copied and saved; main kept', async () => {
		jest.useFakeTimers();
		const t = memTransport({ reports_main: main });
		const e = await readyDoc(t, 'dashboard', cat);
		expect(e.doc!.widgets.w1.name).toBe('Mine');
		jest.advanceTimersByTime(SAVE_DEBOUNCE_MS + 10);
		await flush();
		expect(t.docs.get('reports_dashboard').widgets.w1.name).toBe('Mine');
		expect(t.docs.get('reports_main')).toEqual(main);
		jest.useRealTimers();
	});

	test('an existing reports_dashboard is never overwritten', async () => {
		const mine = {
			widgets: { z: { name: 'Kept', spec } },
			layout: [],
			seenDefaults: ['a', 'b'],
		};
		const t = memTransport({ reports_main: main, reports_dashboard: mine });
		const e = await readyDoc(t, 'dashboard', cat);
		expect(Object.keys(e.doc!.widgets)).toEqual(['z']);
	});

	test('no reports_main: a normal first visit (seeded); other groups never look at main', async () => {
		const t = memTransport({});
		const e = await readyDoc(t, 'dashboard', cat);
		expect(Object.keys(e.doc!.widgets)).toEqual(['a', 'b']);
		const t2 = memTransport({ reports_main: main });
		const s = await readyDoc(t2, 'sales', catalogForGroup(CATALOG, 'sales'));
		expect(Object.keys(s.doc!.widgets)).toEqual(['s1']);
	});

	test('reports_main cannot be read: the load fails (retry), nothing is seeded over it', async () => {
		const t = memTransport({ reports_main: main });
		t.failLoad.add('reports_main');
		await expect(readyDoc(t, 'dashboard', cat)).rejects.toThrow('read failed');
		expect(t.saves).toEqual([]);
	});
});

describe('shared store list and group changes', () => {
	const path = groupsStorePath('CxZump');
	const read = () => getDataFromPath(path, []);

	test('loaded, then every create / rename / delete updates Store.reports.<ns>.groups', async () => {
		const t = memTransport({
			reports_groups: { groups: [{ id: 'u_old', label: 'Personal', order: 1 }] },
		});
		const e = groupsEntryFor(t, 'CxZump');
		await flush();
		expect(path).toBe('Store.reports.CxZump.groups');
		expect(read()).toEqual([{ id: 'u_old', label: 'Personal', kind: 'user', order: 1 }]);
		setAppGroups(e, CATALOG);
		expect(read().map((g: any) => g.id)).toEqual(['dashboard', 'sales', 'u_old']);

		const made = await createGroup(e, 'zz test');
		if (!made.ok) throw new Error(made.error);
		expect(read().map((g: any) => g.label)).toEqual([
			'Dashboard',
			'Sales',
			'Personal',
			'zz test',
		]);
		expect(t.docs.get('reports_groups').groups.length).toBe(2);

		expect((await createGroup(e, 'ZZ TEST')).ok).toBe(false);
		expect((await createGroup(e, 'Dashboard')).ok).toBe(false);

		const renamed = await renameGroup(e, made.id!, 'zz renamed');
		expect(renamed.ok).toBe(true);
		expect(read().find((g: any) => g.id === made.id).label).toBe('zz renamed');

		// The group's document goes with it.
		const w = await readyDoc(t, made.id!, catalogForGroup(CATALOG, made.id));
		expect(w.doc).toEqual(emptyDoc());
		t.docs.set(`reports_${made.id}`, emptyDoc());
		const gone = await deleteGroup(e, made.id!);
		expect(gone.ok).toBe(true);
		expect(read().map((g: any) => g.id)).toEqual(['dashboard', 'sales', 'u_old']);
		expect(t.docs.has(`reports_${made.id}`)).toBe(false);
		expect(t.deletes).toEqual([`reports_${made.id}`]);
	});

	test('a failed save rolls the change back (list and store)', async () => {
		const t = memTransport({});
		const e = groupsEntryFor(t, 'CxZump');
		await flush();
		t.failSave = true;
		const r = await createGroup(e, 'Personal');
		expect(r.ok).toBe(false);
		expect(e.user.groups).toEqual([]);
		expect(read()).toEqual([]);
	});

	test('a deleted group is never saved again, even with a change pending', async () => {
		jest.useFakeTimers();
		const t = memTransport({});
		const e = entryFor(t, 'u_gone');
		await flush();
		const ready = await readyDoc(t, 'u_gone', catalogForGroup(CATALOG, 'u_gone'));
		expect(ready).toBe(e);
		await dropDoc(t, 'u_gone');
		jest.advanceTimersByTime(SAVE_DEBOUNCE_MS + 10);
		await flush();
		expect(t.saves).not.toContain('reports_u_gone');
		// A deleteDoc of a document never stored (a 500) is fine.
		expect(t.deletes).toEqual(['reports_u_gone']);
		jest.useRealTimers();
	});
});
