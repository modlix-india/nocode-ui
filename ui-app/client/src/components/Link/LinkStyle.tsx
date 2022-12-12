import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './linkStyleProperties';

const PREFIX = '.comp.compLinks';
export default function LinkStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="LinkCss">{css}</style>;
}
