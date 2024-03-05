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

	${PREFIX}._dialCodeLength1 ._label {
		padding-left: 38px;
	}

	${PREFIX}._dialCodeLength2 ._label {
		padding-left: 64px;
	}

	${PREFIX}._dialCodeLength3 ._label {
		padding-left: 70px;
	}

	${PREFIX}._dialCodeLength4 ._label {
		padding-left: 78px;
	}

	${PREFIX}._dialCodeLength5 ._label {
		padding-left: 86px;
	}

	${PREFIX}._dialCodeLength6 ._label {
		padding-left: 92px;
	}

	${PREFIX}._dialCodeLength7 ._label {
		padding-left: 100px;
	}

	${PREFIX}._dialCodeLength8 ._label {
		padding-left: 108px;
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
	}

	${PREFIX} ._dropdownSelect svg {
		color: inherit;
	}

	${PREFIX} ._dropdownBody {
		position: fixed;
		width: 100%;

		z-index: 2;
		max-height: 250px;
		display: flex;
		flex-direction: column;
	}

	${PREFIX} ._dropdownBody ._dropdownSearchBox {
		max-width: 100%;
		min-height: 38px;
	}

	${PREFIX} ._dropdownBody ._dropdownOptionList {
		flex: 1;
		width: 100%;
		overflow: scroll;
	}

	${PREFIX} ._dropdownBody ._dropdownOption {
		display: flex;
		gap: 4px;
		white-space: wrap;
		cursor: pointer;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
