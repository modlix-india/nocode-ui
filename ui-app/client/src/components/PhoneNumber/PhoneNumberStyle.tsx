import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './phoneNumberStyleProperties';

const PREFIX = '.comp.compPhoneNumber';
export default function PhoneNumberStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} {
		display: flex;
		align-items: center;
		position: relative;
		gap: 8px;
	}

	${PREFIX} input {
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

	${PREFIX} ._label._dialCodeLength1 {
		padding-left: 38px;
	}

	${PREFIX} ._label._dialCodeLength2 {
		padding-left: 64px;
	}

	${PREFIX} ._label._dialCodeLength3 {
		padding-left: 70px;
	}

	${PREFIX} ._label._dialCodeLength4 {
		padding-left: 78px;
	}

	${PREFIX} ._label._dialCodeLength5 {
		padding-left: 86px;
	}

	${PREFIX} ._label {
		position: absolute;
		user-select: none;
		pointer-events: none;
		bottom: 50%;
		transform: translateY(50%);
		transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
	}

	${PREFIX}._bigDesign1 ._label {
    	margin-top: 0px;
	}

	${PREFIX}._bigDesign1._hasDialCode ._label {
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
		// padding-top: 10px;
	}

	${PREFIX} ._label._float {
		bottom: 0px;
	}

	${PREFIX} ._clearText, ${PREFIX} ._passwordIcon {
		cursor: pointer;
	}

	${PREFIX} ._supportText {
		position:absolute;
		z-index:1;
		left: 0;
		top: 100%;
		margin-top: 5px;
	}

	${PREFIX} ._dropdown {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 8px;
	}

	${PREFIX} ._dropdownSelect span {
		font-size: 14px;
	}

	${PREFIX} ._dropdownSelect {
		height: 100%;
		cursor: pointer;
		background-color: transparent;
		border: none;
		outline: none;

		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	${PREFIX} ._dropdownSelect svg {
		width: 8px;
		color: rgb(0,0,0,1);
	}

	${PREFIX} ._dropdownSelect ._selectedOption {
		font-size: 14px;
	}

	${PREFIX} ._dropdownBody {
		position: fixed;
		width: 100%;
		background-color: #FFF;
		border: 1px solid rgba(0, 0, 0, 0.10);
		box-shadow: 0px 1px 4px 0px #00000026;
		border-radius: 6px;
		padding: 5px 0 0px 7px;
		z-index: 2;
		max-height: 250px;
		overflow: scroll;
	}
	${PREFIX} ._dropdownBody ._dropdownSearchBox {
		width: 100%;
		min-height: 38px;
		background: #FFF;
		padding: 0 0 0 7px;
		margin: 6px 0;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		border: 2px solid rgb(0,0,0,.08);
	}

	${PREFIX} ._dropdownBody ._dropdownOption {
		display: flex;
		gap: 4px;
		padding: 10px 0;
		border-radius: 4px;
		white-space: wrap;
		cursor: pointer;
		font-size: 14px;
	}

	${PREFIX} ._dropdownBody ._dropdownOption._hovered {
		background-color: rgb(0,0,0,.04);
	}

	${PREFIX} ._dropdownBody ._dropdownOption._selected {
		background-color: rgb(0,0,0,.04);
	}

	${PREFIX} ._dropdownBody ._dropdownOption._nextSeperator {
		border-radius: 0px;
		border-bottom: 2px solid rgb(0,0,0,.08);
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
