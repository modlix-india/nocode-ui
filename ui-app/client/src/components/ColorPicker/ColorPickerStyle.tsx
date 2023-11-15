import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './colorPickerStyleProperties';

const PREFIX = '.comp.compColorPicker';
export default function ColorPickerStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
			background: none;
			position: relative;
            width: 100%;
            height: 100%;
			box-shadow: none;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		${PREFIX}._boxSquareDesign, ${PREFIX}._boxRoundedDesign {
			background: linear-gradient(90deg, #35F803 -26.56%, #4D7FEE 26.55%, #F9A71E 69.94%, #35F803 126.56%);
			width: 100%;
			height: 100%;
			border-radius: inherit;
			border: 2px solid rgba(0, 0, 0, 0.20);
		}

		${PREFIX}._boxRoundedDesign { 
			border-radius: 50%;
		}

		${PREFIX} ._inputBox{
			display: block;
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

		${PREFIX} ._colorPickerBody {
			position: fixed;
			background-color: #FFF;
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			padding: 10px;
			min-height: 250px;
			width: 250px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		${PREFIX} ._colorPickerBody ._color_variable_picker {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: 12px;
			padding: 5px;
			flex-wrap: wrap;
		}

		${PREFIX} ._colorPickerBody ._color_variable {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			cursor: pointer;
			box-shadow: 0px 1px 2px 0px #00000026;
			position: relative;
		}

		${PREFIX} ._colorPickerBody ._color_variable._selected {
			border: 2px solid #51BD94;
			box-shadow: 0px 0px 4px 4px #51BD94;
		}

		${PREFIX} ._colorPickerBody ._color_variable::before {
			content: '';
			width: 100%;
			height: 100%;
			border-radius: 50%;
			position: absolute;
			background-image:
				linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
				linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
  			background-size: 10px 10px;
  			background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
			border-radius: 8px;
		}

		${PREFIX} ._colorPickerBody ._color_variable_name {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			position: absolute;
		}

		${PREFIX} ._colorPickerBody ._saturation_value_picker{
			position: relative;
			height: 150px;
			border-radius: 6px;
		}

		${PREFIX} ._colorPickerBody ._saturation_value_picker ._thumb {
			margin-top: -8px;
		}

		${PREFIX} ._colorPickerBody ._hue_picker {
			background: linear-gradient(to right,red 0,#ff0 16.66%,#0f0 33.33%,#0ff 50%,#00f 66.66%,#f0f 83.33%,red 100%);
			height: 10px;
			width: 100%;
			border-radius: 8px;
			position: relative;
			margin-bottom: 10px;
		}

		${PREFIX} ._colorPickerBody ._alpha_picker {
			cursor: pointer;
			height: 10px;
			position: relative;
			flex: 3;
			margin-right: 8px;
			background-image:
				linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
				linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
  			background-size: 10px 10px;
  			background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
			border-radius: 8px;
		}

		${PREFIX} ._colorPickerBody ._alpha_picker_gradient {
			position: absolute;
			height: 100%;
			width: 100%;
			border-radius: 8px;
		}

		${PREFIX} ._colorPickerBody ._colorValueline {
			display: flex;
			flex-direction: row;
			align-items: center;
			flex: 1;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._colorPickerBody ._colorValues {
			margin-right: 2px;
    		padding-right: 5px;
    		border-right: 0.5px solid #0000000D;
		}

		${PREFIX} ._thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background-color: #FFF;
			position: absolute;
			top: -4px;
			z-index: 1;
			cursor: pointer;
			box-shadow: 0px 2px 4px 0px #00000033;
			cursor: pointer;
			margin-left: -8px;
			border: 3px solid #FFF;
			pointer-events: none;
		}
		
		${PREFIX} ._thumbInner {
			position: absolute;
			width: 60%;
			height: 60%;
			left: 20%;
			top: 20%;
			border-radius: 50%;
			background-color: #4C7FEE;
		}
		
		${PREFIX} ._combineColorPicker ._simpleColorPicker {
			padding: 0px;
		}

		${PREFIX} ._combineColorPicker ._simpleColorPicker._expandWidth {
			width: 100%
		}

		._combineColorPicker ._simpleEditorInput, 
		._combineColorPicker ._simpleEditorSelect {
			padding: 8px;
			width: 100%;
		}

		${PREFIX} ._combineColorPicker {
			display: flex;
			flex-direction: row;
			align-items: center;			
			padding: 5px 15px;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._combineColorPicker._vertical {
			flex-direction: column;
			align-items: flex-start;
		}

		${PREFIX} ._combineColorPicker._top {
			align-items: flex-start;
		}

		${PREFIX} ._combineColorPicker._spaceBetween {
			justify-content: space-between;
		}

		${PREFIX} ._combineColorPicker._spaceAround {
			justify-content: space-around;
		}

		${PREFIX} ._combineColorPicker._centered {
			justify-content: center;
		}

		${PREFIX} ._combineColorPicker._alignEnd {
			justify-content: flex-end;
		}

		${PREFIX} ._combineColorPicker ._simpleColorPickerInput,
		${PREFIX} ._combineColorPicker ._simpleColorPickerSelect {
			padding: 8px;
			width: 100%;
		}

		${PREFIX} ._simpleColorPickerSelect,
		${PREFIX} ._simpleColorPickerInput{
			min-height: 35px;
			min-width: 35px;
			font-family: Inter;
			font-size: 12px;
			border: none;
			border-radius: 6px;
			color: #555;
			background-color: #F8FAFB;
			cursor: pointer;
			padding: 5px 15px;
			flex: 1;
			outline: none;
		}

		${PREFIX} ._simpleColorPicker {
			padding: 5px 15px;
		}

		${PREFIX} ._combineColorPicker ._simpleColorPicker {
			padding: 0px;
		}

		${PREFIX} ._combineColorPicker ._simpleColorPicker._expandWidth {
			width: 100%
		}

		${PREFIX} ._combineColorPicker ._onePart {
			flex: 1;
		}

		${PREFIX} ._combineColorPicker ._twoParts {
			flex: 2;
		}

		${PREFIX} ._combineColorPicker ._oneAndHalfParts {
			flex: 1.5;
		}

		${PREFIX} ._combineColorPicker ._simpleColorPickerInput,
		${PREFIX} ._combineColorPicker ._simpleColorPickerSelect {
			padding: 8px;
			width: 100%;
		}

		${PREFIX} ._combineColorPicker ._combineColorPicker {
			padding: 0;
		}

		${PREFIX} ._combineColorPicker ._eachProp {
			padding: 0;
		}

		${PREFIX} ._colorPickerBody ._simpleColorPickerInput,
		${PREFIX} ._colorPickerBody ._simpleColorPickerSelect {
			min-height: 25px;
			padding-top: 3px;
			padding-bottom: 3px;
			border-radius: 4px;
			border: 1px solid #EEE;
			background: transparent;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption {
			height: 25px;
			padding: 5px 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption._hovered {
			background-color: #F8FAFB;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption._selected {
			color: #333;
			font-weight: bold;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody{
			position: fixed;
			min-width: 100%;
			background-color: #FFF;
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			margin-top: 4px;
			padding: 10px;
			max-height: 250px;
			overflow: auto;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption {
			height: 25px;
			padding: 5px 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption._hovered {
			background-color: #F8FAFB;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody ._simpleColorPickerDropdownOption._selected {
			color: #333;
			font-weight: bold;
		}

		${PREFIX} ._simpleColorPickerSelect ._simpleColorPickerDropdownBody {
			position: fixed;
			min-width: 100%;
			background-color: #FFF;
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			margin-top: 4px;
			padding: 10px;
			max-height: 250px;
			overflow: auto;
		}

		${PREFIX} ._simpleColorPickerSelect {
			text-transform: uppercase;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;
		}

		${PREFIX} ._simpleColorPickerSelect svg {
			min-width: 8px;
		}

		${PREFIX} ._simpleColorPickerSelect ._selectedOption {
			min-width: calc(100% - 8px);
		}

		${PREFIX} ._simpleColorPickerSelect ._selectedOption._placeholder {
			text-transform: capitalize;
			color: #757575;
		}

		${PREFIX} ._supportText {
			position:absolute;
			z-index:1;
			left: 0;
			top: 100%;
			margin-top: 5px;
		}

 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ColorPickerCss">{css}</style>;
}
