import React from 'react';
import { extractValue, StyleEditorsProps, valuesChangedOnlyValues } from '../simpleEditors';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { ComponentProperty } from '../../../../../types/common';
import { PixelSize } from '../simpleEditors/SizeSliders';

export function BorderCollapseEditor(props: Readonly<StyleEditorsProps>) {
	const {
		selectedComponent,
		subComponentName,
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponentsList,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;

	let borderCollapse = extractValue({
		subComponentName,
		prop: 'borderCollapse',
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponent,
	})?.value?.value;

	const borderSpacing = extractValue({
		subComponentName,
		prop: 'borderSpacing',
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponent,
	})?.value?.value;

	const borderSpacingSplit = borderSpacing?.split(' ') ?? [];
	const borderSpacingX = borderSpacingSplit[0] ?? '';
	const borderSpacingY = borderSpacingSplit[1] ?? undefined;

	const onChangeCurry =
		(prop: string) => (value: string | string[] | ComponentProperty<string>) => {
			const newValues: { prop: string; value: string | ComponentProperty<string> }[] = [];

			if (Array.isArray(value)) value = value.join(' ');

			newValues.push({
				prop,
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

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleEditor">
					<div className="_simpleLabel">Collapse</div>
				</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'separate',
								description: 'Separate borders',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M8.80078 9C8.80078 8.44772 9.2485 8 9.80078 8H12.6008C13.1531 8 13.6008 8.44772 13.6008 9V13C13.6008 13.5523 13.1531 14 12.6008 14H8.80078V9Z"
											className="_lowlight"
											strokeOpacity={0}
										/>
										<mask id="path-2-inside-1_0_1" fill="white">
											<path d="M7.80078 10C7.80078 8.89543 8.69621 8 9.80078 8H13.6008V13C13.6008 13.5523 13.1531 14 12.6008 14H7.80078V10Z" />
										</mask>
										<path
											d="M6.80078 10C6.80078 8.34315 8.14393 7 9.80078 7H13.6008V9H9.80078C9.2485 9 8.80078 9.44772 8.80078 10H6.80078ZM13.6008 14H7.80078H13.6008ZM6.80078 14V10C6.80078 8.34315 8.14393 7 9.80078 7V9C9.2485 9 8.80078 9.44772 8.80078 10V14H6.80078ZM13.6008 8V14V8Z"
											className="_highlight"
											strokeOpacity={0}
											mask="url(#path-2-inside-1_0_1)"
										/>

										<path
											d="M8.80078 5C8.80078 5.55228 9.2485 6 9.80078 6H12.6008C13.1531 6 13.6008 5.55228 13.6008 5V1C13.6008 0.447715 13.1531 0 12.6008 0H8.80078V5Z"
											className="_lowlight"
											strokeOpacity={0}
										/>
										<mask id="path-5-inside-2_0_1" fill="white">
											<path d="M7.80078 4C7.80078 5.10457 8.69621 6 9.80078 6H13.6008V1C13.6008 0.447715 13.1531 0 12.6008 0H7.80078V4Z" />
										</mask>
										<path
											d="M6.80078 4C6.80078 5.65685 8.14393 7 9.80078 7H13.6008V5H9.80078C9.2485 5 8.80078 4.55228 8.80078 4H6.80078ZM13.6008 0H7.80078H13.6008ZM6.80078 0V4C6.80078 5.65685 8.14393 7 9.80078 7V5C9.2485 5 8.80078 4.55228 8.80078 4V0H6.80078ZM13.6008 6V0V6Z"
											className="_highlight"
											strokeOpacity={0}
											mask="url(#path-5-inside-2_0_1)"
										/>
										<path
											d="M4.80078 9C4.80078 8.44772 4.35307 8 3.80078 8H1.00078C0.448496 8 0.000781059 8.44772 0.000781059 9V13C0.000781059 13.5523 0.448496 14 1.00078 14H4.80078V9Z"
											className="_lowlight"
											strokeOpacity={0}
										/>
										<mask id="path-8-inside-3_0_1" fill="white">
											<path d="M5.80078 10C5.80078 8.89543 4.90535 8 3.80078 8H0.000781059V13C0.000781059 13.5523 0.448496 14 1.00078 14H5.80078V10Z" />
										</mask>
										<path
											d="M6.80078 10C6.80078 8.34315 5.45764 7 3.80078 7H0.000781059V9H3.80078C4.35307 9 4.80078 9.44772 4.80078 10H6.80078ZM0.000781059 14H5.80078H0.000781059ZM6.80078 14V10C6.80078 8.34315 5.45764 7 3.80078 7V9C4.35307 9 4.80078 9.44772 4.80078 10V14H6.80078ZM0.000781059 8V14V8Z"
											className="_highlight"
											strokeOpacity={0}
											mask="url(#path-8-inside-3_0_1)"
										/>
										<path
											d="M4.80078 5C4.80078 5.55228 4.35307 6 3.80078 6H1.00078C0.448496 6 0.000781059 5.55228 0.000781059 5V1C0.000781059 0.447715 0.448496 0 1.00078 0H4.80078V5Z"
											className="_lowlight"
											strokeOpacity={0}
										/>
										<mask id="path-11-inside-4_0_1" fill="white">
											<path d="M5.80078 4C5.80078 5.10457 4.90535 6 3.80078 6H0.000781059V1C0.000781059 0.447715 0.448496 0 1.00078 0H5.80078V4Z" />
										</mask>
										<path
											d="M6.80078 4C6.80078 5.65685 5.45764 7 3.80078 7H0.000781059V5H3.80078C4.35307 5 4.80078 4.55228 4.80078 4H6.80078ZM0.000781059 0H5.80078H0.000781059ZM6.80078 0V4C6.80078 5.65685 5.45764 7 3.80078 7V5C4.35307 5 4.80078 4.55228 4.80078 4V0H6.80078ZM0.000781059 6V0V6Z"
											className="_highlight"
											strokeOpacity={0}
											mask="url(#path-11-inside-4_0_1)"
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
											rx="1"
											transform="matrix(1 0 0 -1 0 14)"
											className="_lowlight"
											strokeOpacity={0}
										/>
										<path
											d="M7 0V14"
											stroke="#999999"
											strokeOpacity="0.7"
											strokeWidth="1.5"
											fillOpacity={0}
											className="_highlight"
										/>
										<path
											d="M14 7L0 7"
											stroke="#999999"
											strokeOpacity="10.7"
											strokeWidth="1.5"
											fillOpacity={0}
											className="_highlight"
										/>
									</g>
								),
							},
						]}
						selected={borderCollapse ?? 'separate'}
						onChange={onChangeCurry('borderCollapse')}
						withBackground={true}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Horizontal</div>
			</div>
			<div className="_simpleEditor">
				<PixelSize
					value={borderSpacingX}
					onChange={value => {
						if (borderSpacingY) value = value + ' ' + borderSpacingY;
						onChangeCurry('borderSpacing')(value);
					}}
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Vertical</div>
			</div>
			<div className="_simpleEditor">
				<PixelSize
					value={borderSpacingY ?? borderSpacingX}
					onChange={value => {
						if (borderSpacingX) value = borderSpacingX + ' ' + value;
						onChangeCurry('borderSpacing')(value);
					}}
				/>
			</div>
		</>
	);
}
