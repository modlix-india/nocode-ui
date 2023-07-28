import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textAreaStyleProperties';

const PREFIX = '.comp.compTextArea';
export default function TextAreaStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			width: 100%;
			display: flex;
			flex-direction: column;
			
		}

		${PREFIX} .inputContainer {
			position: relative;
			flex: 1;
		}
		
		${PREFIX} .inputContainer .textArea {
			border: none;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			outline: none;
			resize: none;
		}
		
		${PREFIX} .inputContainer .textAreaLabel {
			position: absolute;
			top: 0;
			
			transition: top 100ms, transform 100ms ease-in;
		}
		
		${PREFIX} .inputContainer {
			display: flex;
			position: relative;
		}

		${PREFIX} .supportText {
			position: relative;
		}

		${PREFIX} .noFloatTextAreaLabel  {
			display: inline-block;
			position: relative;
		}

		${PREFIX} .inputContainer .textArea.float::placeholder {
			opacity: 0;
		}
		
		${PREFIX} .inputContainer .textArea:focus + .textAreaLabel,
		${PREFIX} .inputContainer .textArea:not(:placeholder-shown) + .textAreaLabel {
			transform: translateY(-55%);
		}
		
		${PREFIX} 
			.inputContainer
			.textArea:focus
			+ .textAreaLabel,
		${PREFIX} 
			.inputContainer
			.textArea:not(:placeholder-shown)
			+ .textAreaLabel {
			transform: translateY(-55%);
		}

		${PREFIX} .textArea .remove-spin-button::-webkit-outer-spin-button, .remove-spin-button::-webkit-inner-spin-button {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			margin: 0; 
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextAreaCss">{css}</style>;
}
