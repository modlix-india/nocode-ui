import React, { CSSProperties, useEffect, useRef, useState } from 'react';
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

export type DropdownOptions = Array<{ name: string; displayName: string; description?: string }>;

export function Dropdown({
	value,
	onChange,
	options: orignalOptions,
	placeholder,
	selectNoneLabel = '- None -',
	showNoneLabel = true,
}: {
	value: string;
	onChange: (v: string) => void;
	options: DropdownOptions;
	placeholder?: string;
	selectNoneLabel?: string;
	showNoneLabel?: boolean;
}) {
	const options = showNoneLabel
		? [{ name: '', displayName: selectNoneLabel }, ...orignalOptions]
		: orignalOptions;

	let label = undefined;

	if (value) {
		label = (
			<span className="_selectedOption">
				{options.find(e => e.name === value)?.displayName}
			</span>
		);
	} else {
		label = <span className="_selectedOption _placeholder">{placeholder ?? ''}</span>;
	}

	const [open, setOpen] = useState(false);
	const [currentOption, setOriginalCurrentOption] = useState(0);

	const dropDown = useRef<HTMLDivElement>(null);
	const ddBody = useRef<HTMLDivElement>(null);

	const setCurrentOption = (num: number) => {
		setOriginalCurrentOption(num);
		if (!ddBody.current) return;
		const options = ddBody.current.querySelectorAll('._simpleEditorDropdownOption');
		if (options[num]) options[num].scrollIntoView({ block: 'nearest' });
	};

	let body;
	if (open) {
		const dropdownBodyStyle: CSSProperties = {};
		if (dropDown.current) {
			const rect = dropDown.current.getBoundingClientRect();
			if (rect.top + 300 > document.body.clientHeight)
				dropdownBodyStyle.bottom = document.body.clientHeight - rect.top;
			else dropdownBodyStyle.top = rect.top + rect.height - 4;
			dropdownBodyStyle.right = document.body.clientWidth - rect.right;
			dropdownBodyStyle.minWidth = rect.width;
		}
		body = (
			<div className="_simpleEditorDropdownBody" ref={ddBody} style={dropdownBodyStyle}>
				{options.map((o, i) => (
					<div
						key={o.name}
						className={`_simpleEditorDropdownOption ${
							i === currentOption ? '_hovered' : ''
						} ${o.name === value ? '_selected' : ''}`}
						onClick={() => {
							setOpen(false);
							onChange(o.name);
							setTimeout(() => dropDown.current?.blur(), 0);
						}}
						onMouseOver={() => setCurrentOption(i)}
						title={o.description}
					>
						{o.displayName}
					</div>
				))}
			</div>
		);
	}

	return (
		<div
			tabIndex={0}
			ref={dropDown}
			className="_simpleEditorSelect"
			role="combobox"
			onClick={() => setOpen(true)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
			onMouseLeave={() => setOpen(false)}
			onKeyDown={e => {
				if (e.key === 'ArrowUp') {
					e.preventDefault();
					e.stopPropagation();
					setCurrentOption((options.length + currentOption - 1) % options.length);
					if (!open) setOpen(true);
				} else if (e.key === 'ArrowDown') {
					e.preventDefault();
					e.stopPropagation();
					setCurrentOption((currentOption + 1) % options.length);
					if (!open) setOpen(true);
				} else if (e.key === 'Enter') {
					e.preventDefault();
					e.stopPropagation();
					onChange(options[currentOption].name);
					setOpen(false);
				} else if (e.key === 'Escape') {
					e.preventDefault();
					e.stopPropagation();
					setOpen(false);
				}
			}}
		>
			{label}
			<svg
				width="8"
				height="4"
				viewBox="0 0 8 4"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M4.56629 3.80476C4.56548 3.80476 4.5647 3.80505 4.56408 3.80556C4.25163 4.06508 3.74506 4.06481 3.43301 3.80476L0.234347 1.13914C0.00444266 0.947547 -0.0630292 0.662241 0.0619187 0.412339C0.186867 0.162436 0.476746 5.68513e-09 0.80161 9.5591e-09L7.19894 8.58465e-08C7.52131 8.96907e-08 7.81369 0.162437 7.93863 0.412339C8.06358 0.662241 7.99361 0.947547 7.76621 1.13914L4.5685 3.80396C4.56788 3.80448 4.5671 3.80476 4.56629 3.80476Z"
					fill="#CCCCCC"
				/>
			</svg>
			{body}
		</div>
	);
}

export function PixelSize({
	value = '',
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
}) {
	let num = '';
	let unit = 'px';

	if (value) {
		num = value.replace(/[a-zA-Z% ]/g, '');
		unit = value.replace(/[0-9. ]/g, '').toLowerCase();
	}

	const [inNum, setInNum] = useState(num);

	useEffect(() => {
		setInNum(num);
	}, [num]);

	return (
		<div className="_peMultiEditor">
			<input
				tabIndex={0}
				className="_simpleEditorInput"
				type="text"
				value={inNum}
				placeholder={placeholder}
				onChange={e => setInNum(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						if (isNaN(Number(inNum)) || inNum == '') onChange(inNum);
						else onChange(inNum + unit);
						setInNum(inNum.replace(/[a-zA-Z% ]/g, ''));
					} else if (e.key === 'Escape') setInNum(num);
					else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
						e.preventDefault();
						if (isNaN(Number(inNum))) setInNum(inNum);
						else
							setInNum(
								String(
									Math.round(
										(Number(inNum) + (e.key === 'ArrowDown' ? -1 : 1)) * 100,
									) / 100,
								),
							);
					}
				}}
				onBlur={() => {
					if (isNaN(Number(inNum)) || inNum == '') onChange(inNum);
					else onChange(inNum + unit);
				}}
			/>

			<Dropdown
				value={unit}
				onChange={v => onChange(num + v)}
				options={[
					{ name: 'px', displayName: 'px' },
					{ name: 'vw', displayName: 'vw' },
					{ name: 'vh', displayName: 'vh' },
					{ name: 'vmin', displayName: 'vmin' },
					{ name: 'vmax', displayName: 'vmax' },
					{ name: '%', displayName: '%' },
					{ name: 'em', displayName: 'em' },
					{ name: 'rem', displayName: 'rem' },
					{ name: 'cm', displayName: 'cm' },
					{ name: 'mm', displayName: 'mm' },
					{ name: 'in', displayName: 'in' },
					{ name: 'pt', displayName: 'pt' },
					{ name: 'pc', displayName: 'pc' },
					{ name: 'ex', displayName: 'ex' },
					{ name: 'ch', displayName: 'ch' },
				]}
			/>
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
					options={editorDef.options!}
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
