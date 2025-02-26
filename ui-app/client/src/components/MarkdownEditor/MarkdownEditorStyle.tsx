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
		border: 1px solid #d0d7de;
		border-radius: 6px;
		overflow: hidden;
		
	}

	${PREFIX} ._headingDropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		background-color: #ffffff;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		box-shadow: 0 8px 24px rgba(140,149,159,0.2);
		min-width: 60px;
		z-index: 100;
		padding: 4px 0;
	}

	${PREFIX} ._editorHeader {
		display: flex;
		flex-direction: row;
		border-bottom: 1px solid #d0d7de;
		background-color: #f6f8fa;
	  }
  
	  ${PREFIX} ._tabContainer {
		display: flex;
		padding: 8px 8px 0;
		border-bottom: 1px solid #d0d7de;
	  }
  
	  ${PREFIX} ._tab {
	  	height: 48px;
		padding: 8px 16px;
		gap: 4px;
		border: none;
		background: none;
		border-radius: 6px 6px 0 0;
		font-size: 14px;
		font-weight: 500;
		color: #24292f;
		cursor: pointer;
		border: 1px solid transparent;
	  }
  
	  ${PREFIX} ._tab._active {
		background-color: #ffffff;
		border: 1px solid #d0d7de;
		border-bottom-color: #ffffff;
	  }

	   ${PREFIX} ._tab._preview {
		background-color: #ffffff;
		border: 1px solid #d0d7de;
		border-bottom-color: #ffffff;
	  }
  
	${PREFIX} ._toolbarContainer {
		display: flex;
		align-items: center;
		margin-left: auto; 
	}  

	${PREFIX} ._filterToolbar ._buttonGroup {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}
  
	  ${PREFIX} ._filterPanel ._buttonSeperator {
		width: 1px;
		background-color: rgba(255, 255, 255, 0.3);
		margin: 0 5px;
	  }

	${PREFIX}._both _editorContainer {
		max-height: 100%;
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
		min-height: 30vh;
		height: auto;
		resize: none;
		padding: 10px;
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
		max-width:80vw;
		max-height: 50vh;
		overflow: auto;
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
		min-height: 30vh;
		height: auto;
		overflow: visible;
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
		align-items: center;
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

	${PREFIX} ._filtertoolbar{
		display: flex;
		flex-direction: row;
	}
	  
	${PREFIX} ._componentPanel {
		position: absolute;
		opacity: 1;
		transition: opacity 0.3s;
		z-index: 1;
		display: flex; 
		align-items: center;
	}
	
	
	${PREFIX} ._addButton {
		padding: 5px;
		opacity: 1;
		z-index: 1;
		display: flex;
		fkex-direction: row;
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
		top: 0px;
		width: 300px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		padding: 12px;
		z-index: 100;
	}

	
	${PREFIX} ._searchContainer {
		margin-bottom: 12px;
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
		overflow-y: scroll;
	}
	
	${PREFIX} ._componentButtons {
		display: flex;
		gap: 5px;
		background-color: #fff;
		padding: 5px;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        gap: 10px;
		min-width: 400px;
        max-width: 90vw;
    }

    ${PREFIX} ._linkInput {
        padding: 12px;
		margin: 0 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
    }

    ${PREFIX} ._dialogButtons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 8px;
		padding: 0 10px;
		flex-direction: row;
    }

	${PREFIX} ._dialogButtons ._button {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        min-width: 80px;
		width: fit-content;
        height: 36px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    ${PREFIX} ._dialogButtons ._addButton {
		display: inline-block;
        background-color: #2196F3;
        color: white;
        border: none;
    }

    ${PREFIX} ._dialogButtons ._addButton:hover {
        background-color: #1976D2;
    }

    ${PREFIX} ._dialogButtons ._cancelButton {
        display:  inline-block;
        background-color: #DC3545;
        color: white;
        border: none;
    }

    ${PREFIX} ._dialogButtons ._cancelButton:hover {
        background-color: #C82333;
    }

	${PREFIX} ._dropdownContainer {
        position: relative;
        display: inline-block;
    }

    ${PREFIX} ._dropdown {
    	position: absolute;
		top: 100%;
		left: 0;
		margin-top: 4px;
		background-color: #ffffff;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		box-shadow: 0 8px 24px rgba(140,149,159,0.2);
		min-width: 120px;
    }

    ${PREFIX} ._dropdownItem {
        width: 100%;
		text-align: left;
		padding: 6px 12px;
		border: none;
		background: none;
		font-size: 14px;
		color: #24292f;
		cursor: pointer;
		display: block;
		white-space: nowrap;
    }

	${PREFIX} ._dropdownItem:hover {
		background-color: #f3f4f6;
	}
	
	${PREFIX} ._button._active {
		background-color: #f3f4f6;
		border-color: #d0d7de;
	}
		
	${PREFIX} ._actionButtons {
		display: flex;
		gap: 4px;
		margin-left: 4px;
		margin-right: 4px;
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
    box-shadow: 0 8px 24px rgba(140,149,159,0.2);
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

${PREFIX} ._exportOptions button:hover {
    background: #f5f5f5;
}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
