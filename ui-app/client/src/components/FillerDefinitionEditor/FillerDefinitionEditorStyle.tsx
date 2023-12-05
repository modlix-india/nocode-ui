import React from 'react';
import { StyleResolutionDefinition, processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './fillerDefinitionEditorStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compFillerDefinitionEditor';
export default function FillerDefinitionEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
			display: grid;
			grid-template-columns: 1fr;
			grid-auto-rows: min-content;
			font-weight: 500;
			size: 12px;
			line-height: 12px;
			gap: 20px
		}

		${PREFIX} ._sectionHeader {
			padding: 4px 16px;
			display: flex;
			flex-direction: row;
			height: 45px;
			align-items: center;
			gap: 10px;
			cursor: pointer;
		}

		${PREFIX} ._sectionBody {
			padding: 20px;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._sectionBody ._row {
			display: flex;
			flex-direction: row;
			gap: 5px;
			align-items: center;
		}

		${PREFIX} ._sectionBody ._alignBottom{
			align-items: flex-end;
			gap: 20px;
		}

		${PREFIX} ._sectionBody ._flex1 {
			flex: 1;
		}

		${PREFIX} ._sectionBody ._gap {
			margin-top: 5px;
		}

		${PREFIX} ._sectionBody ._column {
			display: flex;
			flex-direction: column;
			gap: 5px;
			justify-content: center;
		}

		${PREFIX} ._sectionBody ._toggleButton {
			position: relative;
			width: 40px;
			height: 20px;
			border-radius: 10px;
			background-color: #0000001D;
			cursor: pointer;
			
		}

		${PREFIX} ._sectionBody ._toggleButton._on {
			background-color: #52BD94;
		}

		${PREFIX} ._sectionBody ._toggleButton::after {
			content: '';
			position: absolute;
			top: 4px;
			left: 4px;
			width: 12px;
			height: 12px;
			border-radius: 9px;
			background-color: #FFFFFF;
			transition: all 0.2s ease-in-out;
		}

		${PREFIX} ._sectionBody ._toggleButton._on::after {
			left: 24px;
		}

		${PREFIX} ._sectionBody input[type="text"]._textBox {
			border-radius: 6px;
			border: 1px solid rgba(0, 0, 0, 0.10);
			background: #FFF;
			height: 35px;
			padding: 0 8px;
		}

		${PREFIX} ._sectionHeader ._sectionName {
			border: 1px solid transparent;
			padding: 5px 2px;
		}

		${PREFIX} ._sectionHeader ._sectionNameInput {
			flex: 1;
			font-size: inherit;
			line-height: inherit;
			border: none;
			outline: none;
			background: #FFFFFF2D;
			color: inherit;
			font-family: inherit;
			font-weight: inherit;
			padding: 5px 2px;
			border: 1px solid #0000002D;
			border-radius: 3px;
		}

		${PREFIX} ._editorContainer {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-top: 20px;
		}

		${PREFIX} ._label {
			font-size: 10px;
			line-height: 10px;
			padding-left: 15px;
			margin-top: 8px;
		}

		${PREFIX} ._choice {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		${PREFIX} ._choice input[type="radio"] {
			margin: 0;
			margin-right: 2px;
			margin-left: 5px;
		}

		${PREFIX} ._sectionHeaderButtons {
			flex: 1;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			gap: 15px;
		}

		${PREFIX} ._sectionHeaderButtons ._button {
			cursor: pointer;
		}

		${PREFIX} ._sectionHeaderButtons ._button:hover svg path,
		${PREFIX} ._sectionHeaderButtons ._button:hover svg circle,
		${PREFIX} ._sectionHeaderButtons ._button:hover svg rect{
			fill-opacity: 0.8;
		}

		${PREFIX} ._section._collapsed ._sectionHeader{
			border-bottom: none;
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
			border: 2px solid #015ECC;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption {
			height: 25px;
			padding: 5px 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption._hovered {
			background-color: #F8FAFB;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption._selected {
			color: #333;
			font-weight: bold;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody{
			position: fixed;
			min-width: 100%;
			background-color: #FFF;
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			margin-top: 0px;
			padding: 10px;
			max-height: 250px;
			overflow: auto;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption {
			height: 25px;
			padding: 5px 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOption._hovered {
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

		${PREFIX}._colorProfile1 {
			background-color: #ffffff;
			color: #000000CC;
		}

		${PREFIX}._colorProfile1 ._section {
			background-color: #ffffff;
			border-radius: 2px;
			border: 1px solid rgba(0, 0, 0, 0.05);
		}

		${PREFIX}._colorProfile1 ._sectionHeader {
			background: rgba(0, 0, 0, 0.02);
			border-top-left-radius: 2px;
			border-top-right-radius: 2px;
			border-bottom: 1px solid #0000000D;
		}

		${PREFIX}._colorProfile1 ._sectionHeader:hover {
			background: rgba(0, 0, 0, 0.08);
		}

		${PREFIX}._colorProfile1 svg {
			color: #000000;
		}

		${PREFIX}._colorProfile1 ._nondraggable svg {
			color: #aaa;
		}

		${PREFIX}._colorProfile1 ._label {
			color: #00000066;
		}

		._popupBackground._fillerDefEditor ._jsonEditorContainer{
			width: 40vw;
		}

		@media screen and (min-width: ${DESKTOP_MIN_WIDTH}px) {
			${PREFIX} {
				grid-template-columns: 1fr 1fr;
			}
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FillerDefinitionEditorCSS">{css}</style>;
}
