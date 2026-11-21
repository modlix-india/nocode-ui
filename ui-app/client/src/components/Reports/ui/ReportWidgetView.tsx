import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildChartConfig, gaugeParts, targetValue, colorFor } from '../reportChartConfig';
import {
	defaultPdfFunction,
	errorText,
	namespaceOf,
	ReportTransport,
	runReport,
} from '../reportApi';
import {
	canvasPng,
	downloadText,
	exportFileName,
	exportPdf,
	pdfDocument,
	PdfItem,
	pdfItem,
	reportFile,
	toCsv,
} from '../reportExport';
import {
	countLinkOf,
	fillLink,
	linkProps,
	Navigator,
	openInApp,
	rowLinkOf,
	singleValues,
} from '../reportLinks';
import {
	FormatOptions,
	formatCell,
	formatMeasure,
	labelOf,
	measureColumns,
	dimensionColumns,
	toNumber,
	updatedLabel,
} from '../reportFormat';
import {
	compareBlocker,
	DrillStep,
	drillCrumbs,
	effectiveSpec,
	fieldLabel,
	markActions,
	MarkActions,
	MarkTarget,
	specKey,
} from '../reportSpecUtil';
import { useChartTheme } from '../reportStyle';
import {
	applyStyleTransforms,
	chartAxes,
	isAdditive,
	kpiDelta,
	normalizeCompare,
} from '../reportTransform';
import {
	CANVAS_VIEWS,
	COMPARE_LABELS,
	CompareTo,
	DashboardFilters,
	REFRESH_CHOICES,
	ReportCatalog,
	ReportErrorBody,
	ReportSpec,
	ReportStyle,
	ReportSuccess,
	ReportView,
	SessionFilter,
	ViewType,
	ZOOM_VIEWS,
} from '../reportTypes';
import { fitOf, shapeOf } from '../shapeRules';
import { ChartTypePicker } from './ChartTypePicker';
import { blankIfMissing, Crosstab, DataTable, Icon, IconButton, useDismiss } from './common';
import type { MarkClick, ReportChartHandle } from './ReportChart';
import { Dialog, Pop, RpPortal, useEscape } from './portal';
import { RecordsPanel } from './RecordsPanel';
import { StylePanel } from './StylePanel';

const ReportChart = React.lazy(() => import(/* webpackChunkName: "ReportChart" */ './ReportChart'));

/** One forced run per widget spec per 10 s (the runner serves the cache inside that window). */
export const FORCE_WINDOW_MS = 10000;
const lastForced = new Map<string, number>();

export interface ReportWidgetViewProps {
	transport?: ReportTransport;
	runFunction: string;
	catalog?: ReportCatalog;
	spec: ReportSpec;
	name?: string;
	refreshMin?: number;
	/** Type switches and style saves are kept (onSpecChange); off: they last for the session. */
	editable?: boolean;
	dashboard?: DashboardFilters;
	compact?: boolean;
	/** A default shipped after the dashboard was set up. */
	isNew?: boolean;
	onKeep?: () => void;
	onRemoveNew?: () => void;
	onEdit?: () => void;
	onDuplicate?: () => void;
	onRemove?: () => void;
	onDelete?: () => void;
	onSpecChange?: (spec: ReportSpec) => void;
	onRefreshMinChange?: (minutes: number) => void;
	/** The header doubles as the drag handle on a dashboard. */
	onHeadPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
	footer?: React.ReactNode;
	className?: string;
	/** The catalog default this widget follows (its KPI count link, CONTRACT 8.0). */
	defaultId?: string;
	/** Opens an app link; default: the Navigate step's navigation. */
	onNavigate?: Navigator;
	/** "Filter dashboard" filters from other widgets (applied where this source has the field). */
	cross?: SessionFilter[];
	/** Shows "Filter dashboard" on a mark; hands the clicked filters to the dashboard. */
	onCrossFilter?: (filters: SessionFilter[]) => void;
	/** `<ns>.reportPdf`; default from the run function's namespace. */
	pdfFunction?: string;
	/** For the widget file's `app`; default the run function's namespace. */
	appNamespace?: string;
	/** A dashboard collects each widget's PDF part through this. */
	exportRef?: (api: WidgetExportApi | null) => void;
	/** Imported from a file and refused by the dry run: why. */
	importError?: string;
}

export interface WidgetExportApi {
	pdfItem(): PdfItem | undefined;
}

interface MoreState {
	/** The last page read (the spec's own page is the first). */
	page: number;
	rows: Array<Record<string, any>>;
	done: boolean;
	loading: boolean;
	error?: string;
}

interface RunState {
	status: 'idle' | 'loading' | 'ok' | 'error';
	out?: ReportSuccess;
	error?: ReportErrorBody;
}

type Popover = 'type' | 'menu' | undefined;

export function ReportWidgetView(props: Readonly<ReportWidgetViewProps>) {
	const { transport, runFunction, catalog, spec, editable, dashboard } = props;
	const rootRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ReportChartHandle>(null);

	const [steps, setSteps] = useState<DrillStep[]>([]);
	const [session, setSession] = useState<SessionFilter[]>([]);
	const [viewOverride, setViewOverride] = useState<ReportView | undefined>(undefined);
	const [styleDraft, setStyleDraft] = useState<ReportStyle | undefined>(undefined);
	const [pop, setPop] = useState<Popover>(undefined);
	const [mark, setMark] = useState<
		{ x: number; y: number; target: MarkTarget; actions: MarkActions } | undefined
	>(undefined);
	const [showData, setShowData] = useState(false);
	const [records, setRecords] = useState<{ extra?: SessionFilter[] } | undefined>(undefined);
	const [full, setFull] = useState(false);
	const [forceBlocked, setForceBlocked] = useState(false);
	const [state, setState] = useState<RunState>({ status: 'idle' });
	const [compare, setCompare] = useState<CompareTo | undefined>(spec.compare?.to);
	const [more, setMore] = useState<MoreState | undefined>(undefined);
	const [zoomed, setZoomed] = useState(false);
	const [notice, setNotice] = useState('');
	const navigate = props.onNavigate ?? openInApp;

	// A new saved spec wins over the session's look changes.
	const savedKey = specKey(spec);
	useEffect(() => {
		setViewOverride(undefined);
		setStyleDraft(undefined);
		setCompare(spec.compare?.to);
	}, [savedKey]);

	const baseView = viewOverride ?? spec.view;
	const view: ReportView = styleDraft ? { ...baseView, style: styleDraft } : baseView;
	const style = view.style ?? {};
	const source = catalog?.sources?.[spec.source];

	const eff = useMemo(() => {
		const { compare: _saved, ...plain } = spec;
		const e = effectiveSpec(
			{ ...plain, view: baseView },
			{ catalog, dashboard, session, drill: steps, cross: props.cross },
		);
		// Compare is the widget's session toggle; it needs one period that is not All time.
		if (compare && !compareBlocker(e.spec, catalog)) e.spec.compare = { to: compare };
		return e;
	}, [spec, baseView, catalog, dashboard, session, steps, props.cross, compare]);
	const blocker = useMemo(() => {
		const { compare: _c, ...plain } = eff.spec;
		return compareBlocker(plain, catalog);
	}, [eff.spec, catalog]);
	// The view is not part of the query: switching type or style never runs again.
	const runKey = useMemo(() => specKey({ ...eff.spec, view: { type: 'TABLE' } }), [eff.spec]);
	const effRef = useRef(eff);
	effRef.current = eff;
	const seq = useRef(0);
	const lastRunAt = useRef(0);

	const run = useCallback(
		async (force: boolean) => {
			if (!transport || !runFunction) return;
			const id = ++seq.current;
			const key = specKey(effRef.current.spec);
			let useForce = force;
			if (force) {
				const at = lastForced.get(key) ?? 0;
				if (Date.now() - at < FORCE_WINDOW_MS) useForce = false;
				else lastForced.set(key, Date.now());
				setForceBlocked(true);
				setTimeout(() => setForceBlocked(false), FORCE_WINDOW_MS);
			}
			setState(s => ({ ...s, status: 'loading' }));
			const res = await runReport(transport, runFunction, effRef.current.spec, {
				force: useForce,
			});
			if (id !== seq.current) return;
			lastRunAt.current = Date.now();
			setMore(undefined);
			if (res.ok) setState({ status: 'ok', out: res });
			else setState(s => ({ status: 'error', error: res.error, out: s.out }));
		},
		[transport, runFunction],
	);

	// Load more (CONTRACT 8.0 `paging`): the next page of a function source, appended.
	const paging = source?.kind === 'FUNCTION' ? source.paging : undefined;
	const firstPage = paging ? Number(eff.spec.params?.[paging.param] ?? 0) || 0 : 0;
	const loadMore = async () => {
		if (!transport || !paging || more?.loading) return;
		const page = (more?.page ?? firstPage) + 1;
		const id = seq.current;
		setMore(m => ({
			page: m?.page ?? firstPage,
			rows: m?.rows ?? [],
			done: false,
			loading: true,
		}));
		const res = await runReport(transport, runFunction, {
			...effRef.current.spec,
			params: { ...(effRef.current.spec.params ?? {}), [paging.param]: page },
		});
		if (id !== seq.current) return;
		setMore(m => {
			const rows = m?.rows ?? [];
			if (!res.ok)
				return {
					page: page - 1,
					rows,
					done: false,
					loading: false,
					error: errorText(res.error),
				};
			return {
				page,
				rows: [...rows, ...res.rows],
				done: res.rows.length < (paging.size || 1),
				loading: false,
			};
		});
	};

	useEffect(() => {
		run(false);
	}, [runKey, run]);

	// Auto refresh, paused while the tab is hidden; on return an overdue widget refreshes.
	const refreshMin = props.refreshMin ?? 0;
	useEffect(() => {
		if (!refreshMin) return;
		const ms = refreshMin * 60000;
		const tick = () => {
			if (typeof document !== 'undefined' && document.hidden) return;
			if (Date.now() - lastRunAt.current >= ms - 1000) run(false);
		};
		const h = setInterval(tick, Math.min(ms, 60000));
		const onVis = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener('visibilitychange', onVis);
		return () => {
			clearInterval(h);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [refreshMin, run]);

	useEscape(full, () => setFull(false));

	const theme = useChartTheme(rootRef, style.palette);
	const fmt: FormatOptions = useMemo(
		() => ({
			locale: catalog?.locale,
			timeZone: catalog?.timeZone,
			currency: catalog?.currency,
			numberFormat: style.numberFormat,
		}),
		[catalog?.locale, catalog?.timeZone, catalog?.currency, style.numberFormat],
	);
	const compareLabel = state.out?.comparePeriod?.label
		? state.out.comparePeriod.label
		: eff.spec.compare
			? COMPARE_LABELS[eff.spec.compare.to]
			: undefined;
	const out = useMemo(() => {
		const o = state.out;
		if (!o) return undefined;
		const all = more?.rows.length ? { ...o, rows: [...o.rows, ...more.rows] } : o;
		return normalizeCompare(all, compareLabel);
	}, [state.out, more?.rows, compareLabel]);
	// More pages while the last page read came back full (or the runner's total says so).
	const loadedRows = (state.out?.rows.length ?? 0) + (more?.rows.length ?? 0);
	const total = Number.isFinite(state.out?.total) ? Number(state.out!.total) : undefined;
	const hasMore =
		!!paging &&
		!!state.out &&
		(total !== undefined
			? loadedRows < total
			: !more?.done &&
				(more !== undefined ||
					state.out.rows.length >= (paging.size || Number.MAX_SAFE_INTEGER)));
	const shown = useMemo(
		() => (out ? applyStyleTransforms(out, eff.spec, style) : undefined),
		[out, eff.spec, style],
	);
	const hasCompare = !!eff.spec.compare && !!out?.columns.some(c => c.role === 'compare');
	const shape = useMemo(() => shapeOf(eff.spec, catalog, out), [eff.spec, catalog, out]);
	const fit = fitOf(view.type, shape, out?.fits);
	const compact = props.compact || style.density === 'compact';
	const isCanvas = CANVAS_VIEWS.has(view.type);

	const zoomable = ZOOM_VIEWS.has(view.type) && shape.firstIsDate === true;
	const config = useMemo(() => {
		if (!shown || !isCanvas) return undefined;
		return buildChartConfig(shown, view, theme, {
			locale: catalog?.locale,
			currency: catalog?.currency,
			compact,
			zoom: zoomable,
			compareLabel: hasCompare ? compareLabel : undefined,
		});
	}, [
		shown,
		view,
		theme,
		catalog?.locale,
		catalog?.currency,
		compact,
		isCanvas,
		zoomable,
		hasCompare,
		compareLabel,
	]);
	useEffect(() => setZoomed(false), [config]);

	// Click-through (CONTRACT 8.0): what the links' placeholders read.
	const linkCtx = useMemo(
		() => ({ filters: singleValues(eff.spec), period: out?.period }),
		[eff.spec, out?.period],
	);
	const rowHref = source?.link
		? (row: Record<string, any>) => rowLinkOf(source.link, row, linkCtx)
		: undefined;
	// "View all" belongs under a list of rows (the old dashboard's lists), not under a chart.
	const moreHref =
		source?.moreLink?.path && (view.type === 'TABLE' || view.type === 'LIST')
			? fillLink(source.moreLink.path, linkCtx)
			: undefined;
	const countLink = countLinkOf(catalog, spec, props.defaultId);
	const countHref = countLink ? fillLink(countLink.path, linkCtx) : undefined;
	const canRecords = !!source?.records && source.kind !== 'FUNCTION';

	const commitSpec = (next: ReportSpec) => {
		if (editable && props.onSpecChange) props.onSpecChange(next);
		else setViewOverride(next.view);
	};

	const pickType = (t: ViewType) => {
		setPop(undefined);
		const next = { ...spec, view: { ...baseView, type: t } };
		commitSpec(next);
		if (state.error?.code === 'BAD_VIEW') setTimeout(() => run(false), 0);
	};

	const onMarkClick = (m: MarkClick) => {
		if (!shown || !config) return;
		const ds: any = config.data.datasets[m.datasetIndex];
		const row = ds?._treemap ? ds._leafOf?.(m.raw) : ds?._rows?.[m.index];
		if (!row) return;
		const axes = chartAxes(shown, view);
		const perRow = ds._perRowSeries || (ds._treemap && m.raw?.l === 1);
		const target: MarkTarget = {
			row,
			x: axes.x,
			series: axes.series,
			seriesValue:
				ds._seriesKey !== undefined || perRow ? row[axes.series?.key ?? ''] : undefined,
		};
		const actions = markActions(eff.spec, target, catalog);
		// The menu is in a portal: place it in window coordinates.
		const box = rootRef.current?.querySelector('._rpCanvas') as HTMLElement | null;
		const canvasBox = box?.getBoundingClientRect();
		setMark({
			x: (canvasBox?.left ?? 0) + m.x,
			y: (canvasBox?.top ?? 0) + m.y,
			target,
			actions,
		});
	};

	const addSession = (fs: SessionFilter[] | undefined) => {
		setMark(undefined);
		if (fs?.length) setSession(s => [...s, ...fs]);
	};

	const downloadPng = () => {
		setPop(undefined);
		const png = canvasPng(chartRef.current?.canvas(), theme.surface || undefined);
		if (!png) return;
		const a = document.createElement('a');
		a.href = png;
		a.download = `${(props.name || view.title || 'chart').replace(/[^\w\- ]+/g, '').trim() || 'chart'}.png`;
		a.click();
	};

	const title = props.name || view.title || 'Report';
	// The crumbs name the level the widget started at, so they read the spec before the drill.
	const crumbs = drillCrumbs({ ...spec, view: baseView }, steps, catalog);
	const subtitle = [
		out?.period?.label,
		hasCompare && compareLabel ? `compared with ${compareLabel.toLowerCase()}` : '',
		...session.map(f => f.label ?? f.field),
		...(props.cross ?? [])
			.filter(f => !eff.skipped.includes(f.label ?? fieldLabel(catalog, f.field)))
			.map(f => f.label ?? f.field),
	]
		.filter(Boolean)
		.join(' · ');

	// Export (CONTRACT 8.2).
	const app = props.appNamespace || namespaceOf(runFunction);
	const pdfFunction = props.pdfFunction || defaultPdfFunction(props.appNamespace, runFunction);
	const makePdfItem = (): PdfItem | undefined => {
		if (!out) return undefined;
		const png = isCanvas
			? canvasPng(chartRef.current?.canvas(), theme.surface || undefined)
			: '';
		return pdfItem(title, subtitle, out, { ...fmt, numberFormat: undefined }, png || undefined);
	};
	const pdfRef = useRef(makePdfItem);
	pdfRef.current = makePdfItem;
	useEffect(() => {
		if (!props.exportRef) return;
		props.exportRef({ pdfItem: () => pdfRef.current() });
		return () => props.exportRef?.(null);
	}, [props.exportRef]);
	const exportCsv = () => {
		setPop(undefined);
		if (out) downloadText(toCsv(out), exportFileName(title, 'csv'), 'text/csv;charset=utf-8');
	};
	const exportWidgetPdf = async () => {
		setPop(undefined);
		const item = makePdfItem();
		if (!transport || !item) return;
		const d = pdfDocument(title, [item], { locale: catalog?.locale });
		if (!d.ok) return setNotice(d.error);
		setNotice('Making the PDF');
		setNotice(
			await exportPdf(transport, pdfFunction, d.document, exportFileName(title, 'pdf')),
		);
	};
	const exportWidgetFile = () => {
		setPop(undefined);
		const file = reportFile(app, [
			{ id: 'w1', name: title, spec: { ...spec, view: baseView }, refreshMin },
		]);
		downloadText(
			JSON.stringify(file, null, 2),
			exportFileName(title, 'json'),
			'application/json',
		);
	};
	const measures = shown ? measureColumns(shown) : [];
	const axes = shown ? chartAxes(shown, view) : undefined;
	const seriesTargets =
		shown &&
		axes?.series &&
		(view.type.startsWith('STACKED') || view.type === 'GROUPED_BAR' || axes.ys.length === 1)
			? [
					...new Map(
						shown.rows.map(r => [
							String(r[axes.series!.key]),
							labelOf(r, axes.series!.key),
						]),
					).entries(),
				].map(([key, label]) => ({ key, label }))
			: undefined;

	const popRef = useRef<HTMLDivElement>(null);
	const menuRef = useDismiss(pop !== undefined, () => setPop(undefined), popRef);
	const markRef = useDismiss(!!mark, () => setMark(undefined));

	const body = () => {
		if (!out && (state.status === 'loading' || state.status === 'idle'))
			return (
				<div className="_rpState" aria-busy="true" aria-label="Loading">
					<div className="_rpSkeleton" style={{ width: '100%' }} />
				</div>
			);
		if (state.status === 'error' && !out)
			return (
				<div className="_rpState" role="alert">
					<span className="_rpError">{errorText(state.error)}</span>
					<button type="button" className="_rpBtn" onClick={() => run(false)}>
						Try again
					</button>
				</div>
			);
		if (!shown) return null;
		if (!fit.ok)
			return (
				<div className="_rpState">
					<span className="_rpMuted">{fit.reason}</span>
				</div>
			);
		if (!shown.rows.length && view.type !== 'KPI')
			return (
				<div className="_rpState">
					<span className="_rpMuted">No data for this period</span>
				</div>
			);
		switch (view.type) {
			case 'KPI':
				return (
					<Kpi
						out={shown}
						view={view}
						fmt={fmt}
						href={countHref}
						navigate={navigate}
						compareLabel={hasCompare ? compareLabel : undefined}
					/>
				);
			case 'BULLET':
				return (
					<Bullet
						out={shown}
						view={view}
						fmt={fmt}
						color={colorFor(theme, style, measures[0]?.key, 0)}
					/>
				);
			case 'TABLE':
				return (
					<DataTable
						out={shown}
						fmt={fmt}
						compact={compact}
						rowHref={rowHref}
						navigate={navigate}
					/>
				);
			case 'LIST':
				return <List out={shown} fmt={fmt} rowHref={rowHref} navigate={navigate} />;
			case 'CROSSTAB': {
				const dims = dimensionColumns(shown).filter(c => c.key !== 'currency');
				const m = axes?.ys[0];
				if (dims.length < 2 || !m)
					return <DataTable out={shown} fmt={fmt} compact={compact} />;
				return (
					<Crosstab
						out={shown}
						rowsCol={dims[0]}
						colsCol={dims[1]}
						measure={m}
						additive={isAdditive(eff.spec, m.key) && !style.pctOfTotal}
						fmt={fmt}
						compact={compact}
					/>
				);
			}
			default:
				return (
					<div className="_rpCanvas">
						<Suspense
							fallback={<div className="_rpSkeleton" style={{ height: '100%' }} />}
						>
							{config ? (
								<ReportChart
									ref={chartRef}
									config={config}
									onMarkClick={view.type === 'GAUGE' ? undefined : onMarkClick}
									onZoomChange={setZoomed}
								/>
							) : null}
						</Suspense>
						{zoomed ? (
							<button
								type="button"
								className="_rpBtn _rpZoomReset"
								onClick={() => chartRef.current?.resetZoom()}
							>
								<Icon name="fa-magnifying-glass-minus" /> Reset zoom
							</button>
						) : null}
						{view.type === 'GAUGE' && shown ? (
							<GaugeValue out={shown} view={view} fmt={fmt} />
						) : null}
					</div>
				);
		}
	};

	const card = (
		<div
			ref={rootRef}
			className={`_rpWidget${compact ? ' _compact' : ''}${full ? ' _full' : ''}${props.className ? ' ' + props.className : ''}`}
			role="region"
			aria-label={title}
		>
			{props.isNew ? (
				<div className="_rpNewBar">
					<span>New from the app</span>
					{props.onKeep ? (
						<button type="button" className="_rpBtn _primary" onClick={props.onKeep}>
							Keep
						</button>
					) : null}
					{props.onRemoveNew ? (
						<button type="button" className="_rpBtn" onClick={props.onRemoveNew}>
							Remove
						</button>
					) : null}
				</div>
			) : null}
			<div
				className={`_rpHead${props.onHeadPointerDown && !full ? ' _drag' : ''}`}
				onPointerDown={full ? undefined : props.onHeadPointerDown}
			>
				<div className="_rpTitle" title={title}>
					{title}
				</div>
				{props.isNew ? <span className="_rpBadge">New</span> : null}
				<div ref={menuRef} style={{ display: 'flex', alignItems: 'center' }}>
					<IconButton
						icon="fa-chart-simple"
						label="Chart type"
						on={pop === 'type'}
						onClick={() => setPop(p => (p === 'type' ? undefined : 'type'))}
					/>
					<IconButton
						icon="fa-palette"
						label="Style"
						on={styleDraft !== undefined}
						onClick={() => {
							setPop(undefined);
							setStyleDraft(baseView.style ?? {});
						}}
					/>
					<IconButton
						icon="fa-rotate-right"
						label={forceBlocked ? 'Refreshed just now' : 'Refresh'}
						disabled={forceBlocked || state.status === 'loading'}
						onClick={() => run(true)}
					/>
					<IconButton
						icon="fa-ellipsis-vertical"
						label="More"
						on={pop === 'menu'}
						onClick={() => setPop(p => (p === 'menu' ? undefined : 'menu'))}
					/>
					{pop === 'type' ? (
						<Pop anchor={menuRef.current} align="right" popRef={popRef}>
							<ChartTypePicker
								shape={shape}
								value={view.type}
								onPick={pickType}
								runnerFits={out?.fits}
							/>
						</Pop>
					) : null}
					{pop === 'menu' ? (
						<Pop anchor={menuRef.current} align="right" popRef={popRef} role="menu">
							{props.onEdit ? (
								<MenuItem
									icon="fa-pen"
									label="Edit"
									onClick={() => (setPop(undefined), props.onEdit!())}
								/>
							) : null}
							{props.onDuplicate ? (
								<MenuItem
									icon="fa-copy"
									label="Duplicate"
									onClick={() => (setPop(undefined), props.onDuplicate!())}
								/>
							) : null}
							<MenuItem
								icon="fa-table"
								label="View data"
								disabled={!out}
								onClick={() => (setPop(undefined), setShowData(true))}
							/>
							{canRecords ? (
								<MenuItem
									icon="fa-list-ul"
									label="View records"
									onClick={() => (setPop(undefined), setRecords({}))}
								/>
							) : null}
							<div className="_rpMenuSep" />
							<div className="_rpMuted" style={{ padding: '4px 10px' }}>
								Compare with
							</div>
							{([undefined, 'PREVIOUS_PERIOD', 'SAME_PERIOD_LAST_YEAR'] as const).map(
								c => (
									<button
										key={c ?? 'off'}
										type="button"
										role="menuitemradio"
										aria-checked={compare === c}
										disabled={!!c && !!blocker}
										title={c && blocker ? blocker : undefined}
										className={`_rpMenuItem${compare === c ? ' _on' : ''}`}
										onClick={() => (setPop(undefined), setCompare(c))}
									>
										{c ? COMPARE_LABELS[c] : 'Nothing'}
									</button>
								),
							)}
							{blocker ? (
								<div className="_rpMuted" style={{ padding: '2px 10px 4px' }}>
									{blocker}
								</div>
							) : null}
							<div className="_rpMenuSep" />
							<MenuItem
								icon="fa-file-csv"
								label="Export CSV"
								disabled={!out}
								onClick={exportCsv}
							/>
							<MenuItem
								icon="fa-file-pdf"
								label="Export PDF"
								disabled={!out || !pdfFunction}
								onClick={exportWidgetPdf}
							/>
							<MenuItem
								icon="fa-file-export"
								label="Export widget file"
								onClick={exportWidgetFile}
							/>
							<div className="_rpMenuSep" />
							<MenuItem
								icon={full ? 'fa-compress' : 'fa-expand'}
								label={full ? 'Exit full screen' : 'Full screen'}
								onClick={() => (setPop(undefined), setFull(f => !f))}
							/>
							{isCanvas ? (
								<MenuItem
									icon="fa-image"
									label="Download PNG"
									disabled={!config}
									onClick={downloadPng}
								/>
							) : null}
							{props.onRefreshMinChange ? (
								<>
									<div className="_rpMenuSep" />
									<div className="_rpMuted" style={{ padding: '4px 10px' }}>
										Auto refresh
									</div>
									{REFRESH_CHOICES.map(m => (
										<button
											key={m}
											type="button"
											role="menuitemradio"
											aria-checked={refreshMin === m}
											className={`_rpMenuItem${refreshMin === m ? ' _on' : ''}`}
											onClick={() => (
												setPop(undefined),
												props.onRefreshMinChange!(m)
											)}
										>
											{m ? `Every ${m} min` : 'Off'}
										</button>
									))}
								</>
							) : null}
							{props.onRemove || props.onDelete ? (
								<div className="_rpMenuSep" />
							) : null}
							{props.onRemove ? (
								<MenuItem
									icon="fa-eye-slash"
									label="Remove from dashboard"
									onClick={() => (setPop(undefined), props.onRemove!())}
								/>
							) : null}
							{props.onDelete ? (
								<MenuItem
									icon="fa-trash"
									label="Delete"
									onClick={() => (setPop(undefined), props.onDelete!())}
								/>
							) : null}
						</Pop>
					) : null}
				</div>
			</div>
			<div className="_rpSub">
				{crumbs.length ? (
					<nav className="_rpCrumbs" aria-label="Drill path">
						{crumbs.map((c, i) =>
							i < crumbs.length - 1 ? (
								<React.Fragment key={i}>
									<button
										type="button"
										onClick={() => setSteps(s => s.slice(0, i))}
									>
										{c}
									</button>
									<span className="_rpMuted">/</span>
								</React.Fragment>
							) : (
								<span key={i}>{c}</span>
							),
						)}
					</nav>
				) : null}
				{session.map((f, i) => (
					<span key={i} className="_rpChip">
						{f.label ?? f.field}
						<button
							type="button"
							aria-label={`Remove filter ${f.label ?? f.field}`}
							onClick={() => setSession(s => s.filter((_, j) => j !== i))}
						>
							<Icon name="fa-xmark" />
						</button>
					</span>
				))}
				<span className="_rpMuted">
					{[
						out?.period?.label,
						updatedLabel(out?.refreshedAt),
						eff.skipped.length ? `Not applied: ${eff.skipped.join(', ')}` : '',
					]
						.filter(Boolean)
						.join(' · ')}
				</span>
				{state.status === 'error' && out ? (
					<span className="_rpError _rpMuted">{errorText(state.error)}</span>
				) : null}
				{props.importError && state.status === 'error' ? (
					<span className="_rpError _rpMuted">Imported: {props.importError}</span>
				) : null}
				{notice ? (
					<span className="_rpMuted" role="status">
						{notice}
					</span>
				) : null}
			</div>
			<div className="_rpBody" aria-busy={state.status === 'loading'}>
				{state.status === 'loading' && out ? (
					<span className="_rpSpin _rpMuted" aria-hidden="true">
						<Icon name="fa-spinner fa-spin" />
					</span>
				) : null}
				{body()}
				{mark ? (
					<Pop at={{ x: mark.x, y: mark.y }} popRef={markRef} role="menu">
						<div className="_rpMuted" style={{ padding: '4px 10px' }}>
							{mark.target.x ? labelOf(mark.target.row, mark.target.x.key) : ''}
						</div>
						<MenuItem
							icon="fa-filter"
							label="Keep only"
							disabled={!mark.actions.keep}
							onClick={() => addSession(mark.actions.keep)}
						/>
						<MenuItem
							icon="fa-filter-circle-xmark"
							label="Exclude"
							disabled={!mark.actions.exclude}
							hint={mark.actions.exclude ? undefined : mark.actions.excludeReason}
							onClick={() => addSession(mark.actions.exclude)}
						/>
						{mark.actions.drill ? (
							<MenuItem
								icon="fa-magnifying-glass-plus"
								label="Drill down"
								hint={
									mark.actions.drill.kind === 'hierarchy'
										? fieldLabel(
												catalog,
												mark.actions.drill.next ?? '',
											).toLowerCase()
										: mark.actions.drill.level?.toLowerCase()
								}
								onClick={() => {
									const d = mark.actions.drill!;
									setMark(undefined);
									setSteps(s => [...s, d]);
								}}
							/>
						) : null}
						{props.onCrossFilter ? (
							<MenuItem
								icon="fa-filter"
								label="Filter dashboard"
								disabled={!mark.actions.keep}
								onClick={() => {
									const k = mark.actions.keep;
									setMark(undefined);
									if (k?.length) props.onCrossFilter!(k);
								}}
							/>
						) : null}
						{rowHref && rowHref(mark.target.row) ? (
							<MenuItem
								icon="fa-arrow-up-right-from-square"
								label="Open"
								onClick={() => {
									const href = rowHref(mark.target.row)!;
									setMark(undefined);
									navigate(href);
								}}
							/>
						) : null}
						<MenuItem
							icon="fa-table"
							label="View data"
							onClick={() => (setMark(undefined), setShowData(true))}
						/>
						{canRecords ? (
							<MenuItem
								icon="fa-list-ul"
								label="View records"
								onClick={() => {
									const k = mark.actions.keep;
									setMark(undefined);
									setRecords({ extra: k });
								}}
							/>
						) : null}
					</Pop>
				) : null}
			</div>
			{hasMore || moreHref ? (
				<div className="_rpFoot">
					{more?.error ? <span className="_rpError _rpMuted">{more.error}</span> : null}
					{hasMore ? (
						<button
							type="button"
							className="_rpBtn"
							disabled={more?.loading}
							onClick={loadMore}
						>
							{more?.loading ? <Icon name="fa-spinner fa-spin" /> : null}
							Load more
						</button>
					) : null}
					{moreHref ? (
						<button
							type="button"
							className="_rpLinkBtn"
							onClick={e => navigate(moreHref, e.metaKey || e.ctrlKey)}
						>
							{source?.moreLink?.label || 'View all'}
							<Icon name="fa-arrow-right" />
						</button>
					) : null}
				</div>
			) : null}
			{props.footer}
		</div>
	);

	return (
		<>
			{full ? (
				<RpPortal>
					<div className="_rpBackdrop" onClick={() => setFull(false)} />
					{card}
				</RpPortal>
			) : (
				card
			)}
			{styleDraft !== undefined ? (
				<Dialog kind="drawer" label="Style" onClose={() => setStyleDraft(undefined)}>
					<div className="_rpDrawerHead">
						<span>Style</span>
						<IconButton
							icon="fa-xmark"
							label="Close"
							onClick={() => setStyleDraft(undefined)}
						/>
					</div>
					<div className="_rpDrawerBody">
						<StylePanel
							type={view.type}
							style={styleDraft}
							onChange={setStyleDraft}
							measures={measures.map(m => ({ key: m.key, label: m.label ?? m.key }))}
							series={seriesTargets}
						/>
					</div>
					<div className="_rpDrawerFoot">
						<button
							type="button"
							className="_rpBtn"
							onClick={() => setStyleDraft(undefined)}
						>
							Discard
						</button>
						<button
							type="button"
							className="_rpBtn _primary"
							onClick={() => {
								const s = styleDraft;
								setStyleDraft(undefined);
								commitSpec({
									...spec,
									view: {
										...baseView,
										style: Object.keys(s).length ? s : undefined,
									},
								});
							}}
						>
							Save
						</button>
					</div>
				</Dialog>
			) : null}
			{showData && out ? (
				<Dialog kind="modal" label={`${title} data`} onClose={() => setShowData(false)}>
					<div className="_rpDrawerHead">
						<span>{title}</span>
						<IconButton
							icon="fa-xmark"
							label="Close"
							onClick={() => setShowData(false)}
						/>
					</div>
					<div className="_rpDrawerBody">
						<DataTable out={out} fmt={{ ...fmt, numberFormat: undefined }} />
					</div>
				</Dialog>
			) : null}
			{records && transport ? (
				<RecordsPanel
					transport={transport}
					runFunction={runFunction}
					spec={eff.spec}
					extra={records.extra}
					title={title}
					link={source?.records?.link ?? source?.link}
					linkContext={linkCtx}
					navigate={navigate}
					fmt={fmt}
					onClose={() => setRecords(undefined)}
				/>
			) : null}
		</>
	);
}

function MenuItem({
	icon,
	label,
	onClick,
	disabled,
	hint,
}: Readonly<{
	icon: string;
	label: string;
	onClick: () => void;
	disabled?: boolean;
	hint?: string;
}>) {
	return (
		<button
			type="button"
			role="menuitem"
			className="_rpMenuItem"
			disabled={disabled}
			title={hint}
			onClick={onClick}
		>
			<Icon name={icon} />
			{label}
			{hint ? <small>{hint}</small> : null}
		</button>
	);
}

function Kpi({
	out,
	view,
	fmt,
	href,
	navigate,
	compareLabel,
}: Readonly<{
	out: ReportSuccess;
	view: ReportView;
	fmt: FormatOptions;
	/** The count link (CONTRACT 8.0): the whole tile opens it. */
	href?: string;
	navigate: Navigator;
	compareLabel?: string;
}>) {
	const ms = measureColumns(out);
	const main = (view.y?.length ? ms.find(m => m.key === view.y![0]) : undefined) ?? ms[0];
	if (!main) return null;
	const big = { ...fmt, compact: true };
	// The widget's number format is for the number it is about; the small lines below keep
	// their own formats (a rate in percent must not turn the counts beside it into percents).
	const plain = { ...fmt, numberFormat: undefined, compact: true };
	const full = {
		...fmt,
		numberFormat: {
			...fmt.numberFormat,
			style: fmt.numberFormat?.style === 'percent' ? ('percent' as const) : ('full' as const),
		},
	};
	// With view.y set, only the measures it names are shown (a function source such as a
	// money summary returns many); without it, every measure.
	const extras = (
		view.y?.length ? view.y.slice(1).map(k => ms.find(m => m.key === k)) : ms
	).filter((m): m is NonNullable<typeof m> => !!m && m !== main);
	const rows = out.rows.length ? out.rows : [{}];
	const delta = compareLabel ? kpiDelta(rows[0], main.key) : undefined;
	return (
		<div
			className={`_rpKpi${href ? ' _rpLinkTile' : ''}`}
			{...linkProps(href, navigate, href ? `Open ${main.label ?? main.key}` : undefined)}
		>
			{rows.map((r, i) => (
				<div
					key={i}
					className="_rpKpiValue"
					title={formatMeasure(r[main.key], main, r, full)}
				>
					{formatMeasure(r[main.key], main, r, big)}
				</div>
			))}
			<div className="_rpMuted">{main.label ?? main.key}</div>
			{delta ? (
				<div className={`_rpDelta _${delta.dir}`}>
					<Icon
						name={
							delta.dir === 'up'
								? 'fa-arrow-trend-up'
								: delta.dir === 'down'
									? 'fa-arrow-trend-down'
									: 'fa-minus'
						}
					/>
					{formatMeasure(Math.abs(delta.pct), { key: '', format: 'PERCENT' }, rows[0], {
						locale: fmt.locale,
					})}{' '}
					vs {compareLabel!.toLowerCase()}
				</div>
			) : null}
			{extras.length ? (
				<div className="_rpKpiMore">
					{extras.map(m => (
						<span key={m.key} className="_rpMuted">
							{m.label ?? m.key}: {formatMeasure(rows[0][m.key], m, rows[0], plain)}
						</span>
					))}
				</div>
			) : null}
		</div>
	);
}

function GaugeValue({
	out,
	view,
	fmt,
}: Readonly<{ out: ReportSuccess; view: ReportView; fmt: FormatOptions }>) {
	const g = gaugeParts(out, view);
	return (
		<div className="_rpGaugeValue">
			{formatMeasure(g.missing ? undefined : g.value, g.column, g.row, {
				...fmt,
				compact: true,
			})}
			{g.target !== undefined ? (
				<div className="_rpMuted">
					Target {formatMeasure(g.target, g.column, g.row, { ...fmt, compact: true })}
				</div>
			) : null}
		</div>
	);
}

function Bullet({
	out,
	view,
	fmt,
	color,
}: Readonly<{ out: ReportSuccess; view: ReportView; fmt: FormatOptions; color: string }>) {
	const m = measureColumns(out)[0];
	const row = out.rows[0] ?? {};
	if (!m) return null;
	const value = toNumber(row[m.key]) ?? 0;
	const target = targetValue(view.style, row);
	const max = Math.max(value, target ?? 0) * 1.1 || 1;
	const pct = (v: number) => `${Math.max(0, Math.min(100, (100 * v) / max))}%`;
	const short = { ...fmt, compact: true };
	return (
		<div className="_rpBullet">
			<div className="_rpKpiValue">{formatMeasure(value, m, row, short)}</div>
			<div
				className="_rpBulletTrack"
				role="img"
				aria-label={`${m.label ?? m.key} ${formatMeasure(value, m, row, short)}${target !== undefined ? ` of ${formatMeasure(target, m, row, short)}` : ''}`}
			>
				<div className="_rpBulletFill" style={{ width: pct(value), background: color }} />
				{target !== undefined ? (
					<div className="_rpBulletTarget" style={{ left: pct(target) }} />
				) : null}
			</div>
			<div className="_rpMuted">
				{m.label ?? m.key}
				{target !== undefined
					? ` · target ${formatMeasure(target, m, row, short)}`
					: ' · set a target in Style'}
			</div>
		</div>
	);
}

function List({
	out,
	fmt,
	rowHref,
	navigate,
}: Readonly<{
	out: ReportSuccess;
	fmt: FormatOptions;
	rowHref?: (row: Record<string, any>) => string | undefined;
	navigate: Navigator;
}>) {
	const dims = dimensionColumns(out);
	const ms = measureColumns(out);
	return (
		<ul className="_rpList">
			{out.rows.map((r, i) => {
				const href = rowHref?.(r);
				return (
					<li
						key={i}
						className={href ? '_rpLinkRow' : undefined}
						{...linkProps(href, navigate)}
					>
						<span>
							{dims.length ? formatCell(r, dims[0], fmt) : `Row ${i + 1}`}
							{dims
								.slice(1)
								.filter(d => !blankIfMissing(r, d))
								.map(d => (
									<span key={d.key} className="_rpMuted">
										{' · '}
										{formatCell(r, d, fmt)}
									</span>
								))}
						</span>
						{ms.slice(0, 2).map(m => (
							<span key={m.key} className="_rpMuted" title={m.label}>
								{formatMeasure(r[m.key], m, r, fmt)}
							</span>
						))}
					</li>
				);
			})}
		</ul>
	);
}
