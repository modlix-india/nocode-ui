import { datasetCatalogSource, DatasetInfo } from '../datasetModel';
import { checkView, shapeOf } from '../shapeRules';
import { ReportTransport } from '../reportApi';
import {
	Bucket,
	ReportCatalog,
	ReportColumn,
	ReportOutput,
	ReportSpec,
	SPEC_CAPS,
} from '../reportTypes';

/**
 * Sample data shaped exactly like CONTRACT section 2 (catalog) and section 3 (runner output),
 * for building and testing the components before the runner is live, and for the components'
 * "Preview with sample data" property. Values are made up and deterministic.
 */

const BOOKINGS_CONDITION = { field: 'milestones', operator: 'EQUALS', value: 'BOOKED' };

export const FIXTURE_CATALOG: ReportCatalog = {
	v: 1,
	app: 'cxzump',
	timeZone: 'Asia/Kolkata',
	locale: 'en-IN',
	fyStartMonth: 4,
	ai: false,
	quickFilters: ['productId', 'assignedUserId'],
	hierarchies: {
		location: { label: 'Location', levels: ['productId', 'unitId'] },
		stage: { label: 'Stage', levels: ['stageGroup', 'status'] },
	},
	sources: {
		cases: {
			kind: 'STORAGE',
			storage: 'cxCase',
			label: 'Cases',
			scope: 'REQUIRED',
			link: { path: '/caseView/{_id}' },
			moreLink: { path: '/cases', label: 'View all' },
			records: {
				fields: ['caseNumber', 'customerName', 'productId', 'stageGroup', 'openedAt'],
				sort: [{ by: 'openedAt', dir: 'DESC' }],
				link: { path: '/caseView/{_id}' },
			},
			fields: {
				unitId: { kind: 'DIMENSION', label: 'Unit' },
				status: { kind: 'DIMENSION', label: 'Status' },
				productId: {
					kind: 'DIMENSION',
					label: 'Project',
					lookup: { source: 'products', key: '_id', label: 'name' },
				},
				assignedUserId: { kind: 'DIMENSION', label: 'RM', lookup: { type: 'USER' } },
				stageGroup: { kind: 'DIMENSION', label: 'Stage group' },
				bookedAt: { kind: 'DATE', label: 'Booked on', stringDate: true },
				openedAt: { kind: 'DATE', label: 'Opened on', stringDate: true },
				agreementValue: {
					kind: 'MEASURE',
					label: 'Agreement value',
					format: 'MONEY',
					currencyField: 'currency',
					fns: ['SUM', 'AVG', 'MIN', 'MAX'],
					authority: 'Authorities.CXZUMP.Report_READ',
				},
				paidAmount: {
					kind: 'MEASURE',
					label: 'Paid amount',
					format: 'MONEY',
					currencyField: 'currency',
					fns: ['SUM', 'AVG', 'MIN', 'MAX'],
				},
				customerEmail: { kind: 'DIMENSION', label: 'Email', pii: true },
			},
			segments: {
				bookings: {
					label: 'Bookings',
					condition: BOOKINGS_CONDITION,
					countLink: {
						path: '/cases?dash=BOOKING&product={filter.productId}&from={period.from}&to={period.to}',
					},
				},
				eois: { label: 'EOIs', condition: { field: 'milestones', value: 'EOI' } },
			},
		},
		moneySummary: {
			kind: 'FUNCTION',
			label: 'Money summary',
			function: 'CxZump.moneySummary',
			resultPath: 'result',
			columns: {},
			authority: 'Authorities.CXZUMP.Report_READ',
		},
		myTasks: {
			kind: 'FUNCTION',
			label: 'My tasks',
			function: 'CxZump.taskList',
			link: { path: '/caseView/{caseId}' },
			paging: { param: 'page', size: 20 },
			allowedParams: ['page'],
		},
	},
	defaults: [
		{
			id: 'totalBookings',
			name: 'Total bookings',
			spec: {
				v: 1,
				source: 'cases',
				segment: 'bookings',
				measures: [{ fn: 'COUNT', as: 'bookings' }],
				filters: [{ field: 'bookedAt', period: 'ALL_TIME' }],
				view: { type: 'KPI', title: 'Total bookings' },
			},
			authorityAny: ['Authorities.CXZUMP.Case_READ', 'Authorities.CXZUMP.Case_READ_ASSIGNED'],
			layout: { w: 3, h: 2 },
		},
		{
			id: 'totalEois',
			name: 'Total EOIs',
			spec: {
				v: 1,
				source: 'cases',
				segment: 'eois',
				measures: [{ fn: 'COUNT', as: 'eois' }],
				view: { type: 'KPI', title: 'Total EOIs' },
			},
			layout: { w: 3, h: 2 },
		},
		{
			id: 'salesPerformance',
			name: 'Sales performance',
			spec: {
				v: 1,
				source: 'cases',
				segment: 'bookings',
				measures: [
					{ fn: 'COUNT', as: 'bookings' },
					{ fn: 'SUM', field: 'agreementValue', as: 'value' },
				],
				groupBy: [{ field: 'assignedUserId', as: 'rm' }],
				filters: [{ field: 'bookedAt', period: 'THIS_QUARTER' }],
				sort: [{ by: 'value', dir: 'DESC' }],
				limit: 10,
				view: {
					type: 'BAR',
					x: 'rm',
					y: ['bookings', 'value'],
					title: 'Sales performance',
				},
			},
			layout: { w: 6, h: 4 },
		},
		{
			id: 'customerAcquisition',
			name: 'Customer acquisition',
			spec: {
				v: 1,
				source: 'cases',
				measures: [{ fn: 'COUNT', as: 'cases' }],
				groupBy: [{ field: 'openedAt', bucket: 'MONTH', as: 'month' }],
				filters: [{ field: 'openedAt', period: 'LAST_12_MONTHS' }],
				view: { type: 'LINE', x: 'month', y: ['cases'], title: 'Customer acquisition' },
			},
			layout: { w: 6, h: 4 },
		},
	],
};

const LABELS: Record<string, Array<[string, string]>> = {
	assignedUserId: [
		['u101', 'Asha Rao'],
		['u102', 'Vikram Shah'],
		['u103', 'Meera Iyer'],
		['u104', 'Kabir Das'],
		['u105', 'Nisha Menon'],
		['u106', 'Arjun Pillai'],
	],
	productId: [
		['p1', 'Tower A'],
		['p2', 'Tower B'],
		['p3', 'Lake View'],
		['p4', 'Garden Court'],
	],
	unitId: [
		['u-a1', 'A-101'],
		['u-a2', 'A-102'],
		['u-b1', 'B-201'],
	],
	status: [
		['OPEN', 'Open'],
		['ON_HOLD', 'On hold'],
	],
	stageGroup: [
		['ENQUIRY', 'Enquiry'],
		['BOOKING', 'Booking'],
		['AGREEMENT', 'Agreement'],
		['HANDOVER', 'Handover'],
	],
};

/** Deterministic 0..1 from a string. */
function noise(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return ((h >>> 0) % 1000) / 1000;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function iso(d: Date) {
	return d.toISOString().slice(0, 10);
}

function bucketKeys(bucket: Bucket, filters: ReportSpec['filters']): Array<[string, string]> {
	const custom = filters?.find(f => f.period === 'CUSTOM' && f.from && f.to);
	const end = custom?.to ? new Date(custom.to + 'T00:00:00Z') : new Date(Date.UTC(2026, 10, 17));
	const start = custom?.from
		? new Date(custom.from + 'T00:00:00Z')
		: new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth() + 1, 1));
	const out: Array<[string, string]> = [];
	const d = new Date(start.getTime());
	if (bucket === 'MONTH') d.setUTCDate(1);
	if (bucket === 'QUARTER') d.setUTCMonth(Math.floor(d.getUTCMonth() / 3) * 3, 1);
	if (bucket === 'YEAR') d.setUTCMonth(0, 1);
	while (d <= end && out.length < 400) {
		const m = d.getUTCMonth();
		const y = d.getUTCFullYear();
		const label =
			bucket === 'DAY' || bucket === 'WEEK'
				? `${d.getUTCDate()} ${MONTHS[m]}`
				: bucket === 'MONTH'
					? `${MONTHS[m]} ${y}`
					: bucket === 'QUARTER'
						? `Q${Math.floor(m / 3) + 1} ${y}`
						: String(y);
		out.push([iso(d), label]);
		if (bucket === 'DAY') d.setUTCDate(d.getUTCDate() + 1);
		else if (bucket === 'WEEK') d.setUTCDate(d.getUTCDate() + 7);
		else if (bucket === 'MONTH') d.setUTCMonth(m + 1);
		else if (bucket === 'QUARTER') d.setUTCMonth(m + 3);
		else d.setUTCFullYear(y + 1);
	}
	return out;
}

function fail(code: string, message: string, path?: string): ReportOutput {
	return { ok: false, error: { code, message, path } };
}

/** What the runner would answer for a spec (CONTRACT section 3), from made up numbers. */
export function fixtureRun(spec: ReportSpec, dryRun = false): ReportOutput {
	const cat = fixtureCatalog();
	const src = cat.sources[spec?.source];
	if (!src) return fail('UNKNOWN_SOURCE', `Unknown source ${spec?.source}`, 'source');
	if (src.kind === 'FUNCTION')
		return spec.source === 'myTasks' ? myTasks(Number(spec.params?.page ?? 0)) : moneySummary();
	if (spec.records) return records(spec, dryRun);
	if (spec.segment && !src.segments?.[spec.segment])
		return fail('UNKNOWN_SEGMENT', `Unknown segment ${spec.segment}`, 'segment');
	const measures = spec.measures ?? [];
	const groupBy = spec.groupBy ?? [];
	if (measures.length > SPEC_CAPS.measures)
		return fail('TOO_MANY', 'At most 3 measures', 'measures');
	if (groupBy.length > SPEC_CAPS.groupBy)
		return fail('TOO_MANY', 'At most 2 group bys', 'groupBy');
	if ((spec.filters?.length ?? 0) > SPEC_CAPS.filters)
		return fail('TOO_MANY', 'At most 8 filters', 'filters');
	for (let i = 0; i < measures.length; i++) {
		const m = measures[i];
		if (m.fn === 'COUNT') continue;
		const f = m.field ? src.fields?.[m.field] : undefined;
		if (!f) return fail('UNKNOWN_FIELD', `Unknown field ${m.field}`, `measures[${i}].field`);
	}
	for (let i = 0; i < groupBy.length; i++) {
		const f = src.fields?.[groupBy[i].field];
		if (!f)
			return fail(
				'UNKNOWN_FIELD',
				`Unknown field ${groupBy[i].field}`,
				`groupBy[${i}].field`,
			);
		if (f.pii) return fail('PII_GROUP', `${f.label} cannot be grouped`, `groupBy[${i}].field`);
	}
	const fit = checkView(spec.view?.type ?? 'TABLE', shapeOf(spec, cat));
	if (!fit.ok) return fail('BAD_VIEW', fit.reason ?? 'View does not fit', 'view.type');

	const columns: ReportColumn[] = [];
	for (const g of groupBy) {
		const f = src.fields![g.field];
		columns.push({
			key: g.as,
			label: f.label,
			kind: f.kind === 'DATE' || g.bucket ? 'DATE' : 'DIMENSION',
		});
		columns.push({ key: `${g.as}_label`, hidden: true });
	}
	for (const m of measures) {
		const f = m.field ? src.fields?.[m.field] : undefined;
		const money = f?.format === 'MONEY' && m.fn !== 'COUNT' && m.fn !== 'COUNT_DISTINCT';
		columns.push({
			key: m.as,
			label:
				m.fn === 'COUNT'
					? (src.segments?.[spec.segment ?? '']?.label ?? 'Count')
					: f?.label,
			kind: 'MEASURE',
			format: money ? 'MONEY' : 'NUMBER',
			...(money ? { currency: 'INR' } : {}),
		});
	}
	for (const d of spec.derived ?? [])
		columns.push({
			key: d.as,
			label: d.as,
			kind: 'MEASURE',
			format: d.percent ? 'PERCENT' : 'NUMBER',
		});
	if (dryRun) return { ok: true, columns, rows: [] };

	const keysFor = (i: number): Array<[string, string]> => {
		const g = groupBy[i];
		if (g.bucket) return bucketKeys(g.bucket, spec.filters);
		return (
			LABELS[g.field] ?? [
				['a', 'A'],
				['b', 'B'],
				['c', 'C'],
			]
		);
	};
	const combos: Array<Array<[string, string]>> = [];
	if (!groupBy.length) combos.push([]);
	else if (groupBy.length === 1) keysFor(0).forEach(k => combos.push([k]));
	else keysFor(0).forEach(a => keysFor(1).forEach(b => combos.push([a, b])));

	const excluded = (spec.filters ?? []).filter(f => f.op === 'NE' || f.op === 'EQ');
	let rows = combos
		.filter(c =>
			excluded.every(f => {
				const i = groupBy.findIndex(g => g.field === f.field);
				if (i < 0) return true;
				return f.op === 'EQ' ? c[i][0] === f.values?.[0] : c[i][0] !== f.values?.[0];
			}),
		)
		.map(c => {
			const row: Record<string, any> = {};
			c.forEach(([k, l], i) => {
				row[groupBy[i].as] = k;
				row[`${groupBy[i].as}_label`] = l;
			});
			const seed = c.map(e => e[0]).join('|') + spec.segment;
			for (const m of measures) {
				const r = noise(seed + m.as);
				const base = groupBy.length ? 1 : 40;
				const count = Math.round(base * (4 + r * 30));
				row[m.as] =
					m.fn === 'COUNT' || m.fn === 'COUNT_DISTINCT'
						? count
						: m.fn === 'AVG' || m.fn === 'MIN' || m.fn === 'MAX'
							? Math.round(4500000 + r * 6000000)
							: count * Math.round(4500000 + r * 3000000);
			}
			for (const d of spec.derived ?? []) {
				const pair = d.ratio ?? d.difference ?? d.percent;
				if (!pair) continue;
				const a = Number(row[pair[0]]);
				const b = Number(row[pair[1]]);
				row[d.as] = d.difference ? a - b : b ? (d.percent ? (100 * a) / b : a / b) : null;
			}
			return row;
		});
	for (const s of spec.sort ?? []) {
		const dir = s.dir === 'ASC' ? 1 : -1;
		rows = rows.sort((a, b) => (Number(a[s.by]) - Number(b[s.by])) * dir);
	}
	if (spec.limit) rows = rows.slice(0, spec.limit);
	let comparePeriod: { from: string; to: string; label: string } | undefined;
	if (spec.compare) {
		const periods = (spec.filters ?? []).filter(f => f.period);
		if (!periods.length || periods.some(f => f.period === 'ALL_TIME'))
			return fail('BAD_PERIOD', 'Compare needs a date range that is not All time', 'compare');
		comparePeriod = { from: '2026-07-01', to: '2026-09-30', label: 'Previous period' };
		rows = rows.map(r => {
			const next = { ...r };
			for (const m of measures) {
				const v = Number(r[m.as]);
				const cmp = Math.round(v * (0.7 + noise(String(v)) * 0.6));
				next[`${m.as}_cmp`] = cmp;
				next[`${m.as}_delta_pct`] = cmp ? (100 * (v - cmp)) / cmp : null;
			}
			return next;
		});
	}
	return {
		ok: true,
		columns,
		rows,
		...(comparePeriod ? { comparePeriod } : {}),
		truncated: false,
		period: { from: '2026-10-01', to: '2026-12-31', label: 'This quarter' },
		refreshedAt: new Date().toISOString(),
		cached: false,
	};
}

/** A records page (CONTRACT 8.1): 230 made up cases. */
function records(spec: ReportSpec, dryRun: boolean): ReportOutput {
	const src = fixtureCatalog().sources[spec.source];
	if (!src.records) return fail('RECORDS_NOT_ALLOWED', 'This source has no records', 'records');
	const total = 230;
	const size = Math.min(spec.records!.export ? 5000 : 100, spec.records!.size || 100);
	const page = spec.records!.page || 0;
	const columns: ReportColumn[] = [
		{ key: '_id', hidden: true },
		{ key: 'caseNumber', label: 'Case', kind: 'DIMENSION' },
		{ key: 'customerName', label: 'Customer', kind: 'DIMENSION' },
		{ key: 'productId', label: 'Project', kind: 'DIMENSION' },
		{ key: 'productId_label', hidden: true },
		{ key: 'openedAt', label: 'Opened on', kind: 'DATE' },
	];
	if (dryRun) return { ok: true, columns, rows: [], total, page, size };
	const rows = [];
	for (let i = page * size; i < Math.min(total, (page + 1) * size); i++) {
		const p = LABELS.productId[i % LABELS.productId.length];
		rows.push({
			_id: `c${i + 1}`,
			caseNumber: `CX-${1000 + i}`,
			customerName: `Customer ${i + 1}`,
			productId: p[0],
			productId_label: p[1],
			openedAt: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`,
		});
	}
	return { ok: true, columns, rows, total, page, size };
}

/** My tasks, 45 of them, 20 a page (a paging function source). */
function myTasks(page: number): ReportOutput {
	const rows = [];
	for (let i = page * 20; i < Math.min(45, (page + 1) * 20); i++)
		rows.push({
			_id: `t${i + 1}`,
			title: `Task ${i + 1}`,
			// Every fifth task is on no case: no link.
			...(i % 5 === 4 ? {} : { caseId: `c${i + 1}` }),
		});
	return {
		ok: true,
		columns: [
			{ key: '_id', hidden: true, kind: 'DIMENSION' },
			{ key: 'title', label: 'Task', kind: 'DIMENSION' },
			{ key: 'caseId', label: 'Case', kind: 'DIMENSION' },
		],
		rows,
		refreshedAt: new Date().toISOString(),
	};
}

function moneySummary(): ReportOutput {
	return {
		ok: true,
		columns: [
			{ key: 'kind', label: 'Kind', kind: 'DIMENSION' },
			{ key: 'amount', label: 'Amount', kind: 'MEASURE', format: 'MONEY', currency: 'INR' },
		],
		rows: [
			{ kind: 'Collected', amount: 182500000 },
			{ kind: 'Due', amount: 64000000 },
			{ kind: 'Overdue', amount: 12500000 },
			{ kind: 'Refunded', amount: 3200000 },
		],
		refreshedAt: new Date().toISOString(),
		cached: true,
	};
}

const docs = new Map<string, any>();

/** In memory: the server's event answer shape, `[{name:'output', result:{result: ...}}]`. */
/** The sample user's datasets (CONTRACT 10), kept for the page visit. */
const datasets = new Map<string, DatasetInfo & { rows: any[][] }>();
let datasetSeq = 0;

/** For tests: forget the sample datasets. */
export function resetFixtureDatasets() {
	datasets.clear();
	datasetSeq = 0;
}

/** The sample catalog plus one source per sample dataset. */
export function fixtureCatalog(): ReportCatalog {
	if (!datasets.size) return FIXTURE_CATALOG;
	const sources = { ...FIXTURE_CATALOG.sources };
	for (const d of datasets.values()) sources[`dataset:${d._id}`] = datasetCatalogSource(d);
	return { ...FIXTURE_CATALOG, sources };
}

function datasetCall(fn: string, args: any): any {
	const ok = (result: any) => [{ name: 'output', result: { result } }];
	if (/reportDatasetList$/.test(fn))
		return ok(
			[...datasets.values()].map(({ rows, ...info }) => ({ ...info, rowCount: rows.length })),
		);
	if (/reportDatasetDelete$/.test(fn)) {
		if (!datasets.delete(String(args?.datasetId)))
			return ok({ ok: false, error: { code: 'NOT_FOUND', message: 'No such dataset' } });
		return ok({ ok: true });
	}
	// reportDatasetSave
	const now = new Date().toISOString();
	let d = args?.datasetId ? datasets.get(String(args.datasetId)) : undefined;
	if (args?.datasetId && !d)
		return ok({ ok: false, error: { code: 'NOT_FOUND', message: 'No such dataset' } });
	if (!d) {
		if (datasets.size >= 20)
			return ok({ ok: false, error: { code: 'LIMIT', message: 'At most 20 datasets' } });
		d = { _id: `ds${++datasetSeq}`, name: '', columns: [], rows: [], createdAt: now };
		datasets.set(d._id, d);
	}
	if (Number(args?.part) === 0) {
		// Metadata only (a rename): the rows stay.
		d.name = String(args?.name ?? d.name);
		d.updatedAt = now;
		return ok({ ok: true, datasetId: d._id, rowCount: d.rows.length });
	}
	d.name = String(args?.name ?? d.name);
	d.columns = Array.isArray(args?.columns) ? args.columns : d.columns;
	d.updatedAt = now;
	if (Array.isArray(args?.rows)) {
		if (Number(args.part) === 1) d.rows = [];
		d.rows.push(...args.rows);
	}
	return ok({ ok: true, datasetId: d._id, rowCount: d.rows.length });
}

export const fixtureTransport: ReportTransport = {
	async call(fn, args) {
		await new Promise(r => setTimeout(r, 150));
		if (/reportCatalog$/.test(fn))
			return [{ name: 'output', result: { result: fixtureCatalog() } }];
		if (/reportDataset(Save|List|Delete)$/.test(fn)) return datasetCall(fn, args);
		// A stand-in for <ns>.reportPdf until the core's Report.Pdf answers (CONTRACT 8.2).
		if (/reportPdf$/.test(fn))
			return [
				{
					name: 'output',
					result: {
						fileData: {
							fileName: 'report.pdf',
							url: 'data:application/pdf;base64,JVBERi0xLjQK',
						},
					},
				},
			];
		return [{ name: 'output', result: { result: fixtureRun(args?.spec, !!args?.dryRun) } }];
	},
	async loadDoc(name) {
		return docs.get(name) ?? {};
	},
	async saveDoc(name, doc) {
		docs.set(name, JSON.parse(JSON.stringify(doc)));
	},
	async deleteDoc(name) {
		docs.delete(name);
	},
};
