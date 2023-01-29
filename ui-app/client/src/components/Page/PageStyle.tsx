import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './pageStyleProperties';

const PREFIX = '.comp.compPage';
export default function PageStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageCss">{css}</style>;
}
