import React, { useEffect, useState } from 'react';
import { ResultShape, viewFits } from '../shapeRules';
import { VIEW_LABELS, ViewType } from '../reportTypes';
import { Icon } from './common';

export const VIEW_ICONS: Record<ViewType, string> = {
	KPI: 'fa-hashtag',
	GAUGE: 'fa-gauge-high',
	BULLET: 'fa-bars-progress',
	TABLE: 'fa-table',
	LIST: 'fa-list',
	CROSSTAB: 'fa-table-cells',
	BAR: 'fa-chart-column',
	HBAR: 'fa-chart-bar',
	GROUPED_BAR: 'fa-chart-column',
	STACKED_BAR: 'fa-layer-group',
	STACKED_BAR_100: 'fa-percent',
	LOLLIPOP: 'fa-ellipsis-vertical',
	FUNNEL: 'fa-filter',
	LINE: 'fa-chart-line',
	SMOOTH_LINE: 'fa-wave-square',
	STEP_LINE: 'fa-stairs',
	AREA: 'fa-chart-area',
	STACKED_AREA: 'fa-mountain',
	COMBO: 'fa-chart-simple',
	SCATTER: 'fa-braille',
	PIE: 'fa-chart-pie',
	DOUGHNUT: 'fa-circle-notch',
	HEATMAP: 'fa-table-cells-large',
	TREEMAP: 'fa-border-all',
	WATERFALL: 'fa-chart-gantt',
};

/**
 * "Show me": every view type, the ones that do not fit the result greyed out with the reason
 * (shown on hover, focus or tap). Picking one changes `view.type` only.
 */
export function ChartTypePicker({
	shape,
	value,
	onPick,
	runnerFits,
}: Readonly<{
	shape: ResultShape;
	value: ViewType;
	onPick: (t: ViewType) => void;
	/** The Run output's `fits`, preferred when present. */
	runnerFits?: Record<string, { ok: boolean; reason?: string }>;
}>) {
	const fits = viewFits(shape, runnerFits);
	const [hint, setHint] = useState<string>('');
	// A reason read for the old shape is stale once the report changes.
	useEffect(() => setHint(''), [shape.groupBy, shape.measures]);
	return (
		<div>
			<div className="_rpTypes" role="listbox" aria-label="Chart type">
				{fits.map(f => (
					<button
						key={f.type}
						type="button"
						role="option"
						aria-selected={f.type === value}
						aria-disabled={!f.ok}
						title={f.ok ? (f.reason ?? VIEW_LABELS[f.type]) : f.reason}
						className={`_rpType${f.type === value ? ' _on' : ''}${f.ok ? '' : ' _off'}`}
						onMouseEnter={() => setHint(f.reason ?? '')}
						onFocus={() => setHint(f.reason ?? '')}
						onClick={() => {
							if (!f.ok) {
								setHint(f.reason ?? '');
								return;
							}
							onPick(f.type);
						}}
					>
						<Icon name={VIEW_ICONS[f.type]} />
						{VIEW_LABELS[f.type]}
					</button>
				))}
			</div>
			<div className="_rpReason" aria-live="polite">
				{hint}
			</div>
		</div>
	);
}
