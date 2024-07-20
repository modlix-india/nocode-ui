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
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	${PREFIX} textarea {
		width: 100%;
		min-height: 100%;
		border: none;
		resize: none;
		padding: 5px;
		outline: none;
	}

	${PREFIX} ._markdown {
		max-width: 1020px;
		width: 80vw;
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow-y: auto;
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
	}

	${PREFIX} ._code {
		padding: 20px;
		font-family: monospace;
		background-color: #FFFFFF55;
		border-radius: 10px;
		white-space: pre-wrap;
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

	${PREFIX} ._hr {
		width: 100%;
		height: 2px;
		background-color: #000;
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
