import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './productAnalyticsWidgetStyleProperties';

const PREFIX = '.comp.compProductAnalyticsWidget';
export default function ProductAnalyticsWidgetStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} { display: block; }
		${PREFIX} ._title { font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; opacity: 0.85; }
		${PREFIX} ._table { width: 100%; border-collapse: collapse; }
		${PREFIX} ._table tr { border-bottom: 1px solid rgba(0,0,0,0.05); }
		${PREFIX} ._table td { padding: 6px 10px; vertical-align: middle; font-size: 0.875rem; }
		${PREFIX} ._table td._rank { width: 24px; opacity: 0.5; text-align: right; }
		${PREFIX} ._table td._label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
		${PREFIX} ._table td._value { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
		${PREFIX} ._barWrap { position: relative; display: inline-block; min-width: 80px; padding: 0 8px; }
		${PREFIX} ._bar { position: absolute; top: 0; bottom: 0; right: 0; background: rgba(59,130,246,0.15); border-radius: 2px; }
		${PREFIX} ._timeSeries { display: flex; align-items: flex-end; gap: 2px; height: 80px; padding-top: 8px; }
		${PREFIX} ._timeSeries ._point { background: rgba(59,130,246,0.6); flex: 1; min-width: 4px; border-radius: 2px 2px 0 0; }

		${PREFIX} ._funnel { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
		${PREFIX} ._funnelStep { display: flex; align-items: center; gap: 12px; }
		${PREFIX} ._funnelStepLabel { flex: 0 0 160px; font-size: 0.875rem; }
		${PREFIX} ._funnelStepBar { position: relative; flex: 1; height: 28px; background: rgba(0,0,0,0.04); border-radius: 4px; overflow: hidden; }
		${PREFIX} ._funnelStepFill { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(59,130,246,0.5); border-radius: 4px; transition: width 0.3s ease; }
		${PREFIX} ._funnelStepNum { position: relative; padding: 0 8px; line-height: 28px; font-variant-numeric: tabular-nums; font-weight: 500; font-size: 0.875rem; }
		${PREFIX} ._funnelStepConv { flex: 0 0 60px; text-align: right; font-size: 0.8rem; opacity: 0.7; font-variant-numeric: tabular-nums; }

		${PREFIX} ._cohort { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
		${PREFIX} ._cohort th { text-align: left; padding: 4px 6px; font-weight: 600; opacity: 0.7; }
		${PREFIX} ._cohort td { padding: 3px 6px; text-align: center; font-variant-numeric: tabular-nums; }
		${PREFIX} ._cohort td._date { text-align: left; opacity: 0.7; }
		${PREFIX} ._cohort td._size { text-align: right; opacity: 0.7; padding-right: 12px; }

		${PREFIX} ._error { padding: 8px 12px; color: #b91c1c; background: #fef2f2; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ProductAnalyticsWidgetCss">{css}</style>;
}
