import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './chartStyleProperties';

const PREFIX = '.comp.compChart';
export default function ChartStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} ,
	${PREFIX} svg.chart {
		width: 100%;
		height: 100%;
	}

	${PREFIX} .legendText {
		cursor: pointer
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ChartCss">{css}</style>;
}
