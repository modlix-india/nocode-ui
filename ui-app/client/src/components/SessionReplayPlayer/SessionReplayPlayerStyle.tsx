import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './sessionReplayPlayerStyleProperties';

const PREFIX = '.comp.compSessionReplayPlayer';
export default function SessionReplayPlayerStyle({
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
		${PREFIX} ._iframe { width: 100%; border: 0; border-radius: 4px; }
		${PREFIX} ._error { padding: 8px 12px; color: ${t('colorTwelve', '#b91c1c')}; background: ${t('errorWashColor', '#fef2f2')}; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SessionReplayPlayerCss">{css}</style>;
}
