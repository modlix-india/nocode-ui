import React, { useCallback, useMemo, useRef, useState } from 'react';
import { startPointerDrag } from '../../../functions/usePointerDrag';
import { moveInOrder, moveItem, resizeItem, sortLayout } from '../dashboardLayout';
import {
	addDefault,
	addToDashboard,
	addWidget,
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
import { useDashboardDoc } from '../dashboardStore';
import { errorText, ReportTransport, runReport } from '../reportApi';
import { labelOf } from '../reportFormat';
import { fieldLabel, valuesSpec } from '../reportSpecUtil';
import {
	DashboardDoc,
	DashboardFilters,
	DASHBOARD_CAPS,
	LayoutItem,
	Period,
	PERIOD_LABELS,
	PERIODS,
	ReportCatalog,
	VIEW_LABELS,
} from '../reportTypes';
import { Icon, MultiPick, PickOption } from './common';
import { useCatalog, useWidth } from './hooks';
import { EditorValue, ReportEditorView } from './ReportEditorView';
import { ReportWidgetView } from './ReportWidgetView';

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
	const catalog = cat.catalog;
	const docState = useDashboardDoc(transport, props.name, catalog);
	const doc = docState.doc;
	const [mode, setMode] = useState<'dashboard' | 'library'>(props.mode ?? 'dashboard');
	const [filters, setFilters] = useState<DashboardFilters>({});
	const [editing, setEditing] = useState<{ id?: string; value?: EditorValue } | undefined>(
		undefined,
	);
	const [notice, setNotice] = useState<string>('');
	const [confirmReset, setConfirmReset] = useState(false);
	const [drag, setDrag] = useState<DragState | undefined>(undefined);
	const rootRef = useRef<HTMLDivElement>(null);
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

	const loadValues = useCallback(
		(field: string) => async (): Promise<PickOption[]> => {
			const vs = valuesSpec(catalog, field);
			if (!vs || !transport) return [];
			const r = await runReport(transport, runFunction, vs);
			if (!r.ok) throw new Error(errorText(r.error));
			return r.rows.map(row => ({ value: row.k, label: labelOf(row, 'k') }));
		},
		[catalog, transport, runFunction],
	);
	const loaders = useMemo(
		() => new Map((catalog?.quickFilters ?? []).map(f => [f, loadValues(f)])),
		[catalog, loadValues],
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
				onRemove={editable ? () => apply(d => removeFromDashboard(d, item.id)) : undefined}
				onDelete={editable ? () => apply(d => deleteWidget(d, item.id)) : undefined}
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

	return (
		<div className="_rpDash" ref={rootRef}>
			<div className="_rpBar">
				{props.title ? <div className="_rpTitle">{props.title}</div> : null}
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
										period: (e.target.value || undefined) as Period | undefined,
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
									onChange={v =>
										setFilters(s => ({
											...s,
											quick: { ...(s.quick ?? {}), [f]: v },
										}))
									}
								/>
							) : null,
						)}
					</>
				) : null}
				<div className="_rpSpacer" />
				{editable ? (
					<>
						<button type="button" className="_rpBtn" onClick={() => setEditing({})}>
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
									name={mode === 'dashboard' ? 'fa-book' : 'fa-table-cells-large'}
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
			{notice ? (
				<div className="_rpError" role="alert">
					{notice}
				</div>
			) : null}

			{mode === 'library' ? (
				<LibraryList
					doc={doc}
					catalog={catalog}
					editable={editable}
					apply={apply}
					onEdit={(id, value) => setEditing({ id, value })}
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

			{editing ? (
				<>
					<div className="_rpBackdrop" />
					<div
						className="_rpModal"
						role="dialog"
						aria-label={editing.id ? 'Edit widget' : 'New widget'}
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
								onSave={saveEditor}
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
					</div>
				</>
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
}: Readonly<{
	doc: DashboardDoc;
	catalog: ReportCatalog;
	editable?: boolean;
	apply: (fn: (d: DashboardDoc) => DocResult | DashboardDoc) => void;
	onEdit: (id: string, v: EditorValue) => void;
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
								<button
									type="button"
									className="_rpBtn"
									onClick={() => apply(d => deleteWidget(d, id))}
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
