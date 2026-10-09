import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './messageStyleProperies';

const PREFIX = '.comp.compMessages';
export default function MessageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// No z-index in the CSS below: it is the messagesZIndex style property in
	// messageStyleProperies.ts, whose default is 10000. Hard-coding it at 12 meant
	// toasts painted behind popups and portals with no way for a theme to say
	// otherwise.
	//
	// The container is always in the DOM, even with no toasts, and sits above everything.
	// A theme that pins it on all four sides (top AND bottom, left AND right) stretches it
	// over the page, and an empty box at 10000 then swallows every click. So the box
	// itself ignores the pointer and only the toasts inside it take clicks.
	const css =
		`
		${PREFIX} {
			position: fixed;
			pointer-events: none;
		}

		${PREFIX} > * {
			pointer-events: auto;
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
