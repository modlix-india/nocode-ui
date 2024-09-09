import React, { useEffect, useState } from 'react';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorMultipleValueType,
	SimpleEditorType,
	StyleEditorsProps,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { PixelSize } from './simpleEditors/SizeSliders';
import { Dropdown } from './simpleEditors/Dropdown';
import { CommonColorPickerPropertyEditor } from '../../../../commonComponents/CommonColorPicker';
import { ComponentProperty } from '../../../../types/common';

export function BorderEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <BorderDetailedEditor {...props} />;
	}

	return <BorderStandardEditor {...props} />;
}

enum BorderMode {
	ALL = 'ALL',
	TOP = 'TOP',
	RIGHT = 'RIGHT',
	BOTTOM = 'BOTTOM',
	LEFT = 'LEFT',
}

const colorIndex = ['', '_color1', '_color2', '_color3'];

function BorderStandardEditor({
	selectedComponent,
	subComponentName,
	iterateProps,
	pseudoState,
	selectorPref,
	selectedComponentsList,
	defPath,
	locationHistory,
	pageExtractor,
	styleProps,
	saveStyle,
	properties,
}: Readonly<StyleEditorsProps>) {
	const [borderMode, setBorderMode] = useState<Array<BorderMode>>([BorderMode.ALL]);

	const valueBag: Record<string, Record<string, string>> = {};

	for (const direction of ['Top', 'Right', 'Bottom', 'Left']) {
		for (const prop of ['Color', 'Style', 'Width']) {
			const value = extractValue({
				subComponentName,
				prop: 'border' + direction + prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value;

			if (!value) continue;

			if (!valueBag[direction.toLowerCase()]) valueBag[direction.toLowerCase()] = {};
			valueBag[direction.toLowerCase()][prop.toLowerCase()] = value;
		}
	}

	useEffect(() => {
		if (!selectedComponent) return;

		if (!valueBag.top && !valueBag.right && !valueBag.bottom && !valueBag.left) {
			setBorderMode([BorderMode.ALL]);
			return;
		}

		if (valueBag.top && valueBag.right && valueBag.bottom && valueBag.left) {
			for (const direction of ['right', 'bottom', 'left']) {
				if (
					valueBag[direction].color !== valueBag.top.color ||
					valueBag[direction].style !== valueBag.top.style ||
					valueBag[direction].width !== valueBag.top.width
				) {
					setBorderMode([BorderMode.TOP]);
					return;
				}
			}
			setBorderMode([BorderMode.ALL]);
			return;
		}

		if (valueBag.top) setBorderMode([BorderMode.TOP]);
		else if (valueBag.right) setBorderMode([BorderMode.RIGHT]);
		else if (valueBag.bottom) setBorderMode([BorderMode.BOTTOM]);
		else setBorderMode([BorderMode.LEFT]);
	}, [selectedComponent, setBorderMode]);

	// 'borderTopColor',
	// 'borderTopStyle',
	// 'borderTopWidth',
	// 'borderRightColor',
	// 'borderRightStyle',
	// 'borderRightWidth',
	// 'borderBottomColor',
	// 'borderBottomStyle',
	// 'borderBottomWidth',
	// 'borderLeftColor',
	// 'borderLeftStyle',
	// 'borderLeftWidth',

	let size: string | undefined = undefined;
	let style: string | undefined = undefined;
	let color: string | undefined = undefined;

	if (borderMode.includes(BorderMode.ALL)) {
		size =
			valueBag.top?.width ??
			valueBag.right?.width ??
			valueBag.bottom?.width ??
			valueBag.left?.width;
		style =
			valueBag.top?.style ??
			valueBag.right?.style ??
			valueBag.bottom?.style ??
			valueBag.left?.style;
		color =
			valueBag.top?.color ??
			valueBag.right?.color ??
			valueBag.bottom?.color ??
			valueBag.left?.color;
	} else {
		size = valueBag[borderMode[0].toLowerCase()]?.width;
		style = valueBag[borderMode[0].toLowerCase()]?.style;
		color = valueBag[borderMode[0].toLowerCase()]?.color;
	}

	let topHighlightClass = '_highlight';
	let rightHighlightClass = '_highlight';
	let bottomHighlightClass = '_highlight';
	let leftHighlightClass = '_highlight';

	let indexOfIndexes: Record<string, number> = {};
	let index = 0;

	for (const direction of ['top', 'right', 'bottom', 'left']) {
		const string = `${valueBag[direction]?.color ?? ''} ${valueBag[direction]?.style ?? ''} ${valueBag[direction]?.width ?? ''}`;
		if (indexOfIndexes[string] === undefined) {
			indexOfIndexes[string] = index;
			index++;
		}

		if (direction === 'top') {
			topHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else if (direction === 'right') {
			rightHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else if (direction === 'bottom') {
			bottomHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else {
			leftHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		}
	}

	const onChangeCurry = (propType: string) => (value: string | ComponentProperty<string>) => {
		const newValues: { prop: string; value: string | ComponentProperty<string> }[] = [];

		if (borderMode.includes(BorderMode.ALL)) {
			newValues.push({ prop: 'borderTop' + propType, value: value });
			newValues.push({ prop: 'borderRight' + propType, value: value });
			newValues.push({ prop: 'borderBottom' + propType, value: value });
			newValues.push({ prop: 'borderLeft' + propType, value: value });
		} else {
			for (const direction of borderMode) {
				newValues.push({
					prop: 'border' + direction[0] + direction.slice(1).toLowerCase() + propType,
					value: value,
				});
			}
		}

		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: newValues,
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Width :</div>
				<div className="_simpleEditor">
					<PixelSize autofocus={true} value={size} onChange={onChangeCurry('Width')} />
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Style :</div>
				<IconsSimpleEditor
					options={[
						{
							name: 'none',
							description: 'No border',
							icon: (
								<g transform="translate(11 11)">
									<path
										d="M1,1,9,9"
										fill="none"
										strokeLinecap="round"
										strokeWidth="1.45"
										className="_highlight"
									/>
									<path
										d="M1,9,9,1"
										fill="none"
										strokeLinecap="round"
										strokeWidth="1.45"
										className="_highlight"
									/>
								</g>
							),
						},
						{
							name: 'solid',
							description: 'Solid line border',
							icon: (
								<path
									id="Path_162"
									data-name="Path 162"
									d="M1,1H20.013"
									transform="translate(5.5 15)"
									fill="none"
									strokeLinecap="square"
									strokeWidth="2"
								/>
							),
						},
						{
							name: 'double',
							description: 'Double line border',
							icon: (
								<>
									<g
										id="Group_76"
										data-name="Group 76"
										transform="translate(4.727 13)"
									>
										<path
											id="Path_163"
											data-name="Path 163"
											d="M1.273,6H20.286"
											fill="none"
											strokeLinecap="square"
											strokeWidth="2"
										/>
										<path
											id="Path_164"
											data-name="Path 164"
											d="M1.273,1H20.286"
											fill="none"
											strokeLinecap="square"
											strokeWidth="2"
										/>
									</g>
								</>
							),
						},
						{
							name: 'dotted',
							description: 'Dotted line border',
							icon: (
								<path
									id="Path_167"
									data-name="Path 167"
									d="M1,1H22"
									transform="translate(4.5 15.5)"
									fill="none"
									strokeLinecap="round"
									strokeMiterlimit="3.999"
									strokeWidth="2"
									strokeDasharray="0 4"
								/>
							),
						},
						{
							name: 'dashed',
							description: 'Text Decoration Style : Dashed',
							icon: (
								<path
									id="Path_165"
									data-name="Path 165"
									d="M1,1H20.013"
									transform="translate(5.5 15.5)"
									strokeLinecap="square"
									strokeMiterlimit="3.999"
									strokeWidth="2"
									strokeDasharray="4 4"
								/>
							),
						},
					]}
					selected={style}
					onChange={v => onChangeCurry('Style')(v as string)}
					withBackground={true}
				/>
				<CommonColorPickerPropertyEditor
					color={{ value: color }}
					onChange={onChangeCurry('Color')}
				/>
			</div>
			<div className="_simpleEditor">
				<Dropdown
					value={style}
					onChange={v => onChangeCurry('Style')(v as string)}
					options={[
						{
							name: 'none',
							displayName: 'No border',
						},
						{
							name: 'solid',
							displayName: 'Solid line border',
						},
						{
							name: 'double',
							displayName: 'Double line border',
						},
						{
							name: 'dotted',
							displayName: 'Dotted line border',
						},
						{
							name: 'dashed',
							displayName: 'Dashed line border',
						},
						{
							name: 'groove',
							displayName: 'Groove border',
						},
						{
							name: 'ridge',
							displayName: 'Ridge border',
						},
						{
							name: 'inset',
							displayName: 'Inset border',
						},
						{
							name: 'outset',
							displayName: 'Outset border',
						},
						{
							name: 'hidden',
							displayName: 'Hidden border',
						},
					]}
				/>
			</div>
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'ALL',
							description: 'All Borders',
							icon: (
								<>
									<rect
										width="14"
										height="14"
										rx="2"
										transform="translate(9 9)"
										className="_highlight"
										strokeOpacity="0"
									/>

									<rect
										x="2.25"
										y="2.25"
										width="9.75"
										height="9.75"
										transform="translate(9 9)"
										rx="1.5"
										className="_lowlight"
									/>
								</>
							),
						},
						{
							name: 'TOP',
							description: 'Top Border',
							icon: (
								<g transform="translate(9 10)">
									<rect
										x="1"
										y="0"
										width="12"
										height="12"
										rx="2"
										ry="2"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										className={topHighlightClass}
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: 'RIGHT',
							description: 'Right Border',
							icon: (
								<g transform="translate(9 10)">
									<rect
										x="1"
										y="0"
										width="12"
										height="12"
										rx="2"
										ry="2"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										className={rightHighlightClass}
										strokeOpacity="0"
									/>
								</g>
							),
							transform: 'rotate(90)',
						},
						{
							name: 'BOTTOM',
							description: 'Bottom Border',
							icon: (
								<g transform="translate(9 10)">
									<rect
										x="1"
										y="0"
										width="12"
										height="12"
										rx="2"
										ry="2"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										className={bottomHighlightClass}
										strokeOpacity="0"
									/>
								</g>
							),
							transform: 'rotate(180)',
						},
						{
							name: 'LEFT',
							description: 'Left Border',
							icon: (
								<g transform="translate(9 10)">
									<rect
										x="1"
										y="0"
										width="12"
										height="12"
										rx="2"
										ry="2"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										className={leftHighlightClass}
										strokeOpacity="0"
									/>
								</g>
							),
							transform: 'rotate(270)',
						},
					]}
					selected={borderMode}
					multiSelect={true}
					multipleValueType={SimpleEditorMultipleValueType.Array}
					multiSelectWithControl={true}
					onChange={v => {
						if (!Array.isArray(v)) return;

						if (borderMode.length === 1 && borderMode[0] === BorderMode.ALL)
							v = v.filter((e: string) => (e as BorderMode) != BorderMode.ALL);

						if (v.length === 0 || v.includes(BorderMode.ALL) || v.length === 4) {
							setBorderMode([BorderMode.ALL]);
							return;
						}
						setBorderMode(v as BorderMode[]);
					}}
					withBackground={true}
				/>
			</div>
		</>
	);
}

function BorderDetailedEditor({}: Readonly<StyleEditorsProps>) {
	return <></>;
}

// 'borderTopLeftRadius',
// 'borderTopRightRadius',
// 'borderBottomLeftRadius',
// 'borderBottomRightRadius',

// 'borderCollapse',
// 'borderEndEndRadius',
// 'borderEndStartRadius',
// 'borderImageOutset',
// 'borderImageRepeat',
// 'borderImageSlice',
// 'borderImageSource',
// 'borderImageWidth',
// 'borderSpacing',
// 'borderStartEndRadius',
// 'borderStartStartRadius',
// 'borderBlockStartColor',
// 'borderBlockStartStyle',
// 'borderBlockStartWidth',
// 'borderBlockEndColor',
// 'borderBlockEndStyle',
// 'borderBlockEndWidth',
// 'borderInlineStartColor',
// 'borderInlineStartStyle',
// 'borderInlineStartWidth',
// 'borderInlineEndColor',
// 'borderInlineEndStyle',
// 'borderInlineEndWidth',
