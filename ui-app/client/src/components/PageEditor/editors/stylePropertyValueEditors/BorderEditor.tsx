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

enum BorderRadiusMode {
	ALL = 'ALL',
	TOP_LEFT = 'TOP_LEFT',
	TOP_RIGHT = 'TOP_RIGHT',
	BOTTOM_LEFT = 'BOTTOM_LEFT',
	BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}

enum LogicalBorderRadiusMode {
	ALL = 'ALL',
	START_START = 'START_START',
	START_END = 'START_END',
	END_START = 'END_START',
	END_END = 'END_END',
}

enum AdvancedBorderMode {
	ALL = 'ALL',
	BLOCK_START = 'BLOCK_START',
	BLOCK_END = 'BLOCK_END',
	INLINE_START = 'INLINE_START',
	INLINE_END = 'INLINE_END',
}

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
	const [borderRadiusMode, setBorderRadiusMode] = useState<Array<BorderRadiusMode>>([
		BorderRadiusMode.ALL,
	]);
	const [borderRadius, setBorderRadius] = useState<string>('');
	const [borderImageSliceValue, setBorderImageSliceValue] = useState<string>('');
	const [borderImageSliceFill, setBorderImageSliceFill] = useState<boolean>(false);

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

	const onChangeBorderRadius = (value: string) => {
		setBorderRadius(value);
		const newValues: { prop: string; value: string }[] = [];

		if (borderRadiusMode.includes(BorderRadiusMode.ALL)) {
			newValues.push({ prop: 'borderTopLeftRadius', value });
			newValues.push({ prop: 'borderTopRightRadius', value });
			newValues.push({ prop: 'borderBottomLeftRadius', value });
			newValues.push({ prop: 'borderBottomRightRadius', value });
		} else {
			for (const mode of borderRadiusMode) {
				switch (mode) {
					case BorderRadiusMode.TOP_LEFT:
						newValues.push({ prop: 'borderTopLeftRadius', value });
						break;
					case BorderRadiusMode.TOP_RIGHT:
						newValues.push({ prop: 'borderTopRightRadius', value });
						break;
					case BorderRadiusMode.BOTTOM_LEFT:
						newValues.push({ prop: 'borderBottomLeftRadius', value });
						break;
					case BorderRadiusMode.BOTTOM_RIGHT:
						newValues.push({ prop: 'borderBottomRightRadius', value });
						break;
				}
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

	const updateBorderImageSlice = (value: string, fill: boolean) => {
		const newValue = `${value}${fill ? ' fill' : ''}`;
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'borderImageSlice', value: newValue }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Width</div>
				<div className="_simpleEditor">
					<PixelSize autofocus={true} value={size} onChange={onChangeCurry('Width')} />
				</div>
			</div>
			<div className="_simpleEditor">
				<div className="_simpleLabel">Basic</div>
			</div>
			<div className="_simpleEditor">
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
							description: 'Dashed line border',
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
			</div>
			<div className="_simpleEditor">
				<div className="_simpleLabel">Advanced</div>
			</div>
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'groove',
							description: 'Groove border',
							icon: (
								<g transform="translate(664.646 293.118) rotate(180)">
									<path
										d="M-1.5,2A3.5,3.5,0,0,1,2-1.5h8.5A3.5,3.5,0,0,1,14,2c0-.276-.9-.5-2-.5H2a.5.5,0,0,0-.5.5ZM14,14h0ZM2,14a3.5,3.5,0,0,1-3.5-3.5V2A3.5,3.5,0,0,1,2-1.5v3a.5.5,0,0,0-.5.5V12C1.5,13.1,1.724,14,2,14ZM14,0V0Z"
										transform="translate(656.146 284.618) rotate(180)"
										strokeOpacity="0"
									/>
									<path
										d="M15.5,12A3.5,3.5,0,0,1,12,15.5H3.5A3.5,3.5,0,0,1,0,12c0,.276.9.5,2,.5H12a.5.5,0,0,0,.5-.5ZM0,0H0ZM12,0a3.5,3.5,0,0,1,3.5,3.5V12A3.5,3.5,0,0,1,12,15.5v-3a.5.5,0,0,0,.5-.5V2C12.5.9,12.276,0,12,0ZM0,14v0Z"
										transform="translate(655.499 283.927) rotate(180)"
										strokeOpacity="0"
										opacity="0.5"
									/>
									<path
										d="M-.176,1.824a2,2,0,0,1,2-2h9.353a2,2,0,0,1,2,2H-.176ZM13.177,13.177h0Zm-11.353,0a2,2,0,0,1-2-2V1.824a2,2,0,0,1,2-2V13.177ZM13.177.824v0Z"
										transform="translate(642.322 270.75)"
										strokeOpacity="0"
									/>
									<path
										d="M14.176,12.176a2,2,0,0,1-2,2H3.646a2,2,0,0,1-2-2H14.176ZM1.646,1.647h0Zm10.529,0a2,2,0,0,1,2,2v8.529a2,2,0,0,1-2,2V1.647ZM1.646,13.176v0Z"
										transform="translate(640.824 269.383)"
										strokeOpacity="0"
										opacity="0.5"
									/>
								</g>
							),
						},
						{
							name: 'ridge',
							description: 'Ridge border',
							icon: (
								<g transform="translate(-632.999 -262)">
									<path
										d="M-1.5,2A3.5,3.5,0,0,1,2-1.5h8.5A3.5,3.5,0,0,1,14,2c0-.276-.9-.5-2-.5H2a.5.5,0,0,0-.5.5ZM14,14h0ZM2,14a3.5,3.5,0,0,1-3.5-3.5V2A3.5,3.5,0,0,1,2-1.5v3a.5.5,0,0,0-.5.5V12C1.5,13.1,1.724,14,2,14ZM14,0V0Z"
										transform="translate(656.146 284.618) rotate(180)"
										strokeOpacity="0"
									/>
									<path
										d="M15.5,12A3.5,3.5,0,0,1,12,15.5H3.5A3.5,3.5,0,0,1,0,12c0,.276.9.5,2,.5H12a.5.5,0,0,0,.5-.5ZM0,0H0ZM12,0a3.5,3.5,0,0,1,3.5,3.5V12A3.5,3.5,0,0,1,12,15.5v-3a.5.5,0,0,0,.5-.5V2C12.5.9,12.276,0,12,0ZM0,14v0Z"
										transform="translate(655.499 283.927) rotate(180)"
										strokeOpacity="0"
										opacity="0.5"
									/>
									<path
										d="M-.176,1.824a2,2,0,0,1,2-2h9.353a2,2,0,0,1,2,2H-.176ZM13.177,13.177h0Zm-11.353,0a2,2,0,0,1-2-2V1.824a2,2,0,0,1,2-2V13.177ZM13.177.824v0Z"
										transform="translate(642.322 270.75)"
										strokeOpacity="0"
									/>
									<path
										d="M14.176,12.176a2,2,0,0,1-2,2H3.646a2,2,0,0,1-2-2H14.176ZM1.646,1.647h0Zm10.529,0a2,2,0,0,1,2,2v8.529a2,2,0,0,1-2,2V1.647ZM1.646,13.176v0Z"
										transform="translate(640.824 269.383)"
										strokeOpacity="0"
										opacity="0.5"
									/>
								</g>
							),
						},
						{
							name: 'inset',
							description: 'Inset border',
							icon: (
								<g transform="translate(9.5 9.5)">
									<path
										d="M0,0H0ZM15.5,12A3.5,3.5,0,0,1,12,15.5H3.5A3.5,3.5,0,0,1,0,12c0,.276.9.5,2,.5H12a.5.5,0,0,0,.5-.5ZM0,14v0ZM12,0a3.5,3.5,0,0,1,3.5,3.5V12A3.5,3.5,0,0,1,12,15.5v-3a.5.5,0,0,0,.5-.5V2C12.5.9,12.276,0,12,0Z"
										strokeOpacity="0"
										opacity="0.5"
									/>
									<path
										d="M-1.5,2A3.5,3.5,0,0,1,2-1.5h8.5A3.5,3.5,0,0,1,14,2c0-.276-.9-.5-2-.5H2a.5.5,0,0,0-.5.5ZM14,14h0ZM2,14a3.5,3.5,0,0,1-3.5-3.5V2A3.5,3.5,0,0,1,2-1.5v3a.5.5,0,0,0-.5.5V12C1.5,13.1,1.724,14,2,14ZM14,0V0Z"
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: 'outset',
							description: 'Outset border',
							icon: (
								<g transform="translate(23.5 23.5) rotate(180)">
									<path
										d="M0,0H0ZM15.5,12A3.5,3.5,0,0,1,12,15.5H3.5A3.5,3.5,0,0,1,0,12c0,.276.9.5,2,.5H12a.5.5,0,0,0,.5-.5ZM0,14v0ZM12,0a3.5,3.5,0,0,1,3.5,3.5V12A3.5,3.5,0,0,1,12,15.5v-3a.5.5,0,0,0,.5-.5V2C12.5.9,12.276,0,12,0Z"
										strokeOpacity="0"
										opacity="0.5"
									/>
									<path
										d="M-1.5,2A3.5,3.5,0,0,1,2-1.5h8.5A3.5,3.5,0,0,1,14,2c0-.276-.9-.5-2-.5H2a.5.5,0,0,0-.5.5ZM14,14h0ZM2,14a3.5,3.5,0,0,1-3.5-3.5V2A3.5,3.5,0,0,1,2-1.5v3a.5.5,0,0,0-.5.5V12C1.5,13.1,1.724,14,2,14ZM14,0V0Z"
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: 'hidden',
							description: 'Hidden border',
							icon: <></>,
						},
					]}
					selected={style}
					onChange={v => onChangeCurry('Style')(v as string)}
					withBackground={true}
				/>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Color</div>
				<CommonColorPickerPropertyEditor
					color={{ value: color }}
					onChange={onChangeCurry('Color')}
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

			<div className="_combineEditors">
				<div className="_simpleLabel">Radius</div>
				<div className="_simpleEditor">
					<PixelSize value={borderRadius} onChange={onChangeBorderRadius} />
				</div>
			</div>
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'ALL',
							description: 'All Corners',
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
							name: 'TOP_LEFT',
							description: 'Top Left Corner',
							icon: (
								<g transform="translate(8 8)" transform-origin="7 7">
									<mask id="path-1-inside-1_3193_9193" fill="white">
										<path d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z" />
									</mask>
									<path
										d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z"
										strokeOpacity={0}
										className="_lowlight"
										// fill="#E3E5EA"
									/>
									<path
										d="M-1.5 5C-1.5 1.41015 1.41015 -1.5 5 -1.5H11.5C12.8807 -1.5 14 -0.380712 14 1V1.5C14 1.5 13.5523 1.5 13 1.5H5C3.067 1.5 1.5 3.067 1.5 5H-1.5ZM14 14H0H14ZM1 14C-0.380712 14 -1.5 12.8807 -1.5 11.5V5C-1.5 1.41015 1.41015 -1.5 5 -1.5V1.5C3.067 1.5 1.5 3.067 1.5 5V13C1.5 13.5523 1.5 14 1.5 14H1ZM14 0V14V0Z"
										// fill="#52BD94"
										strokeOpacity={0}
										className="_highlight"
										mask="url(#path-1-inside-1_3193_9193)"
									/>
								</g>
							),
						},
						{
							name: 'TOP_RIGHT',
							description: 'Top Right Corner',
							icon: (
								<g transform="translate(8 8) rotate(90)" transform-origin="7 7">
									<mask id="path-1-inside-1_3193_9193" fill="white">
										<path d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z" />
									</mask>
									<path
										d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z"
										strokeOpacity={0}
										className="_lowlight"
										// fill="#E3E5EA"
									/>
									<path
										d="M-1.5 5C-1.5 1.41015 1.41015 -1.5 5 -1.5H11.5C12.8807 -1.5 14 -0.380712 14 1V1.5C14 1.5 13.5523 1.5 13 1.5H5C3.067 1.5 1.5 3.067 1.5 5H-1.5ZM14 14H0H14ZM1 14C-0.380712 14 -1.5 12.8807 -1.5 11.5V5C-1.5 1.41015 1.41015 -1.5 5 -1.5V1.5C3.067 1.5 1.5 3.067 1.5 5V13C1.5 13.5523 1.5 14 1.5 14H1ZM14 0V14V0Z"
										// fill="#52BD94"
										strokeOpacity={0}
										className="_highlight"
										mask="url(#path-1-inside-1_3193_9193)"
									/>
								</g>
							),
						},
						{
							name: 'BOTTOM_LEFT',
							description: 'Bottom Left Corner',
							icon: (
								<g transform="translate(8 8) rotate(180)" transform-origin="7 7">
									<mask id="path-1-inside-1_3193_9193" fill="white">
										<path d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z" />
									</mask>
									<path
										d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z"
										strokeOpacity={0}
										className="_lowlight"
										// fill="#E3E5EA"
									/>
									<path
										d="M-1.5 5C-1.5 1.41015 1.41015 -1.5 5 -1.5H11.5C12.8807 -1.5 14 -0.380712 14 1V1.5C14 1.5 13.5523 1.5 13 1.5H5C3.067 1.5 1.5 3.067 1.5 5H-1.5ZM14 14H0H14ZM1 14C-0.380712 14 -1.5 12.8807 -1.5 11.5V5C-1.5 1.41015 1.41015 -1.5 5 -1.5V1.5C3.067 1.5 1.5 3.067 1.5 5V13C1.5 13.5523 1.5 14 1.5 14H1ZM14 0V14V0Z"
										// fill="#52BD94"
										strokeOpacity={0}
										className="_highlight"
										mask="url(#path-1-inside-1_3193_9193)"
									/>
								</g>
							),
						},
						{
							name: 'BOTTOM_RIGHT',
							description: 'Bottom Right Corner',
							icon: (
								<g transform="translate(8 8) rotate(270)" transform-origin="7 7">
									<mask id="path-1-inside-1_3193_9193" fill="white">
										<path d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z" />
									</mask>
									<path
										d="M0 5C0 2.23858 2.23858 0 5 0H13C13.5523 0 14 0.447715 14 1V13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V5Z"
										strokeOpacity={0}
										className="_lowlight"
										// fill="#E3E5EA"
									/>
									<path
										d="M-1.5 5C-1.5 1.41015 1.41015 -1.5 5 -1.5H11.5C12.8807 -1.5 14 -0.380712 14 1V1.5C14 1.5 13.5523 1.5 13 1.5H5C3.067 1.5 1.5 3.067 1.5 5H-1.5ZM14 14H0H14ZM1 14C-0.380712 14 -1.5 12.8807 -1.5 11.5V5C-1.5 1.41015 1.41015 -1.5 5 -1.5V1.5C3.067 1.5 1.5 3.067 1.5 5V13C1.5 13.5523 1.5 14 1.5 14H1ZM14 0V14V0Z"
										// fill="#52BD94"
										strokeOpacity={0}
										className="_highlight"
										mask="url(#path-1-inside-1_3193_9193)"
									/>
								</g>
							),
						},
					]}
					selected={borderRadiusMode}
					multiSelect={true}
					multipleValueType={SimpleEditorMultipleValueType.Array}
					multiSelectWithControl={true}
					onChange={v => {
						if (!Array.isArray(v)) return;
						if (v.length === 0 || v.includes(BorderRadiusMode.ALL) || v.length === 4) {
							setBorderRadiusMode([BorderRadiusMode.ALL]);
						} else {
							setBorderRadiusMode(v as BorderRadiusMode[]);
						}
					}}
					withBackground={true}
				/>
			</div>
		</>
	);
}

function BorderDetailedEditor({
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
	const [borderCollapse, setBorderCollapse] = useState<string>('separate');
	const [borderSpacingX, setBorderSpacingX] = useState<string>('');
	const [borderSpacingY, setBorderSpacingY] = useState<string>('');
	const [borderImage, setBorderImage] = useState<string>('');
	const [borderImageOutset, setBorderImageOutset] = useState<string>('');
	const [borderImageRepeat, setBorderImageRepeat] = useState<string>('');
	const [borderImageSliceValue, setBorderImageSliceValue] = useState<string>('');
	const [borderImageSliceFill, setBorderImageSliceFill] = useState<boolean>(false);
	const [borderImageSource, setBorderImageSource] = useState<string>('');
	const [borderImageWidth, setBorderImageWidth] = useState<string>('');

	const [logicalBorderRadiusMode, setLogicalBorderRadiusMode] = useState<
		Array<LogicalBorderRadiusMode>
	>([LogicalBorderRadiusMode.ALL]);
	const [logicalBorderRadius, setLogicalBorderRadius] = useState<string>('');

	const [advancedBorderMode, setAdvancedBorderMode] = useState<AdvancedBorderMode[]>([
		AdvancedBorderMode.ALL,
	]);
	const [advancedBorderWidth, setAdvancedBorderWidth] = useState<string>('');
	const [advancedBorderStyle, setAdvancedBorderStyle] = useState<string>('');
	const [advancedBorderColor, setAdvancedBorderColor] = useState<string>('');

	useEffect(() => {
		if (!selectedComponent) return;

		const collapseValue = extractValue({
			subComponentName,
			prop: 'borderCollapse',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		setBorderCollapse(collapseValue || 'separate');

		const spacingValue = extractValue({
			subComponentName,
			prop: 'borderSpacing',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		if (spacingValue) {
			const [x, y] = spacingValue.split(' ');
			setBorderSpacingX(x);
			setBorderSpacingY(y || x);
		}

		const borderImageValue = extractValue({
			subComponentName,
			prop: 'borderImage',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		setBorderImage(borderImageValue || '');

		const borderImageOutsetValue = extractValue({
			subComponentName,
			prop: 'borderImageOutset',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		setBorderImageOutset(borderImageOutsetValue || '');

		const borderImageRepeatValue = extractValue({
			subComponentName,
			prop: 'borderImageRepeat',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		setBorderImageRepeat(borderImageRepeatValue || '');

		const borderImageSliceValue = extractValue({
			subComponentName,
			prop: 'borderImageSlice',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		if (borderImageSliceValue) {
			const [value, fill] = borderImageSliceValue.split(' ');
			setBorderImageSliceValue(value);
			setBorderImageSliceFill(fill === 'fill');
		} else {
			setBorderImageSliceValue('');
			setBorderImageSliceFill(false);
		}

		const borderImageSourceValue = extractValue({
			subComponentName,
			prop: 'borderImageSource',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		setBorderImageSource(borderImageSourceValue || '');

		const borderImageWidthValue = extractValue({
			subComponentName,
			prop: 'borderImageWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;
		setBorderImageWidth(borderImageWidthValue || '');

		// Initialize advanced border properties
		const blockStartWidth = extractValue({
			subComponentName,
			prop: 'borderBlockStartWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const blockEndWidth = extractValue({
			subComponentName,
			prop: 'borderBlockEndWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const inlineStartWidth = extractValue({
			subComponentName,
			prop: 'borderInlineStartWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const inlineEndWidth = extractValue({
			subComponentName,
			prop: 'borderInlineEndWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		if (blockStartWidth || blockEndWidth || inlineStartWidth || inlineEndWidth) {
			const newMode: AdvancedBorderMode[] = [];
			if (blockStartWidth) newMode.push(AdvancedBorderMode.BLOCK_START);
			if (blockEndWidth) newMode.push(AdvancedBorderMode.BLOCK_END);
			if (inlineStartWidth) newMode.push(AdvancedBorderMode.INLINE_START);
			if (inlineEndWidth) newMode.push(AdvancedBorderMode.INLINE_END);
			setAdvancedBorderMode(newMode.length === 4 ? [AdvancedBorderMode.ALL] : newMode);
			setAdvancedBorderWidth(
				blockStartWidth || blockEndWidth || inlineStartWidth || inlineEndWidth,
			);
		}

		// Similar logic for style and color...
	}, [selectedComponent, subComponentName, iterateProps, pseudoState, selectorPref]);

	const onChangeBorderCollapse = (value: string) => {
		setBorderCollapse(value);
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'borderCollapse', value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const onChangeBorderSpacing = (x: string, y: string) => {
		setBorderSpacingX(x);
		setBorderSpacingY(y);
		const value = y ? `${x} ${y}` : x;
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'borderSpacing', value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const onChangeBorderImage = (value: string) => {
		setBorderImage(value);
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'borderImage', value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const onChangeProperty = (prop: string, value: string) => {
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop, value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const onChangeLogicalBorderRadius = (value: string) => {
		setLogicalBorderRadius(value);
		const newValues: { prop: string; value: string }[] = [];

		if (logicalBorderRadiusMode.includes(LogicalBorderRadiusMode.ALL)) {
			newValues.push({ prop: 'borderStartStartRadius', value });
			newValues.push({ prop: 'borderStartEndRadius', value });
			newValues.push({ prop: 'borderEndStartRadius', value });
			newValues.push({ prop: 'borderEndEndRadius', value });
		} else {
			for (const mode of logicalBorderRadiusMode) {
				switch (mode) {
					case LogicalBorderRadiusMode.START_START:
						newValues.push({ prop: 'borderStartStartRadius', value });
						break;
					case LogicalBorderRadiusMode.START_END:
						newValues.push({ prop: 'borderStartEndRadius', value });
						break;
					case LogicalBorderRadiusMode.END_START:
						newValues.push({ prop: 'borderEndStartRadius', value });
						break;
					case LogicalBorderRadiusMode.END_END:
						newValues.push({ prop: 'borderEndEndRadius', value });
						break;
				}
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

	const onChangeAdvancedBorder =
		(propType: string) => (value: string | ComponentProperty<string>) => {
			const newValues: { prop: string; value: string | ComponentProperty<string> }[] = [];

			if (advancedBorderMode.includes(AdvancedBorderMode.ALL)) {
				newValues.push({ prop: `borderBlockStart${propType}`, value });
				newValues.push({ prop: `borderBlockEnd${propType}`, value });
				newValues.push({ prop: `borderInlineStart${propType}`, value });
				newValues.push({ prop: `borderInlineEnd${propType}`, value });
			} else {
				for (const mode of advancedBorderMode) {
					switch (mode) {
						case AdvancedBorderMode.BLOCK_START:
							newValues.push({ prop: `borderBlockStart${propType}`, value });
							break;
						case AdvancedBorderMode.BLOCK_END:
							newValues.push({ prop: `borderBlockEnd${propType}`, value });
							break;
						case AdvancedBorderMode.INLINE_START:
							newValues.push({ prop: `borderInlineStart${propType}`, value });
							break;
						case AdvancedBorderMode.INLINE_END:
							newValues.push({ prop: `borderInlineEnd${propType}`, value });
							break;
					}
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
				<div className="_simpleEditor">
					<div className="_simpleLabel">Collapse:</div>
				</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'separate',
								description: 'Separate borders',
								icon: (
									<g transform="translate(9 9)">
										<rect
											width="14"
											height="14"
											rx="2"
											className="_lowlight"
											strokeOpacity="0"
										/>
										<rect
											x="2"
											y="2"
											width="10"
											height="10"
											rx="1"
											className="_highlight"
											strokeOpacity="0"
										/>
									</g>
								),
							},
							{
								name: 'collapse',
								description: 'Collapse borders',
								icon: (
									<g transform="translate(9 9)">
										<rect
											width="14"
											height="14"
											rx="2"
											className="_lowlight"
											strokeOpacity="0"
										/>
									</g>
								),
							},
						]}
						selected={borderCollapse}
						onChange={v => onChangeBorderCollapse(v as string)}
						withBackground={true}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Horizontal:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderSpacingX}
						onChange={value => {
							setBorderSpacingX(value); // Update horizontal spacing
							onChangeBorderSpacing(value, borderSpacingY); // Call with updated horizontal value
						}}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Vertical:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderSpacingY}
						onChange={value => {
							setBorderSpacingY(value); // Update vertical spacing
							onChangeBorderSpacing(borderSpacingX, value); // Call with current horizontal value
						}}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Image</div>
				{/* <div className="_simpleEditor">
					<input
						type="text"
						value={borderImage}
						onChange={e => onChangeBorderImage(e.target.value)}
						placeholder="url() / gradient"
					/>
				</div> */}
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Outset:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderImageOutset}
						onChange={value => {
							setBorderImageOutset(value);
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [{ prop: 'borderImageOutset', value }],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Repeat:</div>
				<div className="_simpleEditor">
					<Dropdown
						options={[
							{ name: 'stretch', displayName: 'Stretch' },
							{ name: 'repeat', displayName: 'Repeat' },
							{ name: 'round', displayName: 'Round' },
							{ name: 'space', displayName: 'Space' },
						]}
						value={borderImageRepeat}
						onChange={value => {
							setBorderImageRepeat(value as string);
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [{ prop: 'borderImageRepeat', value: value as string }],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Slice:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderImageSliceValue}
						onChange={value => {
							setBorderImageSliceValue(value);
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [
									{
										prop: 'borderImageSlice',
										value: `${value}${borderImageSliceFill ? ' fill' : ''}`,
									},
								],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Source:</div>
				<div className="_simpleEditor">
					<input
						type="text"
						value={borderImageSource}
						onChange={e => {
							setBorderImageSource(e.target.value);
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [{ prop: 'borderImageSource', value: e.target.value }],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
						placeholder="url() gradient none"
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Width:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderImageWidth}
						onChange={value => {
							setBorderImageWidth(value);
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [{ prop: 'borderImageWidth', value }],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
					/>
				</div>
			</div>

			<div className="_simpleLabel">Logical Border </div>

			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: LogicalBorderRadiusMode.ALL,
							description: 'All Sides',
							icon: (
								<>
									<rect
										width="14"
										height="14"
										rx="2"
										transform="translate(9 9)"
										className="_highlight"
										strokeOpacity="1"
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
							name: LogicalBorderRadiusMode.START_START,
							description: 'Start Start',
							icon: (
								// <g transform="translate(9 10)">
								// 	<rect
								// 		x="1"
								// 		y="0"
								// 		width="12"
								// 		height="12"
								// 		rx="2"
								// 		ry="2"
								// 		className="_lowlight"
								// 		strokeOpacity="0"
								// 	/>
								// 	<path
								// 		d="M9,0 L2,0 A2,2 0 0 0 0,2 L0,9 L2,9 L2,2 L9,2 Z"
								// 		className="_highlight"
								// 		strokeOpacity="0"
								// 	/>
								// </g>
								<g transform="translate(8 8) rotate(0)" transform-origin="7 7">
									<rect x="1" y="1" width="12" height="12" rx="1" />
									<mask id="path-2-inside-1_3197_8791" opacity={1}>
										<path d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z" />
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										className="_highlight"
										mask="url(#path-2-inside-1_3197_8791)"
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.START_END,
							description: 'Start End',
							icon: (
								<g transform="translate(8 8) rotate(90)" transform-origin="7 7">
									<rect x="1" y="1" width="12" height="12" rx="1" />
									<mask id="path-2-inside-1_3197_8791" opacity={1}>
										<path d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z" />
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										className="_highlight"
										mask="url(#path-2-inside-1_3197_8791)"
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.END_START,
							description: 'End Start',
							icon: (
								<g transform="translate(8 8) rotate(270)" transform-origin="7 7">
									<rect x="1" y="1" width="12" height="12" rx="1" />
									<mask id="path-2-inside-1_3197_8791" opacity={1}>
										<path d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z" />
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										className="_highlight"
										mask="url(#path-2-inside-1_3197_8791)"
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.END_END,
							description: 'End End',
							icon: (
								<g transform="translate(8 8) rotate(180)" transform-origin="7 7">
									<rect x="1" y="1" width="12" height="12" rx="1" />
									<mask id="path-2-inside-1_3197_8791" opacity={1}>
										<path d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z" />
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										className="_highlight"
										mask="url(#path-2-inside-1_3197_8791)"
									/>
								</g>
							),
						},
					]}
					selected={logicalBorderRadiusMode}
					multiSelect={true}
					multipleValueType={SimpleEditorMultipleValueType.Array}
					multiSelectWithControl={true}
					onChange={v => {
						if (!Array.isArray(v)) return;
						if (
							v.length === 0 ||
							v.includes(LogicalBorderRadiusMode.ALL) ||
							v.length === 4
						) {
							setLogicalBorderRadiusMode([LogicalBorderRadiusMode.ALL]);
						} else {
							setLogicalBorderRadiusMode(v as LogicalBorderRadiusMode[]);
						}
					}}
					withBackground={true}
				/>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Radius:</div>
				<div className="_simpleEditor">
					<PixelSize value={logicalBorderRadius} onChange={onChangeLogicalBorderRadius} />
				</div>
			</div>

			<div className="_simpleLabel">Block/Inline Style</div>

			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: AdvancedBorderMode.ALL,
							description: 'All Sides',
							icon: (
								<rect
									width="14"
									height="14"
									rx="2"
									transform="translate(9 9)"
									className="_highlight"
									strokeOpacity="0"
								/>
							),
						},
						{
							name: AdvancedBorderMode.BLOCK_START,
							description: 'Block Start',
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
										transform="translate(0 0)"
										className="_highlight"
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.BLOCK_END,
							description: 'Block End',
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
										transform="translate(0 12)"
										className="_highlight"
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.INLINE_START,
							description: 'Inline Start',
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
										width="2"
										height="14"
										rx="1"
										transform="translate(0 0)"
										className="_highlight"
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.INLINE_END,
							description: 'Inline End',
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
										width="2"
										height="14"
										rx="1"
										transform="translate(12 0)"
										className="_highlight"
										strokeOpacity="0"
									/>
								</g>
							),
						},
					]}
					selected={advancedBorderMode}
					multiSelect={true}
					multipleValueType={SimpleEditorMultipleValueType.Array}
					multiSelectWithControl={true}
					onChange={v => {
						if (!Array.isArray(v)) return;
						if (
							v.length === 0 ||
							v.includes(AdvancedBorderMode.ALL) ||
							v.length === 4
						) {
							setAdvancedBorderMode([AdvancedBorderMode.ALL]);
						} else {
							setAdvancedBorderMode(v as AdvancedBorderMode[]);
						}
					}}
					withBackground={true}
				/>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Width:</div>
				<div className="_simpleEditor">
					<PixelSize
						value={advancedBorderWidth}
						onChange={value => {
							setAdvancedBorderWidth(value);
							onChangeAdvancedBorder('Width')(value);
						}}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Style:</div>
				<div className="_simpleEditor">
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
								description: 'Dashed line border',
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
						]}
						selected={advancedBorderStyle}
						onChange={value => {
							setAdvancedBorderStyle(value as string);
							onChangeAdvancedBorder('Style')(value as string);
						}}
						withBackground={true}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Color:</div>
				<div className="_simpleEditor">
					<CommonColorPickerPropertyEditor
						color={{ value: advancedBorderColor }}
						onChange={value => {
							setAdvancedBorderColor(value.value ?? '');
							onChangeAdvancedBorder('Color')(value.value ?? '');
						}}
					/>
				</div>
			</div>
		</>
	);
}
