import React, { useCallback, useMemo, useRef, useState } from 'react';
import { startPointerDrag } from '../../../functions/usePointerDrag';
import { moveInOrder, moveItem, resizeItem, sortLayout } from '../dashboardLayout';
import {
	addDefault,
	addToDashboard,
	addWidget,
	copyWidgetTo,
	defaultsNotInLibrary,
	deleteWidget,
	DocResult,
	duplicateWidget,
	editWidget,
	keepNew,
	onDashboard,
	removeFromDashboard,
	resetDoc,
	resolveWidget,
	withLayout,
} from '../dashboardModel';
import { persistEntry, readyDoc, updateEntry, useDashboardDoc } from '../dashboardStore';
import { catalogForGroup, GroupInfo } from '../groupsModel';
import { useReportGroups } from '../groupsStore';
import {
	defaultPdfFunction,
	errorText,
	namespaceOf,
	ReportTransport,
	runQuickOptions,
	runReport,
} from '../reportApi';
import {
	checkImport,
	downloadText,
	exportFileName,
	exportPdf,
	ImportVerdict,
	importIntoDoc,
	parseReportFile,
	PdfItem,
	pdfDocument,
	readFileText,
	ReportFile,
	reportFile,
} from '../reportExport';
import { labelOf } from '../reportFormat';
import { fieldLabel, valuesSpec } from '../reportSpecUtil';
import {
	QuickPicks,
	pruneQuick,
	mergeQuickOptions,
	quickDependents,
	quickOptionsFunction,
	quickOptionsKey,
	quickValuesSpec,
} from '../quickCascade';
import {
	DashboardDoc,
	DashboardFilters,
	DASHBOARD_CAPS,
	LayoutItem,
	Period,
	PERIOD_LABELS,
	PERIODS,
	ReportCatalog,
	SessionFilter,
	VIEW_LABELS,
} from '../reportTypes';
import { Icon, MultiPick, PickOption, useDismiss } from './common';
import { useCatalog, useWidth } from './hooks';
import { EditorValue, ReportEditorView } from './ReportEditorView';
import { ReportWidgetView, WidgetExportApi } from './ReportWidgetView';
import { Dialog, Pop } from './portal';
import { ListAsk, ReportCards } from './ReportCards';
import { aiUrl } from '../reportAi';

/**
 * A per-user dashboard: a 12 column tile grid (drag to move, snap resize, both on the shared
 * pointer drag of functions/usePointerDrag.ts), one column with move up / down on a phone, a
 * filter bar (period + the catalog's quick filters, for this session), and the saved widget
 * library. The document lives in personalization (`reports_<name>`, dashboardStore.ts).
 */

export const ROW_PX = 72;
export const GAP_PX = 12;
export const PHONE_MAX_PX = 640;

export interface DashboardViewProps {
	transport?: ReportTransport;
	catalogFunction: string;
	runFunction: string;
	name: string;
	editable?: boolean;
	mode?: 'dashboard' | 'library';
	showFilters?: boolean;
	title?: string;
	/** ReportLibrary: library only, no switch to the grid. */
	lockMode?: boolean;
	/** `<ns>.reportPdf`; default from the run function's namespace. */
	pdfFunction?: string;
	/** The app for widget files; default the run function's namespace. */
	appNamespace?: string;
	/**
	 * New report and Edit open the page's builder (a ReportEditor on the same page) instead of
	 * this view's own dialog (reportsPage.ts).
	 */
	onOpenBuilder?: (req: { id?: string; value?: EditorValue; prompt?: string }) => void;
	/** Library: "Your data" (CSV files) in the Data menu. */
	onYourData?: () => void;
}

/** Copy / Move to group: the widget and the choice so far. */
interface TransferState {
	id: string;
	name: string;
	move: boolean;
	target?: string;
	busy?: boolean;
	error?: string;
}

interface ImportState {
	file: ReportFile;
	verdicts?: ImportVerdict[];
	toDashboard: boolean;
}

interface DragState {
	id: string;
	kind: 'move' | 'resize';
	dx: number;
	dy: number;
	preview: LayoutItem[];
}

const HUGE = { width: 1e7, height: 1e7 };

export function DashboardView(props: Readonly<DashboardViewProps>) {
	const { transport, runFunction, editable } = props;
	const cat = useCatalog(transport, props.catalogFunction);
	// This group's view of the catalog: only the defaults it seeds (CONTRACT 9).
	const catalog = catalogForGroup(cat.catalog, props.name);
	const docState = useDashboardDoc(transport, props.name, catalog);
	const doc = docState.doc;
	const [mode, setMode] = useState<'dashboard' | 'library'>(props.mode ?? 'dashboard');
	const [filters, setFilters] = useState<DashboardFilters>({});
	const [editing, setEditing] = useState<
		{ id?: string; value?: EditorValue; prompt?: string } | undefined
	>(undefined);
	const [dataMenu, setDataMenu] = useState(false);
	const dataBtn = useRef<HTMLButtonElement>(null);
	const dataMenuRef = useDismiss(dataMenu, () => setDataMenu(false));
	const openNew = (prompt?: string) =>
		props.onOpenBuilder ? props.onOpenBuilder({ prompt }) : setEditing({ prompt });
	const openEdit = (id: string, value: EditorValue) =>
		props.onOpenBuilder ? props.onOpenBuilder({ id, value }) : setEditing({ id, value });
	const [notice, setNotice] = useState<string>('');
	const [confirmReset, setConfirmReset] = useState(false);
	const [drag, setDrag] = useState<DragState | undefined>(undefined);
	const [cross, setCross] = useState<SessionFilter[]>([]);
	const [importing, setImporting] = useState<ImportState | undefined>(undefined);
	const [busy, setBusy] = useState(false);
	const [transfer, setTransfer] = useState<TransferState | undefined>(undefined);
	/** A widget waiting for the user to confirm its delete (PLAT-1704). */
	const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | undefined>(
		undefined,
	);
	const exportApis = useRef(new Map<string, WidgetExportApi>());
	const exportRefs = useRef(new Map<string, (api: WidgetExportApi | null) => void>());
	const fileRef = useRef<HTMLInputElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const app = props.appNamespace || namespaceOf(runFunction);
	const pdfFunction = props.pdfFunction || defaultPdfFunction(props.appNamespace, runFunction);
	const groups = useReportGroups(transport, app, cat.catalog);
	/** The groups a widget can go to from here. */
	const otherGroups: GroupInfo[] =
		groups.status === 'ready' ? groups.all.filter(g => g.id !== props.name) : [];
	/** One stable callback per widget id, so a widget registers its export part once. */
	const exportRefFor = (id: string) => {
		let f = exportRefs.current.get(id);
		if (!f) {
			f = (api: WidgetExportApi | null) => {
				if (api) exportApis.current.set(id, api);
				else exportApis.current.delete(id);
			};
			exportRefs.current.set(id, f);
		}
		return f;
	};
	const addCross = useCallback((fs: SessionFilter[]) => {
		// One cross filter per field: a new click on the same field replaces it.
		setCross(c => [...c.filter(e => !fs.some(f => f.field === e.field)), ...fs]);
	}, []);
	const width = useWidth(rootRef);
	const phone = width > 0 && width < PHONE_MAX_PX;

	const apply = useCallback(
		(fn: (d: DashboardDoc) => DocResult | DashboardDoc) => {
			let error = '';
			docState.update(d => {
				const r = fn(d);
				if ('ok' in r) {
					if (!r.ok) {
						error = r.error;
						return d;
					}
					return r.doc;
				}
				return r;
			});
			setNotice(error);
		},
		[docState],
	);

	// A quick filter's choices: the values that exist together with what is picked in the
	// filters it depends on (catalog.quickFilterDepends, ADZ-2164).
	const loadValues = useCallback(
		async (field: string, quick?: QuickPicks): Promise<PickOption[]> => {
			const vs = quickValuesSpec(catalog, field, quick);
			if (!vs || !transport) return [];
			// One request: the values with data plus every connected asset (no data yet ones flagged).
			const optionsFn = quickOptionsFunction(catalog, field);
			if (optionsFn) {
				const a = await runQuickOptions(transport, optionsFn, field, vs, quick ?? {});
				return mergeQuickOptions(a.rows, a.connected);
			}
			const r = await runReport(transport, runFunction, vs);
			if (!r.ok) throw new Error(errorText(r.error));
			return r.rows.map(row => ({ value: row.k, label: labelOf(row, 'k') }));
		},
		[catalog, transport, runFunction],
	);
	const loaders = useMemo(
		() =>
			new Map(
				(catalog?.quickFilters ?? []).map(f => [f, () => loadValues(f, filters.quick)]),
			),
		[catalog, loadValues, filters.quick],
	);
	// Picking a quick filter drops the picks of the filters that depend on it which no longer
	// fit (a Meta ad account after the platform became Google Ads), so no conflicting pair stays.
	const quickSeq = useRef(0);
	const setQuick = useCallback(
		(field: string, v: any[]) => {
			const next: QuickPicks = { ...(filters.quick ?? {}), [field]: v };
			setFilters(s => ({ ...s, quick: { ...(s.quick ?? {}), [field]: v } }));
			setNotice(n => (n.startsWith('Cleared') ? '' : n));
			if (!quickDependents(catalog, field).some(d => next[d]?.length)) return;
			const seq = ++quickSeq.current;
			pruneQuick(catalog, next, field, loadValues).then(({ quick, dropped }) => {
				if (seq !== quickSeq.current || !Object.keys(dropped).length) return;
				setFilters(s => ({
					...s,
					quick: Object.fromEntries(
						Object.entries(s.quick ?? {}).map(([f, vals]) => [
							f,
							dropped[f]
								? vals.filter(
										x => !dropped[f].some((d: any) => String(d) === String(x)),
									)
								: vals,
						]),
					),
				}));
				setNotice(
					`Cleared ${Object.keys(dropped)
						.map(f => fieldLabel(catalog, f).toLowerCase())
						.join(' and ')} that did not match`,
				);
			});
		},
		[catalog, filters.quick, loadValues],
	);

	const dashFilters = useMemo<DashboardFilters | undefined>(() => {
		const quick = Object.fromEntries(
			Object.entries(filters.quick ?? {}).filter(([, v]) => v?.length),
		);
		if (!filters.period && !Object.keys(quick).length) return undefined;
		if (filters.period === 'CUSTOM' && (!filters.from || !filters.to))
			return Object.keys(quick).length ? { quick } : undefined;
		return { ...filters, quick };
	}, [filters]);

	if (cat.error || docState.status === 'error')
		return (
			<div className="_rpDash" ref={rootRef}>
				<div className="_rpWidget">
					<div className="_rpState" role="alert">
						<span className="_rpError">{cat.error ?? docState.error}</span>
						<button
							type="button"
							className="_rpBtn"
							onClick={() => (cat.error ? cat.retry() : docState.retry())}
						>
							Try again
						</button>
					</div>
				</div>
			</div>
		);

	if (!catalog || !doc)
		return (
			<div className="_rpDash" ref={rootRef} aria-busy="true">
				<div className="_rpGrid">
					{[0, 1, 2].map(i => (
						<div
							key={i}
							className="_rpTile"
							style={{ gridColumn: `${i * 4 + 1} / span 4`, gridRow: '1 / span 3' }}
						>
							<div className="_rpWidget">
								<div className="_rpState">
									<div className="_rpSkeleton" style={{ width: '100%' }} />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);

	const layout = drag?.preview ?? doc.layout;
	const cell = { w: (width - GAP_PX * 11) / 12 + GAP_PX, h: ROW_PX + GAP_PX };

	const beginDrag = (
		id: string,
		kind: 'move' | 'resize',
		el: HTMLElement,
		e: React.PointerEvent,
	) => {
		if (!editable || phone || e.button !== 0) return;
		const item = doc.layout.find(l => l.id === id);
		if (!item) return;
		const rect = el.getBoundingClientRect();
		let preview = doc.layout;
		startPointerDrag(el, e.nativeEvent, {
			inset: -1e6,
			viewport: () => HUGE,
			onMove: o => {
				const dx = HUGE.width - o.right - rect.width - rect.left;
				const dy = HUGE.height - o.bottom - rect.height - rect.top;
				preview =
					kind === 'move'
						? moveItem(
								doc.layout,
								id,
								item.x + Math.round(dx / cell.w),
								item.y + Math.round(dy / cell.h),
							)
						: resizeItem(
								doc.layout,
								id,
								item.w + Math.round(dx / cell.w),
								item.h + Math.round(dy / cell.h),
							);
				setDrag({ id, kind, dx, dy, preview });
			},
			onEnd: () => {
				setDrag(undefined);
				apply(d => withLayout(d, preview));
			},
		});
	};

	const widgetFor = (item: LayoutItem, footer?: React.ReactNode) => {
		const r = resolveWidget(doc, item.id, catalog);
		if (!r) return null;
		return (
			<ReportWidgetView
				transport={transport}
				runFunction={runFunction}
				catalog={catalog}
				spec={r.spec}
				name={r.name}
				refreshMin={r.refreshMin}
				editable={editable}
				dashboard={dashFilters}
				compact={item.w <= 3 || item.h <= 2}
				isNew={item.isNew}
				defaultId={r.defaultId}
				cross={cross.length ? cross : undefined}
				onCrossFilter={addCross}
				pdfFunction={pdfFunction}
				appNamespace={app}
				exportRef={exportRefFor(item.id)}
				importError={doc.widgets[item.id]?.importError}
				onKeep={editable ? () => apply(d => keepNew(d, item.id)) : undefined}
				onRemoveNew={
					editable ? () => apply(d => removeFromDashboard(d, item.id)) : undefined
				}
				onEdit={
					editable
						? () =>
								setEditing({
									id: item.id,
									value: { name: r.name, spec: r.spec, refreshMin: r.refreshMin },
								})
						: undefined
				}
				onDuplicate={
					editable ? () => apply(d => duplicateWidget(d, item.id, catalog)) : undefined
				}
				onCopyToGroup={
					editable && otherGroups.length
						? () => setTransfer({ id: item.id, name: r.name, move: false })
						: undefined
				}
				onMoveToGroup={
					editable && otherGroups.length
						? () => setTransfer({ id: item.id, name: r.name, move: true })
						: undefined
				}
				onRemove={editable ? () => apply(d => removeFromDashboard(d, item.id)) : undefined}
				onDelete={
					editable ? () => setConfirmDelete({ id: item.id, name: r.name }) : undefined
				}
				onSpecChange={
					editable
						? spec => apply(d => editWidget(d, item.id, { spec }, catalog))
						: undefined
				}
				onRefreshMinChange={
					editable
						? m => apply(d => editWidget(d, item.id, { refreshMin: m }, catalog))
						: undefined
				}
				onHeadPointerDown={
					editable && !phone
						? e =>
								beginDrag(
									item.id,
									'move',
									(e.currentTarget as HTMLElement).closest(
										'._rpTile',
									) as HTMLElement,
									e,
								)
						: undefined
				}
				footer={footer}
			/>
		);
	};

	const saveEditor = async (v: EditorValue) => {
		const id = editing?.id;
		if (id)
			apply(d =>
				editWidget(
					d,
					id,
					{ name: v.name, spec: v.spec, refreshMin: v.refreshMin },
					catalog,
				),
			);
		else
			apply(d =>
				addWidget(
					d,
					{ name: v.name, spec: v.spec, refreshMin: v.refreshMin },
					{ toDashboard: mode === 'dashboard' },
				),
			);
		setEditing(undefined);
	};

	const ordered = sortLayout(layout);

	const runTransfer = async () => {
		const t = transfer;
		const target = otherGroups.find(g => g.id === t?.target);
		if (!t || !target || !transport) return;
		setTransfer({ ...t, busy: true, error: undefined });
		let error = '';
		let placed: 'dashboard' | 'library' | undefined;
		try {
			const entry = await readyDoc(
				transport,
				target.id,
				catalogForGroup(cat.catalog, target.id),
			);
			const undo = { doc: entry.doc, wasDirty: entry.dirty };
			updateEntry(entry, d => {
				const r = copyWidgetTo(doc, t.id, catalog, d);
				if (!r.ok) {
					error = r.error;
					return d;
				}
				placed = r.placed;
				return r.doc;
			});
			if (!error && !placed) error = 'That group could not be changed.';
			// Copied or Moved only once the server has the other group's document.
			if (!error) {
				const stored = await persistEntry(entry, undo);
				if (!stored.ok)
					error = `Not saved: check your connection and try again${
						stored.error ? ` (${stored.error})` : ''
					}.`;
			}
		} catch (e: any) {
			error = e?.message ?? 'That group could not be loaded.';
		}
		if (error) return setTransfer({ ...t, busy: false, error });
		if (t.move) apply(d => deleteWidget(d, t.id));
		setTransfer(undefined);
		setNotice(
			`${t.move ? 'Moved' : 'Copied'} "${t.name}" to ${target.label}${
				placed === 'library' ? ' (in its library: its dashboard is full)' : ''
			}.`,
		);
	};

	const exportDashboardPdf = async () => {
		if (!transport) return;
		const items = ordered
			.map(l => exportApis.current.get(l.id)?.pdfItem())
			.filter((i): i is PdfItem => !!i);
		const title = props.title || 'Dashboard';
		const d = pdfDocument(title, items, {
			locale: catalog.locale,
			subtitle: [
				filters.period ? PERIOD_LABELS[filters.period] : '',
				...cross.map(f => f.label ?? f.field),
			]
				.filter(Boolean)
				.join(' · '),
		});
		if (!d.ok) return setNotice(d.error);
		setBusy(true);
		const err = await exportPdf(
			transport,
			pdfFunction,
			d.document,
			exportFileName(title, 'pdf'),
		);
		setBusy(false);
		setNotice(err);
	};

	const exportDashboardFile = () => {
		const ws = ordered
			.map(l => resolveWidget(doc, l.id, catalog))
			.filter((r): r is NonNullable<typeof r> => !!r)
			.map(r => ({ id: r.id, name: r.name, spec: r.spec, refreshMin: r.refreshMin }));
		const file = reportFile(app, ws, doc.layout);
		downloadText(
			JSON.stringify(file, null, 2),
			exportFileName(props.title || 'Dashboard', 'json'),
			'application/json',
		);
	};

	const pickFile = async (f: File | undefined) => {
		if (!f || !transport) return;
		setNotice('');
		if (f.size > 2 * 1024 * 1024) return setNotice('That file is too big for a reports file.');
		const parsed = parseReportFile(await readFileText(f), app);
		if (!parsed.ok) return setNotice(parsed.error);
		const state: ImportState = { file: parsed.file, toDashboard: mode === 'dashboard' };
		setImporting(state);
		const verdicts = await checkImport(
			parsed.file,
			spec => runReport(transport, runFunction, spec, { dryRun: true }),
			errorText,
		);
		setImporting(s => (s && s.file === parsed.file ? { ...s, verdicts } : s));
	};

	const finishImport = () => {
		const im = importing;
		if (!im?.verdicts) return;
		let done = 0;
		let left = 0;
		apply(d => {
			const r = importIntoDoc(d, im.file, im.verdicts!, { toDashboard: im.toDashboard });
			if (r.ok) {
				done = r.imported ?? 0;
				left = r.left ?? 0;
			}
			return r;
		});
		setImporting(undefined);
		if (done)
			setNotice(
				`Imported ${done} widget${done === 1 ? '' : 's'}${left ? `; ${left} did not fit` : ''}.`,
			);
	};

	return (
		<div className="_rpDash" ref={rootRef}>
			{mode === 'library' ? (
				<>
					<div className="_rpBar _rpListHead">
						{props.title ? (
							<div className="_rpTitle _rpPageTitle" title={props.title}>
								{props.title}
							</div>
						) : null}
						<div className="_rpSpacer" />
						{editable ? (
							<>
								<input
									ref={fileRef}
									type="file"
									accept=".json,application/json"
									style={{ display: 'none' }}
									onChange={e => {
										const f = e.target.files?.[0];
										e.target.value = '';
										void pickFile(f);
									}}
								/>
								<button
									ref={dataBtn}
									type="button"
									className="_rpBtn"
									aria-haspopup="menu"
									aria-expanded={dataMenu}
									onClick={() => setDataMenu(v => !v)}
								>
									<Icon name="fa-database" /> Data
								</button>
								{dataMenu ? (
									<Pop
										anchor={dataBtn.current}
										popRef={dataMenuRef}
										align="right"
										role="menu"
									>
										{props.onYourData ? (
											<button
												type="button"
												role="menuitem"
												className="_rpMenuItem"
												onClick={() => {
													setDataMenu(false);
													props.onYourData!();
												}}
											>
												<Icon name="fa-file-csv" /> Your data (CSV files)
											</button>
										) : null}
										<button
											type="button"
											role="menuitem"
											className="_rpMenuItem"
											onClick={() => {
												setDataMenu(false);
												fileRef.current?.click();
											}}
										>
											<Icon name="fa-file-import" /> Import a report file
										</button>
									</Pop>
								) : null}
								{props.lockMode ? null : (
									<button
										type="button"
										className="_rpBtn"
										onClick={() => setMode('dashboard')}
									>
										<Icon name="fa-table-cells-large" /> Dashboard
									</button>
								)}
								<button
									type="button"
									className="_rpBtn _primary"
									onClick={() => openNew()}
								>
									<Icon name="fa-plus" /> New report
								</button>
							</>
						) : null}
					</div>
					{editable && cat.catalog?.ai ? (
						<ListAsk onAsk={p => openNew(p)} example={cat.catalog?.aiExample} />
					) : null}
				</>
			) : (
				<div className="_rpBar">
					{props.title ? (
						<div className="_rpTitle _rpPageTitle" title={props.title}>
							{props.title}
						</div>
					) : null}
					{props.showFilters !== false && mode === 'dashboard' ? (
						<>
							<label className="_rpLabel">
								Period
								<select
									className="_rpSelect"
									value={filters.period ?? ''}
									onChange={e =>
										setFilters(f => ({
											...f,
											period: (e.target.value || undefined) as
												Period | undefined,
										}))
									}
								>
									<option value="">As each widget is set</option>
									{PERIODS.map(p => (
										<option key={p} value={p}>
											{PERIOD_LABELS[p]}
										</option>
									))}
								</select>
							</label>
							{filters.period === 'CUSTOM' ? (
								<>
									<label className="_rpLabel">
										From
										<input
											className="_rpInput"
											type="date"
											value={filters.from ?? ''}
											onChange={e =>
												setFilters(f => ({ ...f, from: e.target.value }))
											}
										/>
									</label>
									<label className="_rpLabel">
										To
										<input
											className="_rpInput"
											type="date"
											value={filters.to ?? ''}
											onChange={e =>
												setFilters(f => ({ ...f, to: e.target.value }))
											}
										/>
									</label>
								</>
							) : null}
							{(catalog.quickFilters ?? []).map(f =>
								valuesSpec(catalog, f) ? (
									<MultiPick
										key={f}
										label={fieldLabel(catalog, f)}
										values={filters.quick?.[f] ?? []}
										loadOptions={loaders.get(f)!}
										optionsKey={quickOptionsKey(catalog, f, filters.quick)}
										onChange={v => setQuick(f, v)}
									/>
								) : null,
							)}
						</>
					) : null}
					<div className="_rpSpacer" />
					{mode === 'dashboard' && ordered.length ? (
						<>
							<button
								type="button"
								className="_rpBtn"
								disabled={busy || !pdfFunction}
								onClick={exportDashboardPdf}
							>
								<Icon name={busy ? 'fa-spinner fa-spin' : 'fa-file-pdf'} /> Export
								PDF
							</button>
							<button type="button" className="_rpBtn" onClick={exportDashboardFile}>
								<Icon name="fa-file-export" /> Export file
							</button>
						</>
					) : null}
					{editable ? (
						<>
							<input
								ref={fileRef}
								type="file"
								accept=".json,application/json"
								style={{ display: 'none' }}
								onChange={e => {
									const f = e.target.files?.[0];
									e.target.value = '';
									void pickFile(f);
								}}
							/>
							<button
								type="button"
								className="_rpBtn"
								onClick={() => fileRef.current?.click()}
							>
								<Icon name="fa-file-import" /> Import file
							</button>
						</>
					) : null}
					{editable ? (
						<>
							<button type="button" className="_rpBtn" onClick={() => openNew()}>
								<Icon name="fa-plus" /> Add widget
							</button>
							{props.lockMode ? null : (
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										setMode(m => (m === 'dashboard' ? 'library' : 'dashboard'))
									}
								>
									<Icon
										name={
											mode === 'dashboard'
												? 'fa-book'
												: 'fa-table-cells-large'
										}
									/>
									{mode === 'dashboard' ? 'Library' : 'Dashboard'}
								</button>
							)}
							{mode === 'dashboard' ? (
								confirmReset ? (
									<span className="_rpRow" style={{ alignItems: 'center' }}>
										<span className="_rpMuted">Reset to the app defaults?</span>
										<button
											type="button"
											className="_rpBtn _primary"
											onClick={() => {
												setConfirmReset(false);
												apply(d => resetDoc(d, catalog));
												// The dashboard is back to how it first opened: the
												// widgets AND the session filters (period, quick picks,
												// chart clicks). apply() has already cleared any notice.
												setFilters({});
												setCross([]);
											}}
										>
											Reset
										</button>
										<button
											type="button"
											className="_rpBtn"
											onClick={() => setConfirmReset(false)}
										>
											Cancel
										</button>
									</span>
								) : (
									<button
										type="button"
										className="_rpBtn"
										onClick={() => setConfirmReset(true)}
									>
										<Icon name="fa-arrow-rotate-left" /> Reset to defaults
									</button>
								)
							) : null}
						</>
					) : null}
				</div>
			)}
			{notice ? (
				<div
					className={
						/^(Imported|Copied|Moved|Cleared)/.test(notice) ? '_rpMuted' : '_rpError'
					}
					role="alert"
				>
					{notice}
				</div>
			) : null}
			{cross.length && mode === 'dashboard' ? (
				<div className="_rpRow" style={{ alignItems: 'center' }}>
					<span className="_rpMuted">Filtered by a click:</span>
					{cross.map((f, i) => (
						<span key={i} className="_rpChip">
							{f.label ?? f.field}
							<button
								type="button"
								aria-label={`Remove filter ${f.label ?? f.field}`}
								onClick={() => setCross(c => c.filter((_, j) => j !== i))}
							>
								<Icon name="fa-xmark" />
							</button>
						</span>
					))}
					<button type="button" className="_rpLinkBtn" onClick={() => setCross([])}>
						Clear
					</button>
				</div>
			) : null}

			{mode === 'library' ? (
				<ReportCards
					doc={doc}
					catalog={catalog}
					editable={editable}
					apply={apply}
					transport={transport}
					runFunction={runFunction}
					onEdit={openEdit}
					onDelete={(id, name) => setConfirmDelete({ id, name })}
					onTransfer={
						editable && otherGroups.length
							? (id, name) => setTransfer({ id, name, move: false })
							: undefined
					}
				/>
			) : phone ? (
				<div className="_rpColumn">
					{ordered.map((item, i) => (
						<div
							key={item.id}
							className="_rpTile"
							style={{
								['--rp-tile-h' as any]: `${Math.max(item.h * ROW_PX, 180)}px`,
							}}
						>
							{widgetFor(
								item,
								editable ? (
									<div className="_rpMove">
										<button
											type="button"
											className="_rpIconBtn"
											aria-label="Move up"
											title="Move up"
											disabled={i === 0}
											onClick={() =>
												apply(d =>
													withLayout(
														d,
														moveInOrder(d.layout, item.id, -1),
													),
												)
											}
										>
											<Icon name="fa-arrow-up" />
										</button>
										<button
											type="button"
											className="_rpIconBtn"
											aria-label="Move down"
											title="Move down"
											disabled={i === ordered.length - 1}
											onClick={() =>
												apply(d =>
													withLayout(
														d,
														moveInOrder(d.layout, item.id, 1),
													),
												)
											}
										>
											<Icon name="fa-arrow-down" />
										</button>
									</div>
								) : undefined,
							)}
						</div>
					))}
					{!ordered.length ? (
						<EmptyState
							editable={editable}
							onAdd={() => setEditing({})}
							onLibrary={() => setMode('library')}
						/>
					) : null}
				</div>
			) : (
				<div
					className="_rpGrid"
					style={{
						['--rp-row' as any]: `${ROW_PX}px`,
						['--rp-gap' as any]: `${GAP_PX}px`,
					}}
				>
					{ordered.map(item => {
						const dragging = drag?.id === item.id;
						const original = doc.layout.find(l => l.id === item.id) ?? item;
						const at = dragging && drag!.kind === 'move' ? original : item;
						return (
							<React.Fragment key={item.id}>
								{dragging && drag!.kind === 'move' ? (
									<div
										className="_rpGhost"
										style={{
											gridColumn: `${item.x + 1} / span ${item.w}`,
											gridRow: `${item.y + 1} / span ${item.h}`,
										}}
									/>
								) : null}
								<div
									className={`_rpTile${dragging ? ' _dragging' : ''}`}
									style={{
										gridColumn: `${at.x + 1} / span ${at.w}`,
										gridRow: `${at.y + 1} / span ${at.h}`,
										transform:
											dragging && drag!.kind === 'move'
												? `translate(${drag!.dx}px, ${drag!.dy}px)`
												: undefined,
									}}
								>
									{widgetFor(item)}
									{editable ? (
										<div
											className="_rpResize"
											role="separator"
											aria-label="Resize"
											title="Drag to resize"
											onPointerDown={e => {
												e.stopPropagation();
												beginDrag(item.id, 'resize', e.currentTarget, e);
											}}
										/>
									) : null}
								</div>
							</React.Fragment>
						);
					})}
					{!ordered.length ? (
						<div style={{ gridColumn: '1 / span 12' }}>
							<EmptyState
								editable={editable}
								onAdd={() => setEditing({})}
								onLibrary={() => setMode('library')}
							/>
						</div>
					) : null}
				</div>
			)}

			{importing ? (
				<Dialog kind="modal" label="Import widgets" onClose={() => setImporting(undefined)}>
					<div className="_rpDrawerHead">
						<span>Import widgets</span>
						<button
							type="button"
							className="_rpIconBtn"
							aria-label="Close"
							title="Close"
							onClick={() => setImporting(undefined)}
						>
							<Icon name="fa-xmark" />
						</button>
					</div>
					<div className="_rpDrawerBody">
						{!importing.verdicts ? (
							<div className="_rpMuted" aria-busy="true">
								Checking each widget against your data
							</div>
						) : (
							importing.verdicts.map(v => (
								<div key={v.id} className="_rpLibRow">
									<div className="_rpLibName">
										<span>{v.name}</span>
										<span className={v.ok ? '_rpMuted' : '_rpMuted _rpError'}>
											{v.ok ? 'Ready' : `Kept, not available: ${v.reason}`}
										</span>
									</div>
									<Icon name={v.ok ? 'fa-check' : 'fa-triangle-exclamation'} />
								</div>
							))
						)}
					</div>
					<div className="_rpDrawerFoot" style={{ alignItems: 'center' }}>
						<label className="_rpCheck" style={{ flex: 1 }}>
							<input
								type="checkbox"
								checked={importing.toDashboard}
								onChange={e =>
									setImporting(s =>
										s ? { ...s, toDashboard: e.target.checked } : s,
									)
								}
							/>
							Also add to the dashboard
						</label>
						<button
							type="button"
							className="_rpBtn"
							onClick={() => setImporting(undefined)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="_rpBtn _primary"
							disabled={!importing.verdicts}
							onClick={finishImport}
						>
							Import
						</button>
					</div>
				</Dialog>
			) : null}
			{transfer ? (
				<Dialog
					kind="modal"
					label={transfer.move ? 'Move to group' : 'Copy to group'}
					onClose={() => setTransfer(undefined)}
				>
					<div className="_rpDrawerHead">
						<span>{transfer.move ? 'Move to group' : 'Copy to group'}</span>
						<button
							type="button"
							className="_rpIconBtn"
							aria-label="Close"
							title="Close"
							onClick={() => setTransfer(undefined)}
						>
							<Icon name="fa-xmark" />
						</button>
					</div>
					<div className="_rpDrawerBody">
						<div className="_rpMuted">{transfer.name}</div>
						<div className="_rpRow" role="radiogroup" aria-label="Copy or move">
							<label className="_rpCheck">
								<input
									type="radio"
									name="rpTransferKind"
									checked={!transfer.move}
									onChange={() =>
										setTransfer(s => (s ? { ...s, move: false } : s))
									}
								/>
								Copy (keep it here too)
							</label>
							<label className="_rpCheck">
								<input
									type="radio"
									name="rpTransferKind"
									checked={transfer.move}
									onChange={() =>
										setTransfer(s => (s ? { ...s, move: true } : s))
									}
								/>
								Move (take it off here)
							</label>
						</div>
						<div className="_rpGroupTitle">To group</div>
						<div role="radiogroup" aria-label="To group">
							{otherGroups.map(g => (
								<label key={g.id} className="_rpCheck _rpLibRow">
									<input
										type="radio"
										name="rpTransferTarget"
										checked={transfer.target === g.id}
										onChange={() =>
											setTransfer(s => (s ? { ...s, target: g.id } : s))
										}
									/>
									{g.label}
								</label>
							))}
						</div>
						{transfer.error ? (
							<div className="_rpError" role="alert">
								{transfer.error}
							</div>
						) : null}
					</div>
					<div className="_rpDrawerFoot">
						<button
							type="button"
							className="_rpBtn"
							onClick={() => setTransfer(undefined)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="_rpBtn _primary"
							disabled={!transfer.target || transfer.busy}
							onClick={() => void runTransfer()}
						>
							{transfer.busy ? <Icon name="fa-spinner fa-spin" /> : null}
							{transfer.move ? 'Move' : 'Copy'}
						</button>
					</div>
				</Dialog>
			) : null}
			{confirmDelete ? (
				<Dialog
					kind="modal"
					label="Delete widget"
					onClose={() => setConfirmDelete(undefined)}
				>
					<div className="_rpDrawerHead">
						<span>Delete widget</span>
						<button
							type="button"
							className="_rpIconBtn"
							aria-label="Close"
							title="Close"
							onClick={() => setConfirmDelete(undefined)}
						>
							<Icon name="fa-xmark" />
						</button>
					</div>
					<div className="_rpDrawerBody">
						<span>
							Delete the widget {confirmDelete.name}? It goes from the dashboard and
							the library. This cannot be undone.
						</span>
					</div>
					<div className="_rpDrawerFoot">
						<button
							type="button"
							className="_rpBtn"
							onClick={() => setConfirmDelete(undefined)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="_rpBtn _primary"
							onClick={() => {
								const id = confirmDelete.id;
								setConfirmDelete(undefined);
								apply(d => deleteWidget(d, id));
							}}
						>
							Delete
						</button>
					</div>
				</Dialog>
			) : null}
			{editing ? (
				<Dialog
					kind="modal"
					label={editing.id ? 'Edit widget' : 'New widget'}
					onClose={() => setEditing(undefined)}
				>
					<div className="_rpDrawerHead">
						<span>{editing.id ? 'Edit widget' : 'New widget'}</span>
						<button
							type="button"
							className="_rpIconBtn"
							aria-label="Close"
							title="Close"
							onClick={() => setEditing(undefined)}
						>
							<Icon name="fa-xmark" />
						</button>
					</div>
					<div className="_rpDrawerBody">
						<ReportEditorView
							transport={transport}
							catalog={catalog}
							runFunction={runFunction}
							initial={editing.value}
							heading=""
							ai={
								cat.catalog?.ai
									? { endpoint: aiUrl(undefined), initialPrompt: editing.prompt }
									: undefined
							}
							onSave={saveEditor}
							onSaveAsNew={
								editing.id
									? v => {
											apply(d =>
												addWidget(
													d,
													{
														name: v.name,
														spec: v.spec,
														refreshMin: v.refreshMin,
													},
													{ toDashboard: mode === 'dashboard' },
												),
											);
											setEditing(undefined);
										}
									: undefined
							}
							onCancel={() => setEditing(undefined)}
							saveLabel={
								editing.id
									? 'Save'
									: mode === 'dashboard'
										? 'Add to dashboard'
										: 'Save to library'
							}
						/>
					</div>
				</Dialog>
			) : null}
		</div>
	);
}

function EmptyState({
	editable,
	onAdd,
	onLibrary,
}: Readonly<{ editable?: boolean; onAdd: () => void; onLibrary: () => void }>) {
	return (
		<div className="_rpWidget">
			<div className="_rpState">
				<span className="_rpMuted">Nothing on this dashboard yet.</span>
				{editable ? (
					<span className="_rpRow">
						<button type="button" className="_rpBtn _primary" onClick={onAdd}>
							Add widget
						</button>
						<button type="button" className="_rpBtn" onClick={onLibrary}>
							Open the library
						</button>
					</span>
				) : null}
			</div>
		</div>
	);
}

/** Every saved widget (on the dashboard or not) and the app defaults not in it. */
export function LibraryList({
	doc,
	catalog,
	editable,
	apply,
	onEdit,
	onDelete,
	onTransfer,
}: Readonly<{
	doc: DashboardDoc;
	catalog: ReportCatalog;
	editable?: boolean;
	apply: (fn: (d: DashboardDoc) => DocResult | DashboardDoc) => void;
	onEdit: (id: string, v: EditorValue) => void;
	/** Asks before deleting (PLAT-1704); without it Delete acts at once. */
	onDelete?: (id: string, name: string) => void;
	/** Copy or move to another group (only when there is one). */
	onTransfer?: (id: string, name: string) => void;
}>) {
	const ids = Object.keys(doc.widgets);
	const defaults = defaultsNotInLibrary(doc, catalog);
	const count = ids.length;
	return (
		<div className="_rpLib">
			<div className="_rpMuted">
				{count} of {DASHBOARD_CAPS.saved} saved · {doc.layout.length} of{' '}
				{DASHBOARD_CAPS.onDashboard} on the dashboard
			</div>
			{ids.map(id => {
				const r = resolveWidget(doc, id, catalog);
				if (!r) return null;
				const on = onDashboard(doc, id);
				return (
					<div key={id} className="_rpLibRow">
						<div className="_rpLibName">
							<span>{r.name}</span>
							<span className="_rpMuted">
								{VIEW_LABELS[r.spec.view.type] ?? r.spec.view.type}
								{r.byReference ? ' · from the app' : ''}
								{on ? ' · on the dashboard' : ''}
							</span>
							{doc.widgets[id]?.importError ? (
								<span className="_rpMuted _rpError">
									Not available: {doc.widgets[id].importError}
								</span>
							) : null}
						</div>
						{editable ? (
							<>
								{on ? (
									<button
										type="button"
										className="_rpBtn"
										onClick={() => apply(d => removeFromDashboard(d, id))}
									>
										Remove from dashboard
									</button>
								) : (
									<button
										type="button"
										className="_rpBtn"
										onClick={() => apply(d => addToDashboard(d, id))}
									>
										Add to dashboard
									</button>
								)}
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										onEdit(id, {
											name: r.name,
											spec: r.spec,
											refreshMin: r.refreshMin,
										})
									}
								>
									Edit
								</button>
								<button
									type="button"
									className="_rpBtn"
									onClick={() => apply(d => duplicateWidget(d, id, catalog))}
								>
									Duplicate
								</button>
								{onTransfer ? (
									<button
										type="button"
										className="_rpBtn"
										onClick={() => onTransfer(id, r.name)}
									>
										Copy or move
									</button>
								) : null}
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										onDelete
											? onDelete(id, r.name)
											: apply(d => deleteWidget(d, id))
									}
								>
									Delete
								</button>
							</>
						) : null}
					</div>
				);
			})}
			{!ids.length ? <div className="_rpMuted">No saved widgets yet.</div> : null}
			{defaults.length ? (
				<>
					<div className="_rpGroupTitle">From the app</div>
					{defaults.map(d => (
						<div key={d.id} className="_rpLibRow">
							<div className="_rpLibName">
								<span>{d.name}</span>
								<span className="_rpMuted">
									{VIEW_LABELS[d.spec.view.type] ?? d.spec.view.type}
								</span>
							</div>
							{editable ? (
								<button
									type="button"
									className="_rpBtn"
									onClick={() => apply(doc2 => addDefault(doc2, d, true))}
								>
									Add to dashboard
								</button>
							) : null}
						</div>
					))}
				</>
			) : null}
		</div>
	);
}
