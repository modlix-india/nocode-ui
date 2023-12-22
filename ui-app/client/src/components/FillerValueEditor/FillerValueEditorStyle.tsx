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
			flex-shrink : 0;
		}

		${PREFIX} ._body {
			flex:1;
			display: flex;
			overflow: hidden;
		}

		${PREFIX} ._body ._pageViewer {
			flex: 1;
			padding-left: 5px;
			display: flex;
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

		${PREFIX} ._body ._pageViewer._TABLET {
			justify-content: center;
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

		${PREFIX} ._body ._pageViewer._MOBILE {
			justify-content: center;
		}

		${PREFIX} ._body ._valueEditor {
			width: 350px;
			height: 100%;
			background-color: #F8FAFB;
			box-shadow: 0px 3px 4px 0px rgba(0, 0, 0, 0.25);
			position: relative;
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
			border: none;
			background: transparent;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;
			height: 35px;
			padding: 0 8px;
			background-color: #F8FAFB;
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
			cursor: pointer;
			display: flex;
		}

		${PREFIX} ._simpleFillerPickerSelect ._simpleFillerPickerDropdownBody ._simpleFillerPickerDropdownOptionColors {
			display: flex;
			flex: 1;
			height: 20px;
			gap: 5px;
		}

		${PREFIX} ._eachColor {
			width: 24px;
			height: 24px;
			border-radius: 100%;
			border: 2px solid #FFF;
			box-shadow: 0px 1px 4px 0px #00000026;
		}

		${PREFIX} ._simpleEditorColorSelector {
			border-width: 2px;
		}

		${PREFIX} ._eachColor:hover {
			z-index: 5;
		}

		${PREFIX} ._currentPalette {
			display: flex;
			flex-direction: row;
			gap: 5px;
		}

		${PREFIX} ._generateButtonContainer {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 10px;
			flex: 1;
		}

		${PREFIX} ._generateButton {
			width: 50px;
			height: 25px;
			border-radius: 100px;
			background: #FFFFFF;
			border: 0.5px solid #0000001A;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			box-shadow: 0px 1px 2px 0px #0000000D;

		}

		${PREFIX} ._main_editor_dropdown ._simpleFillerPickerDropdownBody,
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

		${PREFIX} ._simpleFillerPickerDropdownBody._colorDropdown {
			position: absolute;
			top: 100%;
			left: 0;
			margin-top: 0px;
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

		${PREFIX} ._simpleFillerPickerDropdownBody._colorDropdown ._simpleFillerPickerDropdownOption {
			height: 34px;
			align-items: center;
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
			
			font-size: 12px;
			font-weight: 600;
			cursor: pointer;
		}

		${PREFIX} ._rightButtonBar ._outlineButton{
			border-radius: 6px;
			background: transparent;
			border: 1px solid #52BD94;
			box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.10);
			padding: 6px 15px;
			color: #52BD94;
			
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
			gap: 20px;
		}

		${PREFIX} ._toggleButton {
			position: relative;
			min-width: 40px;
			max-width: 40px;
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

		${PREFIX}  input[type="text"]._textBox,
		${PREFIX}  textarea._textEditor {
			border-radius: 6px;
			background: #F8FAFB;
			height: 35px;
			padding: 0 8px;
			border: none;
			font-family: inherit;
		}

		${PREFIX}  textarea._textEditor {
			height: 150px;
			resize: none;
			padding: 10px;
			
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
		}

		${PREFIX} ._section._selected ._sectionNumber {
			background-color: #427EE4;
		}

		${PREFIX} ._sectionHeader ._sectionName {
			border: 1px solid transparent;
			padding: 5px 2px;
			
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
		}

		${PREFIX} ._sectionEnd {
			min-height:200px;
		}

		${PREFIX} ._sectionBody._HORIZONTAL {
			flex-direction: row;
			align-items: center;
		}

		${PREFIX} ._sectionBody._TWO_PER_ROW {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: center;
		}

		${PREFIX} ._sectionBody._THREE_PER_ROW {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			align-items: center;
		}

		${PREFIX} ._editor {
			display: flex;
			flex-direction: column;
			gap: 10px;	
			flex: 1;		
		}

		${PREFIX} ._sectionBody._HORIZONTAL ._editor {
			height: 100%;
		}

		${PREFIX} ._editor ._editorLabel {
			font-size: 12px;
			font-weight: 500;
			color: #33333366;
			white-space: nowrap;
		}

		${PREFIX} ._imageEditor {
			width: 100%;
			height: 70px;
			background-size: contain;
			background-position: center;
			background-repeat: no-repeat;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #F8FAFB;
			border-radius: 6px;
			border: 1px solid #F8FAFB99;
		}

		${PREFIX} ._imageEditor ._imageControls {
			display: none;
			flex-direction: column;
			gap: 10px;
			justify-content: center;
			align-items: center;
			background-color: #00000014;
			flex: 1;
			border-radius: 6px;
			height: 100%;
		}

		${PREFIX} ._imageEditor:hover ._imageControls,
		${PREFIX} ._imageControls._show {
			display: flex;
		}

		${PREFIX} ._imageControls button {
			height: 22px;
			padding: 0 10px;
			border-radius: 18px;
			border: 0.4px solid #FFF;
			background: #000000B2;
			color: #FFFFFF;
			font-size: 10px;
			font-weight: 500;
			
			cursor: pointer;
		}

		${PREFIX} ._imageControls button:hover {
			box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.20);
		}

		${PREFIX} ._popupContainer {
			position: fixed;
			width: calc(100vw - 350px);
			height: calc(100vh - 65px);
			z-index: 6;
			background-color: #0000002D;
			left: 350px;
			top: 65px;
			display: flex;
			align-items: center;
			justify-content: left;
		}

		${PREFIX} ._popup {
			width: 650px;
			height: 400px;
			background-color: #FFF;
			border-radius: 6px;
			display: flex;
			flex-direction: column;
			padding: 10px;
			margin-left: 20px;
			position: relative;
		}

		${PREFIX} ._popupClose {
			font-family: monospace;
			position: absolute;
			right: 10px;
			top: 7px;
			cursor: pointer;
		}

		${PREFIX} ._popupContainer ._iconSelectionBrowser {
			width: auto;
			height: 325px;
			gap: 20px;
		}

		${PREFIX} ._browserBack {
			gap: 20px;
		}

		${PREFIX} ._arrayOfImages{ 
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr;
			grid-gap: 5px;
			row-gap: 8px;
		}

		${PREFIX} ._arrayOfImages ._imageEditor {
			width: 70px;
			height: 70px;
		}

		${PREFIX} ._objectEditor {
			display: flex;
			flex-direction: column;
			gap: 10px;
			overflow-y: auto;
			height: 280px;
			border-radius: 6px;
			background-color: #F8FAFB;
			padding: 13px;
		}

		${PREFIX} ._objectEditor._LIST_HORIZONTAL {
			background-color: transparent;
		}

		${PREFIX} ._objectEditor._LIST_HORIZONTAL ._eachObject {
			background-color: #F8FAFB;
			border-radius: 6px;
		}

		${PREFIX} ._objectEditor ._eachObject,
		${PREFIX} ._tab ._eachObject {
			display: flex;
			flex-direction: row;
			gap: 10px;
			align-items: center;
		}

		${PREFIX} ._tab ._eachObject {
			background: #F8FAFB;
			padding: 5px;
			border-radius: 4px;
			align-items: center;
			cursor: pointer;
		}

		${PREFIX} ._tab ._eachObject ._controlGrid {
			display: flex;
			flex-direction: direction;
			gap: 5px;
		}

		${PREFIX} ._tab ._eachObject span {
			white-space: nowrap;
		}

		${PREFIX} ._objectEditor._LIST img,
		${PREFIX} ._tab ._eachObject img {
			width: 24px;
		}

		${PREFIX} ._objectEditor._GRID img,
		${PREFIX} ._tab._GRID ._eachObject img {
			width: 70px;
		}

		${PREFIX} ._objectEditor._LIST_HORIZONTAL img,
		${PREFIX} ._tab._LIST_HORIZONTAL ._eachObject img {
			width: auto;
			height: 70px;
		}

		${PREFIX} ._objectEditor::-webkit-scrollbar {
			width: 3px;
		}

		${PREFIX} ._objectEditor._GRID ._eachObject,
		${PREFIX} ._tab._GRID ._eachObject {
			flex-direction: column;
			align-items: center;	
		}

		${PREFIX} ._objectEditor._LIST_HORIZONTAL ._eachField,
		${PREFIX} ._tab._LIST_HORIZONTAL ._eachField {
			flex-direction: row;
			display: flex;
			justify-content: center;
			flex: 1;	
		}

		${PREFIX} ._objectEditor._GRID {
			display: grid;
			grid-template-columns: 1fr 1fr ;
		}

		${PREFIX} ._tabContainer {
			display: flex;
			flex-direction: column;
			flex: 1;
			gap: 5px;
			padding: 10px;
		}

		${PREFIX} ._tabContainer ._tabHeader {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		${PREFIX} ._tabContainer ._tabHeader ._tabTitle {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			color: rgba(0, 0, 0, 0.20);
			border-bottom: 2px solid #F1F1F1;
			cursor: pointer;
			padding-bottom: 10px;
		}

		${PREFIX} ._tabContainer ._tabHeader ._tabTitle._selected {
			color: #427EE4;
			border-color: #427EE4;
		}

		${PREFIX} ._tabContainer ._tabDivider {
			height: 0px;
			border: 1px solid #F1F1F1;
			width: 175px;
			margin-top: 10px;
		}

		${PREFIX} ._tabContainer ._tab {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 10px;
			max-height: 250px;
		}

		${PREFIX} ._tabContainer ._tab {
			display: grid;
			grid-template-columns: 1fr 1fr;
			overflow: auto;
			grid-auto-rows: max-content;
			gap: 10px;
		}

		${PREFIX} ._tabContainer ._tab._newObject {
			display: flex;
			flex-direction: column;
			overflow: auto;
		}

		${PREFIX} ._tabContainer ._tabFooter {
			display: flex;
			flex-direction: row;
			gap: 10px;
			padding-top: 10px;
		}

		${PREFIX} ._tabContainer ._tabFooter ._button {			
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			background-color: #427EE4;
			color: #FFF;
			cursor: pointer;
			padding: 10px;
			border-radius: 6px;
			border: none;
			font-size: 12px;
		}

		${PREFIX} ._palette {
			display: flex;
			flex-direction: column;
			gap: 10px;
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
			margin-left: 0px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FillterValueEditorCSS">{css}</style>;
}
