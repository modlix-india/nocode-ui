import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	styleDefaults,
	styleProperties,
	stylePropertiesForTheme,
} from './RadioButtonStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './radioButtonProperties';

const PREFIX = '.comp.compRadioButton';
const NAME = 'RadioButton';
export default function RadioButtonStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
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

		const fn = () => setTimeout(() => {
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
    
    ${PREFIX} .radioLabel {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
    }

    ${PREFIX} .radioLabel.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .radioLabel.vertical {
        flex-direction: column;
    }
    
    ${PREFIX} span.commonCheckbox {
        min-width: 16px;
        min-height: 16px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="RadioButtonCss">{css}</style>;
}
