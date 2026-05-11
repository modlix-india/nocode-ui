import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './webAnalyticsWidgetStyleProperties';

const PREFIX = '.comp.compWebAnalyticsWidget';
export default function WebAnalyticsWidgetStyle({
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
		${PREFIX} ._timeSeries ._point:hover { background: rgba(59,130,246,0.9); }
		${PREFIX} ._error { padding: 8px 12px; color: #b91c1c; background: #fef2f2; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="WebAnalyticsWidgetCss">{css}</style>;
}
