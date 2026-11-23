/**
 * ADZ-2164: the Ad account and Product dropdowns list every connected asset, not only the values
 * with rows in the fact table. Assets without a row are greyed, tagged "no data yet" and stay
 * selectable; the platform cascade still narrows the connected accounts.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { mergeQuickOptions, quickOptionsFunction } from '../quickCascade';
import { runQuickOptions, ReportTransport } from '../reportApi';
import { ReportCatalog } from '../reportTypes';
import { MultiPick } from '../ui/common';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const FN = 'AdZumpV2.reportQuickOptions';
const catalog = {
	quickFilters: ['adAccountId'],
	quickFilterOptions: { adAccountId: FN },
	sources: {},
} as ReportCatalog;

describe('which filters list connected assets', () => {
	test('the function named in the catalog', () => {
		expect(quickOptionsFunction(catalog, 'adAccountId')).toBe(FN);
		expect(quickOptionsFunction(catalog, 'platform')).toBeUndefined();
		expect(
			quickOptionsFunction({ ...catalog, quickFilterOptions: undefined }, 'adAccountId'),
		).toBeUndefined();
		expect(
			quickOptionsFunction(
				{ ...catalog, quickFilterOptions: { adAccountId: 'nodot' } },
				'adAccountId',
			),
		).toBeUndefined();
	});
});

describe('mergeQuickOptions', () => {
	const rows = [
		{ k: 'a2', k_label: 'Beta', n: 9 },
		{ k: 'a1', k_label: 'Alpha', n: 3 },
	];
	test('connected assets without a row are flagged, with data first in the runner order', () => {
		const out = mergeQuickOptions(rows, [
			{ _id: 'a1', name: 'Alpha' },
			{ _id: 'a2', name: 'Beta' },
			{ _id: 'z9', name: 'Zed' },
			{ _id: 'c3', name: 'Cee' },
		]);
		expect(out).toEqual([
			{ value: 'a2', label: 'Beta' },
			{ value: 'a1', label: 'Alpha' },
			{ value: 'c3', label: 'Cee', noData: true },
			{ value: 'z9', label: 'Zed', noData: true },
		]);
	});
	test('a value with rows that is not connected any more is kept, never flagged', () => {
		const out = mergeQuickOptions(rows, [{ _id: 'a1', name: 'Alpha' }]);
		expect(out.map(o => [o.value, !!o.noData])).toEqual([
			['a2', false],
			['a1', false],
		]);
	});
	test('no connected list: the runner rows as before', () => {
		expect(mergeQuickOptions(rows, [])).toEqual([
			{ value: 'a2', label: 'Beta' },
			{ value: 'a1', label: 'Alpha' },
		]);
	});
	test('nothing connected and nothing with data: empty', () => {
		expect(mergeQuickOptions([], [])).toEqual([]);
	});
	test('ids compare as text, a repeated asset is listed once', () => {
		const out = mergeQuickOptions(
			[{ k: 7, k_label: 'Seven' }],
			[
				{ _id: '7', name: 'Seven' },
				{ _id: '8', name: 'Eight' },
				{ _id: '8', name: 'Eight' },
			],
		);
		expect(out).toEqual([
			{ value: 7, label: 'Seven' },
			{ value: '8', label: 'Eight', noData: true },
		]);
	});
	test('two assets with the same name get their external id', () => {
		const out = mergeQuickOptions(
			[],
			[
				{ _id: 'g1', name: 'Modlix', externalId: '588-975-8158' },
				{ _id: 'g2', name: 'Modlix', externalId: '446-197-2633' },
				{ _id: 'g3', name: 'Other', externalId: '1' },
			],
		);
		expect(out.map(o => o.label)).toEqual([
			'Modlix (446-197-2633)',
			'Modlix (588-975-8158)',
			'Other',
		]);
	});
	test('an asset without a name reads as its id; a row without an _id is ignored', () => {
		const out = mergeQuickOptions([], [{ _id: 'x1' }, { name: 'no id' }]);
		expect(out).toEqual([{ value: 'x1', label: 'x1', noData: true }]);
	});
});

describe('runQuickOptions', () => {
	const transport = (reply: any): ReportTransport & { calls: any[] } => {
		const calls: any[] = [];
		return {
			calls,
			call: async (fn, args) => {
				calls.push([fn, args]);
				return reply;
			},
			loadDoc: async () => ({}),
			saveDoc: async () => {},
		};
	};
	test('one call with field, spec and picks; answers rows and connected', async () => {
		const t = transport([
			{
				name: 'output',
				result: { result: { ok: true, rows: [{ k: 'a' }], connected: [{ _id: 'a' }] } },
			},
		]);
		const spec: any = { v: 1, source: 'performance' };
		const a = await runQuickOptions(t, FN, 'adAccountId', spec, { platform: ['META'] });
		expect(t.calls).toEqual([
			[FN, { field: 'adAccountId', spec, picks: { platform: ['META'] } }],
		]);
		expect(a).toEqual({ rows: [{ k: 'a' }], connected: [{ _id: 'a' }] });
	});
	test('an answer without a connected list gives []', async () => {
		const t = transport([{ name: 'output', result: { result: { ok: true, rows: [] } } }]);
		expect((await runQuickOptions(t, FN, 'f', {} as any, {})).connected).toEqual([]);
	});
	test('ok false and an error event both throw', async () => {
		await expect(
			runQuickOptions(
				transport([
					{
						name: 'output',
						result: { result: { ok: false, error: { code: 'X', message: 'no' } } },
					},
				]),
				FN,
				'f',
				{} as any,
				{},
			),
		).rejects.toThrow('no');
		await expect(
			runQuickOptions(
				transport([{ name: 'error', result: { message: 'refused' } }]),
				FN,
				'f',
				{} as any,
				{},
			),
		).rejects.toThrow('refused');
	});
});

describe('the dropdown shows the no data yet ones greyed and selectable', () => {
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
	test('tag, grey class, checkbox not disabled, and picking it reports its value', async () => {
		const picked: any[][] = [];
		await act(async () =>
			root.render(
				<MultiPick
					label="Ad account"
					values={[]}
					onChange={v => picked.push(v)}
					loadOptions={async () => [
						{ value: 'a', label: 'Has rows' },
						{ value: 'b', label: 'Fresh', noData: true },
					]}
				/>,
			),
		);
		await act(async () => (host.querySelector('button._rpBtn') as HTMLButtonElement).click());
		for (let i = 0; i < 5; i++) await act(async () => Promise.resolve());
		const items = [...document.querySelectorAll('._rpCheck')];
		expect(items.map(e => e.textContent)).toEqual(['Has rows', 'Freshno data yet']);
		expect(items[0].classList.contains('_rpNoData')).toBe(false);
		expect(items[1].classList.contains('_rpNoData')).toBe(true);
		const box = items[1].querySelector('input') as HTMLInputElement;
		expect(box.disabled).toBe(false);
		await act(async () => box.click());
		expect(picked).toEqual([['b']]);
	});
});
