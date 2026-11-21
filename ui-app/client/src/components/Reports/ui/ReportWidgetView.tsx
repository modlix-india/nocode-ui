import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildChartConfig, gaugeParts, targetValue, colorFor } from '../reportChartConfig';
import { errorText, ReportTransport, runReport } from '../reportApi';
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
	DrillStep,
	drillCrumbs,
	effectiveSpec,
	markActions,
	MarkActions,
	MarkTarget,
	specKey,
} from '../reportSpecUtil';
import { useChartTheme } from '../reportStyle';
import { applyStyleTransforms, chartAxes, isAdditive } from '../reportTransform';
import {
	CANVAS_VIEWS,
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
} from '../reportTypes';
import { fitOf, shapeOf } from '../shapeRules';
import { ChartTypePicker } from './ChartTypePicker';
import { blankIfMissing, Crosstab, DataTable, Icon, IconButton, useDismiss } from './common';
import type { MarkClick, ReportChartHandle } from './ReportChart';
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
	const [full, setFull] = useState(false);
	const [forceBlocked, setForceBlocked] = useState(false);
	const [state, setState] = useState<RunState>({ status: 'idle' });

	// A new saved spec wins over the session's look changes.
	const savedKey = specKey(spec);
	useEffect(() => {
		setViewOverride(undefined);
		setStyleDraft(undefined);
	}, [savedKey]);

	const baseView = viewOverride ?? spec.view;
	const view: ReportView = styleDraft ? { ...baseView, style: styleDraft } : baseView;
	const style = view.style ?? {};

	const eff = useMemo(
		() =>
			effectiveSpec(
				{ ...spec, view: baseView },
				{ catalog, dashboard, session, drill: steps },
			),
		[spec, baseView, catalog, dashboard, session, steps],
	);
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
			if (res.ok) setState({ status: 'ok', out: res });
			else setState(s => ({ status: 'error', error: res.error, out: s.out }));
		},
		[transport, runFunction],
	);

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

	useEffect(() => {
		if (!full) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [full]);

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
	const out = state.out;
	const shown = useMemo(
		() => (out ? applyStyleTransforms(out, eff.spec, style) : undefined),
		[out, eff.spec, style],
	);
	const shape = useMemo(() => shapeOf(eff.spec, catalog, out), [eff.spec, catalog, out]);
	const fit = fitOf(view.type, shape, out?.fits);
	const compact = props.compact || style.density === 'compact';
	const isCanvas = CANVAS_VIEWS.has(view.type);

	const config = useMemo(() => {
		if (!shown || !isCanvas) return undefined;
		return buildChartConfig(shown, view, theme, {
			locale: catalog?.locale,
			currency: catalog?.currency,
			compact,
		});
	}, [shown, view, theme, catalog?.locale, catalog?.currency, compact, isCanvas]);

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
		const row = ds?._rows?.[m.index];
		if (!row) return;
		const axes = chartAxes(shown, view);
		const target: MarkTarget = {
			row,
			x: axes.x,
			series: axes.series,
			seriesValue: ds._seriesKey !== undefined ? row[axes.series?.key ?? ''] : undefined,
		};
		const actions = markActions(eff.spec, target);
		const box = rootRef.current?.querySelector('._rpCanvas') as HTMLElement | null;
		const rootBox = rootRef.current?.getBoundingClientRect();
		const canvasBox = box?.getBoundingClientRect();
		const ox = (canvasBox?.left ?? 0) - (rootBox?.left ?? 0);
		const oy = (canvasBox?.top ?? 0) - (rootBox?.top ?? 0);
		setMark({ x: ox + m.x, y: oy + m.y, target, actions });
	};

	const addSession = (fs: SessionFilter[] | undefined) => {
		setMark(undefined);
		if (fs?.length) setSession(s => [...s, ...fs]);
	};

	const downloadPng = () => {
		setPop(undefined);
		const canvas = chartRef.current?.canvas();
		if (!canvas) return;
		const c = document.createElement('canvas');
		c.width = canvas.width;
		c.height = canvas.height;
		const ctx = c.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = theme.surface || 'transparent';
		ctx.fillRect(0, 0, c.width, c.height);
		ctx.drawImage(canvas, 0, 0);
		const a = document.createElement('a');
		a.href = c.toDataURL('image/png');
		a.download = `${(props.name || view.title || 'chart').replace(/[^\w\- ]+/g, '').trim() || 'chart'}.png`;
		a.click();
	};

	const title = props.name || view.title || 'Report';
	// The crumbs name the level the widget started at, so they read the spec before the drill.
	const crumbs = drillCrumbs({ ...spec, view: baseView }, steps);
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

	const menuRef = useDismiss(pop !== undefined, () => setPop(undefined));
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
				return <Kpi out={shown} view={view} fmt={fmt} />;
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
				return <DataTable out={shown} fmt={fmt} compact={compact} />;
			case 'LIST':
				return <List out={shown} fmt={fmt} />;
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
								/>
							) : null}
						</Suspense>
						{view.type === 'GAUGE' && shown ? (
							<GaugeValue out={shown} view={view} fmt={fmt} />
						) : null}
					</div>
				);
		}
	};

	return (
		<>
			{full ? <div className="_rpBackdrop" onClick={() => setFull(false)} /> : null}
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
							<button
								type="button"
								className="_rpBtn _primary"
								onClick={props.onKeep}
							>
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
							<div className="_rpPop _right" style={{ top: 40 }}>
								<ChartTypePicker
									shape={shape}
									value={view.type}
									onPick={pickType}
									runnerFits={out?.fits}
								/>
							</div>
						) : null}
						{pop === 'menu' ? (
							<div className="_rpPop _right" style={{ top: 40 }} role="menu">
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
							</div>
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
				</div>
				<div className="_rpBody" aria-busy={state.status === 'loading'}>
					{state.status === 'loading' && out ? (
						<span className="_rpSpin _rpMuted" aria-hidden="true">
							<Icon name="fa-spinner fa-spin" />
						</span>
					) : null}
					{body()}
					{mark ? (
						<div
							ref={markRef}
							className="_rpPop"
							role="menu"
							style={{
								left: Math.max(
									4,
									Math.min(mark.x, (rootRef.current?.clientWidth ?? 300) - 200),
								),
								top: mark.y,
							}}
						>
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
									hint={mark.actions.drill.level.toLowerCase()}
									onClick={() => {
										const d = mark.actions.drill!;
										setMark(undefined);
										setSteps(s => [...s, d]);
									}}
								/>
							) : null}
							<MenuItem
								icon="fa-table"
								label="View data"
								onClick={() => (setMark(undefined), setShowData(true))}
							/>
						</div>
					) : null}
				</div>
				{props.footer}
			</div>
			{styleDraft !== undefined ? (
				<div className="_rpDrawer" role="dialog" aria-label="Style">
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
				</div>
			) : null}
			{showData && out ? (
				<>
					<div className="_rpBackdrop" onClick={() => setShowData(false)} />
					<div className="_rpModal" role="dialog" aria-label={`${title} data`}>
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
					</div>
				</>
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
}: Readonly<{ out: ReportSuccess; view: ReportView; fmt: FormatOptions }>) {
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
	return (
		<div className="_rpKpi">
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

function List({ out, fmt }: Readonly<{ out: ReportSuccess; fmt: FormatOptions }>) {
	const dims = dimensionColumns(out);
	const ms = measureColumns(out);
	return (
		<ul className="_rpList">
			{out.rows.map((r, i) => (
				<li key={i}>
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
			))}
		</ul>
	);
}
