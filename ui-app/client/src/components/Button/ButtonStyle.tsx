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
			height: ${theme.get(StyleResolution.ALL)?.get('buttonHeight') ?? styleDefaults.get('buttonHeight')};
			border: ${theme.get(StyleResolution.ALL)?.get('buttonBorder') ?? styleDefaults.get('buttonBorder')};
		}

		${PREFIX}.button.fabButton {
			height: ${processStyleValueWithFunction(values.get('fabButtonWidth'), values)};
			border-radius: 50%;
			padding: 0px;
		}
		
		${PREFIX}.button.fabButtonMini {
			height: ${processStyleValueWithFunction(values.get('fabButtonMiniWidth'), values)};
			border-radius: 50%;
			padding: 0px;
		}

		${PREFIX}.button.iconButton {
			padding: 0px 5px;
		}
		${PREFIX}.button.iconButton .leftButtonIcon {
			margin-right: 0px;
		}
		
		${PREFIX}.button {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		${PREFIX}.button .rightButtonIcon,
		${PREFIX}.button .leftButtonIcon{
			position: relative
		}
		
		${PREFIX}.button.fabButton .leftButtonIcon,
		${PREFIX}.button.fabButtonMini .leftButtonIcon {
			margin-right: 0px;
		}
		
		${PREFIX}.button .rightButtonIcon {
			margin-left: ${processStyleValueWithFunction(values.get('buttonIconMargin'), values)};
		}
		${PREFIX}.button .leftButtonIcon {
			margin-right: ${processStyleValueWithFunction(values.get('buttonIconMargin'), values)};
		}		
		${PREFIX}.button {
			padding: ${processStyleValueWithFunction(values.get('buttonPadding'), values)};
			border-radius: ${processStyleValueWithFunction(values.get('buttonBorderRadius'), values)};
		}
		
		${PREFIX}.button.outlined, ${PREFIX}.button.outlined:disabled {
			background: transparent;
		}
		
		${PREFIX}.button.text, ${PREFIX}.button.text:disabled {
			border: 0;
			background: transparent;
		}

		${PREFIX} .nameEditor {
			height: 100%;
			border: none;
			text-align: center;
			width: 100%;
		}

		${PREFIX} .textToolBar {
			position: absolute;
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
