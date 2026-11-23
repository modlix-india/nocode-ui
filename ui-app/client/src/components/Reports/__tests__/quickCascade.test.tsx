/**
 * ADZ-2164: the dashboard's quick filter choices cascade. Ad account choices follow the picked
 * platform, product choices follow platform and ad account, and a pick that no longer fits is
 * dropped. A catalog without `quickFilterDepends` lists every value, as before.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	pruneQuick,
	quickDependents,
	quickDepends,
	quickOptionsKey,
	quickValuesSpec,
} from '../quickCascade';
import { ReportCatalog } from '../reportTypes';
import { MultiPick, PickOption } from '../ui/common';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const catalog: ReportCatalog = {
	quickFilters: ['adAccountId', 'platform', 'productId'],
	quickFilterDepends: {
		adAccountId: ['platform'],
		productId: ['platform', 'adAccountId'],
	},
	sources: {
		performance: {
			kind: 'STORAGE',
			label: 'Ad performance',
			fields: {
				adAccountId: { kind: 'DIMENSION', label: 'Ad account' },
				platform: { kind: 'DIMENSION', label: 'Platform' },
				productId: { kind: 'DIMENSION', label: 'Product' },
			},
		},
	},
};

// Facts: account m1 and m2 are Meta, g1 is Google. Products p1 (m1, m2), p2 (g1), p3 (m2, g1).
const rows = [
	{ adAccountId: 'm1', platform: 'META', productId: 'p1' },
	{ adAccountId: 'm2', platform: 'META', productId: 'p1' },
	{ adAccountId: 'm2', platform: 'META', productId: 'p3' },
	{ adAccountId: 'g1', platform: 'GOOGLE', productId: 'p2' },
	{ adAccountId: 'g1', platform: 'GOOGLE', productId: 'p3' },
];
/** What the runner does for a values spec: the distinct values of the group by under the filters. */
async function load(field: string, quick: Record<string, any[]>): Promise<PickOption[]> {
	const vs = quickValuesSpec(catalog, field, quick)!;
	const live = rows.filter(r =>
		(vs.filters ?? []).every(f =>
			(f.values ?? []).map(String).includes(String((r as any)[f.field])),
		),
	);
	return [...new Set(live.map(r => (r as any)[field]))].map(v => ({ value: v, label: `L ${v}` }));
}

describe('which filters depend on which', () => {
	test('dependencies in catalog order, only real quick filters, never itself', () => {
		expect(quickDepends(catalog, 'productId')).toEqual(['adAccountId', 'platform']);
		expect(quickDepends(catalog, 'adAccountId')).toEqual(['platform']);
		expect(quickDepends(catalog, 'platform')).toEqual([]);
	});
	test('no quickFilterDepends: nothing depends on anything', () => {
		const plain = { ...catalog, quickFilterDepends: undefined };
		expect(quickDepends(plain, 'adAccountId')).toEqual([]);
		expect(quickDependents(plain, 'platform')).toEqual([]);
		expect(
			quickValuesSpec(plain, 'adAccountId', { platform: ['GOOGLE'] })!.filters,
		).toBeUndefined();
	});
	test('dependents of a filter', () => {
		expect(quickDependents(catalog, 'platform')).toEqual(['adAccountId', 'productId']);
		expect(quickDependents(catalog, 'adAccountId')).toEqual(['productId']);
		expect(quickDependents(catalog, 'productId')).toEqual([]);
	});
});

describe('the choices spec', () => {
	test('no pick in a filter it depends on: all values', () => {
		expect(quickValuesSpec(catalog, 'adAccountId', {})!.filters).toBeUndefined();
		expect(quickValuesSpec(catalog, 'adAccountId', { platform: [] })!.filters).toBeUndefined();
	});
	test('Google Ads picked: ad account choices are filtered to it', () => {
		const vs = quickValuesSpec(catalog, 'adAccountId', { platform: ['GOOGLE'] })!;
		expect(vs.filters).toEqual([{ field: 'platform', op: 'IN', values: ['GOOGLE'] }]);
		expect(vs.groupBy).toEqual([{ field: 'adAccountId', as: 'k' }]);
	});
	test('product choices follow platform and ad account; a pick in the filter itself is not applied', () => {
		const vs = quickValuesSpec(catalog, 'productId', {
			platform: ['META'],
			adAccountId: ['m2'],
			productId: ['p1'],
		})!;
		expect(vs.filters).toEqual([
			{ field: 'adAccountId', op: 'IN', values: ['m2'] },
			{ field: 'platform', op: 'IN', values: ['META'] },
		]);
	});
	test('a dependency the values source does not have is left out', () => {
		const lean: ReportCatalog = {
			...catalog,
			sources: {
				performance: {
					kind: 'STORAGE',
					fields: { adAccountId: { kind: 'DIMENSION' } },
				},
			},
		};
		expect(
			quickValuesSpec(lean, 'adAccountId', { platform: ['META'] })!.filters,
		).toBeUndefined();
	});
	test('the options key changes only when a dependency pick changes', () => {
		const a = quickOptionsKey(catalog, 'adAccountId', { platform: ['META'] });
		expect(
			quickOptionsKey(catalog, 'adAccountId', { platform: ['META'], productId: ['p1'] }),
		).toBe(a);
		expect(quickOptionsKey(catalog, 'adAccountId', { platform: ['GOOGLE'] })).not.toBe(a);
		expect(quickOptionsKey(catalog, 'adAccountId', { platform: [] })).toBe(
			quickOptionsKey(catalog, 'adAccountId', {}),
		);
		expect(quickOptionsKey(catalog, 'platform', { adAccountId: ['m1'] })).toBe('[]');
	});
});

describe('the loaded choices', () => {
	test('Meta lists only Meta accounts, Google Ads only Google accounts, none lists all', async () => {
		const ids = async (q: any) => (await load('adAccountId', q)).map(o => o.value);
		expect(await ids({ platform: ['META'] })).toEqual(['m1', 'm2']);
		expect(await ids({ platform: ['GOOGLE'] })).toEqual(['g1']);
		expect(await ids({})).toEqual(['m1', 'm2', 'g1']);
	});
});

describe('dropping picks that no longer fit', () => {
	test('platform switched to Google Ads: a picked Meta account is cleared, with its product', async () => {
		const r = await pruneQuick(
			catalog,
			{ platform: ['GOOGLE'], adAccountId: ['m1'], productId: ['p1'] },
			'platform',
			load,
		);
		expect(r.quick).toEqual({ platform: ['GOOGLE'], adAccountId: [], productId: [] });
		expect(r.dropped).toEqual({ adAccountId: ['m1'], productId: ['p1'] });
	});
	test('only the picks that do not fit go; the rest stay', async () => {
		const r = await pruneQuick(
			catalog,
			{ platform: ['META'], adAccountId: ['m1', 'g1'], productId: ['p1'] },
			'platform',
			load,
		);
		expect(r.quick.adAccountId).toEqual(['m1']);
		expect(r.quick.productId).toEqual(['p1']);
		expect(r.dropped).toEqual({ adAccountId: ['g1'] });
	});
	test('a pick that fits changes nothing', async () => {
		const q = { platform: ['META'], adAccountId: ['m2'], productId: ['p3'] };
		const r = await pruneQuick(catalog, q, 'platform', load);
		expect(r.quick).toEqual(q);
		expect(r.dropped).toEqual({});
	});
	test('a product the account has no rows for is dropped when the account changes', async () => {
		const r = await pruneQuick(
			catalog,
			{ adAccountId: ['m1'], productId: ['p3'] },
			'adAccountId',
			load,
		);
		expect(r.quick.productId).toEqual([]);
	});
	test('values compare as text (ids may be numbers or strings)', async () => {
		const numeric = async () => [{ value: 7, label: 'seven' }];
		const r = await pruneQuick(
			catalog,
			{ platform: ['META'], adAccountId: ['7'] },
			'platform',
			numeric,
		);
		expect(r.quick.adAccountId).toEqual(['7']);
	});
	test('a failed load keeps that field and never throws', async () => {
		const r = await pruneQuick(
			catalog,
			{ platform: ['META'], adAccountId: ['g1'] },
			'platform',
			async () => {
				throw new Error('boom');
			},
		);
		expect(r.quick.adAccountId).toEqual(['g1']);
	});
	test('a field with nothing picked is not loaded', async () => {
		const calls: string[] = [];
		await pruneQuick(catalog, { platform: ['META'] }, 'platform', async f => {
			calls.push(f);
			return [];
		});
		expect(calls).toEqual([]);
	});
	test('no quickFilterDepends: nothing is dropped', async () => {
		const plain = { ...catalog, quickFilterDepends: undefined };
		const q = { platform: ['GOOGLE'], adAccountId: ['m1'] };
		expect((await pruneQuick(plain, q, 'platform', load)).quick).toEqual(q);
	});
});

describe('MultiPick reloads its choices when the options key changes', () => {
	let root: Root;
	let host: HTMLDivElement;
	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
	});
	afterEach(() => {
		act(() => root.unmount());
		host.remove();
	});
	const flush = async () => {
		for (let i = 0; i < 5; i++) await act(async () => Promise.resolve());
	};
	const labels = () => [...document.querySelectorAll('._rpCheck')].map(e => e.textContent);

	test('open: loads; key change: closed list is stale, the next open loads the new choices', async () => {
		let platform = 'META';
		const loadOptions = jest.fn(async () =>
			(await load('adAccountId', { platform: [platform] })).map(o => o),
		);
		const render = (key: string, lo: () => Promise<PickOption[]>) =>
			act(() =>
				root.render(
					<MultiPick
						label="Ad account"
						values={['m1']}
						onChange={() => {}}
						loadOptions={lo}
						optionsKey={key}
					/>,
				),
			);
		render('META', loadOptions);
		const btn = () => host.querySelector('button.\\_rpBtn') as HTMLButtonElement;
		await act(async () => btn().click());
		await flush();
		expect(labels()).toEqual(['L m1', 'L m2']);
		await act(async () => btn().click());
		// The picked account keeps its name while the choices reload.
		platform = 'GOOGLE';
		const lo2 = jest.fn(async () => load('adAccountId', { platform: ['GOOGLE'] }));
		render('GOOGLE', lo2);
		expect(btn().textContent).toContain('L m1');
		await act(async () => btn().click());
		await flush();
		expect(lo2).toHaveBeenCalledTimes(1);
		expect(labels()).toEqual(['L g1']);
	});
});
