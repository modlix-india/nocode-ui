import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from '../Page/pageStyleProperties';

const PREFIX = '.comp.compMarkdownTOC';
export default function MarkdownTOCStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
		display:flex;
		flex-direction:column;
		gap:20px;
		padding:20px;
		}

		
}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownTOCCss">{css}</style>;
}
