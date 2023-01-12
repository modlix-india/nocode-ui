import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textBoxStyleProperties';

const PREFIX = '.comp.compTextBox';
export default function TextBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .supportText{
			letter-spacing: 0px;
			text-overflow: ellipsis;
		}
		${PREFIX} .textBoxDiv {
			width: 230px;
			height: 56px;
			border: 1px solid;
			border-radius: 4px;
		}
		${PREFIX} .textBoxDiv.error {
			border: 1px solid;
		}
		
		${PREFIX} .textBoxDiv.focussed {
			border: 1px solid;
		}
		
		${PREFIX} .textBoxDiv.hasText {
			border: 1px solid;
		}
		${PREFIX} .textBoxDiv .inputContainer {
			position: relative;
			height: 100%;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox {
			border: none;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			outline: none;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox::placeholder {
			opacity: 0;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textBoxLabel {
			position: absolute;
			letter-spacing: 0px;
			left: 0px;
			top: 50%;
			transform: translateY(-50%);
			transition: top 100ms, transform 100ms ease-in;
			cursor: text;
			padding-left: 5px;
		}
		
		${PREFIX} .textBoxDiv.textBoxContainer {
			display: grid;
			grid-template-columns: auto 30px;
			align-items: center;
		}
		
		${PREFIX} .textBoxDiv.textBoxwithIconContainer {
			display: grid;
			grid-template-columns: 30px auto 30px;
			align-items: center;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox:focus + .textBoxLabel,
		${PREFIX} .textBoxDiv .inputContainer .textbox:not(:placeholder-shown) + .textBoxLabel {
			top: 0;
			left: 5px;
			transform: translateY(-55%);
			background-color: #fff;
			padding-left: 0;
		}
		
		${PREFIX} .textBoxDiv .inputContainer .textbox:disabled {
			background-color: transparent;
			color: #d5d5d5;
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
			top: 0;
			left: -25px;
			transform: translateY(-55%);
			background-color: #fff;
			padding-left: 0;
		}
		
		${PREFIX} .textBoxDiv .leftIcon {
			justify-self: center;
		}
		
		${PREFIX} .textBoxDiv .clearText {
			cursor: pointer;
		}

		${PREFIX} .textbox .remove-spin-button::-webkit-outer-spin-button, .remove-spin-button::-webkit-inner-spin-button {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			margin: 0; 
		}

		${PREFIX} .textBoxLabel.disabled {
			background-color: transparent;
			color: #d5d5d5;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
