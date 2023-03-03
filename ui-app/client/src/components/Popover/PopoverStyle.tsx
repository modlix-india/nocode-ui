import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './popoverStyleProperties';

const PREFIX = '.comp.compPopover';
export default function PopoverStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		.popoverTip {
			position: absolute;
			width: 16px;
			height: 16px;
		}

		.topTip{
			transform: translateX(-50%);
		}
		.bottomTip{
			top: calc(100% - 16px);
			transform: translateX(-50%);
		}
		.leftTip{
			transform: translateY(-50%);
		}
		.rightTip{
			left: calc(100% - 16px);
			transform: translateY(-50%);
		}

		.popoverTip.topTip::before {
			clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
		}
		.popoverTip.bottomTip::before {
			clip-path: polygon(100% 0, 0 0, 50% 100%);
		}
		.popoverTip.leftTip::before {
			clip-path: polygon(0 50%, 100% 100%, 100% 0);
		}
		.popoverTip.rightTip::before {
			clip-path: polygon(0 0, 0 100%, 100% 50%);
		}

		.popoverTip::before {
			content: ' ';
			width: 100%;
			height: 100%;
			background-color: black;
			position: absolute;
			top: 0;
			display: block;
		}
		.popoverContainer {
			// border-radius: 5px;
			// background-color: lightblue;
			// width:300px;
			// height: 300px;
			// border: 3px solid black;
		}
		.
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopoverCss">{css}</style>;
}
