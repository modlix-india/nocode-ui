import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './messageStyleProperies';

const PREFIX = '.comp.compMessages';
export default function MessageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} {
			position: fixed;
			z-index: 12;
		}

		${PREFIX} ._message {
			display: flex;
			align-items: center;
		}

		${PREFIX} ._message ._msgStringContainer {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._message ._msgString {
			display: flex;
			gap: 5px;
			align-items: center;
		}

		${PREFIX} ._message ._msgDebug {
			padding: 5px 15px;
			font-weight: 500;
		}

		${PREFIX} ._msgStackTrace {
			padding: 10px;
			border-radius: 0px 2px 2px 0;
			font-family: monospace;
			width: 50vw;
			height: 50vh;
			overflow: auto;
			background-color: #fff;
			box-shadow: 2px 2px 4px #aaa4;
			margin-bottom: 4px;
		}

		${PREFIX} {
			display: flex;
			flex-direction: column;
		}

		${PREFIX} .fa-circle-xmark{
			cursor: pointer
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MessageCss">{css}</style>;
}
