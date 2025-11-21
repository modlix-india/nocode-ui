import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './otpStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import {
	findPropertyDefinitions,
	inflateAndSetStyleProps,
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

		const fn = () =>
			setTimeout(() => {
				inflateAndSetStyleProps(
					[designType, colorScheme],
					stylePropertiesForTheme,
					(props, _) => styleProperties.splice(0, 0, ...props),
					styleDefaults,
				);
				setReRender(Date.now());
			}, 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
		${PREFIX} {
			display: flex;
			position: relative;
		}

		${PREFIX} ._inputBox {
			text-align: center;
			outline: none; 
		}

		${PREFIX} ._label {
			position: absolute;
			user-select: none;
			pointer-events: none;
			bottom: 50%;
			transform: translateY(50%);
			transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
		}

		${PREFIX}._isActive ._label,
		${PREFIX} ._label._noFloat {
			transform: translateY(-50%);
			bottom: 100%;
		}

		${PREFIX} ._clearText {
			cursor: pointer;
			position: absolute;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
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

		${PREFIX} ._visibilityToggle{
			position: relative;
			z-index: 1;
			left: 0;
			top: 100%;
			transform: translateY(30%);
		}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="OtpInputCss">{css}</style>;
}
