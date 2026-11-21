import {
	addDefault,
	addToDashboard,
	addWidget,
	CAP_MESSAGES,
	defaultsNotInLibrary,
	deleteWidget,
	duplicateWidget,
	editWidget,
	keepNew,
	normalizeDoc,
	reconcile,
	removeFromDashboard,
	resetDoc,
	resolveWidget,
	seedDoc,
} from '../dashboardModel';
import {
	CatalogDefault,
	DASHBOARD_CAPS,
	DashboardDoc,
	ReportCatalog,
	ReportSpec,
} from '../reportTypes';

const spec = (type: any = 'KPI', extra: Partial<ReportSpec> = {}): ReportSpec => ({
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	view: { type },
	...extra,
});

const def = (id: string, w = 3, h = 2, s = spec()): CatalogDefault => ({
	id,
	name: `Name ${id}`,
	spec: s,
	layout: { w, h },
});

const catalog = (...defaults: CatalogDefault[]): ReportCatalog => ({ sources: {}, defaults });

describe('first visit', () => {
	test('no document: every default placed, all ids seen', () => {
		const cat = catalog(def('a'), def('b', 6, 4), def('c'));
		const r = reconcile({}, cat);
		expect(r.firstVisit).toBe(true);
		expect(r.changed).toBe(true);
		expect(Object.keys(r.doc.widgets)).toEqual(['a', 'b', 'c']);
		expect(r.doc.layout.map(l => l.id)).toEqual(['a', 'b', 'c']);
		expect(r.doc.seenDefaults).toEqual(['a', 'b', 'c']);
		expect(r.doc.widgets.a).toMatchObject({ defaultId: 'a', name: 'Name a', refreshMin: 0 });
		expect(r.doc.widgets.a.edited).toBeUndefined();
		expect(r.doc.layout.find(l => l.id === 'b')).toMatchObject({ w: 6, h: 4 });
		expect(r.doc.layout.some(l => l.isNew)).toBe(false);
	});

	test('a null or junk document is a first visit too', () => {
		expect(reconcile(null, catalog(def('a'))).firstVisit).toBe(true);
		expect(reconcile([], catalog(def('a'))).firstVisit).toBe(true);
	});

	test('the dashboard cap applies to the seed', () => {
		const many = Array.from({ length: 30 }, (_, i) => def('d' + i));
		const d = seedDoc(catalog(...many));
		expect(d.layout.length).toBe(DASHBOARD_CAPS.onDashboard);
		expect(Object.keys(d.widgets).length).toBe(30);
		expect(d.seenDefaults.length).toBe(30);
	});
});

describe('defaults shipped later', () => {
	const first = reconcile({}, catalog(def('a'), def('b'))).doc;

	test('an unseen default is added at the top as New and marked seen at once', () => {
		const r = reconcile(first, catalog(def('a'), def('b'), def('c', 4, 3)));
		expect(r.changed).toBe(true);
		expect(r.firstVisit).toBe(false);
		const c = r.doc.layout.find(l => l.id === 'c')!;
		expect(c).toMatchObject({ x: 0, y: 0, isNew: true });
		// Existing tiles moved down below it.
		for (const l of r.doc.layout.filter(l => l.id !== 'c'))
			expect(l.y).toBeGreaterThanOrEqual(3);
		expect(r.doc.seenDefaults).toContain('c');
	});

	test('Keep clears the badge; nothing is added again', () => {
		const added = reconcile(first, catalog(def('a'), def('b'), def('c'))).doc;
		const kept = keepNew(added, 'c');
		expect(kept.layout.find(l => l.id === 'c')!.isNew).toBeUndefined();
		const again = reconcile(kept, catalog(def('a'), def('b'), def('c')));
		expect(again.changed).toBe(false);
	});

	test('Remove drops it from the dashboard, it stays in the library and never returns by itself', () => {
		const added = reconcile(first, catalog(def('a'), def('b'), def('c'))).doc;
		const removed = removeFromDashboard(added, 'c');
		expect(removed.layout.some(l => l.id === 'c')).toBe(false);
		expect(removed.widgets.c).toBeDefined();
		const next = reconcile(removed, catalog(def('a'), def('b'), def('c')));
		expect(next.doc.layout.some(l => l.id === 'c')).toBe(false);
		expect(next.changed).toBe(false);
	});

	test('a deleted default never returns by itself and is offered in the library', () => {
		const deleted = deleteWidget(first, 'a');
		const next = reconcile(deleted, catalog(def('a'), def('b')));
		expect(next.doc.widgets.a).toBeUndefined();
		expect(defaultsNotInLibrary(next.doc, catalog(def('a'), def('b'))).map(d => d.id)).toEqual([
			'a',
		]);
		const back = addDefault(next.doc, def('a'), true);
		expect(back.ok && back.doc.widgets.a.defaultId).toBe('a');
	});
});

describe('by reference until edited', () => {
	const v1 = catalog(def('a', 3, 2, spec('KPI')));
	const v2 = catalog({
		...def('a', 3, 2, spec('BAR', { groupBy: [{ field: 'p', as: 'p' }] })),
		name: 'Renamed',
	});
	const doc = reconcile({}, v1).doc;

	test('an unedited default follows the catalog spec and name', () => {
		const r = resolveWidget(doc, 'a', v2)!;
		expect(r.byReference).toBe(true);
		expect(r.spec.view.type).toBe('BAR');
		expect(r.name).toBe('Renamed');
	});

	test('editing copies the spec and sets edited; then the catalog no longer changes it', () => {
		const changed = spec('PIE', { groupBy: [{ field: 'p', as: 'p' }] });
		const e = editWidget(doc, 'a', { spec: changed }, v1);
		expect(e.ok).toBe(true);
		if (!e.ok) return;
		expect(e.doc.widgets.a.edited).toBe(true);
		expect(e.doc.widgets.a.spec.view.type).toBe('PIE');
		expect(e.doc.widgets.a.spec).not.toBe(changed);
		const r = resolveWidget(e.doc, 'a', v2)!;
		expect(r.byReference).toBe(false);
		expect(r.spec.view.type).toBe('PIE');
		expect(r.name).toBe('Name a');
	});

	test('the refresh interval keeps the reference', () => {
		const e = editWidget(doc, 'a', { refreshMin: 15 }, v1);
		expect(e.ok && e.doc.widgets.a.edited).toBeFalsy();
		expect(e.ok && e.doc.widgets.a.refreshMin).toBe(15);
	});

	test('a default gone from the catalog disappears where unedited, stays where edited', () => {
		const two = reconcile({}, catalog(def('a'), def('b'))).doc;
		const edited = editWidget(two, 'b', { name: 'Mine' }, catalog(def('a'), def('b')));
		expect(edited.ok).toBe(true);
		if (!edited.ok) return;
		const r = reconcile(edited.doc, catalog());
		expect(r.changed).toBe(true);
		expect(r.doc.widgets.a).toBeUndefined();
		expect(r.doc.layout.some(l => l.id === 'a')).toBe(false);
		expect(r.doc.widgets.b.name).toBe('Mine');
		expect(resolveWidget(r.doc, 'b', catalog())!.name).toBe('Mine');
	});

	test('resolve hides an unedited default the catalog lost', () => {
		expect(resolveWidget(doc, 'a', catalog())).toBeUndefined();
	});
});

describe('library actions and caps', () => {
	const base: DashboardDoc = { widgets: {}, layout: [], seenDefaults: [] };

	test('add, remove, add back, delete', () => {
		const a = addWidget(base, { name: 'X', spec: spec() }, { toDashboard: true });
		expect(a.ok).toBe(true);
		if (!a.ok) return;
		const id = a.id!;
		const off = removeFromDashboard(a.doc, id);
		expect(off.widgets[id]).toBeDefined();
		expect(off.layout.length).toBe(0);
		const on = addToDashboard(off, id);
		expect(on.ok && on.doc.layout.length).toBe(1);
		const gone = deleteWidget(on.ok ? on.doc : off, id);
		expect(gone.widgets[id]).toBeUndefined();
		expect(gone.layout.length).toBe(0);
	});

	test('duplicate makes the user own copy of a default', () => {
		const d = reconcile({}, catalog(def('a'))).doc;
		const r = duplicateWidget(d, 'a', catalog(def('a')));
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		const copy = r.doc.widgets[r.id!];
		expect(copy.defaultId).toBeUndefined();
		expect(copy.name).toBe('Name a (copy)');
		expect(r.doc.layout.length).toBe(2);
	});

	test('24 on the dashboard, 100 saved', () => {
		let d = base;
		for (let i = 0; i < DASHBOARD_CAPS.onDashboard; i++) {
			const r = addWidget(d, { name: 'w' + i, spec: spec() }, { toDashboard: true });
			if (r.ok) d = r.doc;
		}
		const over = addWidget(d, { name: 'x', spec: spec() }, { toDashboard: true });
		expect(over).toEqual({ ok: false, error: CAP_MESSAGES.dashboard });
		for (let i = 0; Object.keys(d.widgets).length < DASHBOARD_CAPS.saved; i++) {
			const r = addWidget(d, { name: 'l' + i, spec: spec() });
			if (r.ok) d = r.doc;
		}
		expect(addWidget(d, { name: 'y', spec: spec() })).toEqual({
			ok: false,
			error: CAP_MESSAGES.saved,
		});
	});

	test('reset brings back the current defaults by reference and keeps own widgets off the dashboard', () => {
		const cat = catalog(def('a'), def('b'));
		let d = reconcile({}, cat).doc;
		const e = editWidget(d, 'a', { name: 'Edited a' }, cat);
		if (e.ok) d = e.doc;
		const own = addWidget(d, { name: 'Own', spec: spec() }, { toDashboard: true });
		if (own.ok) d = own.doc;
		d = removeFromDashboard(d, 'b');
		const r = resetDoc(d, cat);
		expect(r.layout.map(l => l.id).sort()).toEqual(['a', 'b']);
		expect(r.widgets.a.edited).toBeUndefined();
		const names = Object.values(r.widgets).map(w => w.name);
		expect(names).toContain('Edited a');
		expect(names).toContain('Own');
	});

	test('normalize drops junk and keeps seenDefaults', () => {
		const n = normalizeDoc({
			widgets: { a: { name: 'A', spec: spec() }, bad: 7, d: { defaultId: 'd' } },
			layout: [
				{ id: 'a', x: 20, y: -1, w: 99, h: 1 },
				{ id: 'missing', x: 0, y: 0, w: 2, h: 2 },
				{ id: 'a', x: 0, y: 0, w: 2, h: 2 },
			],
			seenDefaults: ['d', 'd', 3],
		})!;
		expect(Object.keys(n.widgets)).toEqual(['a', 'd']);
		expect(n.layout).toEqual([{ id: 'a', x: 0, y: 0, w: 12, h: 1 }]);
		expect(n.seenDefaults).toEqual(['d']);
	});
});
