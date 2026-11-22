/**
 * AdZump build follow-ups: a KPI over a period with no rows shows 0 for a count or sum (the
 * runner answers no row, or leaves the null out), "-" for what is truly undefined; the Ask AI
 * placeholder is app neutral, with the catalog's `aiExample` when it has one.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { FIXTURE_CATALOG, fixtureTransport } from '../fixtures/reportFixtures';
import { clearCatalogCache, ReportTransport } from '../reportApi';
import { valueOrZero, zeroWhenEmpty } from '../reportTransform';
import { ReportSpec } from '../reportTypes';
import { askPlaceholder } from '../ui/AskAiBox';
import { ListAsk } from '../ui/ReportCards';
import { ReportEditorView } from '../ui/ReportEditorView';
import { ReportWidgetView } from '../ui/ReportWidgetView';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	clearCatalogCache();
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});
async function settle(ms = 300, n = 8) {
	for (let i = 0; i < n; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

/** A runner answering the given rows and columns for every run. */
const answering = (columns: any[], rows: any[]): ReportTransport => ({
	...fixtureTransport,
	async call(fn, args) {
		if (/reportRun$/.test(fn))
			return [{ name: 'output', result: { result: { ok: true, columns, rows } } }];
		return fixtureTransport.call(fn, args);
	},
});

const kpi = (fn: any, extra: Partial<ReportSpec> = {}): ReportSpec => ({
	v: 1,
	source: 'cases',
	measures: [{ fn, field: fn === 'COUNT' ? undefined : 'agreementValue', as: 'm' }],
	view: { type: 'KPI', y: ['m'] },
	...extra,
});

async function kpiText(spec: ReportSpec, rows: any[], columns?: any[]) {
	const cols = columns ?? [{ key: 'm', kind: 'MEASURE', format: 'NUMBER', label: 'Value' }];
	act(() =>
		root.render(
			<ReportWidgetView
				transport={answering(cols, rows)}
				runFunction="CxZump.reportRun"
				catalog={FIXTURE_CATALOG}
				spec={spec}
				name="T"
			/>,
		),
	);
	await settle();
	return document.body.querySelector('._rpKpiValue')?.textContent;
}

describe('KPI over a period with no rows', () => {
	it('count and sum show 0 (no row, or the null left out)', async () => {
		expect(await kpiText(kpi('SUM'), [])).toBe('0');
		expect(await kpiText(kpi('COUNT'), [])).toBe('0');
		expect(await kpiText(kpi('SUM'), [{}])).toBe('0');
		expect(await kpiText(kpi('SUM'), [{ m: null }])).toBe('0');
		expect(await kpiText(kpi('SUM'), [{ m: 12 }])).toBe('12');
	});

	it('average, minimum and a ratio of nothing stay "-"', async () => {
		expect(await kpiText(kpi('AVG'), [])).toBe('-');
		expect(await kpiText(kpi('MIN'), [{}])).toBe('-');
		const rate = kpi('COUNT', {
			measures: [
				{ fn: 'COUNT', as: 'a' },
				{ fn: 'COUNT', as: 'b' },
			],
			derived: [{ as: 'r', ratio: ['a', 'b'] }],
			view: { type: 'KPI', y: ['r'] },
		});
		expect(
			await kpiText(
				rate,
				[],
				[{ key: 'r', kind: 'MEASURE', format: 'NUMBER', label: 'Rate' }],
			),
		).toBe('-');
	});

	it('helpers', () => {
		const z = zeroWhenEmpty(kpi('SUM'));
		expect([...z]).toEqual(['m', 'm_cmp']);
		expect(valueOrZero({}, 'm', z)).toBe(0);
		expect(valueOrZero({ m: 5 }, 'm', z)).toBe(5);
		expect(valueOrZero({}, 'other', z)).toBeUndefined();
		expect(zeroWhenEmpty(kpi('AVG')).size).toBe(0);
	});
});

describe('Ask AI placeholder', () => {
	it('app neutral, with the catalog example when there is one', async () => {
		expect(askPlaceholder(undefined)).toBe('Describe the report you want');
		expect(askPlaceholder('  ')).toBe('Describe the report you want');
		expect(askPlaceholder('spend by campaign last 7 days')).toBe(
			'Describe the report you want, e.g. spend by campaign last 7 days',
		);
		const box = (catalog: any) =>
			act(() =>
				root.render(
					<ReportEditorView
						transport={fixtureTransport}
						catalog={catalog}
						runFunction="CxZump.reportRun"
						onSave={() => {}}
						ai={{ endpoint: '/x', fetchImpl: jest.fn() as any }}
					/>,
				),
			);
		const ph = () =>
			(
				document.body.querySelector(
					'textarea[aria-label="Ask AI for a report"]',
				) as HTMLTextAreaElement
			).placeholder;
		box({ ...FIXTURE_CATALOG, ai: true });
		await settle();
		expect(ph()).toBe('Describe the report you want');
		box({ ...FIXTURE_CATALOG, ai: true, aiExample: 'bookings by RM this quarter' });
		await settle();
		expect(ph()).toBe('Describe the report you want, e.g. bookings by RM this quarter');
		act(() => root.render(<ListAsk onAsk={() => {}} />));
		expect((document.body.querySelector('textarea') as HTMLTextAreaElement).placeholder).toBe(
			'Describe the report you want',
		);
	});
});
