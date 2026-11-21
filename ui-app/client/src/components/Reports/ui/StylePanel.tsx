import React from 'react';
import { themePalette } from '../reportStyle';
import { ReferenceLine, ReportStyle, ViewType } from '../reportTypes';

export const PALETTES = [
	{ name: '_primary', label: 'Primary' },
	{ name: '_secondary', label: 'Secondary' },
	{ name: '_tertiary', label: 'Tertiary' },
	{ name: '_quaternary', label: 'Quaternary' },
];

export interface StyleTarget {
	key: string;
	label: string;
}

const CARTESIAN = new Set<ViewType>([
	'BAR',
	'HBAR',
	'GROUPED_BAR',
	'STACKED_BAR',
	'STACKED_BAR_100',
	'LOLLIPOP',
	'FUNNEL',
	'LINE',
	'SMOOTH_LINE',
	'STEP_LINE',
	'AREA',
	'STACKED_AREA',
	'COMBO',
	'SCATTER',
	'WATERFALL',
]);
const LINES = new Set<ViewType>([
	'LINE',
	'SMOOTH_LINE',
	'STEP_LINE',
	'AREA',
	'STACKED_AREA',
	'COMBO',
]);

function clean(style: ReportStyle): ReportStyle {
	const out: any = {};
	for (const [k, v] of Object.entries(style)) {
		if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
		if (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) continue;
		out[k] = v;
	}
	return out;
}

/**
 * Every `view.style` option (CONTRACT section 1), theme first: palettes are the theme's chart
 * schemes, series colours are positions in that palette, never a colour value.
 */
export function StylePanel({
	type,
	style,
	onChange,
	measures,
	series,
}: Readonly<{
	type: ViewType;
	style: ReportStyle;
	onChange: (s: ReportStyle) => void;
	/** Measures in the result (series colours, reference lines, target). */
	measures: StyleTarget[];
	/** Series values when the second group by is drawn as series. */
	series?: StyleTarget[];
}>) {
	const set = (patch: Partial<ReportStyle>) => onChange(clean({ ...style, ...patch }));
	const palette = themePalette(style.palette);
	const cartesian = CARTESIAN.has(type);
	const radial = type === 'PIE' || type === 'DOUGHNUT';
	const chart =
		cartesian || radial || type === 'GAUGE' || type === 'HEATMAP' || type === 'TREEMAP';
	const colorTargets = series?.length ? series : measures;
	const lines = style.referenceLines ?? [];
	const setLine = (i: number, patch: Partial<ReferenceLine>) =>
		set({ referenceLines: lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });

	const select = (
		label: string,
		value: string | undefined,
		options: Array<[string, string]>,
		on: (v: string | undefined) => void,
	) => (
		<label className="_rpLabel">
			{label}
			<select
				className="_rpSelect"
				value={value ?? ''}
				onChange={e => on(e.target.value || undefined)}
			>
				{options.map(([v, l]) => (
					<option key={v} value={v}>
						{l}
					</option>
				))}
			</select>
		</label>
	);
	const check = (label: string, value: boolean | undefined, on: (v: boolean) => void) => (
		<label className="_rpCheck">
			<input type="checkbox" checked={!!value} onChange={e => on(e.target.checked)} />
			{label}
		</label>
	);

	return (
		<div className="_rpGroup">
			{chart ? (
				<div className="_rpGroup">
					<div className="_rpGroupTitle">Colours and labels</div>
					{select(
						'Palette',
						style.palette,
						[
							['', 'Theme default'],
							...PALETTES.map(p => [p.name, p.label] as [string, string]),
						],
						v => set({ palette: v }),
					)}
					{colorTargets.length && !radial ? (
						<div className="_rpGroup">
							{colorTargets.map(t => (
								<label key={t.key} className="_rpLabel">
									{t.label}
									<div
										className="_rpLine"
										role="radiogroup"
										aria-label={`Colour for ${t.label}`}
									>
										{palette.map((c, i) => (
											<button
												key={i}
												type="button"
												role="radio"
												aria-checked={style.seriesColors?.[t.key] === i}
												aria-label={`Palette colour ${i + 1}`}
												title={`Palette colour ${i + 1}`}
												onClick={() => {
													const next = { ...(style.seriesColors ?? {}) };
													if (next[t.key] === i) delete next[t.key];
													else next[t.key] = i;
													set({ seriesColors: next });
												}}
												style={{
													width: 22,
													height: 22,
													borderRadius: 11,
													background: c,
													cursor: 'pointer',
													border:
														style.seriesColors?.[t.key] === i
															? '3px solid var(--rp-text)'
															: '1px solid var(--rp-border)',
												}}
											/>
										))}
									</div>
								</label>
							))}
						</div>
					) : null}
					{type !== 'GAUGE'
						? select(
								'Data labels',
								style.dataLabels,
								[
									['', 'Off'],
									['inside', 'Inside'],
									['outside', 'Outside'],
									['end', 'At the end, inside'],
								],
								v => set({ dataLabels: v as ReportStyle['dataLabels'] }),
							)
						: null}
					{type !== 'GAUGE'
						? select(
								'Legend',
								style.legend,
								[
									['', 'Automatic'],
									['top', 'Top'],
									['bottom', 'Bottom'],
									['left', 'Left'],
									['right', 'Right'],
									['none', 'Hidden'],
								],
								v => set({ legend: v as ReportStyle['legend'] }),
							)
						: null}
				</div>
			) : null}

			{cartesian ? (
				<div className="_rpGroup">
					<div className="_rpGroupTitle">Axes</div>
					<label className="_rpLabel">
						Horizontal axis title
						<input
							className="_rpInput"
							value={style.xTitle ?? ''}
							onChange={e => set({ xTitle: e.target.value })}
						/>
					</label>
					<label className="_rpLabel">
						Vertical axis title
						<input
							className="_rpInput"
							value={style.yTitle ?? ''}
							onChange={e => set({ yTitle: e.target.value })}
						/>
					</label>
					{check('Start at zero', style.beginAtZero !== false, v =>
						set({ beginAtZero: v ? undefined : false }),
					)}
					{check('Log scale', style.logScale, v => set({ logScale: v || undefined }))}
					{select(
						'Gridlines',
						style.gridlines,
						[
							['', 'Value lines'],
							['both', 'Both'],
							['x', 'Horizontal axis'],
							['y', 'Vertical axis'],
							['none', 'None'],
						],
						v => set({ gridlines: v as ReportStyle['gridlines'] }),
					)}
					{type !== 'COMBO' && type !== 'SCATTER'
						? check('Swap horizontal and vertical', style.swapAxes, v =>
								set({ swapAxes: v || undefined }),
							)
						: null}
				</div>
			) : null}

			<div className="_rpGroup">
				<div className="_rpGroupTitle">Values</div>
				<div className="_rpLine">
					{select(
						'Number format',
						style.numberFormat?.style,
						[
							['', 'Automatic'],
							['compact', 'Short (1.5K)'],
							['full', 'Full'],
							['percent', 'Percent'],
						],
						v =>
							set({
								numberFormat:
									v || style.numberFormat?.decimals !== undefined
										? { ...style.numberFormat, style: v as any }
										: undefined,
							}),
					)}
					{select(
						'Decimals',
						style.numberFormat?.decimals === undefined
							? undefined
							: String(style.numberFormat.decimals),
						[
							['', 'Automatic'],
							['0', '0'],
							['1', '1'],
							['2', '2'],
							['3', '3'],
							['4', '4'],
						],
						v =>
							set({
								numberFormat:
									v === undefined && !style.numberFormat?.style
										? undefined
										: {
												...style.numberFormat,
												decimals: v === undefined ? undefined : Number(v),
											},
							}),
					)}
				</div>
				{cartesian || radial || type === 'TABLE' || type === 'LIST' ? (
					<label className="_rpLabel">
						Show the top (rest as Other)
						<input
							className="_rpInput"
							type="number"
							min={1}
							max={50}
							value={style.topN ?? ''}
							placeholder="All"
							onChange={e =>
								set({
									topN: e.target.value
										? Math.max(1, Number(e.target.value))
										: undefined,
								})
							}
						/>
					</label>
				) : null}
				{type !== 'KPI' && type !== 'GAUGE' && type !== 'BULLET'
					? check('Show as % of total', style.pctOfTotal, v =>
							set({ pctOfTotal: v || undefined }),
						)
					: null}
				{cartesian || type === 'TABLE'
					? check('Running total', style.runningTotal, v =>
							set({ runningTotal: v || undefined }),
						)
					: null}
			</div>

			{cartesian || type === 'GAUGE' || type === 'BULLET' ? (
				<div className="_rpGroup">
					<div className="_rpGroupTitle">Extras</div>
					{type === 'GAUGE' || type === 'BULLET' ? (
						<label className="_rpLabel">
							Target (a number or a measure)
							<input
								className="_rpInput"
								list="_rpTargetMeasures"
								value={style.target === undefined ? '' : String(style.target)}
								onChange={e => {
									const v = e.target.value.trim();
									set({
										target:
											v === ''
												? undefined
												: Number.isFinite(Number(v))
													? Number(v)
													: v,
									});
								}}
							/>
							<datalist id="_rpTargetMeasures">
								{measures.map(m => (
									<option key={m.key} value={m.key}>
										{m.label}
									</option>
								))}
							</datalist>
						</label>
					) : null}
					{cartesian ? (
						<>
							{type !== 'SCATTER'
								? check('Trend line', style.trendLine, v =>
										set({ trendLine: v || undefined }),
									)
								: null}
							{LINES.has(type)
								? check('Fill under lines', style.fill, v =>
										set({ fill: v || undefined }),
									)
								: null}
							<div className="_rpGroup">
								{lines.map((l, i) => (
									<div key={i} className="_rpLine">
										<input
											className="_rpInput"
											type="number"
											aria-label="Line value"
											placeholder="Value"
											value={l.value ?? ''}
											onChange={e =>
												setLine(i, { value: Number(e.target.value) })
											}
										/>
										<input
											className="_rpInput"
											aria-label="Line label"
											placeholder="Label"
											value={l.label ?? ''}
											onChange={e =>
												setLine(i, { label: e.target.value || undefined })
											}
										/>
										{measures.length > 1 ? (
											<select
												className="_rpSelect"
												aria-label="Measure"
												value={l.measure ?? ''}
												onChange={e =>
													setLine(i, {
														measure: e.target.value || undefined,
													})
												}
											>
												<option value="">First measure</option>
												{measures.map(m => (
													<option key={m.key} value={m.key}>
														{m.label}
													</option>
												))}
											</select>
										) : null}
										<button
											type="button"
											className="_rpIconBtn"
											aria-label="Remove line"
											title="Remove line"
											onClick={() =>
												set({
													referenceLines: lines.filter((_, j) => j !== i),
												})
											}
										>
											<i
												className="fa fa-solid fa-xmark"
												aria-hidden="true"
											/>
										</button>
									</div>
								))}
								<button
									type="button"
									className="_rpBtn"
									onClick={() =>
										set({
											referenceLines: [
												...lines,
												{ value: 0, label: 'Target' },
											],
										})
									}
								>
									Add a reference line
								</button>
							</div>
						</>
					) : null}
				</div>
			) : null}

			{select(
				'Density',
				style.density,
				[
					['', 'Comfortable'],
					['compact', 'Compact'],
				],
				v => set({ density: v as ReportStyle['density'] }),
			)}
		</div>
	);
}
