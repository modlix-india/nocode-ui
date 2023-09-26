import React from 'react';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import { editor } from 'monaco-editor';
import { title } from 'process';
import {
	ComponentProperty,
	ComponentStyle,
	DataLocation,
	EachComponentStyle,
	PageDefinition,
	StyleResolution,
} from '../../../../../types/common';
import { PageOperations } from '../../../functions/PageOperations';

import { DropdownOptions, Dropdown } from './Dropdown';
import { IconOptions, IconsSimpleEditor } from './IconsSimpleEditor';
import { PixelSize } from './SizeSliders';
import { ColorSelector } from './ColorSelector';
import { ShadowEditor, ShadowEditorType } from './ShadowEditor';

export interface SimpleStyleEditorsProps {
	pseudoState: string;
	subComponentName: string;
	iterateProps: any;
	placeholder?: string;
	selectorPref: any;
	styleProps: ComponentStyle | undefined;
	selectedComponent: string;
	saveStyle: (newStyleProps: ComponentStyle) => void;
	properties: [string, EachComponentStyle] | undefined;
	displayName?: string;
	showTitle?: boolean;
	editorInNewLine?: boolean;
	prop: string;
	editorDef: SimpleEditorDefinition;
	className?: string;
}

export function EachSimpleEditor({
	subComponentName,
	displayName,
	pseudoState,
	iterateProps,
	prop,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
	editorDef,
	placeholder,
	className = '',
}: SimpleStyleEditorsProps) {
	if (!properties) return <></>;

	const { value, actualProp, propName, screenSize, compProp } = extractValue({
		subComponentName,
		prop,
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponent,
	});

	let editor = undefined;
	const editorOnchange = (v: string | Array<String> | ComponentProperty<string>) => {
		let value;
		if (Array.isArray(v)) value = { value: v, location: { value: v } };
		else if (typeof v === 'string') value = { value: v, location: { value: v } };
		else value = v;
		valueChanged({
			styleProps,
			properties,
			screenSize,
			actualProp,
			compProp,
			pseudoState,
			saveStyle,
			iterateProps,
			value,
		});
	};

	switch (editorDef.type) {
		case SimpleEditorType.Dropdown:
			editor = (
				<Dropdown
					value={value.value}
					onChange={editorOnchange}
					options={editorDef.dropdownOptions!}
					placeholder={placeholder}
					multipleValueType={editorDef.multipleValueType}
					multiSelect={editorDef.multiSelect}
				/>
			);
			break;
		case SimpleEditorType.PixelSize:
			editor = (
				<PixelSize
					value={value.value}
					onChange={editorOnchange}
					placeholder={placeholder}
					min={editorDef.rangeMin ?? 0}
					max={editorDef.rangeMax ?? 100}
				/>
			);
			break;
		case SimpleEditorType.Icons:
			editor = (
				<IconsSimpleEditor
					options={editorDef.iconButtonOptions!}
					selected={value.value}
					onChange={editorOnchange}
					withBackground={editorDef.iconButtonsBackground}
					multipleValueType={editorDef.multipleValueType}
					multiSelect={editorDef.multiSelect}
				/>
			);
			break;
		case SimpleEditorType.Color:
			editor = <ColorSelector color={value} onChange={editorOnchange} />;
			break;
		case SimpleEditorType.TextShadow:
			editor = (
				<ShadowEditor
					value={value.value}
					onChange={editorOnchange}
					type={ShadowEditorType.TextShadow}
				/>
			);
			break;
		case SimpleEditorType.BoxShadow:
			editor = (
				<ShadowEditor
					value={value.value}
					onChange={editorOnchange}
					type={ShadowEditorType.BoxShadow}
				/>
			);
			break;
		default:
			editor = <></>;
	}

	return <div className={`_simpleEditor ${className}`}>{editor}</div>;
}

export enum SimpleEditorType {
	Dropdown = 'Dropdown',
	Icons = 'Icons',
	PixelSize = 'PixelSize',
	Color = 'Color',
	TextShadow = 'TextShadow',
	BoxShadow = 'BoxShadow',
	Image = 'Image',
	Gradient = 'Gradient',
	ImageGradient = 'ImageGradient',
}

export interface SimpleEditorDefinition {
	type: SimpleEditorType;
	dropdownOptions?: DropdownOptions;
	iconButtonOptions?: IconOptions;
	iconButtonsBackground?: boolean;
	multiSelect?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	rangeMin?: number;
	rangeMax?: number;
}

export enum SimpleEditorMultipleValueType {
	CommaSeparated = ',',
	NewLineSeparated = '\n',
	SpaceSeparated = ' ',
	SemicolonSeparated = ';',
	Array = 'Array',
}

export interface StyleEditorsProps {
	pseudoState: string;
	subComponentName: string;
	iterateProps: any;
	pageDef: PageDefinition | undefined;
	editPageName: string | undefined;
	placeholder?: string;
	slaveStore: any;
	storePaths: Set<string>;
	selectorPref: any;
	styleProps: ComponentStyle | undefined;
	selectedComponent: string;
	saveStyle: (newStyleProps: ComponentStyle) => void;
	pageOperations: PageOperations;
	appDef?: any;
	properties: [string, EachComponentStyle] | undefined;
	displayName?: string;
	showTitle?: boolean;
	editorInNewLine?: boolean;
	isDetailStyleEditor?: boolean;
}

export function extractValue({
	subComponentName,
	prop,
	iterateProps,
	pseudoState,
	selectorPref,
	selectedComponent,
}: {
	pseudoState: string;
	subComponentName: string;
	iterateProps: any;
	prop: string;
	selectorPref: any;
	selectedComponent: string;
}) {
	const compProp = subComponentName ? `${subComponentName}-${prop}` : prop;
	let value = iterateProps[compProp] ?? {};
	const actualProp = pseudoState ? `${compProp}:${pseudoState}` : compProp;
	if (pseudoState && iterateProps[`${compProp}:${pseudoState}`]) {
		value = { ...value, ...iterateProps[`${compProp}:${pseudoState}`] };
	}

	let propName = prop.replace(/([A-Z])/g, ' $1');
	propName = propName[0].toUpperCase() + propName.slice(1);

	const screenSize = ((selectorPref[selectedComponent]?.screenSize?.value as string) ??
		'ALL') as StyleResolution;

	return { value, actualProp, propName, screenSize, compProp };
}

export function valueChanged({
	styleProps,
	properties,
	screenSize,
	actualProp,
	value,
	compProp,
	pseudoState,
	saveStyle,
	iterateProps,
}: {
	styleProps: ComponentStyle | undefined;
	properties: [string, EachComponentStyle] | undefined;
	screenSize: StyleResolution;
	actualProp: string;
	value: any;
	compProp: string;
	pseudoState: string;
	saveStyle: (newStyleProps: ComponentStyle) => void;
	iterateProps: any;
}) {
	const updatedStyle = propUpdate({
		styleProps,
		properties,
		screenSize,
		actualProp,
		value,
		compProp,
		pseudoState,
		iterateProps,
	});

	if (!updatedStyle) return;
	saveStyle(updatedStyle);
}

export function valuesChanged({
	styleProps,
	properties,
	screenSize,
	propValues,
	pseudoState,
	saveStyle,
	iterateProps,
}: {
	styleProps: ComponentStyle | undefined;
	properties: [string, EachComponentStyle] | undefined;
	screenSize: StyleResolution;
	pseudoState: string;
	saveStyle: (newStyleProps: ComponentStyle) => void;
	iterateProps: any;
	propValues: { actualProp: string; value: any; compProp: string }[];
}) {
	const updatedStyle = propValues.reduce(
		(updatedStyle, { actualProp, value, compProp }) =>
			propUpdate({
				styleProps: updatedStyle,
				properties,
				screenSize,
				actualProp,
				value,
				compProp,
				pseudoState,
				iterateProps,
			}),
		styleProps,
	);

	if (!updatedStyle) return;
	saveStyle(updatedStyle);
}

function propUpdate({
	styleProps,
	properties,
	screenSize,
	actualProp,
	value,
	compProp,
	pseudoState,
	iterateProps,
}: {
	styleProps: ComponentStyle | undefined;
	properties: [string, EachComponentStyle] | undefined;
	screenSize: StyleResolution;
	actualProp: string;
	value: any;
	compProp: string;
	pseudoState: string;
	iterateProps: any;
}): ComponentStyle | undefined {
	if (!properties) return styleProps;

	const newProps = duplicate(styleProps) as ComponentStyle;

	if (!newProps[properties[0]]) newProps[properties[0]] = { resolutions: {} };

	if (!newProps[properties[0]].resolutions) newProps[properties[0]].resolutions = {};

	if (!newProps[properties[0]].resolutions![screenSize])
		newProps[properties[0]].resolutions![screenSize] = {};

	if (
		(pseudoState && deepEqual(value, iterateProps[compProp] ?? {})) ||
		(!value.value && !value.location?.expression && !value.location?.value)
	) {
		delete newProps[properties[0]].resolutions![screenSize]![actualProp];
	} else {
		if (newProps[properties[0]].resolutions![screenSize]![actualProp])
			value = { ...newProps[properties[0]].resolutions![screenSize]![actualProp], ...value };
		newProps[properties[0]].resolutions![screenSize]![actualProp] = value;
	}

	return newProps;
}
