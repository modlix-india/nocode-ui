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
	}

	${PREFIX} input._inputBox {
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
		padding-left: 10px;
	}

	${PREFIX}._isActive ._label,
	${PREFIX} ._label._noFloat {
		transform: translateY(-50%);
		bottom: 100%;
	}

	${PREFIX} ._label {
		position: absolute;
		user-select: none;
		pointer-events: none;
		bottom: 50%;
		transform: translateY(50%);
		transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
	}

	${PREFIX}._bigDesign1._hasValue ._label,
	${PREFIX}._bigDesign1._isActive ._label,
	${PREFIX}._bigDesign1 ._label._noFloat {
		margin-top: -30px;
		bottom: auto;
		transform: none;
	}

	${PREFIX} ._label._float {
		bottom: 0px;
	}

	${PREFIX} ._clearText {
		cursor: pointer;
	}

	${PREFIX} ._supportText {
		position:absolute;
		z-index:1;
		left: 0;
		top: 100%;
		margin-top: 5px;
	}

	${PREFIX} ._dropdownSelect {
		height: 100%;
		cursor: pointer;
		border: none;
		outline: none;

		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		// padding: 0 12px 0 7px;
	}

	${PREFIX} ._dropdownSelect ._selectedOption {
		display: flex; 
		gap: 2px;
		align-items:center;
	}

	${PREFIX} ._dropdownSelect ._arrowIcon {
		// width: 8px;
		// color: #A3A3A3;
	}

	${PREFIX} ._dropdownBody {
		position: fixed;
		width: 100%;
		// border: 1px solid rgba(0, 0, 0, 0.10);
		// box-shadow: 0px 1px 4px 0px #00000026;
		// border-radius: 6px;
		// padding: 5px 6px 0px 6px;
		z-index: 2;
		max-height: 250px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	${PREFIX} ._dropdownBody ._searchBoxContainer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		// padding: 0 6px;
		max-width: 100%;
		min-height: 38px;
		// border-bottom: 1px solid;
		// border-color: rgb(0,0,0,.07);
	}

	${PREFIX} ._dropdownBody ._searchIcon {
		// color: rgba(0,0,0,.4);
	}
	${PREFIX} ._dropdownBody input._searchBox {
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
	
	${PREFIX} ._dropdownBody ._dropdownOptionList {
		flex: 1;
		width: 100%;
		overflow: scroll;
	}

	${PREFIX} ._dropdownBody ._dropdownOption {
		display: flex;
		gap: 10px;
		white-space: wrap;
		cursor: pointer;
		align-items:center;
		
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
