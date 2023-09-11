import React from 'react';
import {
	ComponentStyle,
	EachComponentStyle,
	PageDefinition,
	StyleResolution,
} from '../../../../types/common';
import PageOperations from '../../functions/PageOperations';
import { deepEqual, duplicate } from '@fincity/kirun-js';

export interface StyleEditorsProps {
	pseudoState: string;
	subComponentName: string;
	iterateProps: any;
	pageDef: PageDefinition | undefined;
	editPageName: string | undefined;
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
}

export type DropdownOptions = Array<{ value: string; displayName: string }>;

export function Dropdown({
	value,
	onChange,
	options,
}: {
	value: string;
	onChange: (v: string) => void;
	options: DropdownOptions;
}) {
	return (
		<select
			className="_simpleEditorSelect"
			value={value}
			onChange={e => onChange(e.target.value)}
		>
			<option value={undefined}></option>
			{options.map(o => (
				<option key={o.value} value={o.value}>
					{o.displayName}
				</option>
			))}
		</select>
	);
}

export function PixelSize({
	value = '',
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	let num = '';
	let unit = 'px';

	if (value) {
		num = value.replace(/[a-zA-Z ]/g, '');
		unit = value.replace(/[0-9. ]/g, '').toLowerCase();
	}

	console.log(num + '_' + unit);

	return (
		<div className="_peMultiEditor">
			<input
				className="_simpleEditorInput"
				type="text"
				value={num}
				onChange={e => {
					if (isNaN(Number(e.target.value))) onChange(e.target.value);
					else onChange(e.target.value + unit);
				}}
			/>
			<select
				className="_simpleEditorSelect"
				value={unit}
				onChange={e => onChange(num + e.target.value)}
			>
				<option value="px">px</option>
				<option value="vw">vw</option>
				<option value="vh">vh</option>
				<option value="vmin">vmin</option>
				<option value="vmax">vmax</option>
				<option value="%">%</option>
				<option value="em">em</option>
				<option value="rem">rem</option>
				<option value="cm">cm</option>
				<option value="mm">mm</option>
				<option value="in">in</option>
				<option value="pt">pt</option>
				<option value="pc">pc</option>
				<option value="ex">ex</option>
				<option value="ch">ch</option>
			</select>
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
	options?: DropdownOptions;
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
	showTitle = true,
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
			value: { value: v },
		});

	switch (editorDef.type) {
		case SimpleEditorType.Dropdown:
			editor = (
				<Dropdown
					value={value.value}
					onChange={editorOnchange}
					options={editorDef.options!}
				/>
			);
			break;
		case SimpleEditorType.PixelSize:
			editor = <PixelSize value={value.value} onChange={editorOnchange} />;
			break;
		default:
			editor = <></>;
	}

	const title =
		showTitle || true ? (
			<div className="_propLabel" title="Name">
				{`${displayName ?? propName} : `}
				{(pseudoState && iterateProps[compProp]) ||
				(screenSize !== 'ALL' &&
					(properties[1]?.resolutions?.ALL?.[compProp] ||
						properties[1]?.resolutions?.ALL?.[actualProp])) ? (
					<span title="Has a default value">★</span>
				) : (
					''
				)}
				{editor}
			</div>
		) : (
			<></>
		);

	return <div className="_eachProp">{title}</div>;
}
