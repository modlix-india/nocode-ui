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

		${PREFIX} ._filterPanel {
			display: flex;
			flex-direction: row;
			align-items: center;
			background-color: #ffffff;
			border-radius: 6px;
			box-shadow: 0px 20px 6px 0px rgba(0, 0, 0, 0.00), 0px 13px 5px 0px rgba(0, 0, 0, 0.01), 0px 7px 4px 0px rgba(0, 0, 0, 0.03), 0px 3px 3px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
			padding: 0px 8px;
			gap: 4px;
			height: 40px;
			border: 1px solid rgba(0, 0, 0, 0.10);
		}

		${PREFIX} ._tabBar ._filterPanel {
			position: absolute;
			right: 20px;
		}
	
		${PREFIX} ._formatButtonGroup {
			display: flex;
			flex-direction: row;
			gap: 4px;
		}
	  
		${PREFIX} ._formatbutton {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 4px;
			border: none;
			background-color: transparent;
			cursor: pointer;
			transition: background-color 0.2s;
		  }
		  
		
	
		${PREFIX} ._formatbutton._active {
			background-color: #EFF1F3;
			color: white;
			border-color: #EFF1F3;
		  }
	  
		  ${PREFIX} ._formatbutton:hover {
			background-color: #f0f0f0;
		  }
			
		${PREFIX} ._buttonSeperator {
			width: 1px;
			height: 100%;
			background-color: #e1e4e8;
			margin: 0 4px;
		  }

		  
	${PREFIX} ._popupBackground {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    ${PREFIX} ._linkDialog {
        background-color: #ffffff;
		border-radius: 8px;
		padding: 20px;
		width: 400px;
		max-width: 90vw;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

	${PREFIX} ._linkDialog h3 {
		margin-top: 0;
		margin-bottom: 16px;
		font-size: 18px;
		color: #333;
		}

    ${PREFIX}._linkInputContainer {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }
    ${PREFIX} ._linkInput {
        width: 100%;
		padding: 10px 12px;
		margin-bottom: 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
    }

	${PREFIX} ._linkInput:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
		}


	${PREFIX} ._linkDialogButtons {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 16px;
	}

	${PREFIX} ._linkDialogButtons button {
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;
	border: 1px solid #ddd;
	background-color: #f5f5f5;
	}

	${PREFIX} ._primaryButton {
	background-color: #4a90e2 !important;
	color: white !important;
	border-color: #4a90e2 !important;
	}

	${PREFIX} ._floatingToolbar {
	position: absolute;
	z-index: 1000;
	}

	${PREFIX} ._linkDialogHeader {
		display: flex;
		flex: 1;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	${PREFIX} ._closeButton {
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	${PREFIX} ._closeButton:hover {
		background-color: #F32013;
		border-color: rgb(33, 6, 6);;
		color: white;
	}

	${PREFIX} ._linkDialogContent {
		margin-bottom: 16px;
	}

	${PREFIX} ._inputGroup {
		display: flex;
		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items:center;
		margin-bottom: 12px;
	}

	${PREFIX} ._inputGroup label {
		display: flex;
		margin-bottom: 6px;
		padding: 6px;
		margin: 12px;
		font-size: 14px;
		color: #555;
	}

	${PREFIX} ._linkDialogFooter {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	}

	${PREFIX} ._cancelButton {
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;
	border: 1px solid #ddd;
	background-color: #ff0000;
	}

	${PREFIX} ._addLinkButton {
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		border: 1px solid #ddd;
		background-color: #4a90e2;
	}

	${PREFIX} ._addButton {
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;
	background-color: #4a90e2;
	color: white;
	border: 1px solid #4a90e2;
	}

	${PREFIX} ._addLinkButton:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	}

	${PREFIX} ._dropdownContainer {
        position: relative;
        display: inline-block;
    }

    ${PREFIX} ._dropdown {
    	position: absolute;
		top: 100%;
		left: 0;
		z-index: 1000;
		min-width: 180px;
		background-color: #ffffff;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 0px 7px 6px -5px rgba(0,0,0,0.15);
		padding: 8px 8px;
		margin-top: 4px;
		border-top-left-radius: 0px;
		border-top-right-radius: 0px;
		z-index: 1;
		max-width: 40vw;

		&:has(~ ._dropdownContainer:last-child) {
			right: 0;
			left: auto;
		}
		/* Adjust position for dropdowns that would overflow */
		@media (max-width: 768px) {
			right: 0;
			left: auto;
		}
		}

    ${PREFIX} ._dropdownItem {
        display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 14px;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 12px;
		color: rgba(0, 0, 0, 0.50);
		border-radius: 40px;
		transition: background-color 0.2s;
		font-weight: 500;
		}

	 ${PREFIX} ._dropdown._right {
	 	left: auto;
		right: 0;
	 }

	${PREFIX} ._dropdownItem:hover {
		background-color: #f5f5f5;
	color: #333;	
		}

		${PREFIX} ._dropdownItem svg path,
		${PREFIX} ._dropdownItem svg rect {
		stroke-opacity: 0.3;
		fill-opacity: 0.3;
		}

	${PREFIX} ._dropdownItem:hover svg path,
	${PREFIX} ._dropdownItem:hover svg rect {
		stroke-opacity: 1;
		fill-opacity: 1;
	}

	${PREFIX} ._dropdownItem span:last-child {
		margin-left: 4px;
		}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
