import React, { useEffect, useState } from 'react';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorType,
	StyleEditorsProps,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { PixelSize } from './simpleEditors/SizeSliders';

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
	const [borderMode, setBorderMode] = useState<BorderMode>(BorderMode.ALL);

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
			setBorderMode(BorderMode.ALL);
			return;
		}

		if (valueBag.top && valueBag.right && valueBag.bottom && valueBag.left) {
			for (const direction of ['right', 'bottom', 'left']) {
				if (
					valueBag[direction].color !== valueBag.top.color ||
					valueBag[direction].style !== valueBag.top.style ||
					valueBag[direction].width !== valueBag.top.width
				) {
					setBorderMode(BorderMode.TOP);
					return;
				}
			}
			setBorderMode(BorderMode.ALL);
			return;
		}

		if (valueBag.top) setBorderMode(BorderMode.TOP);
		else if (valueBag.right) setBorderMode(BorderMode.RIGHT);
		else if (valueBag.bottom) setBorderMode(BorderMode.BOTTOM);
		else setBorderMode(BorderMode.LEFT);
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

	if (borderMode === BorderMode.ALL) {
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
		size = valueBag[borderMode.toLowerCase()]?.width;
		style = valueBag[borderMode.toLowerCase()]?.style;
		color = valueBag[borderMode.toLowerCase()]?.color;
	}

	return (
		<>
			<div className="_simpleEditor">
				<PixelSize
					autofocus={true}
					value={size}
					onChange={(value: string) => {
						const newValues: { prop: string; value: string }[] = [];

						if (borderMode === BorderMode.ALL) {
							newValues.push({ prop: 'borderTopWidth', value: value });
							newValues.push({ prop: 'borderRightWidth', value: value });
							newValues.push({ prop: 'borderBottomWidth', value: value });
							newValues.push({ prop: 'borderLeftWidth', value: value });
						} else {
							newValues.push({
								prop:
									'border' +
									borderMode[0] +
									borderMode.slice(1).toLowerCase() +
									'Width',
								value: value,
							});
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
					}}
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
									<defs>
										<linearGradient
											id="boder-all-greenGradiant"
											x1="0.5"
											x2="0.5"
											y2="1"
											gradientUnits="objectBoundingBox"
										>
											<stop offset="0" stop-color="#7cd9b6" />
											<stop offset="1" stop-color="#52bd94" />
										</linearGradient>
									</defs>

									<rect
										width="14"
										height="14"
										rx="2"
										transform="translate(9 9)"
										style={{ fill: 'url(#boder-all-greenGradiant)' }}
										strokeOpacity="0"
									/>

									<rect
										x="1.5"
										y="1.5"
										width="11"
										height="11"
										transform="translate(9 9)"
										rx="1"
										style={{ fill: '#e3e5ea' }}
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
										style={{ fill: '#e3e5ea' }}
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										style={{ fill: '#02b694' }}
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
										style={{ fill: '#e3e5ea' }}
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										style={{ fill: '#02b694' }}
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
										style={{ fill: '#e3e5ea' }}
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										style={{ fill: '#02b694' }}
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
										style={{ fill: '#e3e5ea' }}
										strokeOpacity="0"
									/>
									<rect
										width="14"
										height="2"
										rx="1"
										transform="translate(14 2) rotate(180)"
										style={{ fill: '#02b694' }}
										strokeOpacity="0"
									/>
								</g>
							),
							transform: 'rotate(270)',
						},
					]}
					selected={'' + borderMode}
					onChange={v => setBorderMode(v as BorderMode)}
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
