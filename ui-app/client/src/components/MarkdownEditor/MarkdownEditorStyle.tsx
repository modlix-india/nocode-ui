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
		display: flex;
		flex-direction: column;
		border: 1px solid #e1e4e8;
		border-radius: 6px;
		overflow: hidden;
    	position: relative;
		background-color: #fff;
	}

	${PREFIX} ._editorHeader {
		display: flex;
		flex-direction: row;
		border-bottom: 1px solid #e1e4e8;
		background-color: #f6f8fa;
	  }
  
	${PREFIX} ._tabContainer {
		display: flex;
		border-bottom: 1px solid #e1e4e8;
		width: 10vw;
		min-width: 100px;
	  }
  
	${PREFIX} ._tab {
	  	height: 60px;
		padding: 8px 8px;
		border: none;
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: #57606a;
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	  }

	${PREFIX}._tabspace{
		width: 40px;
		height: 60px;
		background-color: none;
		}


	${PREFIX} ._tabSeperator {
		transform: translateY(5px);
		width: 2px;
		height: 50px;
		background-color: #DFE8F0;
		margin: 0 4px;
		justify-items: center;
		align-items: center;
		top: 6px;
	}

	${PREFIX} ._tabSeperator1 {
		transform: translateY(5px);
		width: 2px;
		height: 50px;
		background-color:none;
		margin: 0 4px;
		justify-items: center;
		align-items: center;
		top: 6px;
	}
  
	${PREFIX} ._tab svg {
		width: 16px;
		height: 16px;
	  }
  
	${PREFIX} ._tab._active {
		color: #24292f;
		font-weight: 800;
		margin-bottom: 1px;
	  }
  
	${PREFIX} ._tab._active._write-tab {

	  	color:#016A70;
		border-bottom: 3px solid #016A70;	
	  }
	  
	${PREFIX} ._tab._active._doc-tab {
	  	color: #FF3E3E;
		border-bottom: 3px solid #FF3E3E;
	  }
	  
	${PREFIX} ._tab._active._preview-tab {
	  	color: #3F4CC0;
		border-bottom: 3px solid #3F4CC0;
	  }
	  
	${PREFIX} ._tab:hover:not(._active) {
		color: #24292f;
		background-color: rgba(0, 0, 0, 0.05);
	  }
  
	${PREFIX} ._toolbarContainer {
		display: flex;
		flex-direction: row;
		margin-left: auto;
		padding: 8px 12px;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		border-bottom: 1px solid #e1e4e8;
	  }
  
	${PREFIX} ._toolbarContainer:last-child {
		border-bottom: 1px solid #e1e4e8;
	  }

	${PREFIX} ._filterPanel {
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: #ffffff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		padding: 8px;
		gap: 4px;
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
	  
	${PREFIX} ._formatbutton:hover {
		background-color: #f0f0f0;
	  }

	${PREFIX}._formatbutton._active {
		#e0e0e0;
	  }
  
	${PREFIX} ._formatButton._active {
		background-color: #EFF1F3;
		color: white;
		border-color: #EFF1F3;
	  }
  
	${PREFIX} ._buttonSeperator {
		width: 1px;
		height: 24px;
		background-color: #e1e4e8;
		margin: 0 4px;
	  }
  
	
	// ${PREFIX} ._formatButtonGroup ._formatButton:first-child {
	// 	border-top-left-radius: 4px;
	// 	border-bottom-left-radius: 4px;
	//   }
  
	// ${PREFIX} ._formatButtonGroup ._formatButton:last-child {
	// 	border-top-right-radius: 4px;
	// 	border-bottom-right-radius: 4px;
	// 	border-right: 1px solid #d0d7de;
	//   }
  
	// ${PREFIX} ._formatButton:not(._formatButtonGroup ._formatButton) {
	// 	border-radius: 4px;
	// }

	// ${PREFIX} ._filterPanel ._buttonSeperator {
	// 	width: 1px;
	// 	color: #ccc;
	// 	background-color: #fff;
	// 	margin: 0 5px;
	//   }

	${PREFIX} ._actionButtons {
		background-color: none;
		display: flex;
		margin-left: auto;
		gap: 8px;
	  }
  
	${PREFIX} ._actionButton {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background-color: white;
		color:rgb(174, 186, 201);
		cursor: pointer;
	  }
  
	  ${PREFIX} ._actionButton:hover {
		background-color: #f6f8fa;
	  }
  
	  ${PREFIX} ._exportDropdown {
		position: relative;
	  }
  
	  ${PREFIX} ._exportOptions {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		background: white;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		z-index: 100;
		min-width: 180px;
	  }
  
	  ${PREFIX} ._exportOptions button {
		display: block;
		width: 100%;
		text-align: left;
		padding: 8px 12px;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 14px;
		color: #24292f;
	  }
  
	${PREFIX} ._exportOptions button:hover {
		background-color: #f6f8fa;
	  }

	${PREFIX} ._filtertoolbar{
		display: flex;
		flex-direction: row;
	}


	${PREFIX} ._filterToolbar ._buttonGroup {
		display: flex;
		flex-direction: row;
		gap: 5px;
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
		height: 100%;
		min-height: 30vh;
		height: auto;
		resize: none;
		padding: 16px;
		border: 1px solid #efefef;
		border-radius: 0px;
		border-left: 20px solid #efefef;
		overflow-y: auto;
	}

	${PREFIX}._both ._wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
		min-height: 30vh;
		height: auto;
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
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1100;
	}

	${PREFIX} ._popupContainer {
	    position: absolute;
		background: #ffff;
		padding: 10px 20px;
		border-radius: 5px;
		min-width: 50vw;
		max-width:80vw;
		max-height: 50vh;
		overflow: auto;
	}

	${PREFIX} ._markdown {
		max-width: 100vw;
		width: 80%;
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 20px;
		overflow: auto;
	}

	${PREFIX} ._editorContainer {
		display: flex;
		flex: 1;
		position: relative;
		min-height: 30vh;
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
	  
	${PREFIX} ._componentPanel {
		position: absolute;
		opacity: 1;
		transition: opacity 0.3s;
		z-index: 1;
		display: flex; 
		flex-direction: row;
		align-items: center;
	}
	
	
	${PREFIX} ._addButton {
		margin-left:auto;
		padding: 2px;
		opacity: 1;
		z-index: 1;
		display: flex;
		flex-direction: row;
		width: 2vw;
		height: 2vw;
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

	${PREFIX} ._closeaddButton {
		position: relative;
		bottom: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #e0e0e0;
		color: #333;
		cursor: pointer;
		display: flex;
		align-items: center;  
		justify-content: center; 
		font-size: 18px;
		transition: transform 0.2s;
		margin-left: auto; 
	}
	
	${PREFIX} ._addButton:hover {
		background: #e0e0e0;
		transform: scale(1.05);
		color: #333;
	}
	
	${PREFIX} ._componentPopup {
		position: absolute;
 		top: 100%;
		left: 0;
		width: 325px;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
		min-width: 200px;
		max-height: 400px;
		padding: 12px;
		z-index: 10000;
		background-color: #fff;
	}

	
	${PREFIX} ._searchContainer {
		width: 100%;
		align-items: center;
	}
	
	${PREFIX} ._searchInput {
		display: flex;
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
		max-height: 300px;
		overflow-y: auto;
		padding: 8px;
	}
	
	${PREFIX} ._componentButton {
		display: flex;
		flex-direction: column;
		width: 80px;
		hieght: 70px;
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
		overflow-y: scroll;
	}
	
	// ${PREFIX} ._componentButtons {
	// 	display: flex;
	// 	gap: 5px;
	// 	background-color: #fff;
	// 	padding: 5px;
	// 	border-radius: 5px;
	// 	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	// }

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
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	${PREFIX} ._closeButton {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	${PREFIX} ._closeButton:hover {
		background-color: #ff0000;
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
	background-color: #f5f5f5;
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

	${PREFIX} ._addButton:disabled {
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 8px 0;
		margin-top: 4px;
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
		padding: 8px 12px;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 14px;
		color: #333;
		transition: background-color 0.2s;
		}

	${PREFIX} ._dropdownItem:hover {
		background-color: #f5f5f5;
		border-radius: 40px;

		}

	${PREFIX} ._dropdownItem span:last-child {
		margin-left: 4px;
		}
	
	${PREFIX} ._button._active {
		background-color: #f3f4f6;
		border-color: #d0d7de;
	}


	${PREFIX} ._buttonBar {
		padding: 5px;
		display: flex;
		gap: 5px;
		background-color: #f5f5f5;
		border-bottom: 1px solid #ddd;
		position: sticky;
		top: 0;
		z-index: 5;
	}

	${PREFIX} ._actionButton {
	padding: 6px;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		background-color: transparent;
		border: 1px solid #d0d7de;
		color: #57606a;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	${PREFIX} ._actionButton:hover {
		background-color: #f3f4f6;
		color: #24292f;
	}

	${PREFIX} ._exportDropdown {
		position: relative;
		display: inline-block;
	}

	${PREFIX} ._exportOptions {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		background-color: #ffffff;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
		min-width: 160px;
		z-index: 100;
		padding: 4px 0;
	}

	${PREFIX} ._exportOptions ._button {
		width: 100%;
		text-align: left;
		padding: 6px 16px;
		border: none;
		background: none;
		font-size: 14px;
		color: #24292f;
		cursor: pointer;
		display: block;
		white-space: nowrap;
	}

	${PREFIX} ._exportOptions button:hover {
		background-color: #f3f4f6;
	}

	${PREFIX} ._settingsDropdown {
		position: relative;
		display: inline-block;
	}
  
  ${PREFIX} ._settingsButton {
	padding: 6px;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	cursor: pointer;
	background-color: transparent;
	border: 1px solid #d0d7de;
	color: #57606a;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
  }
  
  ${PREFIX} ._settingsButton:hover {
	background-color: #f3f4f6;
	color: #24292f;
  }
  
  ${PREFIX} ._exportOptions {
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 4px;
	background-color: #ffffff;
	border: 1px solid #d0d7de;
	border-radius: 6px;
	box-shadow: 0 8px 24px rgba(140,149,159,0.2);
	min-width: 160px;
	z-index: 100;
	padding: 4px 0;
  }
  
  ${PREFIX} ._exportOptions button {
	width: 100%;
	text-align: left;
	padding: 6px 16px;
	border: none;
	background: none;
	font-size: 14px;
	color: #24292f;
	cursor: pointer;
	display: block;
	white-space: nowrap;
  }
  
  ${PREFIX} ._exportOptions button:hover {
	background-color: #f3f4f6;
  }

  ${PREFIX} ._editBoxContainer {
	position: relative;
	margin: 8px 0;
	}

  ${PREFIX} ._editBox {
	width: 100%;
	position: relative;
	margin: 8px 0;
	border: 1px solid transparent;
	border-radius: 4px;
	transition: all 0.2s ease;
}

${PREFIX} ._editBox:hover {
	border-color: #d0d7de;
}

${PREFIX} ._editBox._editing {
	border-color:rgb(223, 211, 211);
	box-shadow: 0 0 0 3px rgba(208, 221, 235, 0.1);
}

${PREFIX} ._editBoxDisplay {
	width: 100%;
	position: relative;
	padding: 8px;
}

${PREFIX} ._editBoxControls {
	position: absolute;
	justify-content: center;
	align-items: center;
	gap: 4px;
	top: 4px;
	right: 4px;
	display: none;
}

${PREFIX} ._editBox:hover ._editBoxControls {
	display: flex;
}

${PREFIX} ._editButton {
	background: #f6f8fa;
	border: 1px solid #d0d7de;
	border-radius: 4px;
	padding: 4px 8px;
	cursor: pointer;
	font-size: 12px;
}

${PREFIX} ._editButton:hover {
	background: #0969da;
	color: white;
	border-color: #0969da;
}

${PREFIX} ._editBoxContent {
	padding: 8px;
	min-height: 24px;
	outline: none;
	white-space: pre-wrap;
}

${PREFIX} ._addComponentButtonContainer {
	position: relative;
	height: 0;
	display: flex;
	justify-content: center;
	z-index: 10;
	opacity: 0;
	transition: opacity 0.2s ease;
}

${PREFIX} ._editBoxContainer:hover ._addComponentButtonContainer {
	opacity: 1;
}

${PREFIX} ._addComponentButton {
	position: absolute;
	top: -12px;
	background: #f6f8fa;
	border: 1px solid #d0d7de;
	border-radius: 50%;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-size: 12px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

${PREFIX} ._addComponentButton:hover {
	background: #0969da;
	color: white;
	border-color: #0969da;
}


${PREFIX} ._markdown._editable {
	width: 100%;
	padding: 16px;
}

${PREFIX} ._exportOptions button:hover {
    background: #f5f5f5;
}

${PREFIX} ._documentModeContainer {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding: 16px;
}

${PREFIX} ._addComponentButton {
	display: flex;
	justify-content: center;
	margin: 16px 0;
}

${PREFIX} ._addComponentButton button {
	background: #f6f8fa;
	border: 1px solid #d0d7de;
	border-radius: 6px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s ease;
}

${PREFIX} ._addComponentButton button:hover {
	background: #0969da;
	color: white;
	border-color: #0969da;
}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
