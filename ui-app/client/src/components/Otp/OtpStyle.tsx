import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './otpStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { StylePropertyDefinition } from '../../types/common';

const PREFIX = '.comp.compOtp';
const NAME = 'Otp';
export default function OtpStyle({ theme }: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>(
		window.styleProperties[NAME] ?? [],
	);

	if (window.styleProperties[NAME] && !styleDefaults.size) {
		window.styleProperties[NAME].filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);
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
