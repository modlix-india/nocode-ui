import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { ChangeEvent, UIEvent, useCallback, useEffect, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import ColorPickerStyle from './ColorPickerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './colorPickerProperties';
import { styleDefaults } from './colorPickerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { CommonColorPicker } from '../../commonComponents/CommonColorPicker';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	HEXRGBHSL_any,
	HSLA_RGBA_TO_HSLAString,
	HSLA_RGBA_TO_RGBAString,
	RGBA,
	RGBA_HEX,
} from '../util/colorUtil';

function getEmptyValue(emptyValue: string | undefined): string | null | undefined {
	if (emptyValue === 'ENMPTYSTRING') return '';
	if (emptyValue === 'NULL') return null;
	return undefined;
}

function convertToFormat(
	color: string | undefined | null,
	format: string | undefined,
): string | undefined | null {
	if (!format || !color) return color;

	if (format === 'rgba') {
		if (color.startsWith('rgb')) return color;
		return HSLA_RGBA_TO_RGBAString(HEXRGBHSL_any(color, 'rgba') as RGBA);
	} else if (format === 'hsla') {
		if (color.startsWith('hsl')) return color;
		return HSLA_RGBA_TO_HSLAString(HEXRGBHSL_any(color, 'hsla') as RGBA);
	} else {
		if (color.startsWith('#')) return color;
		return HEXRGBHSL_any(color, 'hex') as string;
	}
}

function ColorPickerComponent(props: ComponentProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [focus, setFocus] = useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const inputRef = useRef<HTMLInputElement>(null);
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
			onChange,
			placeholder,
			readOnly,
			label,
			closeOnMouseLeave,
			noFloat,
			validation,
			clearSearchTextOnClose,
			designType,
			colorScheme,
			leftIcon,
			rightIcon,
			rightIconOpen,
			showMandatoryAsterisk,
			updateStoreImmediately,
			removeKeyWhenEmpty,
			emptyValue,
			autoFocus,
			autoComplete,
			noAlpha,
			format,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);

	const [color, setColor] = useState<string | undefined | null>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setColor(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const [mouseIsInside, setMouseIsInside] = useState(false);

	const handleClose = useCallback(() => {
		if (!showDropdown) return;
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
	}, [showDropdown, setShowDropdown, setFocus, inputRef, clearSearchTextOnClose]);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: readOnly },
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
		if (!showDropdown || closeOnMouseLeave || mouseIsInside) return;
		window.addEventListener('mousedown', handleClose);
		return () => window.removeEventListener('mousedown', handleClose);
	}, [showDropdown, color, handleClose, closeOnMouseLeave, mouseIsInside]);

	let dropdownBody = undefined;

	if (showDropdown) {
		dropdownBody = (
			<div
				className="_dropdownContainer _colorPickerBody"
				style={computedStyles.dropDownContainer ?? {}}
				onMouseLeave={() => {
					if (closeOnMouseLeave) handleClose();
					else setMouseIsInside(false);
				}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="dropDownContainer"
				/>
				<CommonColorPicker
					color={color ?? undefined}
					showAlpha={!noAlpha}
					showGradient={false}
					variableSelection={false}
					onChange={vobj => {
						const v = vobj.value;
						if (readOnly || !bindingPathPath) return;
						setData(bindingPathPath, convertToFormat(v, format), context.pageName);
						if (!changeEvent) return;
						(async () =>
							await runEvent(
								changeEvent,
								key,
								context.pageName,
								locationHistory,
								props.pageDefinition,
							))();
					}}
				/>
			</div>
		);
	}

	if (designType.startsWith('_box')) {
		return (
			<div
				className={`comp compColorPicker ${designType} ${colorScheme}`}
				onClick={() => setShowDropdown(true)}
				style={{ ...(computedStyles.comp ?? {}), background: color }}
				onMouseEnter={() => {
					setMouseIsInside(true);
				}}
				onMouseLeave={() => {
					setMouseIsInside(false);
					if (closeOnMouseLeave) handleClose();
				}}
			>
				<HelperComponent definition={props.definition} context={props.context} />
				{dropdownBody}
			</div>
		);
	}

	return (
		<CommonInputText
			id={key}
			cssPrefix="comp compColorPicker"
			noFloat={noFloat}
			readOnly={readOnly}
			value={color ?? ''}
			handleChange={e => {
				if (readOnly || !bindingPathPath) return;
				let v: string | undefined | null = e.target.value;
				if (v?.trim() === '' || isNullValue(v))
					v = removeKeyWhenEmpty ? undefined : getEmptyValue(emptyValue);

				if (!updateStoreImmediately) {
					setColor(v);
				} else {
					setData(bindingPathPath, convertToFormat(v, format), context.pageName);
					if (!changeEvent) return;
					(async () =>
						await runEvent(
							changeEvent,
							key,
							context.pageName,
							locationHistory,
							props.pageDefinition,
						))();
				}
			}}
			label={label}
			translations={translations}
			rightIcon={
				showDropdown
					? rightIconOpen ?? 'fa-solid fa-angle-up'
					: rightIcon ?? 'fa-solid fa-angle-down'
			}
			valueType="text"
			isPassword={false}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			hideClearContentIcon={true}
			blurHandler={async () => {
				if (mouseIsInside) return;

				if (!readOnly && bindingPathPath && !updateStoreImmediately) {
					let v: string | undefined | null = color;
					if (v?.trim() === '' || isNullValue(v))
						v = removeKeyWhenEmpty ? undefined : getEmptyValue(emptyValue);
					setData(bindingPathPath, convertToFormat(v, format), context.pageName);
					if (changeEvent) {
						(async () =>
							await runEvent(
								changeEvent,
								key,
								context.pageName,
								locationHistory,
								props.pageDefinition,
							))();
					}
				}

				setFocus(false);
				setShowDropdown(false);
			}}
			focusHandler={() => {
				setFocus(true);
				setShowDropdown(true);
			}}
			styles={computedStyles}
			inputRef={inputRef}
			definition={props.definition}
			designType={designType}
			colorScheme={colorScheme}
			leftIcon={leftIcon}
			showDropdown={showDropdown}
			onMouseEnter={() => {
				setMouseIsInside(true);
			}}
			onMouseLeave={() => {
				setMouseIsInside(false);
				if (closeOnMouseLeave) handleClose();
			}}
			showMandatoryAsterisk={
				(validation ?? []).find(
					(e: any) => e.type === undefined || e.type === 'MANDATORY',
				) && showMandatoryAsterisk
					? true
					: false
			}
			autoFocus={autoFocus}
			autoComplete={autoComplete}
		>
			{dropdownBody}
		</CommonInputText>
	);
}

const component: Component = {
	name: 'ColorPicker',
	displayName: 'Color Picker',
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
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_CPtube"
						d="M3.04373 17.632C2.21954 18.4562 1.75799 19.5771 1.75799 20.7419V23.0716L0.296427 25.264C-0.170614 25.9618 -0.0772057 26.8904 0.516211 27.4838C1.10963 28.0772 2.03821 28.1706 2.73603 27.7036L4.92837 26.242H7.25808C8.42294 26.242 9.54383 25.7805 10.368 24.9563L17 18.3243L14.5109 15.8352L7.87897 22.4672C7.71413 22.6321 7.48886 22.7255 7.25808 22.7255H5.27453V20.7419C5.27453 20.5111 5.36794 20.2859 5.53278 20.121L12.1648 13.4891L9.6757 11L3.04373 17.632Z"
						fill="url(#paint0_linear_3214_9505)"
					/>
					<path
						className="_CPhandle"
						d="M18.3622 1.6463L12.623 7.39176L12.0915 6.86019C11.3847 6.15332 10.2369 6.15332 9.53009 6.86019C8.8233 7.56706 8.8233 8.71502 9.53009 9.42189L18.577 18.4698C19.2838 19.1767 20.4317 19.1767 21.1385 18.4698C21.8453 17.763 21.8453 16.615 21.1385 15.9081L20.6069 15.3766L26.3461 9.63112C28.5513 7.42569 28.5513 3.85174 26.3461 1.65196C24.1409 -0.547825 20.5674 -0.55348 18.3678 1.65196L18.3622 1.6463Z"
						fill="url(#paint1_linear_3214_9505)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9505"
							x1="8.5"
							y1="11"
							x2="8.5"
							y2="28"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9505"
							x1="18.5"
							y1="0"
							x2="18.5"
							y2="19"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F938AC" />
							<stop offset="1" stopColor="#A03C78" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'dropDownContainer',
			displayName: 'Dropdown Container',
			description: 'Dropdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
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
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
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
