import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './arrayRepeaterStyleProperties';

const PREFIX = '.comp.compArrayRepeater';
export default function ArrayRepeaterStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ArrayRepeaterCss">{css}</style>;
}
