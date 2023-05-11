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
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
