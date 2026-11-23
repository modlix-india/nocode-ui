import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	formatCell,
	FormatOptions,
	labelOf,
	visibleColumns,
	toNumber,
	formatMeasure,
} from '../reportFormat';
import { linkProps, Navigator } from '../reportLinks';
import { ReportColumn, ReportSuccess } from '../reportTypes';
import { Pop } from './portal';

/**
 * Closes a popover on a press outside it or Escape. `inside` are more elements that count as
 * the popover (its portal: a popover renders under document.body, away from its button).
 * Escape is taken in the capture phase and marked handled, so a drawer or modal behind the
 * popover stays open (useEscape skips a handled key).
 */
export function useDismiss(
	open: boolean,
	close: () => void,
	...inside: Array<React.RefObject<HTMLElement | null>>
) {
	const ref = useRef<HTMLDivElement>(null);
	const closeRef = useRef(close);
	closeRef.current = close;
	const insideRef = useRef(inside);
	insideRef.current = inside;
	useEffect(() => {
		if (!open) return;
		// A press in another portaled popover counts as inside: it is a menu opened from this
		// one (a value picker inside a filter menu).
		const isInside = (n: Node) =>
			[ref, ...insideRef.current].some(r => !!r.current && r.current.contains(n)) ||
			!!(n as Element)?.closest?.('._rpPopFixed');
		const onDown = (e: PointerEvent) => {
			if (ref.current && !isInside(e.target as Node)) closeRef.current();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || e.defaultPrevented) return;
			e.preventDefault();
			closeRef.current();
		};
		const t = setTimeout(() => document.addEventListener('pointerdown', onDown, true), 0);
		document.addEventListener('keydown', onKey, true);
		return () => {
			clearTimeout(t);
			document.removeEventListener('pointerdown', onDown, true);
			document.removeEventListener('keydown', onKey, true);
		};
	}, [open]);
	return ref;
}

export function Icon({ name }: Readonly<{ name: string }>) {
	return <i className={`fa fa-solid ${name}`} aria-hidden="true" />;
}

export function IconButton({
	icon,
	label,
	onClick,
	disabled,
	on,
}: Readonly<{
	icon: string;
	label: string;
	onClick: () => void;
	disabled?: boolean;
	on?: boolean;
}>) {
	return (
		<button
			type="button"
			className={`_rpIconBtn${on ? ' _on' : ''}`}
			title={label}
			aria-label={label}
			disabled={disabled}
			onPointerDown={e => e.stopPropagation()}
			onClick={e => {
				e.stopPropagation();
				onClick();
			}}
		>
			<Icon name={icon} />
		</button>
	);
}

/**
 * The runner leaves keys whose value is null out of a row; a table shows those cells blank
 * (a KPI shows a dash, a chart skips the point).
 */
export function blankIfMissing(row: Record<string, any>, c: ReportColumn): boolean {
	const v = row[c.key];
	const l = row[`${c.key}_label`];
	return (v === undefined || v === null) && (l === undefined || l === null);
}

/**
 * The result rows as a table: visible columns, sortable, numbers right aligned. With `rowHref`
 * a row that has a link opens it on click or Enter (CONTRACT 8.0).
 */
export function DataTable({
	out,
	fmt,
	compact,
	maxRows,
	rowHref,
	navigate,
}: Readonly<{
	out: ReportSuccess;
	fmt: FormatOptions;
	compact?: boolean;
	maxRows?: number;
	rowHref?: (row: Record<string, any>) => string | undefined;
	navigate?: Navigator;
}>) {
	const cols = useMemo(() => visibleColumns(out), [out]);
	const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | undefined>(undefined);
	const rows = useMemo(() => {
		const rs = out.rows.slice(0, maxRows ?? out.rows.length);
		if (!sort) return rs;
		const col = cols.find(c => c.key === sort.key);
		const isNum = col?.kind === 'MEASURE';
		return [...rs].sort((a, b) => {
			if (isNum)
				return (
					((toNumber(a[sort.key]) ?? -Infinity) - (toNumber(b[sort.key]) ?? -Infinity)) *
					sort.dir
				);
			return labelOf(a, sort.key).localeCompare(labelOf(b, sort.key)) * sort.dir;
		});
	}, [out, cols, sort, maxRows]);
	if (!cols.length) return <div className="_rpState _rpMuted">No columns</div>;
	return (
		<div className={`_rpTableWrap${compact ? ' _rpCompactRows' : ''}`}>
			<table className="_rpTable">
				<thead>
					<tr>
						{cols.map(c => (
							<th
								key={c.key}
								className={c.kind === 'MEASURE' ? '_num' : undefined}
								aria-sort={
									sort?.key === c.key
										? sort.dir === 1
											? 'ascending'
											: 'descending'
										: 'none'
								}
								onClick={() =>
									setSort(s =>
										s?.key === c.key
											? { key: c.key, dir: s.dir === 1 ? -1 : 1 }
											: { key: c.key, dir: c.kind === 'MEASURE' ? -1 : 1 },
									)
								}
							>
								{c.label ?? c.key}
								{sort?.key === c.key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => {
						const href = rowHref && navigate ? rowHref(r) : undefined;
						return (
							<tr
								key={i}
								className={href ? '_rpLinkRow' : undefined}
								{...(href && navigate ? linkProps(href, navigate) : {})}
							>
								{cols.map(c => (
									<td
										key={c.key}
										className={c.kind === 'MEASURE' ? '_num' : undefined}
									>
										{blankIfMissing(r, c) ? '' : formatCell(r, c, fmt)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
			{out.truncated ? (
				<div className="_rpMuted">Showing the first {out.rows.length} rows.</div>
			) : null}
		</div>
	);
}

/** Two group bys and one measure as a grid, with totals when the measure adds up. */
export function Crosstab({
	out,
	rowsCol,
	colsCol,
	measure,
	additive,
	fmt,
	compact,
}: Readonly<{
	out: ReportSuccess;
	rowsCol: ReportColumn;
	colsCol: ReportColumn;
	measure: ReportColumn;
	additive: boolean;
	fmt: FormatOptions;
	compact?: boolean;
}>) {
	const { rKeys, rLabels, cKeys, cLabels, cell } = useMemo(() => {
		const rKeys: string[] = [];
		const cKeys: string[] = [];
		const rLabels = new Map<string, string>();
		const cLabels = new Map<string, string>();
		const cell = new Map<string, Record<string, any>>();
		for (const r of out.rows) {
			const rk = String(r[rowsCol.key]);
			const ck = String(r[colsCol.key]);
			if (!rLabels.has(rk)) {
				rKeys.push(rk);
				rLabels.set(rk, labelOf(r, rowsCol.key));
			}
			if (!cLabels.has(ck)) {
				cKeys.push(ck);
				cLabels.set(ck, labelOf(r, colsCol.key));
			}
			cell.set(rk + '\u0000' + ck, r);
		}
		return { rKeys, rLabels, cKeys, cLabels, cell };
	}, [out, rowsCol, colsCol]);
	const v = (rk: string, ck: string) => toNumber(cell.get(rk + '\u0000' + ck)?.[measure.key]);
	const show = (n: number | undefined, row?: Record<string, any>) =>
		n === undefined ? '' : formatMeasure(n, measure, row, fmt);
	return (
		<div className={`_rpTableWrap${compact ? ' _rpCompactRows' : ''}`}>
			<table className="_rpTable">
				<thead>
					<tr>
						<th>
							{rowsCol.label ?? rowsCol.key} / {colsCol.label ?? colsCol.key}
						</th>
						{cKeys.map(ck => (
							<th key={ck} className="_num">
								{cLabels.get(ck)}
							</th>
						))}
						{additive ? <th className="_num">Total</th> : null}
					</tr>
				</thead>
				<tbody>
					{rKeys.map(rk => (
						<tr key={rk}>
							<td>{rLabels.get(rk)}</td>
							{cKeys.map(ck => (
								<td key={ck} className="_num">
									{show(v(rk, ck), cell.get(rk + '\u0000' + ck))}
								</td>
							))}
							{additive ? (
								<td className="_num">
									{show(
										cKeys.reduce((a, ck) => a + (v(rk, ck) ?? 0), 0),
										out.rows[0],
									)}
								</td>
							) : null}
						</tr>
					))}
					{additive ? (
						<tr className="_total">
							<td>Total</td>
							{cKeys.map(ck => (
								<td key={ck} className="_num">
									{show(
										rKeys.reduce((a, rk) => a + (v(rk, ck) ?? 0), 0),
										out.rows[0],
									)}
								</td>
							))}
							<td className="_num">
								{show(
									rKeys.reduce(
										(a, rk) =>
											a + cKeys.reduce((b, ck) => b + (v(rk, ck) ?? 0), 0),
										0,
									),
									out.rows[0],
								)}
							</td>
						</tr>
					) : null}
				</tbody>
			</table>
		</div>
	);
}

export interface PickOption {
	value: any;
	label: string;
}

/** A dropdown of checkboxes (quick filters, filter values). Options load on first open. */
export function MultiPick({
	label,
	values,
	onChange,
	loadOptions,
	placeholder,
	optionsKey,
}: Readonly<{
	label: string;
	values: any[];
	onChange: (v: any[]) => void;
	loadOptions: () => Promise<PickOption[]>;
	placeholder?: string;
	/** When this changes the choices are stale (a cascading filter): they load again on the next open. */
	optionsKey?: string;
}>) {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<PickOption[] | undefined>(undefined);
	const [failed, setFailed] = useState(false);
	// Labels seen so far, so a pick still reads as its name while the choices reload.
	const seenLabels = useRef(new Map<string, string>());
	const lastKey = useRef(optionsKey);
	const popRef = useRef<HTMLDivElement>(null);
	const ref = useDismiss(open, () => setOpen(false), popRef);
	useEffect(() => {
		if (lastKey.current === optionsKey) return;
		lastKey.current = optionsKey;
		setOptions(undefined);
		setFailed(false);
	}, [optionsKey]);
	useEffect(() => {
		if (!open || options) return;
		let alive = true;
		loadOptions().then(
			o => {
				if (!alive) return;
				o.forEach(e => seenLabels.current.set(String(e.value), e.label));
				setOptions(o);
			},
			() => alive && setFailed(true),
		);
		return () => {
			alive = false;
		};
	}, [open, options, loadOptions]);
	const selected = new Set(values.map(String));
	const text = values.length
		? values.length === 1
			? (options?.find(o => String(o.value) === String(values[0]))?.label ??
				seenLabels.current.get(String(values[0])) ??
				String(values[0]))
			: `${values.length} selected`
		: (placeholder ?? 'All');
	return (
		<div className="_rpPick" ref={ref}>
			<label className="_rpLabel">
				{label}
				<button
					type="button"
					className="_rpBtn"
					aria-haspopup="listbox"
					aria-expanded={open}
					onClick={() => setOpen(o => !o)}
				>
					{text} <Icon name="fa-chevron-down" />
				</button>
			</label>
			{open ? (
				<Pop anchor={ref.current} popRef={popRef} role="listbox">
					{values.length ? (
						<button type="button" className="_rpMenuItem" onClick={() => onChange([])}>
							Clear
						</button>
					) : null}
					<div className="_rpPickList">
						{!options && !failed ? (
							<div className="_rpMuted" style={{ padding: 8 }}>
								Loading
							</div>
						) : null}
						{failed ? (
							<div className="_rpMuted _rpError" style={{ padding: 8 }}>
								Could not load the choices
							</div>
						) : null}
						{options?.length === 0 ? (
							<div className="_rpMuted" style={{ padding: 8 }}>
								No values
							</div>
						) : null}
						{options?.map(o => (
							<label key={String(o.value)} className="_rpMenuItem _rpCheck">
								<input
									type="checkbox"
									checked={selected.has(String(o.value))}
									onChange={e =>
										onChange(
											e.target.checked
												? [...values, o.value]
												: values.filter(v => String(v) !== String(o.value)),
										)
									}
								/>
								{o.label}
							</label>
						))}
					</div>
				</Pop>
			) : null}
		</div>
	);
}
