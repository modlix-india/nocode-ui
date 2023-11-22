import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './jotStyleProperies';

const PREFIX = '.comp.compJot';
export default function JotStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
		}

		${PREFIX} ._canvas {
			
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="JotCss">{css}</style>;
}
