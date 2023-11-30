import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fillerValueEditorStyleProperties';

const PREFIX = '.comp.compFillerValueEditor';
export default function FillerValueEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._topBar {
			display: flex;
			height: 65px;
			background-color: #fff;
    		border-bottom: 1px solid rgba(0, 0, 0, 0.10);
    		box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.05);
			align-items: center;
			padding: 0 15px;
		}

		${PREFIX} ._logo {
			height: 20px;
			cursor: pointer;
		}

		${PREFIX} ._simpleFillerPickerSelect {
			min-height: 25px;
			padding-top: 3px;
			padding-bottom: 3px;
			border-radius: 6px;
			border: 1px solid #EEE;
			background: transparent;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;
			height: 35px;
			padding: 0 8px;
		}

		${PREFIX} ._simpleFillerPickerSelect:focus {
			border: 2px solid #000088;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption {
			height: 25px;
			padding: 5px 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
			cursor: pointer;
		}

		${PREFIX} ._main_editor_dropdown ._simpleFillerPickerDropdownBody,
		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody{
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

		${PREFIX} ._main_editor_dropdown ._simpleFillerPickerDropdownBody {
			position: absolute;
			top: 100%;
			left: 0;
			margin-top: 0px;
			
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption._hovered,
		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption:hover {
			background-color: #F8FAFB;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption._selected {
			color: #333;
			font-weight: bold;
		}

		${PREFIX} ._simpleFillerPickerSelect svg {
			min-width: 8px;
		}

		${PREFIX} ._simpleFillerPickerSelect ._selectedOption {
			min-width: calc(100% - 8px);
		}

		${PREFIX} ._simpleFillerPickerSelect ._selectedOption._placeholder {
			text-transform: capitalize;
			color: #757575;
		}

		${PREFIX} ._main_editor_dropdown {
			position: relative;
			border: none;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FillterValueEditorCSS">{css}</style>;
}
