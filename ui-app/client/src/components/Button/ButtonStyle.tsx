import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './buttonStyleProperties';

const PREFIX = '.comp.compButton';
export default function ButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
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

		${PREFIX}._decorative ._icon {
			height: 100%;
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			background: #FFF;
			justify-content: center;
		}

		${PREFIX}._decorative ._leftButtonIcon {
			left: 0;
		}

		${PREFIX}._decorative ._rightButtonIcon {
			right: 0
		}

		${PREFIX} .nameEditor {
			height: 100%;
			border: none;
			text-align: center;
			width: 100%;
		}

		${PREFIX} .textToolBar {
			top: 100%;
			margin-top: 6px;
			display: flex;
			flex-direction: row;
			gap: 5px;
			background-color: #fff;
			padding: 5px 10px;
			border-radius: 4px;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			border: 2px solid #eee;
		}

		${PREFIX} .textToolBar i.fa {
			width: 24px;
			height: 24px;
			padding: 5px;
			cursor: pointer;
			border-radius: 4px;
		}

		${PREFIX} .textToolBar i.fa:hover,
		${PREFIX} .textToolBar .colorPicker:hover i.fa {
			background-color: #eee;
		}

		${PREFIX} .colorPicker {
			width: 24px;
			height: 24px;
			position: relative;
		}

		${PREFIX} .colorPicker input[type="color"] {
			position: absolute;
			left: 0px;
			top: 0px;
			width: 24px;
			height: 24px;
			opacity: 0;
			cursor: pointer;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ButtonCss">{css}</style>;
}
