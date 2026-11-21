import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorText, ReportTransport, runReport } from '../reportApi';
import { labelOf } from '../reportFormat';
import { bySize, cloneSpec, reportSources, valuesSpec } from '../reportSpecUtil';
import { checkView, shapeOf, suggestView } from '../shapeRules';
import {
	BUCKET_LABELS,
	Bucket,
	CatalogField,
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
import { ChartTypePicker } from './ChartTypePicker';
import { IconButton, MultiPick, PickOption } from './common';
import { ReportWidgetView } from './ReportWidgetView';

/**
 * The P1a report editor: a plain field form over the spec (the shelves editor replaces it in
 * P1b). Every change validates through `reportRun` with `dryRun`; a spec that passes is then
 * previewed with a real run. Save hands back the name, spec and refresh interval.
 */

export interface EditorValue {
	name: string;
	spec: ReportSpec;
	refreshMin: number;
}

const BUCKETS: Bucket[] = ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'];
const NO_VALUE_OPS = new Set<FilterOp>(['IS_NULL', 'NOT_NULL']);

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

export function ReportEditorView({
	transport,
	catalog,
	runFunction,
	initial,
	onSave,
	onCancel,
	saveLabel,
	extra,
}: Readonly<{
	transport?: ReportTransport;
	catalog?: ReportCatalog;
	runFunction: string;
	initial?: EditorValue;
	onSave: (v: EditorValue) => void | Promise<void>;
	onCancel?: () => void;
	saveLabel?: string;
	/** More controls next to Save (the standalone editor's "Add to my dashboard"). */
	extra?: React.ReactNode;
}>) {
	const [spec, setSpecRaw] = useState<ReportSpec>(
		() => cloneSpec(initial?.spec) ?? newSpec(catalog),
	);
	const [name, setName] = useState(initial?.name ?? '');
	const [refreshMin, setRefreshMin] = useState(initial?.refreshMin ?? 0);
	const [check, setCheck] = useState<{
		status: 'idle' | 'checking' | 'ok' | 'error';
		error?: ReportErrorBody;
		spec?: ReportSpec;
	}>({ status: 'idle' });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!initial && catalog && !spec.source) setSpecRaw(newSpec(catalog));
	}, [catalog]);

	const setSpec = (fn: (s: ReportSpec) => ReportSpec) =>
		setSpecRaw(s => tidySpec(fn(cloneSpec(s)), catalog));
	const source = catalog?.sources?.[spec.source];
	const isFunction = source?.kind === 'FUNCTION';
	const fields = fieldsOf(catalog, spec.source);
	const dims = fields.filter(([, f]) => f.kind !== 'MEASURE' && !f.pii);
	const dates = fields.filter(([, f]) => f.kind === 'DATE');
	const shape = shapeOf(spec, catalog);

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
			const vs = valuesSpec(catalog, field);
			if (!vs || !transport) return [];
			const r = await runReport(transport, runFunction, vs);
			if (!r.ok) throw new Error(errorText(r.error));
			return r.rows.map(row => ({ value: row.k, label: labelOf(row, 'k') }));
		},
		[catalog, transport, runFunction],
	);

	const takenAs = () =>
		new Set([...(spec.measures ?? []).map(m => m.as), ...(spec.derived ?? []).map(d => d.as)]);
	const fieldOptions = (fn: MeasureFn): Array<[string, CatalogField]> =>
		fn === 'COUNT_DISTINCT'
			? dims
			: fields.filter(([, f]) => f.kind === 'MEASURE' && (!f.fns || f.fns.includes(fn)));
	const valueKeys = [
		...(spec.measures ?? []).map(m => m.as),
		...(spec.derived ?? []).map(d => d.as),
	];
	const keyLabel = (k: string) => {
		const m = spec.measures?.find(e => e.as === k);
		if (!m) return k;
		if (m.fn === 'COUNT') return 'Count';
		return `${MEASURE_FN_LABELS[m.fn]} of ${fields.find(([n]) => n === m.field)?.[1].label ?? m.field}`;
	};

	const canSave = !!name.trim() && check.status === 'ok' && !saving;

	return (
		<div className="_rpEditor">
			<div className="_rpEditorForm">
				<label className="_rpLabel">
					Name
					<input
						className="_rpInput"
						value={name}
						placeholder="Bookings by RM"
						onChange={e => setName(e.target.value)}
					/>
				</label>
				<label className="_rpLabel">
					Data
					<select
						className="_rpSelect"
						value={spec.source}
						onChange={e => {
							const next = newSpec(catalog);
							next.source = e.target.value;
							if (catalog?.sources?.[next.source]?.kind === 'FUNCTION') {
								delete next.measures;
								next.view = { type: 'TABLE' };
							}
							setSpecRaw(next);
						}}
					>
						{reportSources(catalog).map(([k, s]) => (
							<option key={k} value={k}>
								{s.label ?? k}
							</option>
						))}
					</select>
				</label>

				{isFunction ? (
					<label className="_rpLabel">
						Parameters (JSON)
						<textarea
							className="_rpInput"
							rows={4}
							defaultValue={spec.params ? JSON.stringify(spec.params, null, 2) : ''}
							onBlur={e => {
								try {
									const v = e.target.value.trim()
										? JSON.parse(e.target.value)
										: undefined;
									setSpec(s => ({ ...s, params: v }));
								} catch {
									// Left as typed; the dry run below keeps the last valid parameters.
								}
							}}
						/>
					</label>
				) : (
					<>
						{source?.segments && Object.keys(source.segments).length ? (
							<label className="_rpLabel">
								Which records
								<select
									className="_rpSelect"
									value={spec.segment ?? ''}
									onChange={e =>
										setSpec(s => ({
											...s,
											segment: e.target.value || undefined,
										}))
									}
								>
									<option value="">
										All {source.label?.toLowerCase() ?? 'records'}
									</option>
									{Object.entries(source.segments).map(([k, sg]) => (
										<option key={k} value={k}>
											{sg.label ?? k}
										</option>
									))}
								</select>
							</label>
						) : null}

						<div className="_rpGroup">
							<div className="_rpGroupTitle">Measures</div>
							{(spec.measures ?? []).map((m, i) => (
								<div key={i} className="_rpLine">
									<select
										className="_rpSelect"
										aria-label="Function"
										value={m.fn}
										onChange={e =>
											setSpec(s => {
												const fn = e.target.value as MeasureFn;
												const opts = fieldOptions(fn);
												const field =
													fn === 'COUNT'
														? undefined
														: opts.some(([n]) => n === m.field)
															? m.field
															: opts[0]?.[0];
												const taken = takenAs();
												taken.delete(m.as);
												s.measures![i] = {
													fn,
													field,
													as: measureAs(fn, field, taken),
													...(m.segment ? { segment: m.segment } : {}),
												};
												return s;
											})
										}
									>
										{MEASURE_FNS.filter(
											fn => fn === 'COUNT' || fieldOptions(fn).length,
										).map(fn => (
											<option key={fn} value={fn}>
												{MEASURE_FN_LABELS[fn]}
											</option>
										))}
									</select>
									{m.fn !== 'COUNT' ? (
										<select
											className="_rpSelect"
											aria-label="Field"
											value={m.field ?? ''}
											onChange={e =>
												setSpec(s => {
													const taken = takenAs();
													taken.delete(m.as);
													s.measures![i] = {
														...m,
														field: e.target.value,
														as: measureAs(m.fn, e.target.value, taken),
													};
													return s;
												})
											}
										>
											{fieldOptions(m.fn).map(([n, f]) => (
												<option key={n} value={n}>
													{f.label ?? n}
												</option>
											))}
										</select>
									) : null}
									{source?.segments && Object.keys(source.segments).length ? (
										<select
											className="_rpSelect"
											aria-label="Only these records"
											value={m.segment ?? ''}
											onChange={e =>
												setSpec(s => {
													const { segment: _old, ...rest } =
														s.measures![i];
													s.measures![i] = e.target.value
														? { ...rest, segment: e.target.value }
														: rest;
													return s;
												})
											}
										>
											<option value="">Of every record</option>
											{Object.entries(source.segments).map(([k, sg]) => (
												<option key={k} value={k}>
													Only {sg.label ?? k}
												</option>
											))}
										</select>
									) : null}
									<IconButton
										icon="fa-xmark"
										label="Remove measure"
										disabled={(spec.measures?.length ?? 0) <= 1}
										onClick={() =>
											setSpec(s => ({
												...s,
												measures: s.measures!.filter((_, j) => j !== i),
											}))
										}
									/>
								</div>
							))}
							{(spec.measures?.length ?? 0) < SPEC_CAPS.measures ? (
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										setSpec(s => ({
											...s,
											measures: [
												...(s.measures ?? []),
												{
													fn: 'COUNT',
													as: measureAs('COUNT', undefined, takenAs()),
												},
											],
										}))
									}
								>
									Add a measure
								</button>
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
							{(spec.measures?.length ?? 0) >= 2 &&
							(spec.derived?.length ?? 0) < 2 ? (
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
						</div>

						<div className="_rpGroup">
							<div className="_rpGroupTitle">Group by</div>
							{(spec.groupBy ?? []).map((g, i) => {
								const f = fields.find(([n]) => n === g.field)?.[1];
								return (
									<div key={i} className="_rpLine">
										<select
											className="_rpSelect"
											aria-label="Group by field"
											value={g.field}
											onChange={e =>
												setSpec(s => {
													const nf = fields.find(
														([n]) => n === e.target.value,
													)?.[1];
													const taken = new Set(
														(s.groupBy ?? []).map(x => x.as),
													);
													taken.delete(g.as);
													s.groupBy![i] = {
														field: e.target.value,
														as: uniqueAs(e.target.value, taken),
														...(nf?.kind === 'DATE'
															? { bucket: g.bucket ?? 'MONTH' }
															: {}),
													};
													return s;
												})
											}
										>
											{dims.map(([n, df]) => (
												<option key={n} value={n}>
													{df.label ?? n}
												</option>
											))}
										</select>
										{f?.kind === 'DATE' ? (
											<select
												className="_rpSelect"
												aria-label="By"
												value={g.bucket ?? 'MONTH'}
												onChange={e =>
													setSpec(
														s => (
															(s.groupBy![i] = {
																...g,
																bucket: e.target.value as Bucket,
															}),
															s
														),
													)
												}
											>
												{BUCKETS.map(b => (
													<option key={b} value={b}>
														By {BUCKET_LABELS[b].toLowerCase()}
													</option>
												))}
											</select>
										) : null}
										<IconButton
											icon="fa-xmark"
											label="Remove group by"
											onClick={() =>
												setSpec(s => ({
													...s,
													groupBy: s.groupBy!.filter((_, j) => j !== i),
												}))
											}
										/>
									</div>
								);
							})}
							{(spec.groupBy?.length ?? 0) < SPEC_CAPS.groupBy && dims.length ? (
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										setSpec(s => {
											const [n, f] =
												dims.find(
													([k]) =>
														!(s.groupBy ?? []).some(g => g.field === k),
												) ?? dims[0];
											const taken = new Set((s.groupBy ?? []).map(x => x.as));
											return {
												...s,
												groupBy: [
													...(s.groupBy ?? []),
													{
														field: n,
														as: uniqueAs(n, taken),
														...(f.kind === 'DATE'
															? { bucket: 'MONTH' as Bucket }
															: {}),
													},
												],
											};
										})
									}
								>
									Add a group by
								</button>
							) : null}
						</div>

						<div className="_rpGroup">
							<div className="_rpGroupTitle">Filters</div>
							{(spec.filters ?? []).map((f, i) => (
								<FilterRow
									key={i}
									value={f}
									fields={fields}
									loadValues={loadValues}
									onChange={v =>
										setSpec(s => ({
											...s,
											filters: v
												? s.filters!.map((e, j) => (j === i ? v : e))
												: s.filters!.filter((_, j) => j !== i),
										}))
									}
								/>
							))}
							{(spec.filters?.length ?? 0) < SPEC_CAPS.filters ? (
								<div className="_rpLine">
									{dates.length ? (
										<button
											type="button"
											className="_rpBtn"
											onClick={() =>
												setSpec(s => {
													// The date the report already uses, else the first by name.
													const used =
														s.groupBy?.find(g => g.bucket)?.field ??
														s.filters?.find(f => f.period)?.field;
													const field =
														used && dates.some(([n]) => n === used)
															? used
															: dates[0][0];
													return {
														...s,
														filters: [
															...(s.filters ?? []),
															{ field, period: 'THIS_MONTH' },
														],
													};
												})
											}
										>
											Add a date range
										</button>
									) : null}
									{dims.filter(([, f]) => f.kind !== 'DATE').length ? (
										<button
											type="button"
											className="_rpBtn"
											onClick={() =>
												setSpec(s => ({
													...s,
													filters: [
														...(s.filters ?? []),
														{
															field: dims.find(
																([, f]) => f.kind !== 'DATE',
															)![0],
															op: 'IN',
															values: [],
														},
													],
												}))
											}
										>
											Add a condition
										</button>
									) : null}
								</div>
							) : null}
						</div>

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
											{fields.find(([n]) => n === g.field)?.[1].label ??
												g.field}
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
										setSpec(s => ({
											...s,
											limit: e.target.value
												? Math.max(1, Number(e.target.value))
												: undefined,
										}))
									}
								/>
							</label>
						</div>
					</>
				)}

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

				<label className="_rpLabel">
					Auto refresh
					<select
						className="_rpSelect"
						value={refreshMin}
						onChange={e => setRefreshMin(Number(e.target.value))}
					>
						{REFRESH_CHOICES.map(m => (
							<option key={m} value={m}>
								{m ? `Every ${m} min` : 'Off'}
							</option>
						))}
					</select>
				</label>

				{check.status === 'error' ? (
					<div className="_rpError" role="alert">
						{errorText(check.error)}
						{check.error?.path ? (
							<span className="_rpMuted"> ({check.error.path})</span>
						) : null}
					</div>
				) : null}

				<div className="_rpLine">
					{onCancel ? (
						<button type="button" className="_rpBtn" onClick={onCancel}>
							Cancel
						</button>
					) : null}
					{extra}
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
						onClick={async () => {
							setSaving(true);
							try {
								await onSave({
									name: name.trim(),
									spec: {
										...spec,
										view: { ...spec.view, title: spec.view.title ?? undefined },
									},
									refreshMin,
								});
							} finally {
								setSaving(false);
							}
						}}
					>
						{saveLabel ?? 'Save'}
					</button>
				</div>
			</div>
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
