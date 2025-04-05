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
		
		${PREFIX} ._tabBar {
			width: 100%;
			height: 60px;
			display: flex;
			align-items: center;
			justify-content: left;
			margin-bottom: 10px;
			background-color: #F8FAFC;
			border-bottom: 1px solid #e1e4e8;
		}
	
		${PREFIX} ._tabBar ._tab {
			padding: 10px 20px;
			border-right: 1px solid #DFE8F0;
			cursor: pointer;
			align-items: center;
			gap: 8px;
		}	

		${PREFIX} ._tabBar ._tab._active {
			border-bottom: 3px solid #0366d6;
			color: #0366d6;
		}

		${PREFIX} ._tabBar._tab._active svg path {
			stroke: #0366d6;
		}
		
		${PREFIX} ._tabBar ._tab._content {
			padding: 16px;
			min-height: 200px;
			width: 100%;
		}
		
		${PREFIX} ._tabBar._tab._textarea {
			width: 100%;
			min-height: 200px;
			padding: 8px;
			border: 1px solid #e1e4e8;
			border-radius: 6px;
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			resize: vertical;
		}
		
		${PREFIX} ._tabBar._tab._docMode {
			min-height: 200px;
			border: 1px solid #e1e4e8;
			border-radius: 6px;
			padding: 8px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
