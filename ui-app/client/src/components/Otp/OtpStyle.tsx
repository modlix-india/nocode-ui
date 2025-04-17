import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './otpStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { StylePropertyDefinition } from '../../types/common';
import { propertiesDefinition } from './otpProperties';

const PREFIX = '.comp.compOtp';
const NAME = 'Otp';
export default function OtpStyle({ theme }: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const { designType, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'designType',
			'colorScheme',
		);
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			(props, originalStyleProps) => {
				styleProperties.splice(0, 0, ...props);
				if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
				setReRender(Date.now());
			},
			styleDefaults,
			[designType, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

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
