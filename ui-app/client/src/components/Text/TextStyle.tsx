import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './TextStyleProperties';

const PREFIX = '.comp.compText';
export default function LabelStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} ._textContainer {
		width: 100%;
		display: block;
		font-family: inherit;
		color: inherit;
		font-size: inherit;
		font-weight: inherit;
		position: relative;
	}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextCss">{css}</style>;
}
