import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './markdownNavigaotrStyleProperties';

const PREFIX = '.comp.compMarkdownNav._markdown';
export default function LabelStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			width: auto;
			display: flex;
			flex-direction: column;
			gap: 10px;
			position: fixed;
			top: 50%;
			right: 20px;
			transform: translateY(-50%);
			z-index: 10;
		}
		${PREFIX} a {
			opacity: 0.6;
			text-decoration: none;
			position:relative;
		}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextCss">{css}</style>;
}
