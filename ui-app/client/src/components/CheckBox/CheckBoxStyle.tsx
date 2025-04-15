import { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './checkBoxStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './checkBoxProperties';

const PREFIX = '.comp.compCheckbox';
const NAME = 'CheckBox';
export default function CheckBoxStyle({
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

		const fn = () => {
			inflateAndSetStyleProps(
				[designType, colorScheme],
				stylePropertiesForTheme,
				(props, _) => styleProperties.splice(0, 0, ...props),
				styleDefaults,
			);
			setReRender(Date.now());
		};

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`

    span.commonCheckbox.radio {
        border-radius:50%;
    }

    span.commonCheckbox,
    span.commonTriStateCheckbox {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        border: 2px solid;
        border-radius: 2px;
        display: grid;
        place-content: center;
        cursor: pointer;
        position: relative;
        box-sizing: content-box;
    }

    span.commonTriStateCheckbox {
        width: 16px;
        height: 16px;
    }

    span.commonCheckbox ._thumb,
    span.commonTriStateCheckbox::before {
        content: ' ';
        width: 100%;
        height: 100%;
        transform: scale(0);
        transition: 500ms transform ease-in-out, 500ms opacity ease-in-out;
        transform-origin: bottom left;
        clip-path: polygon(45% 85%, 10% 59%, 18% 45%, 44% 63%, 80% 15%, 90% 28%);
        position: absolute;
        opacity: 0;
    }
    span.commonCheckbox.radio ._thumb {
        border-radius: 50%;
        transform-origin: center center;
        clip-path: none;
        left: 0px;
        top: 0px;        
    }
    
    span.commonTriStateCheckbox._true {
        border: 2px transpernt;
    }

    span.commonCheckbox._checked {
        border: 0px;
    }
    

    span.commonTriStateCheckbox._false::before {
        transform: scale(1);
        opacity: 1;
        left: 0px;
        top: 0px;
        clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
    }
    
    span.commonCheckbox._checked ._thumb,
    span.commonTriStateCheckbox._true::before {
        transform: scale(1);
        opacity: 1;
    }

    span.commonCheckbox.radio._checked ._thumb {
        transform: scale(0.8);
    }
    
    ${PREFIX} .checkbox {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
        
    }
    ${PREFIX} .checkbox.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .checkbox.vertical {
        flex-direction: column;
    }

    ${PREFIX} span.commonCheckbox {
        min-width: 16px;
        min-height: 16px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
