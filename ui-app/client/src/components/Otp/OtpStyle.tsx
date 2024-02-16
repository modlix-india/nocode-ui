import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './otpStyleProperties'

const PREFIX = '.comp.compOtp';
export default function OtpStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: flex;
		}

		${PREFIX} ._inputBox {
			text-align: center;
			outline: none; 
		}

		${PREFIX} ._supportText {
			position:absolute;
			z-index:1;
			left: 0;
			top: 100%;
			margin-top: 10px;
		}

		${PREFIX} ._errorText {
			position:absolute;
			z-index:1;
			left: 0;
			top: 100%;
			margin-top: 10px;
		}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="OtpInputCss">{css}</style>;
}
