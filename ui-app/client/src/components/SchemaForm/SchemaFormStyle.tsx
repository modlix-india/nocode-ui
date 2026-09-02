import { StyleResolution } from '../../types/common';
import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaFormStyleProperies';

const PREFIX = '.comp.compSchemaForm';
export default function SchemaFormStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; gap: 8px;}
		${PREFIX} ._singleSchema { display: flex; flex-direction: column; gap: 6px;}

		${PREFIX} ._singleSchema input[type="text"],
		${PREFIX} ._singleSchema input[type="number"],
		${PREFIX} ._singleSchema select {
			color: #1F2937;
			border-radius: 6px;
			font-size: 13px;
			font-family: inherit;
			border: 1px solid ${t('borderColorNine', '#E5E7EB')};
			background-color: ${t('surfaceColorOne', '#F9FAFB')};
			width: 100%;
			padding: 8px 10px;
			transition: border-color 0.2s ease, background-color 0.2s ease;
		}

		${PREFIX} ._singleSchema input:focus,
		${PREFIX} ._singleSchema select:focus {
			border-color: ${t('colorFive', '#3B82F6')};
			background-color: ${t('colorSeven', '#fff')};
			outline: none;
		}

		${PREFIX} ._singleSchema ._errorMessages {
			color: ${t('colorFour', '#DC2626')};
			background-color: ${t('errorWashColor', '#FEF2F2')};
			border-left: 3px solid ${t('colorFour', '#DC2626')};
			padding: 6px 10px;
			border-radius: 0 6px 6px 0;
			font-size: 12px;
			line-height: 1.4;
		}

		${PREFIX} ._singleSchema ._inputElement {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		${PREFIX} ._singleSchema ._inputElement i.fa {
			color: ${t('fontColorTen', '#9CA3AF')};
			cursor: pointer;
			padding: 4px;
			border-radius: 4px;
			transition: color 0.15s ease, background-color 0.15s ease;
		}

		${PREFIX} ._singleSchema ._inputElement i.fa:hover {
			color: ${t('colorFour', '#DC2626')};
			background-color: ${t('errorWashColor', '#FEF2F2')};
		}

		${PREFIX} ._fieldLabel {
			font-size: 12px;
			font-weight: 500;
			color: ${t('fontColorTwo', '#374151')};
			margin-bottom: 4px;
		}

		${PREFIX} ._objectSchema {
			border: 1px solid ${t('borderColorNine', '#E5E7EB')};
			border-radius: 6px;
			overflow: hidden;
		}

		${PREFIX} ._objectHeader {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 12px;
			background: linear-gradient(180deg, ${t('surfaceColorOne', '#FAFAFA')} 0%, ${t('surfaceColorTwo', '#F3F4F6')} 100%);
			cursor: pointer;
			font-weight: 500;
			font-size: 13px;
			color: ${t('fontColorTwo', '#374151')};
		}

		${PREFIX} ._objectHeader i.fa {
			font-size: 10px;
			color: ${t('fontColorThree', '#6B7280')};
			transition: transform 0.2s ease;
		}

		${PREFIX} ._objectProperties {
			padding: 12px;
			display: flex;
			flex-direction: column;
			gap: 12px;
			border-top: 1px solid ${t('borderColorNine', '#E5E7EB')};
		}

		${PREFIX} ._objectField {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		${PREFIX} ._arraySchema {
			border: 1px solid ${t('borderColorNine', '#E5E7EB')};
			border-radius: 6px;
		}

		${PREFIX} ._arrayHeader {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
			background: linear-gradient(180deg, ${t('surfaceColorOne', '#FAFAFA')} 0%, ${t('surfaceColorTwo', '#F3F4F6')} 100%);
			border-bottom: 1px solid ${t('borderColorNine', '#E5E7EB')};
			font-size: 13px;
			font-weight: 500;
			color: ${t('fontColorTwo', '#374151')};
		}

		${PREFIX} ._arrayAddBtn {
			background: ${t('colorFive', '#3B82F6')};
			color: ${t('colorSeven', '#fff')};
			border: none;
			padding: 4px 10px;
			border-radius: 4px;
			font-size: 12px;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 4px;
			transition: background-color 0.15s ease;
		}

		${PREFIX} ._arrayAddBtn:hover {
			background: #2563EB;
		}

		${PREFIX} ._arrayItems {
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._arrayItem {
			padding: 12px;
			border-bottom: 1px solid ${t('borderColorNine', '#F3F4F6')};
		}

		${PREFIX} ._arrayItem:last-child {
			border-bottom: none;
		}

		${PREFIX} ._arrayItemHeader {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}

		${PREFIX} ._arrayItemIndex {
			font-size: 11px;
			font-weight: 600;
			color: ${t('fontColorThree', '#6B7280')};
			background: ${t('surfaceColorTwo', '#F3F4F6')};
			padding: 2px 8px;
			border-radius: 4px;
		}

		${PREFIX} ._arrayItemHeader i.fa {
			color: ${t('fontColorTen', '#9CA3AF')};
			cursor: pointer;
			padding: 4px;
			border-radius: 4px;
			transition: color 0.15s ease, background-color 0.15s ease;
		}

		${PREFIX} ._arrayItemHeader i.fa:hover {
			color: ${t('colorFour', '#DC2626')};
			background-color: ${t('errorWashColor', '#FEF2F2')};
		}

		${PREFIX} ._emptyMessage {
			color: ${t('fontColorTen', '#9CA3AF')};
			font-size: 12px;
			font-style: italic;
		}

		${PREFIX} ._multiTypeContainer {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		${PREFIX} ._typeSelector {
			color: #1F2937;
			border-radius: 6px;
			font-size: 12px;
			font-family: inherit;
			border: 1px solid ${t('borderColorNine', '#E5E7EB')};
			background-color: ${t('surfaceColorOne', '#F9FAFB')};
			padding: 6px 10px;
			width: auto;
			max-width: 120px;
			transition: border-color 0.2s ease, background-color 0.2s ease;
		}

		${PREFIX} ._typeSelector:focus {
			border-color: ${t('colorFive', '#3B82F6')};
			background-color: ${t('colorSeven', '#fff')};
			outline: none;
		}

		${PREFIX} ._multiTypeEditor {
			flex: 1;
		}

		${PREFIX} ._multiTypeEditor ._singleSchema {
			gap: 0;
		}

		${PREFIX} .monacoEditor { flex:1; height: 100%; width: 100%; transition: width 0s, height 0s; }

		${PREFIX} > * { transition: width 0s, height 0s;}
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaFormCss">{css}</style>;
}
