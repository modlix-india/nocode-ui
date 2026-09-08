import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './sessionReplayListStyleProperties';

const PREFIX = '.comp.compSessionReplayList';
export default function SessionReplayListStyle({
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
		${PREFIX} ._table { width: 100%; border-collapse: collapse; }
		${PREFIX} ._table tr { cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.05); }
		${PREFIX} ._table tr:hover { background: rgba(59,130,246,0.05); }
		${PREFIX} ._table tr._selected { background: rgba(59,130,246,0.12); }
		${PREFIX} ._table th { text-align: left; padding: 6px 10px; font-weight: 600; opacity: 0.65; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
		${PREFIX} ._table td { padding: 8px 10px; font-size: 0.875rem; vertical-align: middle; }
		${PREFIX} ._table td._when { white-space: nowrap; opacity: 0.8; }
		${PREFIX} ._table td._person { white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
		${PREFIX} ._table td._duration, ${PREFIX} ._table td._clicks { text-align: right; font-variant-numeric: tabular-nums; }
		${PREFIX} ._error { padding: 8px 12px; color: ${t('colorTwelve', '#b91c1c')}; background: ${t('errorWashColor', '#fef2f2')}; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SessionReplayListCss">{css}</style>;
}
