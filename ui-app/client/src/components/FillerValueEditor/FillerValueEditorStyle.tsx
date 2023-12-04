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

		${PREFIX} ._body {
			flex:1;
			display: flex;
		}

		${PREFIX} ._body ._pageViewer {
			flex: 1;
			padding-left: 5px;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #FFF;
			background: repeating-conic-gradient(#FAFAFA 0% 25%, transparent 0% 50%) 50% / 20px 20px;
			overflow: auto;
		}

		${PREFIX} ._body ._pageViewer iframe {
			flex: 1;
			height: 100%;
			outline: none;
			border: none;
			width: 100%;
			transition: min-width 0.5s, max-width 0.5s, width 0.5s;
		}

		${PREFIX} ._body ._pageViewer._DESKTOP iframe {
  		min-width: 1024px;
			max-width: 3024px;
		}

		${PREFIX} ._body ._pageViewer._TABLET iframe {
			width: 0%;
			max-width: 961px;
  		min-width: 961px;
		}

		${PREFIX} ._body ._pageViewer._MOBILE iframe {
			width: 0%;
			max-width: 481px;
  		min-width: 481px;
		}

		${PREFIX} ._body ._valueEditor {
			width: 350px;
			height: 100%;
			background-color: #F8FAFB;
			box-shadow: 0px 3px 4px 0px rgba(0, 0, 0, 0.25);
			position: relative;
			overflow: auto;	
			transition: width 0.5s;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._body ._valueEditor ._collapseButton {
			position: fixed;
			top: 86px;
			left: 338px;
			width: 24px;
			height: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.10);
			background-color: #52BD94;
			border-radius: 100%;
			transition: left 0.5s, rotate 0.5s;
		}

		${PREFIX} ._body ._valueEditor._collapsed {
			width: 5px;
		}

		${PREFIX} ._body ._valueEditor._collapsed ._collapseButton {
			left: -6px;
			rotate: 180deg;
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

		${PREFIX} ._resoultionBar {

			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
		}

		${PREFIX} ._resoultionBar ._icon {
			width: 36px;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
		} 

		${PREFIX} ._resoultionBar ._icon._selected {
			background-color: #8E90A41A;
		}

		${PREFIX} ._rightButtonBar {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 15px;
		}

		${PREFIX} ._rightButtonBar ._button {
			width: 27px;
			height: 27px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			background-color: #F8FAFB;
			border-radius: 10px;
		}

		${PREFIX} ._rightButtonBar ._saveButton{
			border-radius: 6px;
			background: #52BD94;
			box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.10);
			padding: 6px 15px;
			color: #FFF;
			font-family: Inter;
			font-size: 12px;
			font-weight: 600;
			cursor: pointer;
		}

		${PREFIX} ._rightButtonBar ._button._disabled svg {
			opacity: 0.3;
		}

		${PREFIX} ._valueEditor ._sectionContainerHeader {
			display: flex;
			justify-content: center;
			padding: 15px 20px;
			flex-direction: column;
			gap: 8px;
		}

		${PREFIX} ._valueEditor ._sectionContainerHeader ._headerTitle {
			font-size: 16px;
			font-weight: 600;
			color: #000000;
		}

		${PREFIX} ._valueEditor ._sectionContainerHeader ._headerSubTitle {
			font-size: 12px;
			font-weight: 400;
			color: #00000066;
		}

		${PREFIX} ._valueEditor ._sectionContainer {
			flex: 1;
			overflow: auto;
			display: flex;
			background: #FFF;
			flex-direction: column;
			padding: 20px;
		}

		${PREFIX} ._toggleButton {
			position: relative;
			width: 40px;
			height: 20px;
			border-radius: 10px;
			background-color: #0000001D;
			cursor: pointer;
			
		}

		${PREFIX} ._toggleButton._on {
			background-color: #52BD94;
		}

		${PREFIX}  ._toggleButton::after {
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

		${PREFIX}  ._toggleButton._on::after {
			left: 24px;
		}

		${PREFIX}  input[type="text"]._textBox {
			border-radius: 6px;
			border: 1px solid rgba(0, 0, 0, 0.10);
			background: #FFF;
			height: 35px;
			padding: 0 8px;
		}

		${PREFIX} ._sectionHeader ._sectionNumber {
			width: 24px;
			height: 24px;
			border-radius: 100%;
			box-shadow: 0px 1px 4px 0px #00000025;
			background: #FDAB3D;
			color: #FFFFFF;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			font-weight: 700;
			font-family: Inter;
		}

		${PREFIX} ._sectionHeader ._sectionName {
			border: 1px solid transparent;
			padding: 5px 2px;
			font: Inter;
			font-size: 12px;
			font-weight: 500;
			color: #33333366;
			flex: 1;
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

		${PREFIX} ._sectionHeader {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap:8px;
		} 

		${PREFIX} ._sectionBody {
			display: flex;
			flex-direction: column;
			gap: 5px;
			padding-top: 10px;
			align-items: center;
		}

		${PREFIX} ._sectionBody._HORIZONTAL {
			flex-direction: row;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FillterValueEditorCSS">{css}</style>;
}
