import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './timerStyleProperties';

const PREFIX = '.comp.compTimer';
export default function TimerStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);
	const css =
		`
		${PREFIX} {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TimerCss">{css}</style>;
}
