import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './colorPickerStyleProperties';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { StylePropertyDefinition } from '../../types/common';

const PREFIX = '.comp.compColorPicker';
const NAME = 'ColorPicker';
export default function ColorPickerStyle({
    theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
    const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>(
        globalThis.styleProperties[NAME] ?? [],
    );

    if (globalThis.styleProperties[NAME] && !styleDefaults.size) {
        globalThis.styleProperties[NAME].filter((e: any) => !!e.dv)?.map(
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
            padding: 0px;
            background: transparent;
            color: inherit;
            min-width: 20px;
            cursor: pointer;
        }
        
        ${PREFIX} ._colorPickerBody input {
        	flex: 1;
            height: 100%;
            border: none;
            font: inherit;
            line-height: inherit;
            outline: none;
            background: transparent;
            color: inherit;
            min-width: 20px;
            cursor: pointer;
            border: 1px solid;
            padding: 3px 10px;
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
    
        ${PREFIX} ._clearText {
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
            margin-left: auto;
            gap: 4px;
            min-width: 260px;
        }
        
        ${PREFIX} ._combineEditors {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 5px 15px;
			gap: 10px;
			width: 100%;
		}
		
		${PREFIX} ._combineEditors._vertical {
			flex-direction: column;
		}
		
		${PREFIX} ._colorPickerBody ._colorValues {
			border: none;
			gap: 4px;
		}
		
		${PREFIX}._boxRoundedDesign {
			cursor: pointer;
			position: relative;
		}
		
		${PREFIX}._boxSquareDesign {
			cursor: pointer;
			position: relative;
		}

 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

    return <style id="ColorPickerCss">{css}</style>;
}
