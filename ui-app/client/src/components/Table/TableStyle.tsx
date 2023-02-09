import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableStyleProperties';

const PREFIX = '.comp.compTable';
export default function TableStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	
	${PREFIX} {
		display: flex;
		flex-direction: row;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableCss">{css}</style>;
}
