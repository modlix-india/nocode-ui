import { isNullValue } from '@fincity/kirun-js';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import {
	HSV_HSL,
	HSV_HSLAString,
	HSV_HexString,
	HSV_RGB,
	HSV_RGBAString,
	stringRGBHSL_HSVA,
} from '../util/colorUtil';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import ColorPickerStyle from './ColorPickerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './colorPickerProperties';
import { styleDefaults } from './colorPickerStyleProperties';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { Dropdown } from './DropdownSubComponent';

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

function ColorPickerComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;
	const {
		key,
		properties: {
			defaultColor,
			onChange,
			readOnly,
			validation,
			colorScheme,
			variableSelection,
			showColorSelector,
			colorStoreType,
			placeholder,
			label,
			noFloat,
			designType,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const ChangeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath!, locationHistory, pageExtractor)
		: undefined;
	const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
	const [hue, setHue] = useState<number>(0);
	const [saturation, setSaturation] = useState<number>(100);
	const [color, setColor] = useState<any>(defaultColor ?? '');
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
	const [focus, setFocus] = useState<boolean>(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ readOnly, focus },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			color,
			locationHistory,
			pageExtractor,
		);
		setValidationMessages(msgs);

		setData(
			`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
			msgs.length ? msgs : undefined,
			context.pageName,
			true,
		);
		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [color, validation]);

	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setColor(value ?? defaultColor);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleChange = async (value: string) => {
		if (!isNullValue(value)) {
			let newValue;
			let { h, s, v, a } = stringRGBHSL_HSVA(value) ?? {};
			if (isNullValue(h)) return;

			newValue = colorStoreType?.startsWith('_rgba_type')
				? HSV_RGBAString({
						h: h!,
						s: s!,
						v: v!,
						a: a ?? 1,
				  })
				: colorStoreType?.startsWith('_hsl_type')
				? HSV_HSLAString({
						h: h!,
						s: s!,
						v: v!,
						a: a ?? 1,
				  })
				: HSV_HexString({
						h: h!,
						s: s!,
						v: v!,
						a: a ?? 1,
				  });

			if (bindingPathPath) setData(bindingPathPath!, newValue, context.pageName);

			if (ChangeEvent) {
				await runEvent(
					ChangeEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			}
		}
	};

	const onHandleChange = (h: any, s: any, v: any, a: any) => {
		return HSV_RGBAString({
			h: h,
			s: s,
			v: v,
			a: a,
		});
	};

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
	if (showColorPicker && !readOnly) {
		const bodyPosition: CSSProperties = {};
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const offset = 4;
			bodyPosition.left = rect.left - offset;
			if (rect.top + 400 > document.body.clientHeight)
				bodyPosition.bottom = document.body.clientHeight - rect.top + offset;
			else bodyPosition.top = rect.top + rect.height;
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

			handleChange(onHandleChange(hue, newSaturation, newValue, alpha));
		};

		const huePickerChange = (e: any) =>
			onClickSlider(e, huePickerRef.current!, percent =>
				handleChange(
					onHandleChange(Math.round((percent / 100) * 360), saturation, value, alpha),
				),
			);

		const alphaPickerChange = (e: any) =>
			onClickSlider(e, alphaPickerRef.current!, percent =>
				handleChange(onHandleChange(hue, saturation, value, percent / 100)),
			);

		const hueRedUpdate = () => {
			let v = parseInt(hrEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 360) v = 360;
				handleChange(onHandleChange(v, saturation, value, alpha));
			} else {
				if (v > 255) v = 255;
				const { g, b } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				handleChange(`rgba(${v},${g},${b},${alpha})`);
			}
		};

		const saturationGreenUpdate = () => {
			let v = parseInt(sgEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 100) v = 100;
				handleChange(onHandleChange(hue, v, value, alpha));
			} else {
				if (v > 255) v = 255;
				const { r, b } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				handleChange(`rgba(${r},${v},${b},${alpha})`);
			}
		};

		const lightnessBlueUpdate = () => {
			let v = parseInt(lbEdit);
			if (isNaN(v) || v < 0) v = 0;
			if (type === 'hsl') {
				if (v > 100) v = 100;
				handleChange(onHandleChange(hue, saturation, v, alpha));
			} else {
				if (v > 255) v = 255;
				const { r, g } = HSV_RGB({
					h: hue,
					s: saturation,
					v: value,
					a: alpha,
				});
				handleChange(`rgba(${r},${g},${v},${alpha})`);
			}
		};

		const variablePicker = variableSelection ? (
			<div className="_combineColorPicker _vertical">
				<Dropdown
					value={'' + colorType}
					onChange={e => setColorType(e as ColorType)}
					options={Array.from(COLOR_TYPE_TO_VARIABLES.keys()).map(k => ({
						name: '' + k,
						displayName: k,
					}))}
				/>
				<div className="_color_variable_picker">
					{COLOR_TYPE_TO_VARIABLES.get(colorType)?.map(v => (
						<div
							key={v}
							className={`_color_variable ${
								getDataFromPath(`Theme.${v}`, []) === color ? '_selected' : ''
							}`}
							onClick={() => handleChange(getDataFromPath(`Theme.${v}`, []))}
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

		const colorSelector = showColorSelector ? (
			<div className="_combineColorPicker _vertical _colorValues ">
				<div className="_colorValueline">
					<input
						className="_simpleColorPickerInput _hexInput"
						value={hexString}
						onChange={e => setHexString(e.target.value)}
						onBlur={() => {
							let hex = hexString.trim();
							if (!hex?.startsWith('#')) hex = '#' + hex;
							handleChange(hex);
						}}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								let hex = hexString.trim();
								if (!hex?.startsWith('#')) hex = '#' + hex;
								handleChange(hex);
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
				/>
				<div className="_colorValueline">
					{type === 'hsl' ? 'H' : 'R'} :
					<input
						className="_simpleColorPickerInput"
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
											: HSV_RGB({ h: hue, s: saturation, v: value }).r),
								);
							}
						}}
					/>
				</div>
				<div className="_colorValueline">
					{type === 'hsl' ? 'S' : 'G'} :
					<input
						className="_simpleColorPickerInput"
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
											: HSV_RGB({ h: hue, s: saturation, v: value }).g),
								);
							}
						}}
					/>
				</div>
				<div className="_colorValueline">
					{type === 'hsl' ? 'L' : 'B'} :
					<input
						className="_simpleColorPickerInput"
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
											: HSV_RGB({ h: hue, s: saturation, v: value }).b),
								);
							}
						}}
					/>
				</div>
			</div>
		) : undefined;

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
				<div className="_combineColorPicker">
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
						className="_simpleColorPickerInput"
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
							handleChange(onHandleChange(hue, saturation, value, v));
						}}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								let v = parseFloat(alphaEdit);
								if (isNaN(v)) v = 1;
								if (v < 0) v = 0;
								if (v > 1) v = 1;
								onHandleChange(hue, saturation, value, v);
							} else if (e.key === 'Escape') {
								setAlphaEdit('' + alpha);
							}
						}}
					/>
				</div>
				<div className="_combineColorPicker _top">
					{colorSelector}
					{variablePicker}
				</div>
			</div>
		);
	}

	const colorStyle: CSSProperties = color
		? {
				background: color,
		  }
		: { background: defaultColor };

	const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout | undefined>(undefined);

	const onBlur = () => {
		setShowColorPicker(false);
		setFocus(false);
		buttonRef.current?.blur();
	};

	const hasErrorMessages =
		validationMessages?.length && (color || context.showValidationMessages);

	let validationsText = undefined;
	if (hasErrorMessages && designType?.startsWith('_box'))
		validationsText = (
			<div className={`_validationMessages`} style={computedStyles.errorTextContainer ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="errorTextContainer"
				/>
				{validationMessages.map(msg => (
					<div
						className={`_eachValidationMessage`}
						style={computedStyles.errorText ?? {}}
						key={msg}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="errorText"
						/>
						{msg}
					</div>
				))}
			</div>
		);

	return (
		<>
			{designType?.startsWith('_box') ? (
				<>
					<div
						className={`comp compColorPicker ${
							readOnly ? '_disabled' : ''
						} ${designType} ${colorScheme} ${
							value?.toString()?.length ? '_hasValue' : ''
						} ${
							!hasErrorMessages && validation?.length > 0 ? '_validationSuccess' : ''
						} ${hasErrorMessages ? '_hasError' : ''}`}
						id={key}
						ref={buttonRef}
						onClick={() => setShowColorPicker(true)}
						style={{ ...computedStyles?.comp, ...colorStyle } ?? {}}
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
						<HelperComponent definition={props.definition} />
						{colorPicker}
					</div>
					{validationsText}
				</>
			) : (
				<CommonInputText
					id={key}
					inputRef={buttonRef}
					readOnly={readOnly}
					value={color}
					translations={translations}
					colorScheme={colorScheme}
					context={context}
					definition={props.definition}
					designType={designType}
					cssPrefix={`comp compColorPicker ${readOnly ? '_disabled' : ''}`}
					noFloat={noFloat}
					label={label}
					rightIcon={focus ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down'}
					handleChange={e => setColor(e.target.value)}
					valueType="text"
					isPassword={false}
					placeholder={placeholder}
					hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
					validationMessages={validationMessages}
					hasValidationCheck={validation?.length > 0}
					hideClearContentIcon={true}
					onMouseLeave={() => {
						if (!showColorPicker && timeoutHandle !== undefined) return;
						const handle = setTimeout(() => {
							onBlur();
						}, 500);
						setTimeoutHandle(handle);
					}}
					focusHandler={() => {
						if (!readOnly) {
							setFocus(true);
							setShowColorPicker(true);
						}
					}}
					autoComplete="off"
					styles={computedStyles ?? {}}
				>
					<HelperComponent definition={props.definition} />
					{colorPicker}
				</CommonInputText>
			)}
		</>
	);
}

const component: Component = {
	name: 'ColorPicker',
	displayName: 'ColorPicker',
	description: 'ColorPicker component',
	component: ColorPickerComponent,
	styleComponent: ColorPickerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'focus'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'ColorPicker',
		type: 'ColorPicker',
		properties: {},
	},
	sections: [{ name: 'ColorPicker', pageName: 'colorPicker' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M3.46184 14.6141C2.79521 15.2807 2.4219 16.1873 2.4219 17.1295V19.0138L1.23976 20.787C0.862004 21.3514 0.937554 22.1025 1.41752 22.5825C1.89749 23.0624 2.64856 23.138 3.21296 22.7602L4.98618 21.5781H6.87051C7.81267 21.5781 8.71928 21.2048 9.3859 20.5382L14.75 15.1741L12.7368 13.1609L7.3727 18.525C7.23937 18.6583 7.05716 18.7338 6.87051 18.7338H5.26616V17.1295C5.26616 16.9428 5.34172 16.7606 5.47504 16.6273L10.8391 11.2632L8.82594 9.25L3.46184 14.6141Z"
						fill="#E7E9ED"
					/>
					<path
						d="M15.5609 2.27083L11.1307 6.70592L10.7204 6.29558C10.1748 5.74993 9.28877 5.74993 8.74318 6.29558C8.19759 6.84124 8.19759 7.72738 8.74318 8.27304L15.7268 15.2574C16.2724 15.8031 17.1584 15.8031 17.704 15.2574C18.2496 14.7118 18.2496 13.8256 17.704 13.28L17.2937 12.8696L21.724 8.43455C23.4262 6.73211 23.4262 3.97328 21.724 2.2752C20.0217 0.577118 17.2632 0.572753 15.5653 2.2752L15.5609 2.27083Z"
						fill="#96A1B4"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
