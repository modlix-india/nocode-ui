import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './shortcutStyleProperties';

const PREFIX = '.comp.compShortcut';

export default function ShortcutComponentStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			top: 0px;
			left: 0px;
			position: fixed;
			background-color: white;
			border-radius: 6px;
			padding: 5px;
			opacity: 0.5;
			z-index: 10;
			cursor: move;
		}

		${PREFIX}:hover {
			opacity: 1;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ShortcutCss">{css}</style>;
}
