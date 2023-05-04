import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Menu/menuStyleProperties';

const PREFIX = '.comp.compMenu';
export default function MenuStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
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
			position: relative;
		}
		${PREFIX} .menu {
			flex: 1;
			display: flex;
			flex-direction : row;
			align-items: center;
			justify-content: space-between;
			position: relative;
		}

		${PREFIX} .menuText {
			position: relative;
			flex:1;
		}

		${PREFIX} .icon {
			position: relative;
		}

		${PREFIX} .caretIcon {
			position: relative;
		}
		
		${PREFIX} .link{
			text-decoration: none;
			flex: 1;
			position: relative;
		}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
