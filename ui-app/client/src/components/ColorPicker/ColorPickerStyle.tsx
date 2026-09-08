import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	styleProperties,
	styleDefaults,
	stylePropertiesForTheme,
} from './colorPickerStyleProperties';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { StylePropertyDefinition } from '../../types/common';
import { propertiesDefinition } from './colorPickerProperties';

const PREFIX = '.comp.compColorPicker';
const NAME = 'ColorPicker';
export default function ColorPickerStyle({
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
            border: 1px solid rgba(0, 0, 0, 0.12);
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

		/*
		 * The popover.
		 *
		 * _colorPickerBody is markup SHARED with the page editor, and
		 * dist/css/App.css describes it as the editor uses it: a script
		 * positioned FIXED panel, 250px wide, pulled left of its trigger with
		 * margin-left: -240px and floored at min-height: 250px. Here the
		 * same markup is an ABSOLUTE dropdown anchored under the field, so
		 * every one of those has to be undone or the panel lands 240px to the
		 * left of its own input. Everything below is geometry only; colour,
		 * border and radius stay with the theme, whose rules carry a higher
		 * specificity and are appended after this block.
		 */
		${PREFIX} ._dropdownContainer._colorPickerBody {
			position: absolute;
			top: 100%;
			left: 0;
			margin: 4px 0 0 0;
			width: 248px;
			min-width: 248px;
			max-width: 248px;
			min-height: 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			gap: 10px;
			cursor: default;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._combineEditors {
			padding: 0;
			gap: 8px;
			align-items: center;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._saturation_value_picker {
			width: 100%;
			height: 132px;
			flex: 0 0 auto;
			cursor: crosshair;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._hue_picker {
			margin-bottom: 0;
			flex: 0 0 auto;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._alpha_picker {
			margin-right: 0;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._thumb {
			width: 14px;
			height: 14px;
			border-width: 2px;
			box-sizing: border-box;
			margin-left: -7px;
			top: -2px;
			z-index: 2;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._saturation_value_picker ._thumb {
			margin-top: -7px;
			top: auto;
		}

		/*
		 * Hex on its own line, then the format toggle and the three channels as
		 * one row. Stacked, the five lines were taller than the colour square
		 * they belong to.
		 */
		${PREFIX} ._dropdownContainer._colorPickerBody ._colorValues {
			display: grid;
			grid-template-columns: auto 1fr 1fr 1fr;
			align-items: center;
			gap: 6px;
			width: 100%;
			margin: 0;
			padding: 0;
			border: none;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._colorValues > ._colorValueline:first-child {
			grid-column: 1 / -1;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._colorValueline {
			min-width: 0;
			gap: 4px;
			font-size: 11px;
			opacity: 0.7;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._colorSchemeType {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			height: 26px;
			padding: 0 8px;
			border-radius: 5px;
			background: rgba(0, 0, 0, 0.05);
			font-size: 10.5px;
			font-weight: 600;
			letter-spacing: 0.6px;
			cursor: pointer;
			user-select: none;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody input {
			width: 100%;
			min-width: 0;
			height: 26px;
			min-height: 26px;
			padding: 0 6px;
			border-radius: 5px;
			font-size: 11.5px;
			text-align: center;
			cursor: text;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody ._hexInput {
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			letter-spacing: 0.4px;
			text-transform: uppercase;
		}

		/* The channel boxes are 1fr wide; spinners eat half of that. */
		${PREFIX} ._dropdownContainer._colorPickerBody input[type='number'] {
			-moz-appearance: textfield;
			appearance: textfield;
		}

		${PREFIX} ._dropdownContainer._colorPickerBody input[type='number']::-webkit-outer-spin-button,
		${PREFIX} ._dropdownContainer._colorPickerBody input[type='number']::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}

 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ColorPickerCss">{css}</style>;
}
