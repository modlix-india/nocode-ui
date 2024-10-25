import { deepEqual, duplicate } from '@fincity/kirun-js';
import React from 'react';
import {
	ComponentProperty,
	ComponentStyle,
	EachComponentStyle,
	LocationHistory,
	PageDefinition,
	StyleResolution,
} from '../../../../../types/common';
import { PageOperations } from '../../../functions/PageOperations';

import { CommonColorPickerPropertyEditor } from '../../../../../commonComponents/CommonColorPicker';
import { PageStoreExtractor, getDataFromPath, setData } from '../../../../../context/StoreContext';
import { shortUUID } from '../../../../../util/shortUUID';
import { Dropdown, DropdownOptions } from './Dropdown';
import { IconOptions, IconsSimpleEditor } from './IconsSimpleEditor';
import { ShadowEditor, ShadowEditorType } from './ShadowEditor';
import { PixelSize, RangeWithoutUnit } from './SizeSliders';
import { RadioButton, RadioButtonOptions } from './RadioButton';

export interface SimpleStyleEditorsProps {
	pseudoState: string;
	subComponentName: string;
	iterateProps: any;
	placeholder?: string;
	selectorPref: any;
	styleProps: ComponentStyle | undefined;
	selectedComponent: string;
	selectedComponentsList: string[];
	saveStyle: (newStyleProps: ComponentStyle) => void;
	properties: [string, EachComponentStyle] | undefined;
	displayName?: string;
	showTitle?: boolean;
	editorInNewLine?: boolean;
	prop: string;
	editorDef: SimpleEditorDefinition;
	className?: string;
	defPath: string;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}

// Add this new interface
export interface RelatedProps {
	props: string[];
	logic: (values: Record<string, any>) => Record<string, any>;
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
	selectedComponentsList,
	saveStyle,
	properties,
	editorDef,
	placeholder,
	className = '',
	defPath,
	locationHistory,
	pageExtractor,
	relatedProps,
}: SimpleStyleEditorsProps & { relatedProps?: RelatedProps }) {
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
		let newValue;
		if (Array.isArray(v)) newValue = { value: v, location: value.location };
		else if (typeof v === 'string') newValue = { value: v, location: value.location };
		else newValue = v;

		if (relatedProps) {
			const currentValues = relatedProps.props.reduce(
				(acc, propName) => {
					acc[propName] = iterateProps[propName]?.value;
					return acc;
				},
				{} as Record<string, any>,
			);

			currentValues[prop] = newValue.value;

			const updatedValues = relatedProps.logic(currentValues);

			const propValues = Object.entries(updatedValues).map(([prop, value]) => ({
				prop,
				value: { value, location: iterateProps[prop]?.location },
			}));

			valuesChangedOnlyValues({
				subComponentName,
				selectedComponent,
				selectedComponentsList,
				propValues,
				selectorPref,
				defPath,
				locationHistory,
				pageExtractor,
			});
		} else {
			valuesChangedOnlyValues({
				subComponentName,
				selectedComponent,
				selectedComponentsList,
				propValues: [{ prop, value: newValue }],
				selectorPref,
				defPath,
				locationHistory,
				pageExtractor,
			});
		}
	};

	switch (editorDef.type) {
		case SimpleEditorType.Dropdown:
			editor = (
				<Dropdown
					value={value.value ?? editorDef.dropDownDefaultValue}
					onChange={editorOnchange}
					options={editorDef.dropdownOptions!}
					placeholder={placeholder}
					multipleValueType={editorDef.multipleValueType}
					multiSelect={editorDef.multiSelect}
					showNoneLabel={editorDef.dropDownShowNoneLabel}
					selectNoneLabel={editorDef.dropdDownSelectNoneLabel}
				/>
			);
			break;
		case SimpleEditorType.PixelSize:
			editor = (
				<PixelSize
					value={value.value}
					onChange={editorOnchange}
					placeholder={placeholder}
					hideSlider={editorDef.hideSlider}
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
					visibleIconCount={editorDef.visibleIconCount}
					// gridSize={editorDef.gridSize}
				/>
			);
			break;
		case SimpleEditorType.Color:
			editor = <CommonColorPickerPropertyEditor color={value} onChange={editorOnchange} />;
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

		case SimpleEditorType.Range:
			editor = (
				<RangeWithoutUnit
					value={value.value}
					onChange={editorOnchange}
					placeholder={placeholder}
					min={editorDef.rangeMin ?? 0}
					max={editorDef.rangeMax ?? 100}
					hideSlider={editorDef.hideSlider}
					step={editorDef.rangeStep}
				/>
			);
			break;
		case SimpleEditorType.Text:
			editor = (
				<input
					type="text"
					className="_simpleEditorInput"
					placeholder={placeholder}
					value={value.value ?? ''}
					onChange={e => editorOnchange(e.target.value)}
				/>
			);
			break;
		case SimpleEditorType.Number:
			editor = (
				<input
					type="number"
					className="_simpleEditorInput"
					placeholder={placeholder}
					value={value.value}
					onChange={e => editorOnchange(e.target.value)}
				/>
			);
			break;
		case SimpleEditorType.Radio:
			editor = (
				<RadioButton
					value={value.value ?? editorDef.radioDefaultValue}
					onChange={editorOnchange}
					options={editorDef.radioOptions!}
					placeholder={placeholder}
					multipleValueType={editorDef.multipleValueType}
					multiSelect={editorDef.multiSelect}
					showNoneLabel={editorDef.radioShowNoneLabel}
					selectNoneLabel={editorDef.radioSelectNoneLabel}
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
	Range = 'Range',
	Text = 'Text',
	Number = 'Number',
	TextBox = 'TextBox',
	Radio = 'Radio',
}

export interface SimpleEditorDefinition {
	[x: string]: any;
	type: SimpleEditorType;
	dropdownOptions?: DropdownOptions;
	dropdDownSelectNoneLabel?: string;
	dropDownShowNoneLabel?: boolean;
	dropDownDefaultValue?: string | Array<string>;
	iconButtonOptions?: IconOptions;
	iconButtonsBackground?: boolean;
	multiSelect?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	rangeMin?: number;
	rangeMax?: number;
	rangeStep?: number;
	hideSlider?: boolean;
	visibleIconCount?: number;
	radioOptions?: RadioButtonOptions;
	radioSelectNoneLabel?: string;
	radioShowNoneLabel?: boolean;
	radioDefaultValue?: string | Array<string>;
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
	selectedComponentsList: string[];
	saveStyle: (newStyleProps: ComponentStyle) => void;
	pageOperations: PageOperations;
	appDef?: any;
	properties: [string, EachComponentStyle] | undefined;
	displayName?: string;
	showTitle?: boolean;
	editorInNewLine?: boolean;
	isDetailStyleEditor?: boolean;
	defPath: string;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
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

	const screenSize = ((selectorPref?.[selectedComponent]?.screenSize?.value as string) ??
		'ALL') as StyleResolution;

	return { value, actualProp, propName, screenSize, compProp };
}

export function valuesChangedOnlyValues({
	subComponentName,
	selectedComponent,
	selectedComponentsList,
	propValues, // only new updated style prop
	selectorPref,
	defPath,
	locationHistory,
	pageExtractor,
}: {
	propValues: { prop: string; value: ComponentProperty<any> | string }[];
	selectedComponent: string;
	selectedComponentsList: string[];
	subComponentName: string;
	selectorPref?: any;
	defPath: string;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}) {
	if (propValues.length === 0) return;

	const pageDef = duplicate(
		getDataFromPath(defPath, locationHistory, pageExtractor),
	) as PageDefinition;

	for (const compKey of selectedComponentsList?.length
		? selectedComponentsList
		: [selectedComponent]) {
		const compDef = pageDef.componentDefinition[compKey];
		if (!compDef.styleProperties) compDef.styleProperties = {};

		let updatedStyle: ComponentStyle | undefined;

		const styleProps = processOldCondition(compDef.styleProperties);
		const properties = getProperties(
			getDefaultStyles(styleProps),
			styleProps,
			selectedComponent,
			selectorPref,
		);

		const size = (selectorPref[selectedComponent]?.screenSize?.value as string) ?? 'ALL';
		let iterateProps = properties?.[1].resolutions?.ALL ?? {};
		if (size !== 'ALL') {
			const sizedProps = properties?.[1].resolutions?.[size as StyleResolution] ?? {};
			iterateProps = { ...iterateProps, ...sizedProps };
		}
		const screenSize = ((selectorPref[selectedComponent]?.screenSize?.value as string) ??
			'ALL') as StyleResolution;

		let pseudoState = '';
		if (selectorPref[selectedComponent]?.stylePseudoState?.value)
			pseudoState = selectorPref[selectedComponent].stylePseudoState.value;

		const hasSubComponents = new Set<string>();
		const hasPseudoStates = new Set<string>();
		Object.keys(iterateProps).forEach(e => {
			let splits = e.split(':');
			if (splits.length > 1) hasPseudoStates.add(splits[1]);
			else hasPseudoStates.add('');
			splits = e.split('-');
			if (splits.length > 1) hasSubComponents.add(splits[0]);
			else hasSubComponents.add('');
		});

		updatedStyle = propValues.reduce((updatedStyle, { prop, value }) => {
			const {
				value: oldValue,
				actualProp,
				screenSize,
				compProp,
			} = extractValue({
				subComponentName,
				prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			});

			let newValue: any = undefined;

			if (typeof value === 'string') {
				newValue = { value };
				if (oldValue.location) newValue.location = oldValue.location;
			} else newValue = value;
			return propUpdate({
				styleProps: updatedStyle,
				properties,
				screenSize,
				actualProp,
				value: newValue,
				compProp,
				pseudoState,
				iterateProps,
			});
		}, styleProps);

		if (!updatedStyle) continue;
		compDef.styleProperties = updatedStyle;
	}

	setData(defPath, pageDef, pageExtractor.getPageName());
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
	styleProps: ComponentStyle;
	properties: [string, EachComponentStyle] | undefined;
	screenSize: StyleResolution;
	actualProp: string;
	value: any;
	compProp: string;
	pseudoState: string;
	iterateProps: any;
}): ComponentStyle {
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

function processOldCondition(styleProps: ComponentStyle | undefined): ComponentStyle {
	if (!styleProps) return { [shortUUID()]: { resolutions: { ALL: {} } } };

	styleProps = duplicate(styleProps);
	let i = 1;
	Object.values(styleProps!)
		.filter(e => !e.conditionName && e.condition)
		.forEach(e => (e.conditionName = `Condition ${i++}`));

	return styleProps!;
}
// it will return the current applied styles
function getDefaultStyles(styleProps: ComponentStyle | undefined) {
	const inStyles = Object.entries(styleProps ?? {}).filter(e => !e[1].condition);
	if (inStyles.length !== 1) {
		if (inStyles.length === 0) {
			const key = shortUUID();
			const newStyleProps = duplicate(styleProps ?? {}) as ComponentStyle;
			newStyleProps[key] = { resolutions: { ALL: {} } };
			return [key, {}];
		} else {
			let styles = duplicate(inStyles);
			const first = styles[0];
			const newStyleProps = duplicate(styleProps) as ComponentStyle;
			for (let i = 1; i < styles.length; i++) {
				delete newStyleProps[styles[i][0]];
				Object.entries(styles[i][1].resolutions).forEach(e => {
					if (!first[1].resolutions[e[0]]) first[1].resolutions[e[0]] = {};
					Object.assign(first[1].resolutions[e[0]], e[1]);
				});
			}
			newStyleProps[first[0]] = first[1];
			return first;
		}
	}
	return inStyles[0];
}

function getProperties(
	defaultStyles: [string, EachComponentStyle],
	styleProps: ComponentStyle | undefined,
	selectedComponent: string,
	selectorPref: any,
) {
	if (!selectorPref[selectedComponent]?.condition?.value) return duplicate(defaultStyles);

	const conditionStyles = Object.entries(styleProps ?? {}).filter(
		e => e[1].conditionName === selectorPref[selectedComponent]?.condition?.value,
	)?.[0];
	if (!conditionStyles) return duplicate(defaultStyles);

	let styles = duplicate(conditionStyles);
	const first = duplicate(defaultStyles);

	Object.entries(styles[1].resolutions).forEach(e => {
		if (!first[1].resolutions[e[0]]) first[1].resolutions[e[0]] = {};
		Object.assign(first[1].resolutions[e[0]], e[1]);
	});

	return [styles[0], first[1]];
}
