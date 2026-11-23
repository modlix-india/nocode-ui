/**
 * "Saved" only once the server has it: the dashboard document used to be saved 2 s after the last
 * change and a failed save was swallowed, so the page said "Saved ... to Dashboard" while the
 * widget never reached the server (a reload or a lost connection in that window dropped it).
 */
import { addWidget } from '../dashboardModel';
import {
	persistEntry,
	readyDoc,
	resetStore,
	SAVE_DEBOUNCE_MS,
	updateEntry,
} from '../dashboardStore';
import { catalogForGroup } from '../groupsModel';
import { FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportTransport } from '../reportApi';
import { ReportCatalog, ReportSpec } from '../reportTypes';

const spec: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	view: { type: 'KPI' },
};

const CATALOG: ReportCatalog = {
	...FIXTURE_CATALOG,
	groups: { dashboard: { label: 'Dashboard', order: 1 } },
	defaults: [{ id: 'a', name: 'A', spec }],
};

function memTransport(seed: Record<string, any> = {}) {
	const docs = new Map<string, any>(Object.entries(seed));
	const t = {
		docs,
		failSave: false,
		saveCalls: 0,
		async call() {
			return [];
		},
		async loadDoc(name: string) {
			return docs.has(name) ? JSON.parse(JSON.stringify(docs.get(name))) : {};
		},
		async saveDoc(name: string, doc: any) {
			t.saveCalls++;
			if (t.failSave) throw new Error('write failed');
			docs.set(name, JSON.parse(JSON.stringify(doc)));
		},
	};
	return t as typeof t & ReportTransport;
}

const cat = catalogForGroup(CATALOG, 'dashboard');

const add = (e: any, name: string) => {
	let id: string | undefined;
	updateEntry(e, d => {
		const r = addWidget(d, { name, spec }, { toDashboard: true });
		if (!r.ok) return d;
		id = r.id;
		return r.doc;
	});
	return id!;
};

const names = (doc: any) => Object.values<any>(doc.widgets).map(w => w.name);

beforeEach(() => resetStore());

test('persistEntry saves now and says ok once the server has the document', async () => {
	const t = memTransport();
	const e = await readyDoc(t, 'dashboard', cat);
	add(e, 'Mine');
	const r = await persistEntry(e);
	expect(r).toEqual({ ok: true });
	expect(names(t.docs.get('reports_dashboard'))).toContain('Mine');
	expect(e.dirty).toBe(false);
});

test('a refused save is reported, and the change is taken back so Save can be pressed again', async () => {
	const t = memTransport();
	const e = await readyDoc(t, 'dashboard', cat);
	t.saveCalls = 0;
	const undo = { doc: e.doc, wasDirty: e.dirty };
	add(e, 'Lost');
	t.failSave = true;
	const r = await persistEntry(e, undo);
	expect(r.ok).toBe(false);
	expect(r.error).toContain('write failed');
	// Back as it was: no second copy when the user presses Save again.
	expect(names(e.doc)).not.toContain('Lost');
	t.failSave = false;
	add(e, 'Lost');
	expect(await persistEntry(e, undo)).toEqual({ ok: true });
	expect(names(e.doc).filter((n: string) => n === 'Lost')).toHaveLength(1);
	expect(names(t.docs.get('reports_dashboard'))).toContain('Lost');
});

test('a refused save without an undo keeps the change waiting to be saved', async () => {
	const t = memTransport();
	const e = await readyDoc(t, 'dashboard', cat);
	add(e, 'Later');
	t.failSave = true;
	const r = await persistEntry(e);
	expect(r.ok).toBe(false);
	expect(names(e.doc)).toContain('Later');
	expect(e.dirty).toBe(true);
});

test('the 2 second save is not repeated after persistEntry already stored the document', async () => {
	jest.useFakeTimers();
	try {
		const t = memTransport();
		const e = await readyDoc(t, 'dashboard', cat);
		jest.advanceTimersByTime(SAVE_DEBOUNCE_MS + 10);
		await Promise.resolve();
		await Promise.resolve();
		t.saveCalls = 0;
		add(e, 'Once');
		const p = persistEntry(e);
		await Promise.resolve();
		await Promise.resolve();
		await p;
		const after = t.saveCalls;
		jest.advanceTimersByTime(SAVE_DEBOUNCE_MS + 10);
		await Promise.resolve();
		await Promise.resolve();
		expect(t.saveCalls).toBe(after);
	} finally {
		jest.useRealTimers();
	}
});

test('an earlier change still waiting stays waiting when a later save fails with an undo', async () => {
	const t = memTransport();
	const e = await readyDoc(t, 'dashboard', cat);
	add(e, 'First');
	expect(e.dirty).toBe(true);
	const undo = { doc: e.doc, wasDirty: e.dirty };
	add(e, 'Second');
	t.failSave = true;
	await persistEntry(e, undo);
	expect(names(e.doc)).toContain('First');
	expect(names(e.doc)).not.toContain('Second');
	expect(e.dirty).toBe(true);
});
