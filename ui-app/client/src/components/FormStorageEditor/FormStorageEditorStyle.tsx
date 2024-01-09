import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './formStorageEditorStyleProperties';

const PREFIX = '.comp.compFormStorageEditor';
export default function FormStorageEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const css =
		`
        ${PREFIX} {
            display: flex;
			width: 100%;
			height: 100%;
			overflow: hidden;
			position: relative;
            flex-direction: column;
            border-radius: 4px;
            background: #FFF;
            box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.10);
		}

        ${PREFIX} ._main {
            flex: 1;
            display: flex;
            flex-direction: row;
            overflow: auto;
        }

        ${PREFIX} ._main > div {
            flex: 1;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: start;
        }

        ${PREFIX} ._compSection {
            border-radius: 4px 0px 0px 4px;
            border-right: 2px solid rgba(0, 0, 0, 0.05);
            border-bottom: 2px solid rgba(0, 0, 0, 0.05);
            background: #FFF;
        }
        
        ${PREFIX} ._editorSection {
            border-right: 2px solid rgba(0, 0, 0, 0.05);
            border-bottom: 2px solid rgba(0, 0, 0, 0.05);
            background: #FFF;
        }
        
        ${PREFIX} ._previewSection {
            border-radius: 0px 4px 4px 0px;
            border-bottom: 2px solid rgba(0, 0, 0, 0.05);
            background: #FFF;
        }

        ${PREFIX} ._section_header {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 8px;
            border-radius: 2px;
            gap: 8px;
        }

        ${PREFIX} ._compSection ._section_header {
            border-bottom: 2px solid rgba(66, 126, 228, 0.20);
            background: rgba(66, 126, 228, 0.05);
        }
        
        ${PREFIX} ._editorSection ._section_header {
            border-bottom: 2px solid rgba(28, 186, 121, 0.20);
            background: rgba(28, 186, 121, 0.05);
        }
        
        ${PREFIX} ._previewSection ._section_header {
            border-bottom: 2px solid rgba(255, 97, 77, 0.20);
            background: rgba(255, 97, 77, 0.05);
        }
        ${PREFIX} ._section_header > span {
            font-family: Inter;
            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            line-height: 16px;
        }
        ${PREFIX} ._compSection ._section_header > span {
            color: #427EE4;
        }
        
        ${PREFIX} ._editorSection ._section_header > span {
            color: #1CBA79;
        }
        
        ${PREFIX} ._previewSection ._section_header > span {
            color: #FF614D;
        }

        ${PREFIX} ._section_header > p {
            margin: 0;
            color: rgba(0, 0, 0, 0.40);
            font-family: Inter;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 12px;
            text-align: center;
        }

        ${PREFIX} ._comp {
            padding: 20px 10px;
            display: flex;
            flex-direction: column;
            gap: 50px;
            overflow: auto;
        }

        ${PREFIX} ._comp ._type_based, 
        ${PREFIX} ._comp ._option_based {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        ${PREFIX} ._comp ._heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
          
        }
        
        ${PREFIX} ._comp ._heading svg {
            cursor: pointer;
        }
        ${PREFIX} ._comp ._heading span {
            cursor: pointer;
            color: rgba(0, 0, 0, 0.80);
            font-family: Inter;
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: 16px; /* 100% */
        }

        ${PREFIX} ._comp ._container {
            display: flex;
            justify-content: start;
            flex-wrap: wrap;
            gap: 10px;
        }

        ${PREFIX} ._comp ._item {
            width: 128px;
            height: 38px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding-left: 10px; 
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            cursor: pointer;
        }
        ${PREFIX} ._comp ._item span {
            color: rgba(0, 0, 0, 0.80);
            font-family: Inter;
            font-size: 12px;
            font-style: normal;
            font-weight: 600;
            line-height: 12px; /* 100% */
        }

        ${PREFIX} ._editor {
            flex: 1;
            padding: 20px 10px;
            overflow: auto;
        }

        ${PREFIX} ._editor ._accordion {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        ${PREFIX} ._editor ._accordion_panel {
            display: flex;
            flex-direction: column;
            border-radius: 2px;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        ${PREFIX} ._accordion_panel ._header {
            width: 100%;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0px 20px;
            border-radius: 2px 2px 0px 0px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            background: rgba(0, 0, 0, 0.02);
        }

        ${PREFIX} ._accordion_panel ._header ._left {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        ${PREFIX} ._accordion_panel ._header ._left span {
            color: rgba(0, 0, 0, 0.80);
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 14px;
        }

        ${PREFIX} ._accordion_panel ._header ._right {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        ${PREFIX} ._accordion_panel ._header svg {
            cursor: pointer;
        }

        ${PREFIX} ._accordion_panel ._content {
            display: none;
            padding: 0px;
            flex-direction: column;
            gap: 24px;
            padding-bottom: 10px;
        }

        ${PREFIX} ._accordion_panel ._content._show {
            display: flex;
            padding: 20px;
        }

        ${PREFIX} ._content ._item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        ${PREFIX} ._content ._item span {
            color: rgba(0, 0, 0, 0.40);
            font-family: Inter;
            font-size: 12px;
            font-style: normal;
            font-weight: 500;
            line-height: 12px;
            margin-left: 16px;
        }

        ${PREFIX} ._content ._item input {
            height: 44px;
            padding-left: 16px;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.10);
            background: #FFF;
            outline: none;
            color: rgba(0, 0, 0, 0.80);
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 14px;
        }

        ${PREFIX} ._content ._lengthValidationGrid {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        
        ${PREFIX} ._content ._inputContainer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 40px;
        }
        ${PREFIX} ._content ._inputContainer input {
            width: 100px;
            flex: 1;
        }
        
        ${PREFIX} ._content ._checkBoxValidationsGrid {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }

        ${PREFIX} ._content ._checkBoxItem {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        ${PREFIX} ._content ._checkBoxItem span {
            color: rgba(0, 0, 0, 0.80);
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 14px;
        }

        ${PREFIX} ._content ._optionList {
            display: flex;
            flex-direction:column;
            gap: 24px;s
        }

        ${PREFIX} ._content ._optionContainer {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        ${PREFIX} ._content ._optionContainer input {
            flex: 1;
        }

        ${PREFIX} ._content ._optionContainer svg {
            cursor: pointer;
        }

        ${PREFIX} ._content ._addMore {
            background: none;
            border: none;
            width: fit-content;

            cursor: pointer;
            color: #4C7FEE;
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 14px; 

        }

        ${PREFIX} ._dropdownSelect {
            flex: 1;
            min-height: 44px;
            min-width: 35px;
            cursor: pointer;
            padding: 5px 15px;
            border-radius: 6px;
            background-color: #FFFFFF;
            border: 1px solid rgba(0, 0, 0, 0.10);
            outline: none;

			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;

            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 14px;
		}

        ${PREFIX} ._dropdownSelect svg {
			min-width: 8px;
		}

        ${PREFIX} ._dropdownSelect ._selectedOption {
			min-width: calc(100% - 8px);
            color: rgba(0, 0, 0, 0.80);
		}

        ${PREFIX} ._dropdownSelect ._selectedOption._placeholder {
			text-transform: capitalize;
            color: rgba(0, 0, 0, 0.40);
		}

        ${PREFIX} ._dropdownSelect ._dropdownBody{
			position: fixed;
			min-width: 100%;
			background-color: #FFF;
			border: 1px solid rgba(0, 0, 0, 0.10);
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			margin-top: 4px;
            z-index: 2;

			max-height: 250px;
			overflow: auto;
		}

        ${PREFIX} ._dropdownSelect ._dropdownBody ._dropdownOption {
			padding: 10px;
			color: rgba(0, 0, 0, 0.40); 
			border-radius: 4px;
			white-space: nowrap;
		}

        ${PREFIX} ._dropdownSelect ._dropdownBody ._dropdownOption._hovered {
			background-color: #F8FAFB;
			border-radius: 4px;
			font-weight: bold;
			color: #0085F2;
		}

        ${PREFIX} ._dropdownSelect ._dropdownBody ._dropdownOption._selected {
			color: #0085F2;
		}

        ${PREFIX} ._preview {
            flex: 1;
            padding: 20px 10px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow: auto;
        }

        ${PREFIX} ._footer {
            display: flex;
            justify-content: flex-end;
            padding: 20px 30px;
            gap: 24px;
        }

        ${PREFIX} ._footer ._cancel {
            background: none;
            border: none;
            cursor: pointer;

            color: rgba(0, 0, 0, 0.40);
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            line-height: 14px; 
        }

        ${PREFIX} ._footer ._save {
            width: 127px;
            height: 36px;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            background: #0085F2;
            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.10);

            color: #FFF;
            font-family: Inter;
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            line-height: 14px;
        }
        
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StorageEditorCss">{css}</style>;
}
