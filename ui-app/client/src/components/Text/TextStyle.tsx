import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './TextStyleProperties';

const PREFIX = '.comp.compText';
export default function LabelStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
	${PREFIX} ._textContainer {
		width: 100%;
		display: block;
		position: relative;
		font-family: inherit;
		font-Size: inherit;
		font-Weight: inherit;
		color: inherit;
		text-Align: inherit;
		font-Style: inherit;
		line-Height: inherit;
		letter-Spacing: inherit;
		text-Indent: inherit;
		text-Transform: inherit;
		text-Shadow: inherit;
		direction: inherit;
		text-Decoration: inherit;
		text-Orientation: inherit;
		word-Break: inherit;
		word-Spacing: inherit;
		word-Wrap: inherit;
		font-Feature-Settings: inherit;
		font-Kerning: inherit;
		font-Variant: inherit;
		font-Variant-Caps: inherit;
		text-Align-Last: inherit;
		text-Decoration-Color: inherit;
		text-Decoration-Line: inherit;
		text-Decoration-Style: inherit;
		text-Emphasis: inherit;
		text-Overflow: inherit;
		white-Space: inherit;
	}

	${PREFIX}._markdown img {
		max-width: 100%;
	}

	${PREFIX}._markdown pre, ._markDownContent pre {
		overflow: auto;
	}

	${PREFIX}._markdown pre code, ._markDownContent pre code {
		background-color: transparent;
		padding: 0;
		margin: 0;
		border: 0;
	}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextCss">{css}</style>;
}
