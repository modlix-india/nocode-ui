import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Menu/menuStyleProperties';

const PREFIX = '.comp.compMenu';
export default function MenuStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .menuContainer {
			cursor: pointer;
		}
		${PREFIX} .menuContainer .menu {
			width: 100%;
			display: flex;
			flex-direction : row;
			align-items: center;
			justify-content: center;
		}
		${PREFIX} .menuContainer .isActive {
			background-color: white;
		}
		${PREFIX} .menuContainer .menu .menuLink a{
			display: flex;
			align-items: center;
			gap: 10px;
		}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
