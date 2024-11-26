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
						d="M7.5 16.5C7.5 15.6703 8.17031 15 9 15V14.25C9 12.1781 10.6781 10.5 12.75 10.5H19.5C20.3297 10.5 21 9.82969 21 9V7.5V3.25781C22.7484 3.87656 24 5.54063 24 7.5V9C24 11.4844 21.9844 13.5 19.5 13.5H12.75C12.3375 13.5 12 13.8375 12 14.25V15C12.8297 15 13.5 15.6703 13.5 16.5V22.5C13.5 23.3297 12.8297 24 12 24H9C8.17031 24 7.5 23.3297 7.5 22.5V16.5Z"
						fill="#EDEAEA"
						className="_cphandle"
					/>
					<path
						d="M3 0C1.34531 0 0 1.34531 0 3V6C0 7.65469 1.34531 9 3 9H16.5C18.1547 9 19.5 7.65469 19.5 6V3C19.5 1.34531 18.1547 0 16.5 0H3Z"
						className="_cptube"
						fill="#FF6A1F"
					/>
					<path
						d="M3 0C1.34531 0 0 1.34531 0 3V6C0 7.65469 1.34531 9 3 9H16.5C18.1547 9 19.5 7.65469 19.5 6V3C19.5 1.34531 18.1547 0 16.5 0H3Z"
						fill="#2A6AFF"
						className="_cptube1"
						opacity={0}
					/>
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
