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
			height: 100%;
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
			background-color: #F8FAFC;
			border-top-left-radius: 2px;
			border-top-right-radius: 2px;
			padding: 10px 20px;
			z-index: 1;
			box-shadow: 0px 6px 2px 0px rgba(0, 0, 0, 0.00), 0px 4px 2px 0px rgba(0, 0, 0, 0.01), 0px 2px 1px 0px rgba(0, 0, 0, 0.03), 0px 1px 1px 0px rgba(0, 0, 0, 0.04), 0px 0px 1px 0px rgba(0, 0, 0, 0.05);
		}
	
		${PREFIX} ._tabBar ._tab {
			cursor: pointer;
			display: flex;
			gap: 8px;
			align-items: center;
			letter-spacing: 0.3px;
			font-weight: 500;
			border-bottom: 2px solid transparent;
			padding: 10px 0px;
		}

		${PREFIX} ._tabSeparator{
			height:80%;
			margin-left:13px;
			margin-right: 13px;
			border-right: 1px solid #DFE8F0;
		}

		${PREFIX} ._tabBar ._tab._write._active {
			border-bottom-color: #016a70;
		}

		${PREFIX} ._tabBar ._tab._doc._active {
			border-bottom-color: #FF3e3e;
		}

		${PREFIX} ._tabBar ._tab._preview._active {
			border-bottom-color: #3f4cc0;
		}

		${PREFIX} textarea {
			width: 100%;
			height: 100%;
			resize: none;
			outline: none;
			border-radius: 0px;
			border: 1px solid #DFE8F0;
			border-top: none;
			padding: 4px;
		}
		
		${PREFIX} ._markdown {
			width: 100%;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
