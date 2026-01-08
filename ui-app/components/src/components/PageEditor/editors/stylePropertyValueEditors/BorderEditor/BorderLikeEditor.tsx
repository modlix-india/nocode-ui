import React, { useEffect, useState } from 'react';
import { PixelSize } from '../simpleEditors/SizeSliders';
import { CommonColorPickerPropertyEditor } from '../../../../../commonComponents/CommonColorPicker';
import { ComponentProperty } from '../../../../../types/common';
import {
	extractValue,
	valuesChangedOnlyValues,
	SimpleEditorMultipleValueType,
	StyleEditorsProps,
} from '../simpleEditors';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { LikeEditorProps, colorIndex } from './common';

const ALL = 'all';

export function BorderLikeEditor({
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
	valueBagDirectionLabels = ['top', 'right', 'bottom', 'left'],
	valueBagDirectionLabelDescriptions = {
		top: 'Top Border',
		right: 'Right Border',
		bottom: 'Bottom Border',
		left: 'Left Border',
	},
	fixedDirectionLabel = 'top',
	showAdvancedLineStyles = true,
}: Readonly<StyleEditorsProps> & LikeEditorProps) {
	const [borderMode, setBorderMode] = useState<Array<string>>([ALL]);

	const valueBag: Record<string, Record<string, string>> = {};

	for (const direction of valueBagDirectionLabels) {
		for (const prop of ['Color', 'Style', 'Width']) {
			const value = extractValue({
				subComponentName,
				prop: 'border' + direction.slice(0, 1).toUpperCase() + direction.slice(1) + prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value;

			if (!value) continue;

			if (!valueBag[direction]) valueBag[direction] = {};
			valueBag[direction][prop.toLowerCase()] = value;
		}
	}

	useEffect(() => {
		if (!selectedComponent) return;

		if (
			!valueBag[valueBagDirectionLabels[0]] &&
			!valueBag[valueBagDirectionLabels[1]] &&
			!valueBag[valueBagDirectionLabels[2]] &&
			!valueBag[valueBagDirectionLabels[3]]
		) {
			setBorderMode([ALL]);
			return;
		}

		if (
			valueBag[valueBagDirectionLabels[0]] &&
			valueBag[valueBagDirectionLabels[1]] &&
			valueBag[valueBagDirectionLabels[2]] &&
			valueBag[valueBagDirectionLabels[3]]
		) {
			for (const direction of valueBagDirectionLabels.slice(1)) {
				if (
					valueBag[direction].color !== valueBag[fixedDirectionLabel].color ||
					valueBag[direction].style !== valueBag[fixedDirectionLabel].style ||
					valueBag[direction].width !== valueBag[fixedDirectionLabel].width
				) {
					setBorderMode([fixedDirectionLabel]);
					return;
				}
			}
			setBorderMode([ALL]);
			return;
		}

		if (valueBag[valueBagDirectionLabels[0]]) setBorderMode([valueBagDirectionLabels[0]]);
		else if (valueBag[valueBagDirectionLabels[1]]) setBorderMode([valueBagDirectionLabels[1]]);
		else if (valueBag[valueBagDirectionLabels[2]]) setBorderMode([valueBagDirectionLabels[2]]);
		else setBorderMode([valueBagDirectionLabels[3]]);
	}, [selectedComponent, setBorderMode]);

	let size: string | undefined = undefined;
	let style: string | undefined = undefined;
	let color: string | undefined = undefined;

	if (borderMode.includes(ALL)) {
		size =
			valueBag[valueBagDirectionLabels[0]]?.width ??
			valueBag[valueBagDirectionLabels[1]]?.width ??
			valueBag[valueBagDirectionLabels[2]]?.width ??
			valueBag[valueBagDirectionLabels[3]]?.width;
		style =
			valueBag[valueBagDirectionLabels[0]]?.style ??
			valueBag[valueBagDirectionLabels[1]]?.style ??
			valueBag[valueBagDirectionLabels[2]]?.style ??
			valueBag[valueBagDirectionLabels[3]]?.style;
		color =
			valueBag[valueBagDirectionLabels[0]]?.color ??
			valueBag[valueBagDirectionLabels[1]]?.color ??
			valueBag[valueBagDirectionLabels[2]]?.color ??
			valueBag[valueBagDirectionLabels[3]]?.color;
	} else {
		size = valueBag[borderMode[0]]?.width;
		style = valueBag[borderMode[0]]?.style;
		color = valueBag[borderMode[0]]?.color;
	}

	let topHighlightClass = '_highlight';
	let rightHighlightClass = '_highlight';
	let bottomHighlightClass = '_highlight';
	let leftHighlightClass = '_highlight';

	let indexOfIndexes: Record<string, number> = {};
	let index = 0;

	for (const direction of valueBagDirectionLabels) {
		const string = `${valueBag[direction]?.color ?? ''} ${valueBag[direction]?.style ?? ''} ${valueBag[direction]?.width ?? ''}`;
		if (indexOfIndexes[string] === undefined) {
			indexOfIndexes[string] = index;
			index++;
		}

		if (direction === valueBagDirectionLabels[0]) {
			topHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else if (direction === valueBagDirectionLabels[1]) {
			rightHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else if (direction === valueBagDirectionLabels[2]) {
			bottomHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		} else {
			leftHighlightClass += ' ' + colorIndex[indexOfIndexes[string]];
		}
	}

	const onChangeCurry = (propType: string) => (value: string | ComponentProperty<string>) => {
		const newValues: { prop: string; value: string | ComponentProperty<string> }[] = [];

		for (const direction of borderMode.includes(ALL) ? valueBagDirectionLabels : borderMode)
			newValues.push({
				prop: 'border' + direction[0].toUpperCase() + direction.slice(1) + propType,
				value: value,
			});

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

	let advancedLineStyles = <></>;

	if (showAdvancedLineStyles) {
		advancedLineStyles = (
			<>
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
			</>
		);
	}

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Width</div>
				<div className="_simpleEditor">
					<PixelSize autofocus={true} value={size} onChange={onChangeCurry('Width')} />
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleEditor">
					<div className="_simpleLabel">Basic</div>
				</div>
			</div>
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'none',
							description: 'None border',
							icon: (
								<g transform="translate(11 11)">
									<path
										d="M1,1,9,9"
										fill="none"
										strokeLinecap="round"
										strokeWidth="1.45"
									/>
									<path
										d="M1,9,9,1"
										fill="none"
										strokeLinecap="round"
										strokeWidth="1.45"
									/>
								</g>
							),
						},
						{
							name: 'solid',
							description: 'Solid line border',
							icon: (
								<path
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
								<g transform="translate(4.727 13)">
									<path
										d="M1.273,6H20.286"
										fill="none"
										strokeLinecap="square"
										strokeWidth="2"
									/>
									<path
										d="M1.273,1H20.286"
										fill="none"
										strokeLinecap="square"
										strokeWidth="2"
									/>
								</g>
							),
						},
						{
							name: 'dotted',
							description: 'Dotted line border',
							icon: (
								<path
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
			{advancedLineStyles}

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
							name: ALL,
							description: 'All',
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
										width="12"
										height="2"
										rx="1"
										transform="translate(13 0) rotate(180)"
										className={topHighlightClass}
										strokeOpacity="0"
									/>
									<rect
										width="12"
										height="2"
										rx="1"
										transform="translate(15 0) rotate(90)"
										className={rightHighlightClass}
										strokeOpacity="0"
									/>
									<rect
										width="12"
										height="2"
										rx="1"
										transform="translate(13 14) rotate(180)"
										className={bottomHighlightClass}
										strokeOpacity="0"
									/>
									<rect
										width="12"
										height="2"
										rx="1"
										transform="translate(1 0) rotate(90)"
										className={leftHighlightClass}
										strokeOpacity="0"
									/>
								</g>
							),
						},
						{
							name: valueBagDirectionLabels[0],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[0]],
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
							name: valueBagDirectionLabels[1],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[1]],
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
							name: valueBagDirectionLabels[2],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[2]],
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
							name: valueBagDirectionLabels[3],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[3]],
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
					onChange={v => setBorderMode(v as string[])}
					exclusiveOptions={[ALL]}
					combinationOptions={[
						{
							condition: valueBagDirectionLabels,
							name: [ALL],
						},
					]}
					withBackground={true}
				/>
			</div>
		</>
	);
}
