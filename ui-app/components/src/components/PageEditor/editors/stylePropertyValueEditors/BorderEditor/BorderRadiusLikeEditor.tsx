import React, { useEffect, useState } from 'react';
import {
	SimpleEditorMultipleValueType,
	StyleEditorsProps,
	extractValue,
	valuesChangedOnlyValues,
} from '../simpleEditors';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { PixelSize } from '../simpleEditors/SizeSliders';
import { LikeEditorProps, colorIndex } from './common';

const ALL = 'all';

export function BorderRadiusLikeEditor({
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
	valueBagDirectionLabels = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
	valueBagDirectionLabelDescriptions = {
		topLeft: 'Top Left Radius',
		topRight: 'Top Right Radius',
		bottomRight: 'Bottom Right Radius',
		bottomLeft: 'Bottom Left Radius',
	},
	fixedDirectionLabel = 'topLeft',
	showEllipticalRadius = false,
}: Readonly<StyleEditorsProps> & LikeEditorProps) {
	const [borderRadiusMode, setBorderRadiusMode] = useState<Array<string>>([ALL]);

	const borderRadiusValueBag: Record<string, string> = {};

	let topLeftHighlightClass = '_highlight';
	let topRightHighlightClass = '_highlight';
	let bottomLeftHighlightClass = '_highlight';
	let bottomRightHighlightClass = '_highlight';

	let indexOfIndexes: Record<string, number> = {};
	let index = 0;

	for (const direction of valueBagDirectionLabels) {
		const value =
			extractValue({
				subComponentName,
				prop:
					'border' + direction.slice(0, 1).toUpperCase() + direction.slice(1) + 'Radius',
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value ?? '';

		if (indexOfIndexes[value] === undefined) {
			indexOfIndexes[value] = index;
			index++;
		}

		if (direction === valueBagDirectionLabels[0]) {
			topLeftHighlightClass += ' ' + colorIndex[indexOfIndexes[value]];
		} else if (direction === valueBagDirectionLabels[1]) {
			topRightHighlightClass += ' ' + colorIndex[indexOfIndexes[value]];
		} else if (direction === valueBagDirectionLabels[2]) {
			bottomLeftHighlightClass += ' ' + colorIndex[indexOfIndexes[value]];
		} else {
			bottomRightHighlightClass += ' ' + colorIndex[indexOfIndexes[value]];
		}

		if (value) borderRadiusValueBag[direction] = value;
	}

	useEffect(() => {
		if (!selectedComponent) return;

		if (
			!borderRadiusValueBag[valueBagDirectionLabels[0]] &&
			!borderRadiusValueBag[valueBagDirectionLabels[1]] &&
			!borderRadiusValueBag[valueBagDirectionLabels[2]] &&
			!borderRadiusValueBag[valueBagDirectionLabels[3]]
		) {
			setBorderRadiusMode([ALL]);
			return;
		}

		if (
			borderRadiusValueBag[valueBagDirectionLabels[0]] &&
			borderRadiusValueBag[valueBagDirectionLabels[1]] &&
			borderRadiusValueBag[valueBagDirectionLabels[2]] &&
			borderRadiusValueBag[valueBagDirectionLabels[3]]
		) {
			for (const direction of valueBagDirectionLabels.slice(1)) {
				if (borderRadiusValueBag[direction] !== borderRadiusValueBag[fixedDirectionLabel]) {
					setBorderRadiusMode([ALL]);
					return;
				}
			}
			setBorderRadiusMode([ALL]);
			return;
		}

		if (borderRadiusValueBag[valueBagDirectionLabels[0]])
			setBorderRadiusMode([valueBagDirectionLabels[0]]);
		else if (borderRadiusValueBag[valueBagDirectionLabels[1]])
			setBorderRadiusMode([valueBagDirectionLabels[1]]);
		else if (borderRadiusValueBag[valueBagDirectionLabels[2]])
			setBorderRadiusMode([valueBagDirectionLabels[2]]);
		else setBorderRadiusMode([valueBagDirectionLabels[3]]);
	}, [selectedComponent, setBorderRadiusMode]);

	let borderRadius =
		(borderRadiusMode.includes(ALL)
			? borderRadiusValueBag[valueBagDirectionLabels[0]]
			: borderRadiusValueBag[borderRadiusMode[0]]) ?? '';

	let ellipticalRadius = '';
	if (showEllipticalRadius) {
		const spaceIndex = borderRadius.indexOf(' ');
		if (spaceIndex !== -1) {
			ellipticalRadius = borderRadius.slice(spaceIndex + 1);
			borderRadius = borderRadius.slice(0, spaceIndex);
		} else {
			ellipticalRadius = borderRadius;
		}
	}

	const onChangeBorderRadius = (value: string) => {
		const newValues: { prop: string; value: string }[] = [];

		for (const mode of borderRadiusMode.includes(ALL)
			? valueBagDirectionLabels
			: borderRadiusMode)
			newValues.push({
				prop: 'border' + mode.slice(0, 1).toUpperCase() + mode.slice(1) + 'Radius',
				value,
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

	let ellipticalRadiusComp = null;
	if (showEllipticalRadius) {
		ellipticalRadiusComp = (
			<>
				<div className="_simpleLabel">Elliptical</div>
				<div className="_simpleEditor">
					<PixelSize
						value={ellipticalRadius}
						onChange={v => onChangeBorderRadius(borderRadius + ' ' + v)}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Radius</div>
			</div>
			<div className="_simpleEditor">
				<PixelSize
					value={borderRadius}
					onChange={v => {
						if (showEllipticalRadius && v != ellipticalRadius)
							v = v + ' ' + ellipticalRadius;
						onChangeBorderRadius(v);
					}}
				/>
			</div>

			{ellipticalRadiusComp}
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'all',
							description: 'All',
							icon: (
								<g transform="translate(-544 -226)">
									<path
										d="M-151-2543v-6h2.5a3.5,3.5,0,0,1,3.5,3.5v2.5Z"
										transform="translate(713 2783)"
										strokeOpacity="0"
										className={topRightHighlightClass}
									/>
									<path
										d="M0,6V0H6V2.5A3.5,3.5,0,0,1,2.5,6Z"
										transform="translate(558 240) rotate(180)"
										strokeOpacity="0"
										className={topLeftHighlightClass}
									/>
									<path
										d="M0,6V0H6V2.5A3.5,3.5,0,0,1,2.5,6Z"
										transform="translate(562 244)"
										strokeOpacity="0"
										className={bottomRightHighlightClass}
									/>
									<path
										d="M0,6V0H2.5A3.5,3.5,0,0,1,6,3.5V6Z"
										transform="translate(558 249.999) rotate(180)"
										strokeOpacity="0"
										className={bottomLeftHighlightClass}
									/>
									<rect
										width="12"
										height="12"
										rx="2"
										transform="translate(554 236)"
										strokeOpacity="0"
										className="_lowlight"
									/>
								</g>
							),
						},
						{
							name: valueBagDirectionLabels[0],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[0]],
							icon: (
								<g transform="translate(-543 -225)">
									<path
										d="M-2,6V-2H6V2.5A3.5,3.5,0,0,1,2.5,6Z"
										transform="translate(558 240) rotate(180)"
										strokeOpacity="0"
										className={topLeftHighlightClass}
									/>
									<rect
										width="12"
										height="12"
										rx="2"
										transform="translate(554 236)"
										strokeOpacity="0"
										className="_lowlight"
									/>
								</g>
							),
						},
						{
							name: valueBagDirectionLabels[1],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[1]],
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M0,8V0H4.5A3.5,3.5,0,0,1,8,3.5V8Z"
										transform="translate(6 0)"
										strokeOpacity="0"
										className={topRightHighlightClass}
									/>
									<rect
										width="12"
										height="12"
										rx="2"
										transform="translate(0 2)"
										strokeOpacity="0"
										className="_lowlight"
									/>
								</g>
							),
						},
						{
							name: valueBagDirectionLabels[2],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[2]],
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M0,8V0H4.5A3.5,3.5,0,0,1,8,3.5V8Z"
										transform="translate(8 14) rotate(180)"
										strokeOpacity="0"
										className={bottomLeftHighlightClass}
									/>
									<rect
										width="12"
										height="12"
										rx="2"
										transform="translate(2 0)"
										strokeOpacity="0"
										className="_lowlight"
									/>
								</g>
							),
						},
						{
							name: valueBagDirectionLabels[3],
							description:
								valueBagDirectionLabelDescriptions[valueBagDirectionLabels[3]],
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M0,8V0H8V4.5A3.5,3.5,0,0,1,4.5,8Z"
										transform="translate(6 6)"
										strokeOpacity="0"
										className={bottomRightHighlightClass}
									/>
									<rect
										width="12"
										height="12"
										rx="2"
										transform="translate(0 0)"
										strokeOpacity="0"
										className="_lowlight"
									/>
								</g>
							),
						},
					]}
					selected={borderRadiusMode}
					multiSelect={true}
					multipleValueType={SimpleEditorMultipleValueType.Array}
					multiSelectWithControl={true}
					withBackground={true}
					onChange={v => setBorderRadiusMode(v as string[])}
					exclusiveOptions={[ALL]}
					combinationOptions={[
						{
							condition: valueBagDirectionLabels,
							name: [ALL],
						},
					]}
				/>
			</div>
		</>
	);
}
