import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import {
	HSL_RGB,
	HSV_HSL,
	HSV_HexString,
	HSV_RGB,
	HSV_RGBAString,
	RGB_HSL,
	stringRGBHSL_HSVA,
} from '../../util/colorUtil';
import { isNullValue } from '@fincity/kirun-js';
import { Dropdown } from './Dropdown';

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

export function ColorSelector({
	color,
	onChange,
}: {
	color: string;
	onChange: (v: string) => void;
}) {
	const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
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

	const buttonRef = useRef<HTMLDivElement>(null);

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
			setAlpha(a ?? 1);
			setAlphaEdit('' + (a ?? 1));
			setHexString(HSV_HexString({ h: h!, s: s!, v: v!, a: a ?? 1 }));
			const hsl = HSV_HSL({ h: h!, s: s!, v: v! });
			const rgb = HSV_RGB({ h: h!, s: s!, v: v! });
			setHrEdit('' + (type === 'hsl' ? Math.round(hsl.h) : Math.round(rgb.r)));
			setSgEdit('' + (type === 'hsl' ? Math.round(hsl.s) : Math.round(rgb.g)));
			setLbEdit('' + (type === 'hsl' ? Math.round(hsl.l) : Math.round(rgb.b)));
		},
		[setHue, setSaturation, setValue, setAlpha, setHexString, type],
	);

	useEffect(() => {
		if (!color) return;
		updateStates(color);
	}, [color]);

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
			fun(Math.round((x * 100) / width));
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
			const newSaturation = Math.round((x * 100) / width);
			const newValue = Math.round(100 - (y * 100) / height);
			onChange(
				HSV_RGBAString({
					h: hue,
					s: newSaturation,
					v: newValue,
					a: alpha,
				}),
			);
		};

		const huePickerChange = (e: any) =>
			onClickSlider(e, huePickerRef.current!, percent =>
				onChange(
					HSV_RGBAString({
						h: Math.round((percent / 100) * 360),
						s: saturation,
						v: value,
						a: alpha,
					}),
				),
			);

		const alphaPickerChange = (e: any) =>
			onClickSlider(e, alphaPickerRef.current!, percent =>
				onChange(
					HSV_RGBAString({
						h: hue,
						s: saturation,
						v: value,
						a: percent / 100,
					}),
				),
			);

		const hueRedUpdate = () => {
			let v = parseInt(hrEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 360) v = 360;
				onChange(HSV_RGBAString({ h: v, s: saturation, v: value, a: alpha }));
			} else {
				if (v > 255) v = 255;
				const { g, b } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				onChange(`rgba(${v},${g},${b},${alpha})`);
			}
		};

		const saturationGreenUpdate = () => {
			let v = parseInt(sgEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 100) v = 100;
				onChange(HSV_RGBAString({ h: hue, s: v, v: value, a: alpha }));
			} else {
				if (v > 255) v = 255;
				const { r, b } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				onChange(`rgba(${r},${v},${b},${alpha})`);
			}
		};

		const lightnessBlueUpdate = () => {
			let v = parseInt(lbEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 100) v = 100;
				onChange(HSV_RGBAString({ h: hue, s: saturation, v: v, a: alpha }));
			} else {
				if (v > 255) v = 255;
				const { r, g } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				onChange(`rgba(${r},${g},${v},${alpha})`);
			}
		};

		colorPicker = (
			<div className="_colorPickerBody" style={bodyPosition}>
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
						onChange={e => setAlphaEdit(e.target.value)}
						onBlur={() => {
							let v = parseFloat(alphaEdit);
							if (isNaN(v)) v = 1;
							if (v < 0) v = 0;
							if (v > 1) v = 1;
							onChange(HSV_RGBAString({ h: hue, s: saturation, v: value, a: v }));
						}}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								let v = parseFloat(alphaEdit);
								if (isNaN(v)) v = 1;
								if (v < 0) v = 0;
								if (v > 1) v = 1;
								onChange(
									HSV_RGBAString({
										h: hue,
										s: saturation,
										v: value,
										a: v,
									}),
								);
							} else if (e.key === 'Escape') {
								setAlphaEdit('' + alpha);
							}
						}}
					/>
				</div>
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
									onChange(hex);
								}}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										let hex = hexString.trim();
										if (!hex.startsWith('#')) hex = '#' + hex;
										onChange(hex);
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
						<Dropdown
							value={type}
							onChange={e => {
								if (e !== 'rgb' && e !== 'hsl') return;
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
							options={[
								{ name: 'rgb', displayName: 'RGB' },
								{ name: 'hsl', displayName: 'HSL' },
							]}
							hideNone={true}
						/>
						<div className="_colorValueline">
							{type === 'hsl' ? 'H' : 'R'} :
							<input
								className="_simpleEditorInput"
								placeholder={type === 'hsl' ? 'Hue' : 'Red'}
								value={hrEdit}
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
													: HSV_RGB({ h: hue, s: saturation, v: value })
															.r),
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
								value={sgEdit}
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
													: HSV_RGB({ h: hue, s: saturation, v: value })
															.g),
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
								value={lbEdit}
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
													: HSV_RGB({ h: hue, s: saturation, v: value })
															.b),
										);
									}
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const colorStyle: CSSProperties = color
		? {
				background: color,
		  }
		: {};

	const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout | undefined>(undefined);

	return (
		<div
			className="_simpleEditorColorSelector"
			style={colorStyle}
			ref={buttonRef}
			onClick={() => setShowColorPicker(true)}
			onDoubleClick={() => onChange('')}
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
