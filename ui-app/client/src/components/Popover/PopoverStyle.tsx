import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './popoverStyleProperties';

const PREFIX = '.comp.compPopover';
export default function PopoverStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		.popoverTip::before {
			content: ' ';
			width: 10px;
			height: 10px;
			background-color: black;
			position: absolute;
			top: 0;
			left: 0;
			transform: rotate(45deg);
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopoverCss">{css}</style>;
}
