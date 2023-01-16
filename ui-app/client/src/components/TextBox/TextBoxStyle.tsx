import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textBoxStyleProperties';

const PREFIX = '.comp.compTextBox';
export default function TextBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .textBoxDiv .inputContainer {
			position: relative;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox {
			border: none;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			outline: none;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textBoxLabel {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			transition: top 100ms, transform 100ms ease-in;
		}
		
		${PREFIX} .textBoxDiv.textBoxContainer {
			display: grid;
			grid-template-columns: auto 30px;
		}

		${PREFIX} .textBoxDiv.textBoxwithRightIconContainer {
			display: grid;
			grid-template-columns: auto 30px;	
		}
		
		${PREFIX} .textBoxDiv.textBoxwithIconContainer {
			display: grid;
			grid-template-columns: 30px auto 30px;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox:focus + .textBoxLabel,
		${PREFIX} .textBoxDiv .inputContainer .textbox:not(:placeholder-shown) + .textBoxLabel {
			transform: translateY(-55%);
		}
		
		${PREFIX} 
			.textBoxDiv.textBoxwithIconContainer
			.inputContainer
			.textbox:focus
			+ .textBoxLabel,
		${PREFIX} 
			.textBoxDiv.textBoxwithIconContainer
			.inputContainer
			.textbox:not(:placeholder-shown)
			+ .textBoxLabel {
			transform: translateY(-55%);
		}

		${PREFIX} .textbox .remove-spin-button::-webkit-outer-spin-button, .remove-spin-button::-webkit-inner-spin-button {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			margin: 0; 
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
