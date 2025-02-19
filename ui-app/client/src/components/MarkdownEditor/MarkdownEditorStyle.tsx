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
	
	${PREFIX} ._filterPanel {
		position: fixed;
		display: flex;
		gap: 5px;
		background-color: #ccc8;
		backdrop-filter: blur(10px);
		padding: 5px;
		border-radius: 5px;
		z-index: 5;
		cursor: move;
	  }
	  
	${PREFIX} ._componentPanel {
		position: absolute;
		left: -30px;
		opacity: 1;
		transition: opacity 0.3s;
		z-index: 5;
	}
	
	${PREFIX} ._editorContainer:hover ._componentPanel {
		opacity: 1;
	}
	
	${PREFIX} ._addButton {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #000;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		transition: transform 0.2s;
		
	}
	
	${PREFIX} ._addButton:hover {
		background: #e0e0e0;
		transform: scale(1.05);
		color: #333;
	}
	
	${PREFIX} ._componentPopup {
		position: absolute;
		left: 40px;
		top: -300px;
		width: 300px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		padding: 12px;
	}
	
	${PREFIX} ._searchContainer {
		margin-bottom: 12px;
	}
	
	${PREFIX} ._searchInput {
		width: 100%;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
	}
	
	${PREFIX} ._componentGrid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 12px;
	}
	
	${PREFIX} ._componentButton {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px;
		border: 1px solid #eee;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	${PREFIX} ._componentButton:hover {
		background-color: #f5f5f5;
	}
	
	${PREFIX} ._componentIcon {
		font-size: 20px;
		margin-bottom: 4px;
	}
	
	${PREFIX} ._componentName {
		font-size: 12px;
		text-align: center;
	}
	
	${PREFIX} ._footer {
		border-top: 1px solid #eee;
		padding-top: 12px;
	}
	
	${PREFIX} ._browseAll {
		width: 100%;
		padding: 8px;
		background: #f5f5f5;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}
	
	${PREFIX} ._componentButtons {
		display: flex;
		gap: 5px;
		background-color: #fff;
		padding: 5px;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	${PREFIX} ._filterPanel ._buttonGroup {
	  display: flex;
	  gap: 5px;
	}

	${PREFIX} ._filterPanel ._buttonSeperator {
	  width: 1px;
	  background-color: rgba(255, 255, 255, 0.3);
	  margin: 0 5px;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
