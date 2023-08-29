import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './menuStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compMenu';
export default function LinkStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);

	const css =
		`
	${PREFIX} {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
		text-decoration: none;
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

	${PREFIX} + ._right_orientation {
		position: absolute;
		left: 100%;
		z-index: 1;
	}

	${PREFIX} + ._bottom_orientation {
		position: absolute;
		left: 0;
		z-index: 1;
		top: 100%;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
