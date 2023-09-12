import React from 'react';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import { editor } from 'monaco-editor';
import { title } from 'process';
import {
	ComponentStyle,
	EachComponentStyle,
	PageDefinition,
	StyleResolution,
} from '../../../../../types/common';
import PageOperations from '../../../functions/PageOperations';

import { DropdownOptions, Dropdown } from './Dropdown';
import { IconOptions } from './Icons';
import { PixelSize } from './PixelSize';

export function EachSimpleEditor({
	subComponentName,
	displayName,
	pseudoState,
	iterateProps,
	prop,
	pageDef,
	editPageName,
	slaveStore,
	storePaths,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	pageOperations,
	properties,
	editorDef,
	showTitle = false,
	editorInNewLine = false,
	placeholder,
}: StyleEditorsProps & { prop: string; editorDef: SimpleEditorDefinition }) {
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
	const editorOnchange = (v: string) =>
		valueChanged({
			styleProps,
			properties,
			screenSize,
			actualProp,
			compProp,
			pseudoState,
			saveStyle,
			iterateProps,
			value: { value: !v ? '' : v },
		});

	switch (editorDef.type) {
		case SimpleEditorType.Dropdown:
			editor = (
				<Dropdown
					value={value.value}
					onChange={editorOnchange}
					options={editorDef.dropdownOptions!}
					placeholder={placeholder}
				/>
			);
			break;
		case SimpleEditorType.PixelSize:
			editor = (
				<PixelSize
					value={value.value}
					onChange={editorOnchange}
					placeholder={placeholder}
				/>
			);
			break;
		default:
			editor = <></>;
	}

	const title = showTitle ? (
		<>
			{`${displayName ?? propName} : `}
			{(pseudoState && iterateProps[compProp]) ||
			(screenSize !== 'ALL' &&
				(properties[1]?.resolutions?.ALL?.[compProp] ||
					properties[1]?.resolutions?.ALL?.[actualProp])) ? (
				<span title="Has a default value">★</span>
			) : (
				''
			)}
		</>
	) : (
		<></>
	);

	if (!editorInNewLine) {
		return (
			<div className="_eachProp">
				<div className="_propLabel" title="Name">
					{title}
					{editor}
				</div>
			</div>
		);
	}

	return (
		<div className="_eachProp">
			<div className="_propLabel" title="Name">
				{title}
			</div>
			{editor}
		</div>
	);
}

export enum SimpleEditorType {
	Dropdown = 'Dropdown',
	Icons = 'Icons',
	PixelSize = 'PixelSize',
	Color = 'Color',
	Image = 'Image',
	Gradient = 'Gradient',
	ImageGradient = 'ImageGradient',
}

export interface SimpleEditorDefinition {
	type: SimpleEditorType;
	dropdownOptions?: DropdownOptions;
	iconButtonOptions?: IconOptions;
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
	if (!properties) return;

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
		newProps[properties[0]].resolutions![screenSize]![actualProp] = value;
	}

	saveStyle(newProps);
}
