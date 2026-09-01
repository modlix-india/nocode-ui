import {
	applyDraftPatch,
	collectDescriptors,
	draftPayload,
	matchDescriptor,
	pageOverlay,
	snapshotBaseline,
} from '../openDrafts';
import { PageDefinition } from '../../../types/common';

/**
 * The two halves of the open-draft protocol have to agree, and the failure when
 * they do not is silent: an overlay that misses an edit shows the agent stale
 * work, and a patch that misses a component drops a change the user was told
 * had been made.
 */

const page = (comps: Record<string, any>, extra: Record<string, any> = {}) =>
	({
		id: 'p1',
		name: 'contact',
		appCode: 'orangeab',
		version: 3,
		rootComponent: 'root',
		componentDefinition: comps,
		...extra,
	}) as unknown as PageDefinition;

describe('pageOverlay', () => {
	it('reports nothing for an untouched page', () => {
		const base = page({ root: { key: 'root', type: 'Grid' } });
		const overlay = pageOverlay(base, snapshotBaseline(base));
		expect(overlay.changed).toEqual({});
		expect(overlay.removed).toEqual([]);
		expect(overlay.fields).toEqual({});
	});

	it('names only the components the user actually changed', () => {
		const base = page({
			root: { key: 'root', type: 'Grid' },
			a: { key: 'a', type: 'Text' },
			b: { key: 'b', type: 'Button' },
		});
		const baseline = snapshotBaseline(base);
		const current = page({
			root: { key: 'root', type: 'Grid' },
			a: { key: 'a', type: 'Text', edited: true },
			c: { key: 'c', type: 'Image' },
		});

		const overlay = pageOverlay(current, baseline);
		expect(Object.keys(overlay.changed).sort()).toEqual(['a', 'c']);
		expect(overlay.removed).toEqual(['b']);
	});

	it('ignores the timestamps, which would make every page look edited', () => {
		const base = page({ root: { key: 'root', type: 'Grid' } }, { updatedAt: '1' });
		const baseline = snapshotBaseline(base);
		const current = page({ root: { key: 'root', type: 'Grid' } }, { updatedAt: '2' });
		expect(pageOverlay(current, baseline).fields).toEqual({});
	});

	it('carries a page-level change such as the permission', () => {
		const base = page({});
		const baseline = snapshotBaseline(base);
		const current = page({}, { permission: 'Authorities.Logged_IN' });
		expect(pageOverlay(current, baseline).fields).toEqual({
			permission: 'Authorities.Logged_IN',
		});
	});
});

describe('collectDescriptors', () => {
	it('takes an explicit array, the form the page editor declares', () => {
		const out = collectDescriptors(
			[{ kind: 'page', path: 'Page.pageDefinition' }],
			'Page._peSidekick.drafts',
		);
		expect(out).toEqual([{ kind: 'page', path: 'Page.pageDefinition' }]);
	});

	it('derives entries from a keyed map, the form the workspace keeps tabs in', () => {
		const out = collectDescriptors(
			{
				t1: { api: '/api/core/storages', draft: { id: 's1' }, loaded: { id: 's1' } },
				t2: { api: '/api/ui/themes', draft: { id: 'th1' } },
			},
			'Page.tabs',
		);
		expect(out).toEqual([
			{
				path: 'Page.tabs.t1.draft',
				api: '/api/core/storages',
				kind: undefined,
				baselinePath: 'Page.tabs.t1.loaded',
			},
			{ path: 'Page.tabs.t2.draft', api: '/api/ui/themes', kind: undefined },
		]);
	});

	it('skips a tab that has not loaded a document yet', () => {
		expect(collectDescriptors({ t1: { api: '/api/core/storages' } }, 'Page.tabs')).toEqual([]);
	});

	it('skips a record that names neither a kind nor an api', () => {
		expect(collectDescriptors({ t1: { draft: { id: 'x' } } }, 'Page.tabs')).toEqual([]);
	});

	it('returns nothing for an undeclared surface, so nothing is ever held', () => {
		expect(collectDescriptors(undefined, 'Page.tabs')).toEqual([]);
		expect(collectDescriptors('', 'Page.tabs')).toEqual([]);
	});
});

describe('draftPayload', () => {
	it('sends a page as an overlay and marks a clean one not dirty', () => {
		const doc = page({ root: { key: 'root', type: 'Grid' } });
		const payload = draftPayload(
			{ kind: 'page', path: 'Page.pageDefinition' },
			doc,
			snapshotBaseline(doc),
		);
		expect(payload?.doc).toBeUndefined();
		expect(payload?.overlay).toBeDefined();
		expect(payload?.dirty).toBe(false);
	});

	it('sends a dirty non-page document whole', () => {
		const doc = { id: 's1', name: 'Lead', appCode: 'orangeab', isAudited: true };
		const payload = draftPayload(
			{ kind: 'storage', path: 'Page.tabs.a.draft' },
			doc,
			{ id: 's1', name: 'Lead', appCode: 'orangeab' },
		);
		expect(payload?.doc).toBe(doc);
		expect(payload?.dirty).toBe(true);
		expect(payload?.overlay).toBeUndefined();
	});

	it('declares a clean non-page document without shipping it', () => {
		// Declaring is what makes the agent's writes wait for Save. Uploading a
		// byte-identical copy of something the server can read is pure cost.
		const doc = { id: 's1', name: 'Lead', appCode: 'orangeab' };
		const payload = draftPayload({ api: '/api/core/storages', path: 'p' }, doc, doc);
		expect(payload?.dirty).toBe(false);
		expect(payload?.doc).toBeUndefined();
		expect(payload?.api).toBe('/api/core/storages');
	});

	it('chooses the overlay by document shape, not by kind name', () => {
		// A component tree is the thing that reaches 1.4MB, so anything carrying
		// one gets an overlay whether or not it is called a page.
		const doc = { id: 'x1', name: 'x', componentDefinition: { root: { key: 'root' } } };
		const payload = draftPayload({ api: '/api/ui/pages', path: 'p' }, doc, doc);
		expect(payload?.overlay).toBeDefined();
		expect(payload?.doc).toBeUndefined();
	});

	it('skips an object with no id, which is not saved yet', () => {
		expect(draftPayload({ kind: 'page', path: 'x' }, { name: 'draft' }, undefined))
			.toBeUndefined();
	});
});

describe('applyDraftPatch', () => {
	it('adds a component the agent created', () => {
		const current = page({ root: { key: 'root', type: 'Grid' } });
		const next = applyDraftPatch(current, {
			changed: { btn: { key: 'btn', type: 'Button' } },
			removed: [],
			fields: {},
		});
		expect(next.componentDefinition.btn.type).toBe('Button');
		expect(next.componentDefinition.root).toBeDefined();
	});

	it('replaces a component the agent edited', () => {
		const current = page({ btn: { key: 'btn', type: 'Button', label: 'Old' } });
		const next = applyDraftPatch(current, {
			changed: { btn: { key: 'btn', type: 'Button', label: 'New' } },
		});
		expect(next.componentDefinition.btn.label).toBe('New');
	});

	it('removes a component the agent deleted', () => {
		const current = page({ root: { key: 'root' }, gone: { key: 'gone' } });
		const next = applyDraftPatch(current, { removed: ['gone'] });
		expect(next.componentDefinition.gone).toBeUndefined();
		expect(next.componentDefinition.root).toBeDefined();
	});

	it('applies page-level fields', () => {
		const next = applyDraftPatch(page({}), { fields: { permission: 'Authorities.Logged_IN' } });
		expect((next as any).permission).toBe('Authorities.Logged_IN');
	});

	it('returns the same object for an empty patch, so no pointless undo step', () => {
		const current = page({ root: { key: 'root' } });
		expect(applyDraftPatch(current, { changed: {}, removed: [], fields: {} })).toBe(current);
		expect(applyDraftPatch(current, undefined)).toBe(current);
	});

	it('takes a whole document for the kinds that send one', () => {
		const doc = { id: 's1', name: 'Lead', isAudited: true };
		expect(applyDraftPatch({ id: 's1' }, { doc })).toBe(doc);
	});

	it('survives a round trip: overlay out, patch back, same page', () => {
		const saved = page({ root: { key: 'root', type: 'Grid' } });
		const baseline = snapshotBaseline(saved);

		// The user adds one component by hand.
		const userEdited = page({
			root: { key: 'root', type: 'Grid' },
			mine: { key: 'mine', type: 'Text' },
		});
		const overlay = pageOverlay(userEdited, baseline);
		expect(Object.keys(overlay.changed)).toEqual(['mine']);

		// The agent adds another, and only that one comes back.
		const afterAgent = applyDraftPatch(userEdited, {
			changed: { theirs: { key: 'theirs', type: 'Button' } },
		});
		expect(Object.keys(afterAgent.componentDefinition).sort()).toEqual([
			'mine',
			'root',
			'theirs',
		]);
	});
});

describe('matchDescriptor', () => {
	// The bug this pins: the workspace declares its tabs from a keyed store, so
	// each descriptor carries `api` and no `kind`. Matching on kind meant every
	// workspace patch was discarded while the server held the change correctly,
	// and the pane just never updated. Found by driving the real UI, not by a
	// test, because the matcher was buried inside the component.
	const workspaceTabs = collectDescriptors(
		{
			t1: { api: '/api/core/storages', draft: { id: 's1' }, loaded: { id: 's1' } },
			t2: { api: '/api/ui/themes', draft: { id: 'th1' } },
		},
		'Page.tabs',
	);
	const docs: Record<string, any> = {
		'Page.tabs.t1.draft': { id: 's1' },
		'Page.tabs.t2.draft': { id: 'th1' },
	};
	const read = (p: string) => docs[p];

	it('finds a kindless workspace tab by the document id', () => {
		const hit = matchDescriptor(workspaceTabs, { kind: 'storage', id: 's1' }, read);
		expect(hit?.path).toBe('Page.tabs.t1.draft');
	});

	it('picks the right tab when several are open', () => {
		const hit = matchDescriptor(workspaceTabs, { kind: 'theme', id: 'th1' }, read);
		expect(hit?.path).toBe('Page.tabs.t2.draft');
	});

	it('does not guess when no open document has that id', () => {
		expect(matchDescriptor(workspaceTabs, { kind: 'storage', id: 'nope' }, read))
			.toBeUndefined();
	});

	it('falls back to kind when the patch carries no id', () => {
		const explicit = [{ kind: 'page', path: 'Page.pageDefinition' }];
		const hit = matchDescriptor(explicit, { kind: 'page' }, () => ({ id: 'p1' }));
		expect(hit?.path).toBe('Page.pageDefinition');
	});
});
