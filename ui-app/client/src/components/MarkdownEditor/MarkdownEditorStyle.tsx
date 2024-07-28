import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './markdownEditorStyleProperties';

const PREFIX = '.comp.compMarkdownEditor';
export default function MarkdownEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const css =
		`
	${PREFIX} {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	${PREFIX} textarea {
		width: 100%;
		min-height: 100%;
		resize: none;
		padding: 10px;
		border: 1px solid #efefef;
		border-radius: 0px;
		border-left: 20px solid #efefef;
		overflow-y: hidden;
	}

		${PREFIX} ._buttonBar {
		padding: 5px;
		display: flex;
		gap: 5px;
		background-color: #ccc8;
		backdrop-filter: blur(10px);
		position: fixed;
		border-radius: 5px;
		padding-left: 15px;
		cursor: move;
		z-index: 4;
	}

	${PREFIX} ._button {
		padding: 6px;
		width: 32px;
		height: 32px;
		border-radius: 5px;
		cursor: pointer;
		background-color: #FFFFFF;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	${PREFIX} ._button:hover,
	${PREFIX} ._button.active {
		background-color: #f0f0f0;
	}

	${PREFIX} ._button svg {
		color: #000;
		width: 100%;
		heght: auto;
	}

	${PREFIX} ._popupBackground{
	    position: fixed;
		z-index: 4;
		background: #0005;
		width: 100vw;
		height: 100vh;
		backdrop-filter: blur(2px);
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	${PREFIX} ._popupContainer {
	    position: absolute;
		background: #ffff;
		padding: 10px 20px;
		border-radius: 5px;
		min-width: 50vw;
	}

	${PREFIX} ._markdown {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 20px;
	}

	${PREFIX} ._markdown._both {
		max-width: 100%;
	}

	${PREFIX} ._editorContainer {
		display: flex;
		flex-direction: row;
		width: 100%;
		justify-content: center;
		min-height: 100%;
		overflow: auto;
	}

	${PREFIX} ._resizer {
		width: 5px;
		height: 100%;
		background-color: #ccc4;
		backdrop-filter: blur(10px);
		opacity: 0;
		position: absolute;
		top: 0;
		cursor: ew-resize;
		transform: translateX(-50%);
	}

	${PREFIX} ._resizer:hover {
		opacity: 1;
	}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
