import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import useDefinition from '../util/useDefinition';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';
import { validate } from '../../util/validationProcessor';
import CommonInputText from '../../commonComponents/CommonInputText';
import { styleDefaults } from './textBoxStyleProperties';
import { IconHelper } from '../util/IconHelper';

interface mapType {
	[key: string]: any;
}

function TextBox(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const mapValue: mapType = {
		UNDEFINED: undefined,
		NULL: null,
		ENMPTYSTRING: '',
		ZERO: 0,
	};
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			updateStoreImmediately: upStoreImm,
			removeKeyWhenEmpty,
			valueType,
			emptyValue,
			supportingText,
			readOnly,
			defaultValue,
			rightIcon,
			leftIcon,
			label,
			noFloat,
			numberType,
			isPassword,
			onEnter,
			validation,
			placeholder,
			messageDisplay,
			autoComplete,
			onClear,
			onChange,
			autoFocus,
			designType,
			colorScheme,
			showNumberSpinners,
			hideClearButton,
			maxChars,
			onFocus,
			onBlur,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [value, setValue] = React.useState(defaultValue ?? '');

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setValue('');
					return;
				}
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const spinnerPath1 = onEnter
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onEnter,
		  )}.isRunning`
		: undefined;

	const spinnerPath2 = onClear
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onClear,
		  )}.isRunning`
		: undefined;

	const spinnerPath3 = onChange
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onChange,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		(getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath2, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath3, props.locationHistory, pageExtractor)) ??
			false,
	);

	useEffect(() => {
		let paths = [];
		if (spinnerPath1) paths.push(spinnerPath1);
		if (spinnerPath2) paths.push(spinnerPath2);
		if (spinnerPath3) paths.push(spinnerPath3);

		if (!paths.length) return;
		return addListener((_, value) => setIsLoading(value), pageExtractor, ...paths);
	}, []);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: isLoading || readOnly },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			value,
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
	}, [value, validation]);
	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;
	const updateStoreImmediately = upStoreImm || autoComplete === 'on';

	const callChangeEvent = useCallback(() => {
		if (!changeEvent) return;
		(async () =>
			await runEvent(
				changeEvent,
				onChange,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [changeEvent]);

	const callBlurEvent = useCallback(() => {
		if (!blurEvent) return;
		(async () =>
			await runEvent(
				blurEvent,
				onBlur,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [blurEvent]);

	const callFocusEvent = useCallback(() => {
		if (!focusEvent) return;
		(async () =>
			await runEvent(
				focusEvent,
				onFocus,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [focusEvent]);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (valueType === 'number') {
			const tempNumber =
				value !== ''
					? numberType === 'DECIMAL'
						? parseFloat(value)
						: parseInt(value)
					: temp;
			temp = isNaN(tempNumber) ? temp : tempNumber;
		}
		if (!updateStoreImmediately && bindingPathPath) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
			callChangeEvent();
		}
		callBlurEvent();
		setFocus(false);
	};

	const handleInputFocus = () => {
		setFocus(true);
		callFocusEvent();
	};

	const handleTextChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately && bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!updateStoreImmediately) setValue(text);
	};

	const handleNumberChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		let tempNumber = numberType === 'DECIMAL' ? parseFloat(temp) : parseInt(temp);
		temp = !isNaN(tempNumber) ? tempNumber : temp;
		if (updateStoreImmediately && bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}

		if (!updateStoreImmediately) setValue(!isNaN(tempNumber) ? temp?.toString() : '');
	};

	const handleChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		if (valueType === 'text') handleTextChange(event.target.value);
		else handleNumberChange(event.target.value);
	};

	const handleClickClose = async () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!onClear) return;
		const clearEvent = props.pageDefinition.eventFunctions?.[onClear];
		if (!clearEvent) return;
		await runEvent(
			clearEvent,
			onClear,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};
	const clickEvent = onEnter ? props.pageDefinition.eventFunctions?.[onEnter] : undefined;

	const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!clickEvent || isLoading || e.key !== 'Enter') return;
		if (!updateStoreImmediately) {
			handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
		}
		await runEvent(
			clickEvent,
			onEnter,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const finKey: string = 't_' + key;

	let style = undefined;
	if (valueType === 'number' && !showNumberSpinners) {
		style = (
			<style>{`.comp.compTextBox #${finKey}::-webkit-inner-spin-button, .comp.compTextBox #${finKey}::-webkit-outer-spin-button {-webkit-appearance: none;margin: 0;}`}</style>
		);
	}

	return (
		<>
			{style}
			<CommonInputText
				cssPrefix="comp compTextBox"
				id={finKey}
				noFloat={noFloat}
				readOnly={readOnly}
				value={value}
				label={label}
				translations={translations}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				valueType={valueType}
				isPassword={isPassword}
				placeholder={placeholder}
				hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
				validationMessages={validationMessages}
				context={context}
				handleChange={handleChange}
				clearContentHandler={handleClickClose}
				blurHandler={handleBlur}
				keyUpHandler={handleKeyUp}
				focusHandler={() => handleInputFocus()}
				supportingText={supportingText}
				messageDisplay={messageDisplay}
				styles={computedStyles}
				designType={designType}
				colorScheme={colorScheme}
				definition={props.definition}
				autoComplete={autoComplete}
				autoFocus={autoFocus}
				hasValidationCheck={validation?.length > 0}
				hideClearContentIcon={hideClearButton}
				maxChars={maxChars}
			/>
		</>
	);
}

const component: Component = {
	name: 'TextBox',
	displayName: 'Text Box',
	description: 'TextBox component',
	component: TextBox,
	styleComponent: TextBoxStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Text Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'TextBox',
		name: 'TextBox',
		properties: {
			label: { value: 'TextBox' },
		},
	},
	sections: [{ name: 'Text Box', pageName: 'textBox' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect width="24" height="24" fill="#D9D9D9" fillOpacity="0.1" />
					<path
						d="M15.832 7.73047V10.2393H15.5859C15.4401 9.66048 15.2783 9.24577 15.1006 8.99512C14.9229 8.73991 14.679 8.53711 14.3691 8.38672C14.196 8.30469 13.8929 8.26367 13.46 8.26367H12.7695V15.4141C12.7695 15.888 12.7946 16.1842 12.8447 16.3027C12.8994 16.4212 13.002 16.526 13.1523 16.6172C13.3073 16.7038 13.5169 16.7471 13.7812 16.7471H14.0889V17H9.23535V16.7471H9.54297C9.81185 16.7471 10.0283 16.6992 10.1924 16.6035C10.3109 16.5397 10.4043 16.4303 10.4727 16.2754C10.5228 16.166 10.5479 15.8789 10.5479 15.4141V8.26367H9.87793C9.25358 8.26367 8.80013 8.39583 8.51758 8.66016C8.12109 9.0293 7.87044 9.55566 7.76562 10.2393H7.50586V7.73047H15.832Z"
						fill="currentColor"
					/>
					<mask id="path-3-inside-1_433_993" fill="white">
						<rect x="1" y="1" width="22" height="22" rx="1" />
					</mask>
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="1"
						stroke="currentColor"
						strokeWidth="3"
						mask="url(#path-3-inside-1_433_993)"
						fill="transparent"
					/>
				</IconHelper>
			),
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
