import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './timerStyleProperties';

const PREFIX = '.comp.compTimer';
export default function TimerStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
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
			width: 40px;
			height: 40px;
			top: 0px;
			left: 0px;
			position: fixed;
			background-color: white;
			padding: 5px;
			opacity: 0.5;
			z-index: 10;
		}

		${PREFIX}:hover {
			opacity: 1;
		}
		
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TimerCss">{css}</style>;
}
