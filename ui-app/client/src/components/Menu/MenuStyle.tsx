import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Menu/menuStyleProperties';

const PREFIX = '.comp.compMenu';
export default function MenuStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			width: 100%;
		}
		${PREFIX} .menuContainer {
			cursor: pointer;
			
		}
		${PREFIX} .menuItemsContainer {
			display: flex;
		}
		${PREFIX} .menuContainer .menu {
			flex: 1;
			display: flex;
			flex-direction : row;
			align-items: center;
			padding: 0 36px;
			justify-content: space-between;
		
		}
		${PREFIX} .menuLink {
			display: flex;
		}
		
		${PREFIX} .menuLink .link{
			text-decoration: none;
			display: flex;
		}
		${PREFIX} .highLight {
			width: 7px;
			height: ${theme.get(StyleResolution.ALL)?.get('menuHeight') ?? styleDefaults.get('menuHeight')};
		}
		${PREFIX} .menuItemsContainer.isActive .highLight {
			background-color: #E4B022;
		}
		${PREFIX} .menuItemsContainer.isActive .menu {
			background-color: #363A33;
		}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
