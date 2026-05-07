import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './sessionReplayPlayerStyleProperties';

const PREFIX = '.comp.compSessionReplayPlayer';
export default function SessionReplayPlayerStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} { display: block; }
		${PREFIX} ._iframe { width: 100%; border: 0; border-radius: 4px; }
		${PREFIX} ._error { padding: 8px 12px; color: #b91c1c; background: #fef2f2; border-radius: 4px; font-size: 0.875rem; }
		${PREFIX} ._loading { opacity: 0.6; font-size: 0.875rem; padding: 8px; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SessionReplayPlayerCss">{css}</style>;
}
