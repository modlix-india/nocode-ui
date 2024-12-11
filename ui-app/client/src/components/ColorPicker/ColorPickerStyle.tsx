import React, { useState, useEffect } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './colorPickerStyleProperties';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { StylePropertyDefinition } from '../../types/common';

const PREFIX = '.comp.compColorPicker';
const NAME = 'ColorPicker';
export default function ColorPickerStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>([]);

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

        ${PREFIX} ._dropdownContainer._colorPickerBody{
            width: 100%;
            z-index: 5;
            left: 0;
            position: absolute;
            top: 100%;
            margin-left: 0px;
            max-width: 400px;
            min-width: 200px;
            width: 100%;
        }

        ${PREFIX} ._dropdownContainer ._combineEditors {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        ${PREFIX} ._dropdownContainer ._combineEditors._vertical {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
        }

        ${PREFIX} ._dropdownContainer ._combineEditors input {
            padding-left: 5px;
        }

        ${PREFIX} ._dropdownContainer ._colorValues {
            border-right: none;
        }

        ${PREFIX} ._dropdownContainer ._colorValueline,
        ${PREFIX} ._dropdownContainer ._colorValueline input {
            width: 100%;
            flex: 1;
        }

        ${PREFIX} ._colorPickerBody ._simpleEditorSelect {
            position: relative;
        }

        ${PREFIX} ._colorPickerBody ._colorSchemeType {
            cursor: pointer;    
        }

        ${PREFIX}._boxRoundedDesign {
            background: linear-gradient(90deg, #35F803 -26.56%, #4D7FEE 26.55%, #F9A71E 69.94%, #35F803 126.56%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid #FFF;
            box-shadow: 0px 0px 5px 3px #00000017;
            position: relative;
        }

 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ColorPickerCss">{css}</style>;
}
