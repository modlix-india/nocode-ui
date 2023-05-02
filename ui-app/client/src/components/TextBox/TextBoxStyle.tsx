import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textBoxStyleProperties';

const PREFIX = '.comp.compTextBox';
export default function TextBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		.commonInputBox .textBoxDiv .inputContainer {
			position: relative;
		}
		
		.commonInputBox .textBoxDiv .inputContainer .textbox {
			border: none;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			outline: none;
		}
		
		.commonInputBox .textBoxDiv .inputContainer .textBoxLabel {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			transition: top 100ms, transform 100ms ease-in;
		}
		
		.commonInputBox .textBoxDiv {
			display: flex;
			position: relative;
		}

		.commonInputBox .textBoxDiv .leftIcon,
		.commonInputBox .textBoxDiv .rightIcon,
		.commonInputBox .supportText {
			position: relative;
		}

		.commonInputBox .noFloatTextBoxLabel  {
			display: inline-block;
			position: relative;
		}
		
		.commonInputBox .textBoxDiv .inputContainer .textbox:focus + .textBoxLabel,
		.commonInputBox .textBoxDiv .inputContainer .textbox:not(:placeholder-shown) + .textBoxLabel {
			transform: translateY(-55%);
		}
		
		.commonInputBox 
			.textBoxDiv.textBoxwithIconContainer
			.inputContainer
			.textbox:focus
			+ .textBoxLabel,
		.commonInputBox 
			.textBoxDiv.textBoxwithIconContainer
			.inputContainer
			.textbox:not(:placeholder-shown)
			+ .textBoxLabel {
			transform: translateY(-55%);
		}

		.commonInputBox .textbox .remove-spin-button::-webkit-outer-spin-button, .remove-spin-button::-webkit-inner-spin-button {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			margin: 0; 
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
