import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './markdownEditorStyleProperties';

const PREFIX = '.comp.compMarkdownEditor';
export default function MarkdownEditorStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
	const css =
		`
	${PREFIX} {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	${PREFIX}._both _editorContainer {
		max-height: 100%;
	}

	${PREFIX}._both textarea {
		overflow-y: auto;
 	}

	${PREFIX}._both ._wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
		height: 100px;
		max-height: 100%;
	}

	 ${PREFIX} ._markdown._both {
		max-width: 100%;
		max-height: 100%;
		width: 100%;
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
		max-width: 1020px;
		width: 80%;
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 20px;
		overflow: auto;
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
	
	${PREFIX} ._html-preview {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 20px;
}

${PREFIX} ._html-preview img {
    max-width: 100%;
    height: auto;
}

${PREFIX} ._html-content {
    width: 100%;
    padding: 20px;
}

	${PREFIX} ._resizer:hover {
		opacity: 1;
	}
	
	${PREFIX} ._richTextButtonBar {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

${PREFIX} ._richTextButtonBar ._buttonGroup {
    display: flex;
    gap: 5px;
    border-right: 1px solid #ddd;
    padding-right: 10px;
}

${PREFIX} ._richTextButtonBar ._buttonGroup:last-child {
    border-right: none;
}

${PREFIX} ._richTextButtonBar button {
    padding: 5px 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

${PREFIX} ._richTextButtonBar button:hover {
    background: #f0f0f0;
}

${PREFIX} ._richTextButtonBar ._headingBtn {
    font-family: 'Times New Roman', serif;
    font-weight: bold;
    width: 32px;
}

${PREFIX} ._popupContainer input {
    margin: 5px 0;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
}

${PREFIX} ._popupContainer label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

${PREFIX} ._popupContainer button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
}

${PREFIX} ._popupContainer button:hover {
    background: #0056b3;
}

${PREFIX} ._richTextButtonBar {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

${PREFIX} ._richTextButtonBar ._buttonGroup {
    display: flex;
    gap: 5px;
    border-right: 1px solid #ddd;
    padding-right: 10px;
}

${PREFIX} ._richTextButtonBar ._buttonGroup:last-child {
    border-right: none;
}

${PREFIX} ._richTextButtonBar button {
    padding: 5px 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

${PREFIX} ._richTextButtonBar button:hover {
    background: #f0f0f0;
}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
