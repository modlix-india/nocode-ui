import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './buttonStyleProperties';

const PREFIX = '.comp.compButton';
export default function ButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
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


	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ButtonCss">{css}</style>;
}
