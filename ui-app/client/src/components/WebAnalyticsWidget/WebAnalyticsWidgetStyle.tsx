import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './webAnalyticsWidgetStyleProperties';

const PREFIX = '.comp.compWebAnalyticsWidget';
export default function WebAnalyticsWidgetStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const css =
		`
		${PREFIX} { display: block; }
		${PREFIX} ._title { font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; opacity: 0.85; }
		${PREFIX} ._subtitle { font-size: 0.75rem; margin-top: -4px; margin-bottom: 10px; opacity: 0.55; line-height: 1.35; }
		${PREFIX} ._table { width: 100%; border-collapse: collapse; }
		${PREFIX} ._table tr { border-bottom: 1px solid rgba(0,0,0,0.05); }
		${PREFIX} ._table td { padding: 8px 10px; vertical-align: middle; font-size: 0.9rem; }
		${PREFIX} ._table td._rank { width: 24px; opacity: 0.5; text-align: right; }
		${PREFIX} ._table td._label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
		${PREFIX} ._table td._value { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
		${PREFIX} ._barWrap { position: relative; display: inline-block; min-width: 80px; padding: 0 8px; }
		${PREFIX} ._bar { position: absolute; top: 0; bottom: 0; right: 0; background: ${t('accentTintColor', 'rgba(59,130,246,0.15)')}; border-radius: 2px; }
		/* The chart is a plot with two axes rather than a row of bars: a bar chart with no
		   scale and no dates is a shape, and a shape cannot be read. */
		${PREFIX} ._chart { display: flex; gap: 8px; padding-top: 10px; }
		${PREFIX} ._yAxis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; height: 190px; font-size: 0.65rem; opacity: 0.45; font-variant-numeric: tabular-nums; }
		${PREFIX} ._yUnit { writing-mode: vertical-rl; transform: rotate(180deg); opacity: 0.75; letter-spacing: .04em; }
		${PREFIX} ._plot { flex: 1; min-width: 0; }
		${PREFIX} ._timeSeries { display: flex; align-items: flex-end; gap: 3px; height: 190px; border-bottom: 1px solid rgba(0,0,0,0.12); }
		${PREFIX} ._timeSeries ._point { background: ${t('accentTintStrongColor', 'rgba(59,130,246,0.6)')}; flex: 1; min-width: 4px; min-height: 2px; border-radius: 2px 2px 0 0; }
		${PREFIX} ._timeSeries ._point:hover { background: rgba(59,130,246,0.9); }
		/* A day with nothing on it still gets a mark. Otherwise a run of quiet days reads as
		   a chart that only has two bars in it, which is what it looked like. */
		${PREFIX} ._timeSeries ._point._zero { background: rgba(0,0,0,0.08); }
		${PREFIX} ._xAxis { display: grid; margin-top: 5px; font-size: 0.65rem; opacity: 0.45; }
		${PREFIX} ._xAxis ._tick { white-space: nowrap; }
		/* The end ticks are pulled back inside the plot so a date cannot hang off the card. */
		${PREFIX} ._xAxis ._tick:first-child { justify-self: start; }
		${PREFIX} ._xAxis ._tick:last-child { justify-self: end; }
		${PREFIX} ._xAxis ._tick:only-child { justify-self: center; }
		${PREFIX} ._error { padding: 8px 12px; color: ${t('colorTwelve', '#b91c1c')}; background: ${t('errorWashColor', '#fef2f2')}; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="WebAnalyticsWidgetCss">{css}</style>;
}
