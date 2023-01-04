import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './buttonStyleProperties';

const PREFIX = '.comp.compButton';
export default function ButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .button.fabButton {
			height: ${
				theme.get(StyleResolution.ALL)?.get('fabButtonWidth') ??
				styleDefaults.get('fabButtonWidth')
			};
			border-radius: 50%;
			padding: 0px;
		}
		
		${PREFIX} .button.fabButtonMini {
			height: ${
				theme.get(StyleResolution.ALL)?.get('fabButtonMiniWidth') ??
				styleDefaults.get('fabButtonMiniWidth')
			};
			border-radius: 50%;
			padding: 0px;
		}
		
		${PREFIX} .button .buttonInternalContainer {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		${PREFIX} .button.fabButton .leftButtonIcon,
		${PREFIX} .button.fabButtonMini .leftButtonIcon {
			margin-right: 0px;
		}
		
		${PREFIX} .button .rightButtonIcon {
			margin-left: ${
				theme.get(StyleResolution.ALL)?.get('buttonIconMargin') ??
				styleDefaults.get('buttonIconMargin')
			};
		}
		${PREFIX} .button .leftButtonIcon {
			margin-right: ${
				theme.get(StyleResolution.ALL)?.get('buttonIconMargin') ??
				styleDefaults.get('buttonIconMargin')
			};
		}		
		${PREFIX} .button {
			padding: ${
				theme.get(StyleResolution.ALL)?.get('buttonPadding') ??
				styleDefaults.get('buttonPadding')
			};
			height: ${theme.get(StyleResolution.ALL)?.get('buttonHeight') ?? styleDefaults.get('buttonHeight')};
			border: ${theme.get(StyleResolution.ALL)?.get('buttonBorder') ?? styleDefaults.get('buttonBorder')};
			border-radius: ${
				theme.get(StyleResolution.ALL)?.get('buttonBorderRadius') ??
				styleDefaults.get('buttonBorderRadius')
			};
		}
		
		${PREFIX} .button.outlined, ${PREFIX} .button.outlined:disabled {
			background: transparent;
		}
		
		${PREFIX} .button.text, ${PREFIX} .button.text:disabled {
			border: 0;
			background: transparent;
		}


	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ButtonCss">{css}</style>;
}
