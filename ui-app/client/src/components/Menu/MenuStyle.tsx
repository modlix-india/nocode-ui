import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './menuStyleProperties';

const PREFIX = '.comp.compMenu';
export default function LinkStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
	}

	${PREFIX} ._externalButton {
		position: relative;
	}

	${PREFIX} ._icon {
		position: relative;
	}

	${PREFIX} ._caretIcon {
		position: relative;
		transition: transform 0.5s ease-in-out;
	}

	${PREFIX} ._caretIconContainer {
		flex: 1;
		text-align: right;
 	} 

	${PREFIX}._simpleMenuDesign2 {
		border-left: 1px solid transparent;
		border-right: 1px solid transparent;
		justify-content: center;
	}

	${PREFIX}._simpleMenuDesign3 {
		border-top: 1px solid transparent;
		border-bottom: 1px solid transparent;
		justify-content: center;
	}

	${PREFIX}._colouredMenuDesign1 {
		border-top : 1px solid transparent;
		border-bottom : 1px solid transparent;
		border-left : 1px solid transparent;
		border-right : 1px solid transparent;
	}

	${PREFIX}._colouredMenuDesign2 {
		border-top : 1px solid transparent;
		border-bottom : 1px solid transparent;
		border-left : 1px solid transparent;
		border-right : 1px solid transparent;
	}


	${PREFIX}._colouredMenuDesign3 {
		border-top : 1px solid transparent;
		border-bottom : 1px solid transparent;
		border-left : 1px solid transparent;
		border-right : 1px solid transparent;
	}
	${PREFIX}._filledMenuDesign1{
		border-bottom : 1px solid transparent;
	}
	${PREFIX}._filledMenuDesign4:hover, ${PREFIX}._filledMenuDesign4._isActive {
		border : 1px solid transparent;
	}

	${PREFIX}._simpleMenuHorizontalDesign4{
		border-bottom : 1px solid transparent;
	}

	${PREFIX}.childrenDiv{
		display:flex;
		flex-direction: column;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
