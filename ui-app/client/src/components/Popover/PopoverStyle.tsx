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
			left: 50%;
			transform: translateX(-50%);
		}
		.bottomTip{
			top: calc(100% - 16px);
			left: 50%;
			transform: translateX(-50%);
		}
		.leftTip{
			top: 50%;
			transform: translateY(-50%);
		}
		.rightTip{
			left: calc(100% - 16px);
			top: 50%;
			transform: translateY(-50%);
		}

		.popoverTip.topTip::before {
			clip-path: polygon(50% 0%, 100% 50%, 0% 50%);
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
			width: 16px;
			height: 16px;
			background-color: black;
			position: absolute;
			top: 0;
			// left: 3px;
			display: block;
		}
		.popoverContainer {
			border-radius: 5px;
			/* background-color: rgb(188, 188, 188); */
			background-color: lightblue;
			width:300px;
			height: 300px;
			// margin-top: 8px;
			// margin-left: -2px;
			border: 3px solid;
		}
		.
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopoverCss">{css}</style>;
}
