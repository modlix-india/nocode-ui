import React, { useEffect, useState } from 'react';
import { CommonColorPickerPropertyEditor } from '../../../../../commonComponents/CommonColorPicker';
import { ComponentProperty } from '../../../../../types/common';
import {
	extractValue,
	SimpleEditorMultipleValueType,
	StyleEditorsProps,
	valuesChangedOnlyValues,
} from '../simpleEditors';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { PixelSize } from '../simpleEditors/SizeSliders';
import { BorderLikeEditor } from './BorderLikeEditor';
import { BorderRadiusLikeEditor } from './BorderRadiusLikeEditor';

export function BorderEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <BorderDetailedEditor2 {...props} />;
	}

	return <BorderStandardEditor {...props} />;
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

function BorderStandardEditor(props: Readonly<StyleEditorsProps>) {
	return (
		<>
			<BorderLikeEditor {...props} />
			<BorderRadiusLikeEditor {...props} />
		</>
	);
}

function BorderDetailedEditor2(props: Readonly<StyleEditorsProps>) {
	// const {
	// 	selectedComponent,
	// 	subComponentName,
	// 	iterateProps,
	// 	pseudoState,
	// 	selectorPref,
	// 	selectedComponentsList,
	// 	defPath,
	// 	locationHistory,
	// 	pageExtractor,
	// 	styleProps,
	// 	saveStyle,
	// 	properties,
	// } = props;

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Block/Inline Style</div>
			</div>
			<BorderLikeEditor
				{...props}
				fixedDirectionLabel="blockStart"
				valueBagDirectionLabels={['blockStart', 'blockEnd', 'inlineStart', 'inlineEnd']}
				valueBagDirectionLabelDescriptions={{
					blockStart: 'Block Start',
					blockEnd: 'Block End',
					inlineStart: 'Inline Start',
					inlineEnd: 'Inline End',
				}}
				showAdvancedLineStyles={false}
			/>
			<div className="_combineEditors">
				<div className="_simpleLabel">Logical Border Radius</div>
			</div>
			<BorderRadiusLikeEditor
				{...props}
				fixedDirectionLabel="startStart"
				valueBagDirectionLabels={['startStart', 'startEnd', 'endStart', 'endEnd']}
				valueBagDirectionLabelDescriptions={{
					startStart: 'Start Start',
					startEnd: 'Start End',
					endStart: 'End Start',
					endEnd: 'End End',
				}}
				showEllipticalRadius={true}
			/>
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

		const extractAndSetValue = (
			prop: string,
			setter: (value: string) => void,
			defaultValue = '',
		) => {
			const value = extractValue({
				subComponentName,
				prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value;
			setter(value || defaultValue);
		};

		extractAndSetValue('borderCollapse', setBorderCollapse, 'separate');

		extractAndSetValue('borderSpacing', value => {
			if (value) {
				const [x, y] = value.split(' ');
				setBorderSpacingX(x);
				setBorderSpacingY(y || x);
			} else {
				setBorderSpacingX('');
				setBorderSpacingY('');
			}
		});

		extractAndSetValue('borderImage', setBorderImage);
		extractAndSetValue('borderImageOutset', setBorderImageOutset);
		extractAndSetValue('borderImageRepeat', setBorderImageRepeat);

		extractAndSetValue('borderImageSlice', value => {
			if (value) {
				const [sliceValue, fill] = value.split(' ');
				setBorderImageSliceValue(sliceValue);
				setBorderImageSliceFill(fill === 'fill');
			} else {
				setBorderImageSliceValue('');
				setBorderImageSliceFill(false);
			}
		});

		extractAndSetValue('borderImageSource', setBorderImageSource);
		extractAndSetValue('borderImageWidth', setBorderImageWidth);

		// Initialize advanced border properties
		const advancedBorderProps = ['blockStart', 'blockEnd', 'inlineStart', 'inlineEnd'];
		const newMode: AdvancedBorderMode[] = [];
		let widthValue = '';

		advancedBorderProps.forEach(prop => {
			extractAndSetValue(
				`border${prop.charAt(0).toUpperCase() + prop.slice(1)}Width`,
				value => {
					if (value) {
						newMode.push(
							AdvancedBorderMode[
								prop.toUpperCase() as keyof typeof AdvancedBorderMode
							],
						);
						widthValue = widthValue || value;
					}
				},
			);
		});

		setAdvancedBorderMode(newMode.length === 4 ? [AdvancedBorderMode.ALL] : newMode);
		setAdvancedBorderWidth(widthValue);
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
										/>
										<path
											d="M14 7L0 7"
											stroke="#999999"
											strokeOpacity="10.7"
											strokeWidth="1.5"
											fillOpacity={0}
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
				<div className="_simpleLabel">Horizontal</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderSpacingX}
						onChange={value => {
							setBorderSpacingX(value);
							onChangeBorderSpacing(value, borderSpacingY);
						}}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Vertical</div>
				<div className="_simpleEditor">
					<PixelSize
						value={borderSpacingY}
						onChange={value => {
							setBorderSpacingY(value);
							onChangeBorderSpacing(borderSpacingX, value);
						}}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Image Properties</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Source:</div>
				<div className="_simpleEditor">
					<input
						type="text"
						value={borderImageSource}
						className="_simpleEditorInput"
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
						placeholder=""
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

			<div className="_combineEditors">
				<div className="_simpleLabel">Outset</div>
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
				<div className="_simpleLabel">Repeat</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'none',
								description: 'None',
								icon: (
									<g transform=" translate(11 11)">
										<path
											d="M1 1L9 9"
											strokeWidth="1.45"
											strokeLinecap="round"
										/>
										<path
											d="M1 9L9 1"
											strokeWidth="1.45"
											strokeLinecap="round"
										/>
									</g>
								),
							},
							{
								name: 'stretch',
								description: 'Stretch',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M0.201211 13.8041C0.0613179 13.6641 -0.0226178 13.4402 0.00536074 13.2443L0.369082 9.32579C0.397061 8.93394 0.760782 8.65405 1.1245 8.68204C1.5162 8.71003 1.79599 9.0459 1.76801 9.43775L1.57216 11.425L5.0415 7.95432C5.32129 7.67442 5.76894 7.67442 6.02075 7.95432C6.30054 8.23421 6.30054 8.68204 6.02075 8.93394L2.57939 12.4326L4.56587 12.2367C4.95756 12.2087 5.29331 12.4886 5.32129 12.8804C5.34927 13.2723 5.06948 13.6082 4.67778 13.6361L0.760782 14C0.732803 14 0.704825 14 0.704825 14C0.508975 14 0.341103 13.916 0.201211 13.8041ZM13.2392 0.00536279L9.32222 0.369223C8.93052 0.397213 8.65073 0.733084 8.67871 1.12493C8.70669 1.51678 9.07041 1.79668 9.43414 1.76869L11.4206 1.57276L7.95127 5.07142C7.67148 5.35131 7.67148 5.79914 7.95127 6.05105C8.09116 6.19099 8.25904 6.24697 8.45489 6.24697C8.65073 6.24697 8.81861 6.19099 8.9585 6.05105L12.4278 2.58038L12.232 4.56761C12.204 4.95946 12.4838 5.29534 12.8755 5.32332C12.9035 5.32332 12.9315 5.32332 12.9315 5.32332C13.2952 5.32332 13.6029 5.04343 13.6309 4.67957L13.9946 0.761073C14.0226 0.565148 13.9387 0.341234 13.7988 0.201288C13.6309 0.0613413 13.4351 -0.0226265 13.2392 0.00536279Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<path
											d="M13.8041 13.8066C13.6641 13.9465 13.4402 14.0304 13.2443 14.0025L9.32579 13.6387C8.93394 13.6108 8.65405 13.247 8.68204 12.8833C8.71003 12.4916 9.0459 12.2118 9.43775 12.2398L11.425 12.4357L7.95432 8.96631C7.67442 8.68653 7.67442 8.23887 7.95432 7.98706C8.23421 7.70728 8.68204 7.70728 8.93394 7.98706L12.4326 11.4284L12.2367 9.44195C12.2087 9.05025 12.4886 8.7145 12.8804 8.68653C13.2723 8.65855 13.6082 8.93833 13.6361 9.33003L14 13.247C14 13.275 14 13.303 14 13.303C14 13.4988 13.916 13.6667 13.8041 13.8066ZM0.00536279 0.768594L0.369223 4.68559C0.397213 5.07729 0.733084 5.35708 1.12493 5.3291C1.51678 5.30112 1.79668 4.9374 1.76869 4.57368L1.57276 2.5872L5.07142 6.05654C5.35131 6.33633 5.79914 6.33633 6.05105 6.05654C6.19099 5.91665 6.24697 5.74878 6.24697 5.55293C6.24697 5.35708 6.19099 5.18921 6.05105 5.04931L2.58038 1.57997L4.56761 1.77582C4.95946 1.8038 5.29534 1.52401 5.32332 1.13231C5.32332 1.10434 5.32332 1.07636 5.32332 1.07636C5.32332 0.712637 5.04343 0.404872 4.67957 0.376894L0.761073 0.0131731C0.565148 -0.0148058 0.341234 0.0691299 0.201288 0.209023C0.0613413 0.376894 -0.0226265 0.572744 0.00536279 0.768594Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
									</g>
								),
							},
							{
								name: 'repeat',
								description: 'Repeat',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M5.95985 1.63718C6.7393 1.45122 7.55465 1.48086 8.31853 1.72294C9.08241 1.96501 9.76602 2.41039 10.2961 3.01134C10.3627 3.08633 10.4433 3.14747 10.5335 3.19128C10.6237 3.23509 10.7217 3.2607 10.8218 3.26665C10.9219 3.27261 11.0222 3.25879 11.1169 3.22599C11.2117 3.19318 11.299 3.14204 11.374 3.07547C11.449 3.0089 11.5102 2.92821 11.554 2.83801C11.5978 2.74781 11.6234 2.64987 11.6293 2.54977C11.6353 2.44968 11.6215 2.34939 11.5887 2.25463C11.5559 2.15987 11.5047 2.07251 11.4382 1.99752C10.7236 1.19179 9.80332 0.595622 8.77589 0.272868C7.74845 -0.0498862 6.65257 -0.0870676 5.60563 0.165306C4.54379 0.430248 3.56996 0.96893 2.78125 1.72763C1.99254 2.48634 1.41651 3.43855 1.1106 4.48932C1.09966 4.52363 1.07737 4.5532 1.04741 4.57317C1.01745 4.59315 0.981583 4.60234 0.945704 4.59926L0.334967 4.51986C0.279215 4.5116 0.222265 4.51994 0.171219 4.54383C0.120174 4.56773 0.0772921 4.60612 0.0479212 4.65422C0.0166698 4.70128 0 4.75652 0 4.81301C0 4.86951 0.0166698 4.92474 0.0479212 4.9718L1.55644 7.62851C1.5817 7.66874 1.61566 7.7028 1.65583 7.72817C1.69599 7.75353 1.74134 7.76957 1.78852 7.77509C1.83545 7.78071 1.88304 7.77536 1.92756 7.75946C1.97207 7.74357 2.01228 7.71756 2.04503 7.68348L4.16429 5.49093C4.20537 5.4517 4.23416 5.40137 4.24718 5.34607C4.26019 5.29078 4.25685 5.23289 4.23758 5.17946C4.21527 5.11739 4.17346 5.06422 4.11842 5.02789C4.06337 4.99156 3.99805 4.97402 3.93221 4.97791L2.78402 4.83134C2.75114 4.81714 2.72493 4.79093 2.71073 4.75805C2.70004 4.73836 2.69444 4.71632 2.69444 4.69392C2.69444 4.67152 2.70004 4.64948 2.71073 4.62979C2.96441 3.90223 3.39365 3.24847 3.9604 2.72646C4.52715 2.20445 5.21393 1.8303 5.95985 1.63718Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<path
											d="M13.9544 7.23414C13.9842 7.18654 14 7.13151 14 7.07535C14 7.01919 13.9842 6.96416 13.9544 6.91656L12.4276 4.27207C12.4046 4.23187 12.3729 4.19731 12.3349 4.1709C12.2969 4.14449 12.2534 4.12689 12.2077 4.11938C12.1599 4.11373 12.1114 4.11904 12.0659 4.13491C12.0204 4.15078 11.9791 4.1768 11.9451 4.21099L9.83806 6.42186C9.79928 6.46256 9.77248 6.51318 9.76063 6.56814C9.74877 6.6231 9.75232 6.68026 9.77088 6.73333C9.78912 6.78727 9.82237 6.83488 9.86673 6.87058C9.91108 6.90628 9.9647 6.92858 10.0213 6.93488L11.1511 7.06924C11.1769 7.07551 11.2006 7.08838 11.2199 7.10659C11.2391 7.12479 11.2533 7.1477 11.2611 7.17307C11.2718 7.19275 11.2774 7.21479 11.2774 7.23719C11.2774 7.25959 11.2718 7.28164 11.2611 7.30132C11.0051 8.03175 10.5722 8.68738 10.0009 9.20961C9.42968 9.73183 8.73794 10.1044 7.98753 10.2939C7.20712 10.479 6.39112 10.449 5.62644 10.207C4.86175 9.96503 4.17703 9.52015 3.64519 8.91977C3.58155 8.83657 3.50147 8.76735 3.40992 8.71643C3.31838 8.6655 3.21733 8.63397 3.11308 8.62377C3.00882 8.61358 2.90358 8.62496 2.80391 8.65719C2.70424 8.68942 2.61226 8.74183 2.53372 8.81113C2.45517 8.88044 2.39172 8.96517 2.34733 9.06005C2.30294 9.15494 2.27855 9.25794 2.27568 9.36266C2.27281 9.46737 2.29152 9.57156 2.33065 9.66873C2.36977 9.7659 2.42848 9.85398 2.50311 9.92749C3.06036 10.5609 3.74623 11.0684 4.51501 11.4159C5.28379 11.7634 6.11781 11.9431 6.96149 11.9429C7.42445 11.9423 7.8857 11.887 8.33565 11.778C9.40177 11.5125 10.3791 10.9707 11.1693 10.2073C11.9595 9.44397 12.5346 8.4859 12.8368 7.42957C12.8468 7.39507 12.8691 7.36543 12.8995 7.34629C12.9299 7.32715 12.9662 7.31984 13.0017 7.32575L13.6857 7.40514C13.7416 7.40283 13.7959 7.38579 13.8431 7.35577C13.8902 7.32574 13.9287 7.28378 13.9544 7.23414Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
									</g>
								),
							},
							{
								name: 'round',
								description: 'Round',
								icon: (
									<g transform="translate(9 9)">
										<rect
											y="11"
											width="13"
											height="2"
											rx="1"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											width="13"
											height="2"
											rx="1"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<path
											d="M10.2876 3.51789L8.32967 3.32949C8.13467 3.30653 7.96578 3.44527 7.9428 3.64034C7.91981 3.83541 8.07222 4.00697 8.25348 4.02731L9.24748 4.11726L7.21565 5.51043C7.05201 5.62168 7.01004 5.84162 7.12384 5.99156C7.17943 6.07341 7.25664 6.11663 7.35283 6.13499C7.44901 6.15334 7.53671 6.14158 7.61853 6.08596L8.63313 5.39625L9.64773 4.70653L9.3653 5.66419C9.31483 5.85402 9.42076 6.0452 9.61052 6.09565C9.62426 6.09828 9.638 6.1009 9.638 6.1009C9.81664 6.13499 9.99403 6.02636 10.0419 5.85028L10.5878 3.95985C10.6199 3.86624 10.5996 3.7484 10.544 3.66656C10.4747 3.58209 10.3864 3.5225 10.2876 3.51789Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<path
											d="M2.07381 8.70072C2.04153 8.79426 2.06154 8.91214 2.11697 8.99409C2.17506 9.0623 2.24953 9.11942 2.34568 9.13796L2.37315 9.14325L4.33068 9.33539C4.52563 9.35873 4.69479 9.22032 4.71815 9.02529C4.7415 8.83026 4.60316 8.66106 4.4082 8.63772L3.41438 8.54587L5.43513 7.15394C5.59634 7.05675 5.63873 6.83689 5.52786 6.67299C5.43073 6.51173 5.21095 6.46936 5.04709 6.58029L3.01526 7.95583L3.29952 6.99872C3.35035 6.80899 3.24478 6.61761 3.05512 6.56679C2.8792 6.51862 2.67413 6.6216 2.62331 6.81133L2.07381 8.70072Z"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
									</g>
								),
							},
							{
								name: 'space',
								description: 'Space',
								icon: (
									<g transform="translate(9 8.5)">
										<rect
											x="2"
											width="6.5"
											height="2"
											rx="1"
											transform="rotate(90 2 0)"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											x="2"
											y="7.5"
											width="6.5"
											height="2"
											rx="1"
											transform="rotate(90 2 7.5)"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											x="3"
											y="12"
											width="6.5"
											height="2"
											rx="1"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											x="3"
											width="6.5"
											height="2"
											rx="1"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											x="13"
											width="6.5"
											height="2"
											rx="1"
											transform="rotate(90 13 0)"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
										<rect
											x="13"
											y="7.5"
											width="6.5"
											height="2"
											rx="1"
											transform="rotate(90 13 7.5)"
											strokeOpacity={0}
											strokeLinecap="round"
										/>
									</g>
								),
							},
						]}
						selected={borderImageRepeat}
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
						withBackground={true}
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

			<div className="_simpleLabel">Logical Border </div>

			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: LogicalBorderRadiusMode.ALL,
							description: 'All Sides',
							icon: (
								<g transform="translate(8 8)">
									<rect
										x="1"
										y="1"
										width="12"
										height="12"
										className="_lowlight"
										strokeOpacity={0}
									/>
									<mask id="path-2-inside-1_3197_8784" strokeOpacity={0}>
										<path
											d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z"
											style={{ fill: 'white' }}
											strokeOpacity={0}
										/>
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										fill="#52BD94"
										mask="url(#path-2-inside-1_3197_8784)"
										strokeOpacity={0}
									/>
									<mask id="path-4-inside-2_3197_8784">
										<path
											d="M0 12C0 13.1046 0.895431 14 2 14H6.53333V8.46667C6.53333 7.91438 6.08562 7.46667 5.53333 7.46667H0V12Z"
											style={{ fill: 'white' }}
											strokeOpacity={0}
										/>
									</mask>
									<path
										d="M-1.5 12C-1.5 13.933 0.0670034 15.5 2 15.5H6.53333V12.5H2C1.72386 12.5 1.5 12.2761 1.5 12H-1.5ZM6.53333 7.46667H0H6.53333ZM-1.5 7.46667V12C-1.5 13.933 0.0670034 15.5 2 15.5V12.5C1.72386 12.5 1.5 12.2761 1.5 12V7.46667H-1.5ZM6.53333 14V7.46667V14Z"
										fill="#52BD94"
										mask="url(#path-4-inside-2_3197_8784)"
										strokeOpacity={0}
									/>
									<mask id="path-6-inside-3_3197_8784">
										<path
											d="M14 2C14 0.895429 13.1046 0 12 0H7.46667V6.53333H14V2Z"
											style={{ fill: 'white' }}
											strokeOpacity={0}
										/>
									</mask>
									<path
										d="M15.5 2C15.5 0.0670034 13.933 -1.5 12 -1.5H7.46667V1.5H12C12.2761 1.5 12.5 1.72386 12.5 2H15.5ZM7.46667 6.53333H14H7.46667ZM15.5 6.53333V2C15.5 0.0670034 13.933 -1.5 12 -1.5V1.5C12.2761 1.5 12.5 1.72386 12.5 2V6.53333H15.5ZM7.46667 0V6.53333V0Z"
										fill="#52BD94"
										mask="url(#path-6-inside-3_3197_8784)"
										strokeOpacity={0}
									/>
									<mask id="path-8-inside-4_3197_8784">
										<path
											d="M14 12C14 13.1046 13.1046 14 12 14H7.46667V8.46667C7.46667 7.91438 7.91438 7.46667 8.46667 7.46667H14V12Z"
											style={{ fill: 'white' }}
											strokeOpacity={0}
										/>
									</mask>
									<path
										d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5H7.46667V12.5H12C12.2761 12.5 12.5 12.2761 12.5 12H15.5ZM7.46667 7.46667H14H7.46667ZM15.5 7.46667V12C15.5 13.933 13.933 15.5 12 15.5V12.5C12.2761 12.5 12.5 12.2761 12.5 12V7.46667H15.5ZM7.46667 14V7.46667V14Z"
										fill="#52BD94"
										mask="url(#path-8-inside-4_3197_8784)"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.START_START,
							description: 'Start Start',
							icon: (
								<g
									transform="translate(8 8) rotate(0)"
									style={{ transformOrigin: '7 7' }}
								>
									<rect
										x="1"
										y="1"
										width="12"
										height="12"
										rx="1"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<mask id="path-2-inside-1_3197_8791">
										<path
											d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z"
											strokeOpacity={0}
											style={{ fill: 'white' }}
										/>
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										fill="#52BD94"
										mask="url(#path-2-inside-1_3197_8791)"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.START_END,
							description: 'Start End',
							icon: (
								<g
									transform="translate(22 8) rotate(90)"
									style={{ transformOrigin: '7 7' }}
								>
									<rect
										x="1"
										y="1"
										width="12"
										height="12"
										rx="1"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<mask id="path-2-inside-1_3197_8791">
										<path
											d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z"
											strokeOpacity={0}
											style={{ fill: 'white' }}
										/>
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										// className="_highlight"
										fill="#52BD94"
										mask="url(#path-2-inside-1_3197_8791)"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.END_START,
							description: 'End Start',
							icon: (
								<g
									transform="translate(8 22) rotate(270)"
									style={{ transformOrigin: '7 7' }}
								>
									<rect
										x="1"
										y="1"
										width="12"
										height="12"
										rx="1"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<mask id="path-2-inside-1_3197_8791">
										<path
											d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z"
											strokeOpacity={0}
											style={{ fill: 'white' }}
										/>
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										// className="_highlight"
										fill="#52BD94"
										mask="url(#path-2-inside-1_3197_8791)"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: LogicalBorderRadiusMode.END_END,
							description: 'End End',
							icon: (
								<g
									transform="translate(22 22) rotate(180)"
									style={{ transformOrigin: '7 7' }}
								>
									<rect
										x="1"
										y="1"
										width="12"
										height="12"
										rx="1"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<mask id="path-2-inside-1_3197_8791">
										<path
											d="M0 2C0 0.895429 0.895431 0 2 0H6.53333V5.53333C6.53333 6.08562 6.08562 6.53333 5.53333 6.53333H0V2Z"
											strokeOpacity={0}
											style={{ fill: 'white' }}
										/>
									</mask>
									<path
										d="M-1.5 2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5H6.53333V1.5H2C1.72386 1.5 1.5 1.72386 1.5 2H-1.5ZM6.53333 6.53333H0H6.53333ZM-1.5 6.53333V2C-1.5 0.0670034 0.0670034 -1.5 2 -1.5V1.5C1.72386 1.5 1.5 1.72386 1.5 2V6.53333H-1.5ZM6.53333 0V6.53333V0Z"
										// className="_highlight"
										fill="#52BD94"
										mask="url(#path-2-inside-1_3197_8791)"
										strokeOpacity={0}
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
								<g transform="translate(6 6)">
									<rect
										x="3"
										y="3"
										width="12"
										height="12"
										rx="1"
										fill="white"
										stroke="white"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<path
										d="M13.5556 3H4.44436C4.38874 3 4.33564 2.97684 4.2978 2.93609L2.81208 1.33609C2.69325 1.20812 2.78401 1 2.95864 1H15.0414C15.216 1 15.3067 1.20812 15.1879 1.33609L13.7022 2.93609C13.6644 2.97684 13.6113 3 13.5556 3Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M13.5556 15H4.44436C4.38874 15 4.33564 15.0232 4.2978 15.0639L2.81208 16.6639C2.69325 16.7919 2.78401 17 2.95864 17H15.0414C15.216 17 15.3067 16.7919 15.1879 16.6639L13.7022 15.0639C13.6644 15.0232 13.6113 15 13.5556 15Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M15 4.44436V13.5556C15 13.6113 15.0232 13.6644 15.0639 13.7022L16.6639 15.1879C16.7919 15.3067 17 15.216 17 15.0414V2.95864C17 2.78401 16.7919 2.69326 16.6639 2.81208L15.0639 4.2978C15.0232 4.33564 15 4.38874 15 4.44436Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
									<path
										d="M3 4.44436L3 13.5556C3 13.6113 2.97684 13.6644 2.93609 13.7022L1.33609 15.1879C1.20812 15.3067 1 15.216 1 15.0414L1 2.95864C1 2.78401 1.20812 2.69326 1.33609 2.81208L2.93609 4.2978C2.97684 4.33564 3 4.38874 3 4.44436Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.BLOCK_START,
							description: 'Block Start',
							icon: (
								<g transform="translate(6 6)">
									<rect
										x="3"
										y="3"
										width="12"
										height="12"
										rx="1"
										fill="white"
										stroke="white"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<path
										d="M13.5556 3H4.44436C4.38874 3 4.33564 2.97684 4.2978 2.93609L2.81208 1.33609C2.69325 1.20812 2.78401 1 2.95864 1H15.0414C15.216 1 15.3067 1.20812 15.1879 1.33609L13.7022 2.93609C13.6644 2.97684 13.6113 3 13.5556 3Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.BLOCK_END,
							description: 'Block End',
							icon: (
								<g transform="translate(6 6)">
									<rect
										x="3"
										y="3"
										width="12"
										height="12"
										rx="1"
										fill="white"
										stroke="white"
										className="_lowlight"
										strokeOpacity={0}
									/>
									<path
										d="M13.5556 15H4.44436C4.38874 15 4.33564 15.0232 4.2978 15.0639L2.81208 16.6639C2.69325 16.7919 2.78401 17 2.95864 17H15.0414C15.216 17 15.3067 16.7919 15.1879 16.6639L13.7022 15.0639C13.6644 15.0232 13.6113 15 13.5556 15Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.INLINE_START,
							description: 'Inline Start',
							icon: (
								<g transform="translate(6 6)">
									<rect
										x="3"
										y="3"
										width="12"
										height="12"
										rx="1"
										fill="white"
										stroke="white"
										className="_lowlight"
										strokeOpacity="0"
									/>

									<path
										d="M3 4.44436L3 13.5556C3 13.6113 2.97684 13.6644 2.93609 13.7022L1.33609 15.1879C1.20812 15.3067 1 15.216 1 15.0414L1 2.95864C1 2.78401 1.20812 2.69326 1.33609 2.81208L2.93609 4.2978C2.97684 4.33564 3 4.38874 3 4.44436Z"
										fill="#02B694"
										strokeOpacity={0}
									/>
								</g>
							),
						},
						{
							name: AdvancedBorderMode.INLINE_END,
							description: 'Inline End',
							icon: (
								<g transform="translate(6 6)">
									<rect
										x="3"
										y="3"
										width="12"
										height="12"
										rx="1"
										fill="white"
										stroke="white"
										className="_lowlight"
										strokeOpacity="0"
									/>
									<path
										d="M15 4.44436V13.5556C15 13.6113 15.0232 13.6644 15.0639 13.7022L16.6639 15.1879C16.7919 15.3067 17 15.216 17 15.0414V2.95864C17 2.78401 16.7919 2.69326 16.6639 2.81208L15.0639 4.2978C15.0232 4.33564 15 4.38874 15 4.44436Z"
										fill="#02B694"
										strokeOpacity={0}
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
											d="M1.273,6H20"
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
