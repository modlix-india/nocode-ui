import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from '../Page/pageStyleProperties';

const PREFIX = '.comp.compTableOfContent';
export default function TableOfContentsStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
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

	return <style id="TableofContentsCss">{css}</style>;
}
