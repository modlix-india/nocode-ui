import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './analyticsQueryStyleProperties';

const PREFIX = '.comp.compAnalyticsQuery';
export default function AnalyticsQueryStyle({
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
		${PREFIX} ._counter { display: flex; flex-direction: column; align-items: flex-start; }
		${PREFIX} ._counterValue { font-size: 2.25rem; line-height: 1.1; font-weight: 600; }
		${PREFIX} ._counterLabel { font-size: 0.875rem; opacity: 0.75; margin-top: 4px; }
		${PREFIX} ._table { width: 100%; border-collapse: collapse; }
		${PREFIX} ._table th, ${PREFIX} ._table td { text-align: left; padding: 6px 10px; border-bottom: 1px solid ${t('borderColorNine', '#eee')}; }
		${PREFIX} ._table thead th { font-weight: 600; opacity: 0.75; background: rgba(0,0,0,0.02); }
		${PREFIX} ._error { padding: 8px 12px; color: ${t('colorTwelve', '#b91c1c')}; background: ${t('errorWashColor', '#fef2f2')}; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="AnalyticsQueryCss">{css}</style>;
}
