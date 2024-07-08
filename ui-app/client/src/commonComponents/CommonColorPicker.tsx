import { isNullValue } from '@fincity/kirun-js';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import {
	HSV_HSL,
	HSV_HexString,
	HSV_RGB,
	HSV_RGBAString,
	stringRGBHSL_HSVA,
} from '../components/util/colorUtil';
import { getDataFromPath } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { roundTo } from '../functions/utils';

enum ColorType {
	BACKGROUND_COLORS = 'Backgrounds',
	BORDER_COLORS = 'Borders',
	FONT_COLORS = 'Fonts',
	BACKGROUND_HOVER_COLORS = 'Hovers',
	DARKER_BACKGROUND_COLORS = 'Darks',
}

const COLOR_TYPE_TO_VARIABLES = new Map([
	[
		ColorType.BACKGROUND_COLORS,
		[
			'backgroundColorOne',
			'backgroundColorTwo',
			'backgroundColorThree',
			'backgroundColorFour',
			'backgroundColorFive',
			'backgroundColorSix',
			'backgroundColorSeven',
			'backgroundColorEight',
			'backgroundColorNine',
			'backgroundColorTen',
		],
	],
	[
		ColorType.FONT_COLORS,
		[
			'fontColorOne',
			'fontColorTwo',
			'fontColorThree',
			'fontColorFour',
			'fontColorFive',
			'fontColorSix',
			'fontColorSeven',
			'fontColorEight',
			'fontColorNine',
		],
	],
	[
		ColorType.BACKGROUND_HOVER_COLORS,
		[
			'backgroundHoverColorOne',
			'backgroundHoverColorTwo',
			'backgroundHoverColorThree',
			'backgroundHoverColorFour',
			'backgroundHoverColorFive',
			'backgroundHoverColorSix',
			'backgroundHoverColorSeven',
			'backgroundHoverColorEight',
			'backgroundHoverColorNine',
		],
	],
	[
		ColorType.DARKER_BACKGROUND_COLORS,
		[
			'backgroundDarkerColorOne',
			'backgroundDarkerColorTwo',
			'backgroundDarkerColorThree',
			'backgroundDarkerColorFour',
			'backgroundDarkerColorFive',
			'backgroundDarkerColorSix',
			'backgroundDarkerColorSeven',
			'backgroundDarkerColorEight',
			'backgroundDarkerColorNine',
		],
	],
	[
		ColorType.BORDER_COLORS,
		[
			'borderColorOne',
			'borderColorTwo',
			'borderColorThree',
			'borderColorFour',
			'borderColorFive',
			'borderColorSix',
			'borderColorSeven',
		],
	],
]);

export function CommonColorPickerPropertyEditor({
	color: colorProperty,
	variableSelection = true,
	onChange,
	showGradient = false,
	showAlpha = true,
}: {
	color: ComponentProperty<string>;
	onChange: (v: ComponentProperty<string>) => void;
	showGradient?: boolean;
	variableSelection?: boolean;
	showAlpha?: boolean;
}) {
	const color = colorProperty.value;
	const buttonRef = useRef<HTMLDivElement>(null);

	const colorLocation = colorProperty.location;

	const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

	let colorPicker = undefined;
	if (showColorPicker) {
		const bodyPosition: CSSProperties = {};
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			bodyPosition.left = rect.left;
			if (rect.top + 400 > document.body.clientHeight)
				bodyPosition.bottom = document.body.clientHeight - rect.top - rect.height / 2;
			else bodyPosition.top = rect.top + rect.height / 2;
		}

		colorPicker = (
			<div className="_colorPickerBody" style={bodyPosition}>
				<CommonColorPicker
					color={color}
					onChange={onChange}
					showAlpha={showAlpha}
					showGradient={showGradient}
					variableSelection={variableSelection}
					colorLocation={colorLocation}
				/>
			</div>
		);
	}

	const colorStyle: CSSProperties = color
		? {
				background: color,
			}
		: {};

	const [timeoutHandle, setTimeoutHandle] = useState<number | undefined>(undefined);

	return (
		<div
			className="_simpleEditorColorSelector"
			style={colorStyle}
			ref={buttonRef}
			onClick={() => setShowColorPicker(true)}
			onDoubleClick={() => onChange({})}
			onMouseEnter={() => {
				if (!showColorPicker || timeoutHandle === undefined) return;
				clearTimeout(timeoutHandle);
				setTimeoutHandle(undefined);
			}}
			onMouseLeave={() => {
				if (!showColorPicker && timeoutHandle !== undefined) return;
				const handle = setTimeout(() => {
					setShowColorPicker(false);
				}, 500);
				setTimeoutHandle(handle);
			}}
		>
			{colorPicker}
		</div>
	);
}

export function CommonColorPicker({
	color,
	showAlpha,
	onChange,
	showGradient,
	variableSelection,
	colorLocation,
}: {
	color: string | undefined;
	showAlpha?: boolean;
	onChange: (v: ComponentProperty<string>) => void;
	showGradient?: boolean;
	variableSelection?: boolean;
	colorLocation?: ComponentProperty<string>['location'];
}) {
	const [hue, setHue] = useState<number>(0);
	const [saturation, setSaturation] = useState<number>(100);
	const [value, setValue] = useState<number>(100);
	const [alpha, setAlpha] = useState<number>(1);
	const [hexString, setHexString] = useState<string>(
		HSV_HexString({ h: hue, s: saturation, v: value, a: alpha }),
	);
	const [type, setType] = useState<'rgb' | 'hsl'>('hsl');

	const [alphaEdit, setAlphaEdit] = useState<string>('1');
	const [hrEdit, setHrEdit] = useState<string>('0');
	const [sgEdit, setSgEdit] = useState<string>('100');
	const [lbEdit, setLbEdit] = useState<string>('50');

	const saturationValuePickerRef = useRef<HTMLDivElement>(null);
	const huePickerRef = useRef<HTMLDivElement>(null);
	const alphaPickerRef = useRef<HTMLDivElement>(null);

	const [colorType, setColorType] = useState<ColorType>(ColorType.BACKGROUND_COLORS);

	const updateStates = useCallback(
		(c: string) => {
			let { h, s, v, a } = stringRGBHSL_HSVA(c) ?? {};
			if (isNullValue(h)) return;

			setHue(h!);
			setSaturation(s!);
			setValue(v!);
			setAlpha(showAlpha ? a ?? 1 : 1);
			setAlphaEdit('' + (showAlpha ? a ?? 1 : 1));
			setHexString(HSV_HexString({ h: h!, s: s!, v: v!, a: a ?? 1 }));
			const hsl = HSV_HSL({ h: h!, s: s!, v: v! });
			const rgb = HSV_RGB({ h: h!, s: s!, v: v! });
			setHrEdit('' + (type === 'hsl' ? hsl.h : rgb.r));
			setSgEdit('' + (type === 'hsl' ? hsl.s : rgb.g));
			setLbEdit('' + (type === 'hsl' ? hsl.l : rgb.b));
		},
		[setHue, setSaturation, setValue, setAlpha, setHexString, type],
	);

	useEffect(() => {
		if (!color) return;
		updateStates(color);
	}, [color]);

	const hueThumbStyle: CSSProperties = {
		left: `${(hue * 100) / 360}%`,
		backgroundColor: HSV_RGBAString({ h: hue, s: 100, v: 100, a: 1 }),
	};

	const alphaGradientStyle: CSSProperties = {
		backgroundImage: `linear-gradient(to right, ${HSV_RGBAString({
			h: hue,
			s: saturation,
			v: value,
			a: 0,
		})}, ${HSV_RGBAString({ h: hue, s: saturation, v: value, a: 1 })})`,
	};

	const alphaThumbStyle: CSSProperties = {
		left: `${alpha * 100}%`,
		backgroundColor: `${HSV_RGBAString({ h: hue, s: saturation, v: value, a: alpha })}`,
	};

	const saturationValueStyle: CSSProperties = {
		backgroundImage: `linear-gradient(rgba(0,0,0,0),#000),linear-gradient(90deg,#fff,${HSV_RGBAString(
			{ h: hue, s: 100, v: 100, a: 1 },
		)})`,
	};

	const onClickSlider = (e: any, parent: HTMLDivElement, fun: (percent: number) => void) => {
		e.stopPropagation();
		e.preventDefault();
		if (e.type === 'mousemove' && e.buttons !== 1) return;
		const rect = parent.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const width = rect.width;
		fun((x * 100) / width);
	};

	const svThumbStyle: CSSProperties = {
		left: `${(saturation * 100) / 100}%`,
		top: `${100 - (value * 100) / 100}%`,
		backgroundColor: `${HSV_RGBAString({ h: hue, s: saturation, v: value, a: 1 })}`,
	};

	const svPickerChange = (e: any) => {
		e.stopPropagation();
		e.preventDefault();
		if (e.type === 'mousemove' && e.buttons !== 1) return;
		const rect = saturationValuePickerRef.current!.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const width = rect.width;
		const height = rect.height;
		const newSaturation = (x * 100) / width;
		const newValue = 100 - (y * 100) / height;
		onChange({
			value: HSV_RGBAString({
				h: hue,
				s: newSaturation,
				v: newValue,
				a: alpha,
			}),
			location: colorLocation,
		});
	};

	const huePickerChange = (e: any) =>
		onClickSlider(e, huePickerRef.current!, percent =>
			onChange({
				value: HSV_RGBAString({
					h: (percent / 100) * 360,
					s: saturation,
					v: value,
					a: alpha,
				}),
				location: colorLocation,
			}),
		);

	const alphaPickerChange = (e: any) =>
		onClickSlider(e, alphaPickerRef.current!, percent =>
			onChange({
				value: HSV_RGBAString({
					h: hue,
					s: saturation,
					v: value,
					a: percent / 100,
				}),
				location: colorLocation,
			}),
		);

	const hueRedUpdate = () => {
		let v = parseInt(hrEdit);
		if (isNaN(v) || v < 0) v = 0;
		if (type === 'hsl') {
			if (v > 360) v = 360;
			onChange({
				value: HSV_RGBAString({ h: v, s: saturation, v: value, a: alpha }),
				location: colorLocation,
			});
		} else {
			if (v > 255) v = 255;
			const { g, b } = HSV_RGB({
				h: hue,
				s: saturation,
				v: value,
				a: alpha,
			});
			onChange({ value: `rgba(${v},${g},${b},${alpha})`, location: colorLocation });
		}
	};

	const saturationGreenUpdate = () => {
		let v = parseInt(sgEdit);
		if (isNaN(v) || v < 0) v = 0;
		if (type === 'hsl') {
			if (v > 100) v = 100;
			onChange({
				value: HSV_RGBAString({ h: hue, s: v, v: value, a: alpha }),
				location: colorLocation,
			});
		} else {
			if (v > 255) v = 255;
			const { r, b } = HSV_RGB({
				h: hue,
				s: saturation,
				v: value,
				a: alpha,
			});
			onChange({ value: `rgba(${r},${v},${b},${alpha})`, location: colorLocation });
		}
	};

	const lightnessBlueUpdate = () => {
		let v = parseInt(lbEdit);
		if (isNaN(v) || v < 0) v = 0;
		if (type === 'hsl') {
			if (v > 100) v = 100;
			onChange({
				value: HSV_RGBAString({ h: hue, s: saturation, v: v, a: alpha }),
				location: colorLocation,
			});
		} else {
			if (v > 255) v = 255;
			const { r, g } = HSV_RGB({
				h: hue,
				s: saturation,
				v: value,
				a: alpha,
			});
			onChange({ value: `rgba(${r},${g},${v},${alpha})`, location: colorLocation });
		}
	};

	const variablePicker = variableSelection ? (
		<div className="_combineEditors _vertical">
			<select
				value={'' + colorType}
				onChange={e => setColorType(e.target.value as ColorType)}
			>
				{Array.from(COLOR_TYPE_TO_VARIABLES.keys()).map(k => (
					<option value={k}>{k}</option>
				))}
			</select>
			<div className="_color_variable_picker">
				{COLOR_TYPE_TO_VARIABLES.get(colorType)?.map(v => (
					<div
						key={v}
						className={`_color_variable ${
							'Theme.' + v === colorLocation?.expression ? '_selected' : ''
						}`}
						onClick={() =>
							onChange({
								value: color,
								location: {
									type: 'EXPRESSION',
									expression: `Theme.${v}`,
								},
							})
						}
					>
						<div
							className="_color_variable_name"
							style={{
								backgroundColor: getDataFromPath(`Theme.${v}`, []),
							}}
						/>
					</div>
				))}
			</div>
		</div>
	) : undefined;

	const alphaComponent = showAlpha ? (
		<div className="_combineEditors">
			<div
				className="_alpha_picker"
				ref={alphaPickerRef}
				onClick={alphaPickerChange}
				onMouseMove={alphaPickerChange}
			>
				<div className="_thumb" style={alphaThumbStyle}>
					<div className="_thumb_inner" />
				</div>
				<div className="_alpha_picker_gradient" style={alphaGradientStyle} />
			</div>
			<input
				className="_simpleEditorInput"
				placeholder={'Alpha'}
				value={alphaEdit}
				type="number"
				step="0.1"
				onChange={e => setAlphaEdit(showAlpha ? e.target.value : '1')}
				onBlur={() => {
					let v = parseFloat(alphaEdit);
					if (isNaN(v)) v = 1;
					if (v < 0) v = 0;
					if (v > 1) v = 1;
					onChange({
						value: HSV_RGBAString({ h: hue, s: saturation, v: value, a: v }),
						location: colorLocation,
					});
				}}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						let v = parseFloat(alphaEdit);
						if (isNaN(v)) v = 1;
						if (v < 0) v = 0;
						if (v > 1) v = 1;
						onChange({
							value: HSV_RGBAString({
								h: hue,
								s: saturation,
								v: value,
								a: v,
							}),
							location: colorLocation,
						});
					} else if (e.key === 'Escape') {
						setAlphaEdit('' + (showAlpha ? alpha : '1'));
					}
				}}
			/>
		</div>
	) : undefined;

	return (
		<>
			<div
				className="_saturation_value_picker"
				ref={saturationValuePickerRef}
				style={saturationValueStyle}
				onMouseMove={svPickerChange}
				onClick={svPickerChange}
			>
				<div className="_thumb" style={svThumbStyle}>
					<div className="_thumb_inner" />
				</div>
			</div>
			<div
				className="_hue_picker"
				ref={huePickerRef}
				onClick={huePickerChange}
				onMouseMove={huePickerChange}
			>
				<div className="_thumb" style={hueThumbStyle}>
					<div className="_thumb_inner" />
				</div>
			</div>
			{alphaComponent}
			<div className="_combineEditors _top">
				<div className="_combineEditors _vertical _colorValues ">
					<div className="_colorValueline">
						<input
							className="_simpleEditorInput _hexInput"
							value={hexString}
							onChange={e => setHexString(e.target.value)}
							onBlur={() => {
								let hex = hexString.trim();
								if (!hex.startsWith('#')) hex = '#' + hex;
								onChange({ value: hex, location: colorLocation });
							}}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									let hex = hexString.trim();
									if (!hex.startsWith('#')) hex = '#' + hex;
									onChange({ value: hex, location: colorLocation });
								} else if (e.key === 'Escape') {
									setHexString(
										HSV_HexString({
											h: hue,
											s: saturation,
											v: value,
											a: alpha,
										}),
									);
								}
							}}
							placeholder="Hex color code"
						/>
					</div>
					<div className="_colorValueline">
						<span
							className="_colorSchemeType"
							onClick={() => {
								const e = type === 'hsl' ? 'rgb' : 'hsl';
								setType(e);
								if (e === 'rgb') {
									const { r, g, b } = HSV_RGB({
										h: hue,
										s: saturation,
										v: value,
									});
									setHrEdit('' + r);
									setSgEdit('' + g);
									setLbEdit('' + b);
								} else {
									const { h, s, l } = HSV_HSL({
										h: hue,
										s: saturation,
										v: value,
									});
									setHrEdit('' + h);
									setSgEdit('' + s);
									setLbEdit('' + l);
								}
							}}
						>
							{type.toUpperCase()}
						</span>
					</div>
					<div className="_colorValueline">
						{type === 'hsl' ? 'H' : 'R'} :
						<input
							className="_simpleEditorInput"
							placeholder={type === 'hsl' ? 'Hue' : 'Red'}
							value={roundTo(hrEdit, 2)}
							type="number"
							step="1"
							onChange={e => setHrEdit(e.target.value)}
							onBlur={() => hueRedUpdate()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									hueRedUpdate();
								} else if (e.key === 'Escape') {
									setHrEdit(
										'' +
											(type === 'hsl'
												? hue
												: HSV_RGB({ h: hue, s: saturation, v: value }).r),
									);
								}
							}}
						/>
					</div>
					<div className="_colorValueline">
						{type === 'hsl' ? 'S' : 'G'} :
						<input
							className="_simpleEditorInput"
							placeholder={type === 'hsl' ? 'Saturation' : 'Green'}
							value={roundTo(sgEdit, 2)}
							type="number"
							step="1"
							onChange={e => setSgEdit(e.target.value)}
							onBlur={() => saturationGreenUpdate()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									saturationGreenUpdate();
								} else if (e.key === 'Escape') {
									setSgEdit(
										'' +
											(type === 'hsl'
												? saturation
												: HSV_RGB({ h: hue, s: saturation, v: value }).g),
									);
								}
							}}
						/>
					</div>
					<div className="_colorValueline">
						{type === 'hsl' ? 'L' : 'B'} :
						<input
							className="_simpleEditorInput"
							placeholder={type === 'hsl' ? 'Lightness' : 'Blue'}
							value={roundTo(lbEdit, 2)}
							type="number"
							step="1"
							onChange={e => setLbEdit(e.target.value)}
							onBlur={() => lightnessBlueUpdate()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									lightnessBlueUpdate();
								} else if (e.key === 'Escape') {
									setLbEdit(
										'' +
											(type === 'hsl'
												? value
												: HSV_RGB({ h: hue, s: saturation, v: value }).b),
									);
								}
							}}
						/>
					</div>
				</div>
				{variablePicker}
			</div>
		</>
	);
}
