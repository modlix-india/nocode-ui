import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startPointerDrag } from '../../../functions/usePointerDrag';
import { errorText, ReportTransport, runReport } from '../reportApi';
import { labelOf } from '../reportFormat';
import { bySize, cloneSpec, compareBlocker, reportSources, valuesSpec } from '../reportSpecUtil';
import { checkView, shapeOf, suggestView } from '../shapeRules';
import {
	accepts,
	addToShelf,
	COUNT_FIELD,
	filterOfField,
	historyInit,
	historyKey,
	historyPush,
	historyRedo,
	historyUndo,
	isMeasure,
	itemOfField,
	moveOnShelves,
	removeFromShelf,
	replaceOnShelf,
	SHELF_LABELS,
	SHELF_ORDER,
	ShelfItem,
	ShelfName,
	Shelves,
	shelvesToSpec,
	specToShelves,
} from '../shelves';
import {
	BUCKET_LABELS,
	Bucket,
	CatalogField,
	COMPARE_LABELS,
	CompareTo,
	FILTER_OP_LABELS,
	FILTER_OPS,
	FilterOp,
	MEASURE_FN_LABELS,
	MEASURE_FNS,
	MeasureFn,
	PERIOD_LABELS,
	PERIODS,
	Period,
	REFRESH_CHOICES,
	ReportCatalog,
	ReportDerived,
	ReportErrorBody,
	ReportFilter,
	ReportSpec,
	SPEC_CAPS,
	ViewType,
} from '../reportTypes';
import { DatasetFunctions } from '../datasetApi';
import { datasetSourceId, isDatasetSource } from '../datasetModel';
import { ChartTypePicker } from './ChartTypePicker';
import { AiGroup, AiPeriod } from '../reportAi';
import { AskAiBox } from './AskAiBox';
import { FunctionParams } from './FunctionParams';
import { DatasetImportDialog, DatasetListDialog, dayOrderFor, useDatasets } from './Datasets';
import { Icon, IconButton, MultiPick, PickOption, useDismiss } from './common';
import { ReportWidgetView } from './ReportWidgetView';
import { Pop } from './portal';
import { StylePanel } from './StylePanel';

/**
 * The report editor (CONTRACT 8.3): a field list (Dimensions / Dates / Measures, search), the
 * shelves Columns, Rows, Color, Size, Label and Filters (drag a field on with the shared pointer
 * drag, or tap it and pick a shelf: the way on a phone and by keyboard), and the type picker and
 * style panel beside a live preview. Every change edits the spec (shelves.ts maps them), is
 * checked with a `reportRun` dry run and then previewed. Undo / redo (Ctrl or Cmd + Z, with
 * Shift to redo) cover the editing session. Save, Save as new, Discard.
 */

export interface EditorValue {
	name: string;
	spec: ReportSpec;
	refreshMin: number;
}

const IMPORT_DATA = '__importData__';
const MANAGE_DATA = '__manageData__';
const BUCKETS: Bucket[] = ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'];
const NO_VALUE_OPS = new Set<FilterOp>(['IS_NULL', 'NOT_NULL']);
const HUGE = { width: 1e7, height: 1e7 };

/** A source's fields, by label (catalog field order is not kept, so never rely on it). */
function fieldsOf(catalog: ReportCatalog | undefined, source: string) {
	return Object.entries(catalog?.sources?.[source]?.fields ?? {}).sort((a, b) =>
		(a[1].label ?? a[0]).localeCompare(b[1].label ?? b[0]),
	);
}

function uniqueAs(base: string, taken: Set<string>): string {
	const clean = base.replace(/[^A-Za-z0-9_]/g, '_') || 'm';
	let k = clean;
	for (let i = 2; taken.has(k); i++) k = `${clean}_${i}`;
	return k;
}

export function measureAs(fn: MeasureFn, field: string | undefined, taken: Set<string>) {
	return uniqueAs(fn === 'COUNT' ? 'count' : `${fn.toLowerCase()}_${field ?? ''}`, taken);
}

function newSpec(catalog: ReportCatalog | undefined): ReportSpec {
	const sources = reportSources(catalog);
	const source =
		sources.filter(([, s]) => s.kind !== 'FUNCTION').sort(bySize)[0]?.[0] ??
		sources[0]?.[0] ??
		'';
	return { v: 1, source, measures: [{ fn: 'COUNT', as: 'count' }], view: { type: 'KPI' } };
}

/** Keeps view.x / view.y pointing at keys the spec still has, and the type fitting. */
export function tidySpec(spec: ReportSpec, catalog?: ReportCatalog): ReportSpec {
	const next = cloneSpec(spec);
	const keys = new Set([
		...(next.measures ?? []).map(m => m.as),
		...(next.derived ?? []).map(d => d.as),
	]);
	const dims = new Set((next.groupBy ?? []).map(g => g.as));
	if (next.view.x && !dims.has(next.view.x)) delete next.view.x;
	if (next.view.y) {
		next.view.y = next.view.y.filter(k => keys.has(k));
		if (!next.view.y.length) delete next.view.y;
	}
	if (!next.view.x && next.groupBy?.[0]) next.view.x = next.groupBy[0].as;
	const shape = shapeOf(next, catalog);
	if (!checkView(next.view.type, shape).ok) next.view.type = suggestView(shape);
	if (next.sort) {
		const sortable = new Set([...keys, ...dims]);
		next.sort = next.sort.filter(s => sortable.has(s.by));
		if (!next.sort.length) delete next.sort;
	}
	return next;
}

type Menu =
	| { kind: 'field'; field: string }
	| { kind: 'pill'; shelf: Exclude<ShelfName, 'filters'>; index: number }
	| { kind: 'filter'; index: number };

interface DragState {
	label: string;
	x: number;
	y: number;
	over?: ShelfName;
}

type DragPayload =
	| { kind: 'field'; field: string; label: string }
	| { kind: 'pill'; shelf: Exclude<ShelfName, 'filters'>; index: number; label: string };

function shelfAt(x: number, y: number): ShelfName | undefined {
	if (typeof document === 'undefined' || !document.elementFromPoint) return undefined;
	const el = document.elementFromPoint(x, y) as HTMLElement | null;
	const name = el?.closest?.('[data-shelf]')?.getAttribute('data-shelf');
	return (SHELF_ORDER as string[]).includes(name ?? '') ? (name as ShelfName) : undefined;
}

export function ReportEditorView({
	transport,
	catalog,
	runFunction,
	initial,
	onSave,
	onSaveAsNew,
	onCancel,
	saveLabel,
	extra,
	datasets,
	ai,
}: Readonly<{
	transport?: ReportTransport;
	catalog?: ReportCatalog;
	runFunction: string;
	initial?: EditorValue;
	onSave: (v: EditorValue) => void | Promise<void>;
	/** Shows "Save as new": the edited widget stays as it was, a copy is saved. */
	onSaveAsNew?: (v: EditorValue) => void | Promise<void>;
	/** Discard closes through this; without it Discard puts the editor back to the start. */
	onCancel?: () => void;
	saveLabel?: string;
	/** More controls next to Save (the standalone editor's "Add to my dashboard"). */
	extra?: React.ReactNode;
	/** CSV data import from the Data picker (CONTRACT 10): the app's dataset functions. */
	datasets?: DatasetFunctions;
	/** The Ask AI box (CONTRACT 11), shown when the catalog says `ai: true`. */
	ai?: {
		endpoint: string;
		group?: string;
		groups?: Array<{ id: string; label: string; kind?: string }>;
		/** The AI suggested a group (an existing one, or a new label); the page decides. */
		onGroup?: (group: AiGroup) => void;
		fetchImpl?: typeof fetch;
	};
}>) {
	const start = useMemo<EditorValue>(
		() => ({
			name: initial?.name ?? '',
			spec: cloneSpec(initial?.spec) ?? newSpec(catalog),
			refreshMin: initial?.refreshMin ?? 0,
		}),
		// The editing session starts once; later props do not reset it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const [hist, setHist] = useState(() => historyInit(start));
	const { name, spec, refreshMin } = hist.present;
	const [check, setCheck] = useState<{
		status: 'idle' | 'checking' | 'ok' | 'error';
		error?: ReportErrorBody;
		spec?: ReportSpec;
	}>({ status: 'idle' });
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState('');
	const [menu, setMenu] = useState<Menu | undefined>(undefined);
	const [hint, setHint] = useState('');
	const [drag, setDrag] = useState<DragState | undefined>(undefined);
	const dragOver = useRef<ShelfName | undefined>(undefined);
	const justDragged = useRef(false);
	const menuRef = useDismiss(!!menu, () => setMenu(undefined));
	/** The field or pill a menu opened from (menus are in a portal, placed by it). */
	const menuAnchor = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!initial && catalog && !spec.source)
			setHist(historyInit({ ...hist.present, spec: newSpec(catalog) }));
	}, [catalog]);

	const commit = useCallback(
		(patch: Partial<EditorValue>, group?: string) =>
			setHist(h => historyPush(h, { ...h.present, ...patch }, group)),
		[],
	);
	const setSpec = useCallback(
		(fn: (s: ReportSpec) => ReportSpec, group?: string) =>
			setHist(h =>
				historyPush(
					h,
					{ ...h.present, spec: tidySpec(fn(cloneSpec(h.present.spec)), catalog) },
					group,
				),
			),
		[catalog],
	);
	const undo = () => setHist(h => historyUndo(h));
	const redo = () => setHist(h => historyRedo(h));

	const [dataDialog, setDataDialog] = useState<'import' | 'list' | undefined>(undefined);
	/** A dataset just imported: picked as the source once the reloaded catalog lists it. */
	const [pendingSource, setPendingSource] = useState<string | undefined>(undefined);
	const datasetList = useDatasets(dataDialog === 'import' ? transport : undefined, datasets);
	const pickSource = (id: string) => {
		const next = newSpec(catalog);
		next.source = id;
		if (catalog?.sources?.[id]?.kind === 'FUNCTION') {
			delete next.measures;
			next.view = { type: 'TABLE' };
		}
		commit({ spec: next });
	};
	useEffect(() => {
		if (!pendingSource || !catalog?.sources?.[pendingSource]) return;
		setPendingSource(undefined);
		if (spec.source !== pendingSource) pickSource(pendingSource);
	}, [catalog, pendingSource]); // eslint-disable-line react-hooks/exhaustive-deps

	/** The AI's plain-words summary, shown while the spec is the one it proposed. */
	const [aiSummary, setAiSummary] = useState<{ text: string; key: string } | undefined>(
		undefined,
	);
	const latest = useRef({ spec, refine: false });
	latest.current = { spec, refine: !!initial || hist.past.length > 0 };
	/** The name the AI last filled in: a later AI answer may replace it, a typed name stays. */
	const aiName = useRef<string | undefined>(undefined);
	const loadAiSpec = (
		proposed: ReportSpec,
		summaryText: string,
		group?: AiGroup,
		period?: AiPeriod,
	) => {
		// The builder's summary normally carries the period in words and dates already.
		const summary =
			period?.label &&
			summaryText &&
			!summaryText.toLowerCase().includes(period.label.toLowerCase()) &&
			!/\d{4}/.test(summaryText)
				? `${summaryText} (${period.label})`
				: summaryText;
		const next = tidySpec({ ...cloneSpec(proposed), v: 1 }, catalog);
		const takeName = !name.trim() || name === aiName.current;
		const title = next.view.title ?? '';
		if (takeName) aiName.current = title;
		commit({ spec: next, ...(takeName ? { name: title } : {}) });
		setAiSummary(summary ? { text: summary, key: JSON.stringify(next) } : undefined);
		if (group) ai?.onGroup?.(group);
	};

	const source = catalog?.sources?.[spec.source];
	const isFunction = source?.kind === 'FUNCTION';
	const fields = fieldsOf(catalog, spec.source);
	const fieldMap = useMemo(() => new Map(fields), [fields]);
	const shape = shapeOf(spec, catalog);
	const shelves = useMemo(() => specToShelves(spec, catalog), [spec, catalog]);
	const setShelves = (sh: Shelves, group?: string) => setSpec(s => shelvesToSpec(sh, s), group);

	// Validate (dry run) a moment after the last change; preview only a spec that passes.
	const seq = useRef(0);
	useEffect(() => {
		if (!transport || !runFunction || !spec.source) return;
		const id = ++seq.current;
		setCheck(c => ({ ...c, status: 'checking' }));
		const h = setTimeout(async () => {
			const r = await runReport(transport, runFunction, spec, { dryRun: true });
			if (id !== seq.current) return;
			setCheck(c =>
				r.ok ? { status: 'ok', spec } : { status: 'error', error: r.error, spec: c.spec },
			);
		}, 500);
		return () => clearTimeout(h);
	}, [transport, runFunction, spec]);

	const loadValues = useCallback(
		(field: string) => async (): Promise<PickOption[]> => {
			const vs = valuesSpec(catalog, field, spec.source);
			if (!vs || !transport) return [];
			const r = await runReport(transport, runFunction, vs);
			if (!r.ok) throw new Error(errorText(r.error));
			return r.rows.map(row => ({ value: row.k, label: labelOf(row, 'k') }));
		},
		[catalog, transport, runFunction, spec.source],
	);

	/** One loader per param named like a catalog field (stable, so each loads once). */
	const paramLoader = useMemo(() => {
		const cache = new Map<string, () => Promise<PickOption[]>>();
		return (key: string) => {
			if (!valuesSpec(catalog, key)) return undefined;
			if (!cache.has(key)) cache.set(key, loadValues(key));
			return cache.get(key);
		};
	}, [catalog, loadValues]);

	const fieldLabelOf = (field: string) =>
		field === COUNT_FIELD ? 'Number of records' : (fieldMap.get(field)?.label ?? field);
	const itemLabel = (i: ShelfItem) => {
		const base = fieldLabelOf(i.field);
		if (isMeasure(i)) {
			const seg = i.segment ? ` (${source?.segments?.[i.segment]?.label ?? i.segment})` : '';
			if (i.field === COUNT_FIELD || i.fn === 'COUNT') return `Count${seg}`;
			return `${MEASURE_FN_LABELS[i.fn ?? 'SUM']} of ${base}${seg}`;
		}
		if (i.kind === 'DATE')
			return `${base} by ${BUCKET_LABELS[i.bucket ?? 'MONTH'].toLowerCase()}`;
		return base;
	};
	const filterLabel = (f: ReportFilter) => {
		const base = fieldLabelOf(f.field);
		if (f.period)
			return f.period === 'CUSTOM'
				? `${base}: ${f.from ?? '?'} to ${f.to ?? '?'}`
				: `${base}: ${PERIOD_LABELS[f.period]}`;
		const op = FILTER_OP_LABELS[f.op ?? 'IN'];
		if (NO_VALUE_OPS.has(f.op ?? 'IN')) return `${base} ${op}`;
		const n = f.values?.length ?? 0;
		return `${base} ${op} ${n === 1 ? String(f.values![0]) : n ? `${n} values` : '...'}`;
	};

	/** Puts a field (or a moved pill) on a shelf; a refusal shows its reason. */
	const drop = (
		payload:
			| { kind: 'field'; field: string }
			| { kind: 'pill'; shelf: Exclude<ShelfName, 'filters'>; index: number },
		to: ShelfName,
	) => {
		setMenu(undefined);
		if (to === 'filters') {
			const field =
				payload.kind === 'field'
					? payload.field
					: shelves[payload.shelf][payload.index]?.field;
			if (!field || field === COUNT_FIELD) return setHint('Filters take a field');
			if (shelves.filters.length >= SPEC_CAPS.filters)
				return setHint(`At most ${SPEC_CAPS.filters} filters`);
			setHint('');
			return setShelves({
				...shelves,
				filters: [...shelves.filters, filterOfField(field, fieldMap.get(field))],
			});
		}
		const r =
			payload.kind === 'field'
				? addToShelf(shelves, to, itemOfField(payload.field, fieldMap.get(payload.field)))
				: moveOnShelves(shelves, payload, to);
		if (!r.ok) return setHint(r.reason);
		setHint('');
		setShelves(r.shelves);
	};

	const beginDrag = (e: React.PointerEvent<HTMLElement>, payload: DragPayload) => {
		// A finger taps (a touch drag would fight the page scroll); mouse and pen drag.
		if (e.pointerType === 'touch' || e.button !== 0) return;
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		const sx = e.clientX;
		const sy = e.clientY;
		startPointerDrag(el, e.nativeEvent, {
			inset: -1e6,
			viewport: () => HUGE,
			onStart: () => setMenu(undefined),
			onMove: o => {
				const x = sx + (HUGE.width - o.right - rect.width - rect.left);
				const y = sy + (HUGE.height - o.bottom - rect.height - rect.top);
				const over = shelfAt(x, y);
				dragOver.current = over;
				setDrag({ label: payload.label, x, y, over });
			},
			onEnd: () => {
				const to = dragOver.current;
				dragOver.current = undefined;
				setDrag(undefined);
				justDragged.current = true;
				setTimeout(() => (justDragged.current = false), 0);
				if (to) drop(payload, to);
				else if (payload.kind === 'pill')
					// Dragged off the shelves: gone, as in Tableau.
					setShelves(removeFromShelf(shelves, payload.shelf, payload.index));
			},
		});
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		const t = e.target as HTMLElement;
		if (
			t?.tagName === 'TEXTAREA' ||
			(t?.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'checkbox')
		)
			return;
		const k = historyKey(e);
		if (!k) return;
		e.preventDefault();
		if (k === 'undo') undo();
		else redo();
	};

	const q = search.trim().toLowerCase();
	const visible = fields.filter(
		([n, f]) => !f.pii && (!q || (f.label ?? n).toLowerCase().includes(q)),
	);
	const groups: Array<[string, Array<[string, CatalogField | undefined]>]> = [
		['Dimensions', visible.filter(([, f]) => f.kind === 'DIMENSION')],
		['Dates', visible.filter(([, f]) => f.kind === 'DATE')],
		[
			'Measures',
			[
				...(!q || 'number of records'.includes(q)
					? [[COUNT_FIELD, undefined] as [string, CatalogField | undefined]]
					: []),
				...visible.filter(([, f]) => f.kind === 'MEASURE'),
			],
		],
	];
	const fieldIcon = (f: CatalogField | undefined) =>
		!f
			? 'fa-hashtag'
			: f.kind === 'DATE'
				? 'fa-calendar'
				: f.kind === 'MEASURE'
					? 'fa-hashtag'
					: 'fa-font';

	const valueKeys = [
		...(spec.measures ?? []).map(m => m.as),
		...(spec.derived ?? []).map(d => d.as),
	];
	const keyLabel = (k: string) => {
		const m = spec.measures?.find(e => e.as === k);
		if (!m) return k;
		if (m.fn === 'COUNT') return 'Count';
		return `${MEASURE_FN_LABELS[m.fn]} of ${fieldLabelOf(m.field ?? '')}`;
	};
	const takenAs = () => new Set(valueKeys);
	const blocker = compareBlocker(spec, catalog);
	const canSave = !!name.trim() && check.status === 'ok' && !saving;
	const value = (): EditorValue => ({
		name: name.trim(),
		spec: { ...spec, view: { ...spec.view, title: spec.view.title ?? undefined } },
		refreshMin,
	});
	const doSave = async (fn: (v: EditorValue) => void | Promise<void>) => {
		setSaving(true);
		try {
			await fn(value());
		} finally {
			setSaving(false);
		}
	};
	const measuresInResult = [
		...(spec.measures ?? []).map(m => ({ key: m.as, label: keyLabel(m.as) })),
		...(spec.derived ?? []).map(d => ({ key: d.as, label: d.as })),
	];

	const shelfRow = (sh: ShelfName) => {
		const items = sh === 'filters' ? shelves.filters : shelves[sh];
		return (
			<div
				key={sh}
				className={`_rpShelf${drag?.over === sh ? ' _over' : ''}`}
				data-shelf={sh}
				role="group"
				aria-label={SHELF_LABELS[sh]}
			>
				<span className="_rpShelfName">{SHELF_LABELS[sh]}</span>
				<div className="_rpShelfItems">
					{!items.length ? (
						<span className="_rpShelfHint">
							{sh === 'color'
								? 'Drop a dimension'
								: sh === 'size' || sh === 'label'
									? 'Drop a measure'
									: 'Drop a field'}
						</span>
					) : null}
					{sh === 'filters'
						? shelves.filters.map((f, i) => (
								<span key={i} className="_rpPill">
									<button
										type="button"
										aria-haspopup="dialog"
										onClick={e => {
											menuAnchor.current = e.currentTarget;
											setMenu({ kind: 'filter', index: i });
										}}
									>
										{filterLabel(f)}
									</button>
									<IconButton
										icon="fa-xmark"
										label={`Remove ${filterLabel(f)}`}
										onClick={() =>
											setShelves(removeFromShelf(shelves, 'filters', i))
										}
									/>
									{menu?.kind === 'filter' && menu.index === i ? (
										<Pop
											anchor={menuAnchor.current}
											popRef={menuRef}
											role="dialog"
											label="Filter"
											style={{ minWidth: 280 }}
										>
											<FilterRow
												value={f}
												fields={fields}
												loadValues={loadValues}
												onChange={v => {
													if (!v) setMenu(undefined);
													setShelves(
														{
															...shelves,
															filters: v
																? shelves.filters.map((e, j) =>
																		j === i ? v : e,
																	)
																: shelves.filters.filter(
																		(_, j) => j !== i,
																	),
														},
														`filter${i}`,
													);
												}}
											/>
										</Pop>
									) : null}
								</span>
							))
						: shelves[sh].map((it, i) => (
								<span
									key={`${it.field}${i}`}
									className={`_rpPill${isMeasure(it) ? ' _measure' : ''}`}
								>
									<button
										type="button"
										aria-haspopup="menu"
										onPointerDown={e =>
											beginDrag(e, {
												kind: 'pill',
												shelf: sh,
												index: i,
												label: itemLabel(it),
											})
										}
										onClick={e => {
											if (justDragged.current) return;
											menuAnchor.current = e.currentTarget;
											setMenu({ kind: 'pill', shelf: sh, index: i });
										}}
									>
										{itemLabel(it)}
									</button>
									<IconButton
										icon="fa-xmark"
										label={`Remove ${itemLabel(it)}`}
										onClick={() => setShelves(removeFromShelf(shelves, sh, i))}
									/>
									{menu?.kind === 'pill' &&
									menu.shelf === sh &&
									menu.index === i ? (
										<Pop
											anchor={menuAnchor.current}
											popRef={menuRef}
											role="menu"
										>
											<PillEditor
												item={it}
												field={fieldMap.get(it.field)}
												segments={source?.segments}
												onChange={n =>
													setShelves(replaceOnShelf(shelves, sh, i, n))
												}
											/>
											<div className="_rpMenuSep" />
											{SHELF_ORDER.filter(
												t => t !== sh && t !== 'filters' && accepts(t, it),
											).map(t => (
												<button
													key={t}
													type="button"
													role="menuitem"
													className="_rpMenuItem"
													onClick={() =>
														drop(
															{ kind: 'pill', shelf: sh, index: i },
															t,
														)
													}
												>
													<Icon name="fa-arrow-right" /> Move to{' '}
													{SHELF_LABELS[t]}
												</button>
											))}
										</Pop>
									) : null}
								</span>
							))}
				</div>
			</div>
		);
	};

	const dataDialogs =
		datasets && transport && dataDialog ? (
			dataDialog === 'import' ? (
				<DatasetImportDialog
					transport={transport}
					fns={datasets}
					existing={datasetList.list ?? []}
					dayOrder={dayOrderFor(catalog?.locale)}
					onClose={() => setDataDialog(undefined)}
					onDone={id => setPendingSource(datasetSourceId(id))}
				/>
			) : (
				<DatasetListDialog
					transport={transport}
					fns={datasets}
					dayOrder={dayOrderFor(catalog?.locale)}
					onClose={() => setDataDialog(undefined)}
					onImported={id => setPendingSource(datasetSourceId(id))}
				/>
			)
		) : null;

	return (
		<div className="_rpEditor _shelves" onKeyDown={onKeyDown}>
			{dataDialogs}
			{ai && catalog?.ai ? (
				<AskAiBox
					endpoint={ai.endpoint}
					group={ai.group}
					groups={ai.groups}
					fetchImpl={ai.fetchImpl}
					currentSpec={() => (latest.current.refine ? latest.current.spec : undefined)}
					onSpec={loadAiSpec}
				/>
			) : null}
			<div className="_rpLine" style={{ gridColumn: '1 / -1' }}>
				<label className="_rpLabel" style={{ flex: '2 1 220px' }}>
					Name
					<input
						className="_rpInput"
						value={name}
						placeholder="Bookings by RM"
						onChange={e => commit({ name: e.target.value }, 'name')}
					/>
				</label>
				<label className="_rpLabel" style={{ flex: '1 1 160px' }}>
					Data
					<select
						className="_rpSelect"
						value={spec.source}
						onChange={e => {
							const v = e.target.value;
							if (v === IMPORT_DATA || v === MANAGE_DATA) {
								setDataDialog(v === IMPORT_DATA ? 'import' : 'list');
								return;
							}
							pickSource(v);
						}}
					>
						{(() => {
							const all = reportSources(catalog);
							const own = all.filter(([k]) => isDatasetSource(k));
							const app = all.filter(([k]) => !isDatasetSource(k));
							const opts = (list: typeof all) =>
								list.map(([k, s]) => (
									<option key={k} value={k}>
										{s.label ?? k}
									</option>
								));
							const known = all.some(([k]) => k === spec.source);
							return (
								<>
									{!known && spec.source ? (
										<option value={spec.source}>
											{isDatasetSource(spec.source)
												? 'Dataset deleted'
												: spec.source}
										</option>
									) : null}
									{own.length || datasets ? (
										<>
											<optgroup label="App data">{opts(app)}</optgroup>
											{own.length ? (
												<optgroup label="Your data">{opts(own)}</optgroup>
											) : null}
										</>
									) : (
										opts(app)
									)}
									{datasets ? (
										<optgroup label="Your files">
											<option value={IMPORT_DATA}>
												Import data from CSV
											</option>
											<option value={MANAGE_DATA}>Manage your data</option>
										</optgroup>
									) : null}
								</>
							);
						})()}
					</select>
				</label>
				{!isFunction && source?.segments && Object.keys(source.segments).length ? (
					<label className="_rpLabel" style={{ flex: '1 1 160px' }}>
						Which records
						<select
							className="_rpSelect"
							value={spec.segment ?? ''}
							onChange={e =>
								setSpec(s => ({ ...s, segment: e.target.value || undefined }))
							}
						>
							<option value="">All {source.label?.toLowerCase() ?? 'records'}</option>
							{Object.entries(source.segments).map(([k, sg]) => (
								<option key={k} value={k}>
									{sg.label ?? k}
								</option>
							))}
						</select>
					</label>
				) : null}
				<div className="_rpHistory" role="toolbar" aria-label="History">
					<IconButton
						icon="fa-rotate-left"
						label="Undo (Ctrl+Z)"
						disabled={!hist.past.length}
						onClick={undo}
					/>
					<IconButton
						icon="fa-rotate-right"
						label="Redo (Ctrl+Shift+Z)"
						disabled={!hist.future.length}
						onClick={redo}
					/>
				</div>
			</div>

			{isFunction ? (
				<div className="_rpEditorForm" style={{ gridColumn: 'span 2' }}>
					<FunctionParams
						source={source}
						catalog={catalog}
						params={spec.params}
						loadValues={paramLoader}
						onChange={p => setSpec(s => ({ ...s, params: p }), 'params')}
					/>
				</div>
			) : (
				<>
					<div className="_rpFields" aria-label="Fields">
						<input
							className="_rpInput"
							type="search"
							aria-label="Search fields"
							placeholder="Search fields"
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
						{groups.map(([title, list]) =>
							list.length ? (
								<div key={title} className="_rpFieldGroup">
									<div className="_rpMuted">{title}</div>
									{list.map(([n, f]) => (
										<div key={n} style={{ position: 'relative' }}>
											<button
												type="button"
												className="_rpField"
												aria-haspopup="menu"
												aria-expanded={
													menu?.kind === 'field' && menu.field === n
												}
												title="Drag to a shelf, or pick one"
												onPointerDown={e =>
													beginDrag(e, {
														kind: 'field',
														field: n,
														label: fieldLabelOf(n),
													})
												}
												onClick={e => {
													if (justDragged.current) return;
													menuAnchor.current = e.currentTarget;
													setMenu(m =>
														m?.kind === 'field' && m.field === n
															? undefined
															: { kind: 'field', field: n },
													);
												}}
											>
												<Icon name={fieldIcon(f)} />
												{fieldLabelOf(n)}
											</button>
											{menu?.kind === 'field' && menu.field === n ? (
												<Pop
													anchor={menuAnchor.current}
													popRef={menuRef}
													role="menu"
												>
													<div
														className="_rpMuted"
														style={{ padding: '4px 10px' }}
													>
														Add to
													</div>
													{SHELF_ORDER.filter(sh =>
														sh === 'filters'
															? n !== COUNT_FIELD
															: accepts(sh, itemOfField(n, f)),
													).map(sh => (
														<button
															key={sh}
															type="button"
															role="menuitem"
															className="_rpMenuItem"
															onClick={() =>
																drop(
																	{ kind: 'field', field: n },
																	sh,
																)
															}
														>
															{SHELF_LABELS[sh]}
														</button>
													))}
												</Pop>
											) : null}
										</div>
									))}
								</div>
							) : null,
						)}
					</div>
					<div className="_rpEditorForm">
						{SHELF_ORDER.map(shelfRow)}
						{hint ? (
							<div className="_rpMuted _rpError" role="status">
								{hint}
							</div>
						) : null}
						{(spec.derived ?? []).map((d, i) => (
							<DerivedRow
								key={i}
								value={d}
								keys={(spec.measures ?? []).map(m => m.as)}
								keyLabel={keyLabel}
								onChange={v =>
									setSpec(s => ({
										...s,
										derived: v
											? s.derived!.map((e, j) => (j === i ? v : e))
											: s.derived!.filter((_, j) => j !== i),
									}))
								}
							/>
						))}
						{(spec.measures?.length ?? 0) >= 2 && (spec.derived?.length ?? 0) < 2 ? (
							<button
								type="button"
								className="_rpBtn"
								onClick={() =>
									setSpec(s => ({
										...s,
										derived: [
											...(s.derived ?? []),
											{
												as: uniqueAs('ratio', takenAs()),
												ratio: [s.measures![0].as, s.measures![1].as],
											},
										],
									}))
								}
							>
								Add a calculation
							</button>
						) : null}
						<div className="_rpLine">
							<label className="_rpLabel" style={{ flex: 1 }}>
								Sort by
								<select
									className="_rpSelect"
									value={spec.sort?.[0]?.by ?? ''}
									onChange={e =>
										setSpec(s => ({
											...s,
											sort: e.target.value
												? [
														{
															by: e.target.value,
															dir: s.sort?.[0]?.dir ?? 'DESC',
														},
													]
												: undefined,
										}))
									}
								>
									<option value="">Natural order</option>
									{valueKeys.map(k => (
										<option key={k} value={k}>
											{keyLabel(k)}
										</option>
									))}
									{(spec.groupBy ?? []).map(g => (
										<option key={g.as} value={g.as}>
											{fieldLabelOf(g.field)}
										</option>
									))}
								</select>
							</label>
							{spec.sort?.[0] ? (
								<label className="_rpLabel">
									Order
									<select
										className="_rpSelect"
										value={spec.sort[0].dir}
										onChange={e =>
											setSpec(s => ({
												...s,
												sort: [
													{
														by: s.sort![0].by,
														dir: e.target.value as 'ASC' | 'DESC',
													},
												],
											}))
										}
									>
										<option value="DESC">Largest first</option>
										<option value="ASC">Smallest first</option>
									</select>
								</label>
							) : null}
							<label className="_rpLabel">
								Limit
								<input
									className="_rpInput"
									type="number"
									min={1}
									max={500}
									placeholder="All"
									value={spec.limit ?? ''}
									onChange={e =>
										setSpec(
											s => ({
												...s,
												limit: e.target.value
													? Math.max(1, Number(e.target.value))
													: undefined,
											}),
											'limit',
										)
									}
								/>
							</label>
						</div>
						<div className="_rpLine">
							<label className="_rpLabel" style={{ flex: 1 }}>
								Compare with
								<select
									className="_rpSelect"
									value={spec.compare?.to ?? ''}
									title={blocker}
									onChange={e =>
										setSpec(s => {
											const to = e.target.value as CompareTo | '';
											const { compare: _c, ...rest } = s;
											return to ? { ...rest, compare: { to } } : rest;
										})
									}
								>
									<option value="">Nothing</option>
									{(Object.keys(COMPARE_LABELS) as CompareTo[]).map(c => (
										<option key={c} value={c} disabled={!!blocker}>
											{COMPARE_LABELS[c]}
										</option>
									))}
								</select>
							</label>
							<label className="_rpLabel" style={{ flex: 1 }}>
								Auto refresh
								<select
									className="_rpSelect"
									value={refreshMin}
									onChange={e => commit({ refreshMin: Number(e.target.value) })}
								>
									{REFRESH_CHOICES.map(m => (
										<option key={m} value={m}>
											{m ? `Every ${m} min` : 'Off'}
										</option>
									))}
								</select>
							</label>
						</div>
						{blocker && spec.compare ? <div className="_rpMuted">{blocker}</div> : null}
					</div>
				</>
			)}

			<div className="_rpEditorSide">
				{aiSummary && aiSummary.key === JSON.stringify(spec) ? (
					<div className="_rpSummary" role="status">
						{aiSummary.text}
					</div>
				) : null}
				<div className="_rpEditorPreview">
					{check.status !== 'error' && check.spec ? (
						<ReportWidgetView
							transport={transport}
							runFunction={runFunction}
							catalog={catalog}
							spec={check.spec}
							name={name || 'Preview'}
							editable
							onSpecChange={s => setSpec(() => s)}
						/>
					) : (
						<div className="_rpWidget">
							<div className="_rpState _rpMuted">
								{check.status === 'checking'
									? 'Checking'
									: check.status === 'error'
										? 'Fix the report to see a preview'
										: ''}
							</div>
						</div>
					)}
				</div>
				<div className="_rpGroup">
					<div className="_rpGroupTitle">Show as</div>
					<ChartTypePicker
						shape={shape}
						value={spec.view.type}
						onPick={(t: ViewType) =>
							setSpec(s => ({ ...s, view: { ...s.view, type: t } }))
						}
					/>
				</div>
				<details className="_rpGroup">
					<summary className="_rpGroupTitle">Style</summary>
					<StylePanel
						type={spec.view.type}
						style={spec.view.style ?? {}}
						onChange={st =>
							setSpec(
								s => ({
									...s,
									view: {
										...s.view,
										style: Object.keys(st).length ? st : undefined,
									},
								}),
								'style',
							)
						}
						measures={measuresInResult}
					/>
				</details>
			</div>

			<div className="_rpLine" style={{ gridColumn: '1 / -1' }}>
				{check.status === 'error' ? (
					<div className="_rpError" role="alert" style={{ flex: '1 1 100%' }}>
						{errorText(check.error, spec.source)}
						{check.error?.path ? (
							<span className="_rpMuted"> ({check.error.path})</span>
						) : null}
					</div>
				) : null}
				<div style={{ flex: 1 }} />
				<button
					type="button"
					className="_rpBtn"
					onClick={() => (onCancel ? onCancel() : setHist(historyInit(start)))}
				>
					Discard
				</button>
				{extra}
				{onSaveAsNew ? (
					<button
						type="button"
						className="_rpBtn"
						disabled={!canSave}
						onClick={() => doSave(onSaveAsNew)}
					>
						Save as new
					</button>
				) : null}
				<button
					type="button"
					className="_rpBtn _primary"
					disabled={!canSave}
					title={
						!name.trim()
							? 'Give it a name'
							: check.status !== 'ok'
								? 'Fix the report first'
								: undefined
					}
					onClick={() => doSave(onSave)}
				>
					{saveLabel ?? 'Save'}
				</button>
			</div>
			{drag ? (
				<div
					className="_rpDragPill"
					style={{ left: drag.x + 8, top: drag.y + 8 }}
					aria-hidden="true"
				>
					{drag.label}
				</div>
			) : null}
		</div>
	);
}

/** A pill's settings: a measure's function and records, a date's level. */
function PillEditor({
	item,
	field,
	segments,
	onChange,
}: Readonly<{
	item: ShelfItem;
	field?: CatalogField;
	segments?: Record<string, { label?: string }>;
	onChange: (i: ShelfItem) => void;
}>) {
	if (item.kind === 'DATE')
		return (
			<label className="_rpLabel" style={{ padding: '4px 8px' }}>
				By
				<select
					className="_rpSelect"
					value={item.bucket ?? 'MONTH'}
					onChange={e => onChange({ ...item, bucket: e.target.value as Bucket })}
				>
					{BUCKETS.map(b => (
						<option key={b} value={b}>
							{BUCKET_LABELS[b]}
						</option>
					))}
				</select>
			</label>
		);
	if (item.kind !== 'MEASURE')
		return (
			<div className="_rpMuted" style={{ padding: '4px 10px' }}>
				A dimension
			</div>
		);
	const fns =
		item.field === COUNT_FIELD
			? (['COUNT'] as MeasureFn[])
			: (field?.fns ?? MEASURE_FNS.filter(f => f !== 'COUNT' && f !== 'COUNT_DISTINCT'));
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 8px' }}>
			{fns.length > 1 ? (
				<label className="_rpLabel">
					Function
					<select
						className="_rpSelect"
						value={item.fn ?? fns[0]}
						onChange={e =>
							onChange({ ...item, fn: e.target.value as MeasureFn, as: undefined })
						}
					>
						{fns.map(fn => (
							<option key={fn} value={fn}>
								{MEASURE_FN_LABELS[fn]}
							</option>
						))}
					</select>
				</label>
			) : null}
			{segments && Object.keys(segments).length ? (
				<label className="_rpLabel">
					Records
					<select
						className="_rpSelect"
						value={item.segment ?? ''}
						onChange={e => {
							const { segment: _s, ...rest } = item;
							onChange(
								e.target.value
									? { ...rest, segment: e.target.value, as: undefined }
									: { ...rest, as: undefined },
							);
						}}
					>
						<option value="">Of every record</option>
						{Object.entries(segments).map(([k, sg]) => (
							<option key={k} value={k}>
								Only {sg.label ?? k}
							</option>
						))}
					</select>
				</label>
			) : null}
		</div>
	);
}

function DerivedRow({
	value,
	keys,
	keyLabel,
	onChange,
}: Readonly<{
	value: ReportDerived;
	keys: string[];
	keyLabel: (k: string) => string;
	onChange: (v: ReportDerived | undefined) => void;
}>) {
	const kind = value.ratio ? 'ratio' : value.difference ? 'difference' : 'percent';
	const pair = (value.ratio ?? value.difference ?? value.percent ?? [keys[0], keys[1]]) as [
		string,
		string,
	];
	const set = (k: string, p: [string, string]) =>
		onChange({ as: value.as, [k]: p } as ReportDerived);
	const pick = (v: string, on: (v: string) => void, label: string) => (
		<select
			className="_rpSelect"
			aria-label={label}
			value={v}
			onChange={e => on(e.target.value)}
		>
			{keys.map(k => (
				<option key={k} value={k}>
					{keyLabel(k)}
				</option>
			))}
		</select>
	);
	return (
		<div className="_rpLine">
			<select
				className="_rpSelect"
				aria-label="Calculation"
				value={kind}
				onChange={e => set(e.target.value, pair)}
			>
				<option value="ratio">Ratio</option>
				<option value="percent">Percent</option>
				<option value="difference">Difference</option>
			</select>
			{pick(pair[0], v => set(kind, [v, pair[1]]), 'First')}
			{pick(pair[1], v => set(kind, [pair[0], v]), 'Second')}
			<IconButton
				icon="fa-xmark"
				label="Remove calculation"
				onClick={() => onChange(undefined)}
			/>
		</div>
	);
}

function FilterRow({
	value,
	fields,
	loadValues,
	onChange,
}: Readonly<{
	value: ReportFilter;
	fields: Array<[string, CatalogField]>;
	loadValues: (field: string) => () => Promise<PickOption[]>;
	onChange: (v: ReportFilter | undefined) => void;
}>) {
	const isPeriod = !!value.period;
	const choices = fields.filter(([, f]) =>
		isPeriod ? f.kind === 'DATE' : f.kind !== 'DATE' && !f.pii,
	);
	const field = fields.find(([n]) => n === value.field)?.[1];
	const loader = useMemo(() => loadValues(value.field), [loadValues, value.field]);
	return (
		<div className="_rpLine">
			<select
				className="_rpSelect"
				aria-label="Filter field"
				value={value.field}
				onChange={e =>
					onChange(
						isPeriod
							? { ...value, field: e.target.value }
							: { field: e.target.value, op: value.op ?? 'IN', values: [] },
					)
				}
			>
				{choices.map(([n, f]) => (
					<option key={n} value={n}>
						{f.label ?? n}
					</option>
				))}
			</select>
			{isPeriod ? (
				<>
					<select
						className="_rpSelect"
						aria-label="Period"
						value={value.period}
						onChange={e => {
							const p = e.target.value as Period;
							onChange(
								p === 'CUSTOM'
									? {
											field: value.field,
											period: p,
											from: value.from,
											to: value.to,
										}
									: { field: value.field, period: p },
							);
						}}
					>
						{PERIODS.map(p => (
							<option key={p} value={p}>
								{PERIOD_LABELS[p]}
							</option>
						))}
					</select>
					{value.period === 'CUSTOM' ? (
						<>
							<input
								className="_rpInput"
								type="date"
								aria-label="From"
								value={value.from ?? ''}
								onChange={e => onChange({ ...value, from: e.target.value })}
							/>
							<input
								className="_rpInput"
								type="date"
								aria-label="To"
								value={value.to ?? ''}
								onChange={e => onChange({ ...value, to: e.target.value })}
							/>
						</>
					) : null}
				</>
			) : (
				<>
					<select
						className="_rpSelect"
						aria-label="Condition"
						value={value.op ?? 'IN'}
						onChange={e => {
							const op = e.target.value as FilterOp;
							onChange(
								NO_VALUE_OPS.has(op)
									? { field: value.field, op }
									: { ...value, op, values: value.values ?? [] },
							);
						}}
					>
						{FILTER_OPS.filter(
							op =>
								field?.kind === 'MEASURE' ||
								!['GT', 'GTE', 'LT', 'LTE', 'BETWEEN'].includes(op),
						).map(op => (
							<option key={op} value={op}>
								{FILTER_OP_LABELS[op]}
							</option>
						))}
					</select>
					{NO_VALUE_OPS.has(value.op ?? 'IN') ? null : value.op === 'IN' ||
					  value.op === 'NOT_IN' ||
					  value.op === 'EQ' ||
					  value.op === 'NE' ? (
						<MultiPick
							label=""
							values={value.values ?? []}
							placeholder="Pick values"
							loadOptions={loader}
							onChange={v =>
								onChange({
									...value,
									values:
										value.op === 'EQ' || value.op === 'NE' ? v.slice(-1) : v,
								})
							}
						/>
					) : (
						<input
							className="_rpInput"
							aria-label="Values"
							placeholder={value.op === 'BETWEEN' ? 'low, high' : 'value'}
							defaultValue={(value.values ?? []).join(', ')}
							onBlur={e =>
								onChange({
									...value,
									values: e.target.value
										.split(',')
										.map(v => v.trim())
										.filter(Boolean)
										.map(v => (Number.isFinite(Number(v)) ? Number(v) : v)),
								})
							}
						/>
					)}
				</>
			)}
			<IconButton icon="fa-xmark" label="Remove filter" onClick={() => onChange(undefined)} />
		</div>
	);
}
