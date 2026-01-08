import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { StylePropertyDefinition } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './dropdownStyleProperties';
import { propertiesDefinition } from './dropdownProperties';

const PREFIX = '.comp.compDropdown';
const NAME = 'Dropdown';
export default function DropdownStyle({
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
            align-items: center;
            cursor: pointer;
        }
    
        ${PREFIX} input {
            flex: 1;
            height: 100%;
            border: none;
            font: inherit;
            line-height: inherit;
            outline: none;
            padding: 0;
            background: transparent;
            color: inherit;
            min-width: 20px;
            cursor: pointer;
        }
    
        ${PREFIX}._isActive ._label,
        ${PREFIX} ._label._noFloat {
            transform: translateY(-50%);
		    bottom: 100%;
        }
    
        ${PREFIX}._hasLeftIcon ._label {
            padding-left: 24px;
        }
    
        ${PREFIX} ._label {
            position: absolute;
            user-select: none;
            pointer-events: none;
            bottom: 50%;
		    transform: translateY(50%);
            transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
        }
    
        ${PREFIX} ._rightIcon,
        ${PREFIX} ._leftIcon {
            width: 24px;
        }
    
        ${PREFIX}._bigDesign1 ._leftIcon {
            margin-right: 10px;
            border-right: 1px solid;
        }
    
        ${PREFIX}._bigDesign1 ._label {
            margin-top: 0px;
        }
    
        ${PREFIX}._bigDesign1._hasLeftIcon ._label {
            padding-left: 36px;
        }
    
        ${PREFIX}._bigDesign1._hasValue ._label,
        ${PREFIX}._bigDesign1._isActive ._label,
        ${PREFIX}._bigDesign1 ._label._noFloat {
            margin-top: -30px;
            bottom: auto;
            transform: none;
        }
    
        ${PREFIX}._bigDesign1 ._inputBox {
            padding-top: 10px;
        }
    
        ${PREFIX} ._rightIcon {
            padding-right: 5px;
        }
    
        ${PREFIX} ._label._float {
            bottom: 0px;
        }
    
        ${PREFIX} ._clearText, ${PREFIX} ._passwordIcon {
            cursor: pointer;
        }
    
        ${PREFIX} ._supportText {
            position:absolute;
            z-index:1;
            left: 0;
            top: 100%;
            margin-top: 5px;
        }

        ${PREFIX} ._dropdownContainer{
            width: 100%;
            z-index: 5;
            left: 0;
            position: absolute;
            top: 100%;
        }

        ${PREFIX} ._dropdownContainer._atBottom {
            top: auto;
            bottom: 100%;
        }

        ${PREFIX} ._dropdownCheckIcon {
            position: relative;
            display: inline-block;   
            transform: rotate(45deg);
            border-top: none !important ;
            border-left: none !important;
        }

        ${PREFIX} ._dropdownCheckIcon::before {
            position: absolute;
            width: 100%;
            height: 100%;
            content: '';
            border-top: none !important ;
            border-left: none !important;
        }

        ${PREFIX} ._dropdownItem {
            cursor: pointer;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }

        ${PREFIX} ._dropdownSearchBoxContainer {
            width: 100%;
            display: flex;
            align-items: center;
            flex-direction: row;
            gap: 10px;
            padding: 5px;
        }

        ${PREFIX} ._dropdownSearchBox {
            width: 100%;
        }

        ${PREFIX} ._dropdownItem._leftOfOption {
            flex-direction: row-reverse;
            justify-content: flex-end;
        }

        ${PREFIX} ._dropdownItem._rightOfOption ._dropdownCheckIcon{
            position: absolute;
            right: 3%;
        }

        ${PREFIX} ._dropdownItem._rightOfOption .commonCheckbox {
            position: absolute;
            right: 0;
            transform: translateX(-100%);
        }

        ${PREFIX} span.commonCheckbox.radio._checked ._thumb {
            transform: scale(0.7);
        }
            
        ${PREFIX} ._controlButtons {
            display: none;
            margin-right: 5px;
        }
    
        ${PREFIX}:hover ._controlButtons,
        ${PREFIX}._editMode ._controlButtons {
            display: flex;
        }
 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
