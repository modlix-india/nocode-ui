import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './KIRunEditorStyleProperties';

const PREFIX = '.comp.compKIRunEditor';
export default function KIRunEditorStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			flex: 1;
			border: 1px solid #eee;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._designer {
			position: relative;
			width: 3000px;
			height: 3000px;
			background-color: #fff;
			background-size: 20px 20px;
			background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 0px),
				linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0px);
		}

		${PREFIX} ._nodeContainer {
			position: absolute;
			left: 0px;
			top: 0px;
		}

		${PREFIX} ._nodeContainer ._node {
		}

		${PREFIX} ._nodeContainer ._node._selected {
		}

		${PREFIX} ._flowContainer {
			position: absolute;
			left: 0px;
			top: 0px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="KIRUNEditorCss">{css}</style>;
}
