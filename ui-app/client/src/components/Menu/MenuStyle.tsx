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
		${PREFIX} {
			cursor: pointer;
		}
		${PREFIX} .menuItemsContainer {
			display: flex;
		}
		${PREFIX} .menu {
			flex: 1;
			display: flex;
			flex-direction : row;
			align-items: center;
			justify-content: space-between;
		}
		${PREFIX} .menuLink {
			display: flex;
		}
		
		${PREFIX} .link{
			text-decoration: none;
			flex: 1
		}
		
		${PREFIX} .icon {
			width:  calc(${
				theme.get(StyleResolution.ALL)?.get('menuIconSize') ??
				styleDefaults.get('menuIconSize')
			} + 4px);
			height:  calc(${
				theme.get(StyleResolution.ALL)?.get('menuIconSize') ??
				styleDefaults.get('menuIconSize')
			} + 4px);
		}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
