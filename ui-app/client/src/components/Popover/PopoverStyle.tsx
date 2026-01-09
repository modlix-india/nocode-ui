import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './popoverStyleProperties';

const PREFIX = '.comp.compPopover';
export default function PopoverStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		.popoverTip {
			position: absolute;
			width: 16px;
			height: 16px;
			overflow: hidden;
			z-index: 2;
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
			transform: translateX(-50%) translateY(50%) rotate(45deg);
			left: 50%;
		}
		.popoverTip.bottomTip::before {
			transform: translateX(-50%) translateY(-50%) rotate(45deg);
			left: 50%;
		}
		.popoverTip.leftTip::before {
			transform: translateX(50%) rotate(45deg);
		}
		.popoverTip.rightTip::before {
			transform: translateX(-50%) rotate(45deg);
		}

		.popoverTip::before {
			content: ' ';
			width: 16px;
			height: 16px;
			position: absolute;
			top: 0;
			display: block;
		}
		.popoverContainer {
			position: relative;
			z-index:1;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopoverCss">{css}</style>;
}
