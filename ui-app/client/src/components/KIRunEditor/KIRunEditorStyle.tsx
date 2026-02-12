import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './KIRunEditorStyleProperties';

const PREFIX = '.comp.compKIRunEditor';
export default function KIRunEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="KIRUNEditorCss">{css}</style>;
}
