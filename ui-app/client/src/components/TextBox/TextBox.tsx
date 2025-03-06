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

const REGEX_NUMBER = /^(?![.,])[0-9.,]+$/;

interface mapType {
	[key: string]: any;
}

function TextBox(props: Readonly<ComponentProps>) {
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
			onLeftIconClick,
			onRightIconClick,
			showMandatoryAsterisk,
			numberFormat,
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
				if (valueType === 'number' && numberFormat) {
					const formatter = new Intl.NumberFormat(
						numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
						{ style: 'decimal' },
					);
					value = numberType === 'DECIMAL' ? parseFloat(value) : parseInt(value);
					setValue(formatter.format(value));
				} else {
					setValue(value);
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, valueType, numberFormat, numberType]);

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

	const spinnerPath4 = onLeftIconClick
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onLeftIconClick,
			)}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		(getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath2, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath3, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath4, props.locationHistory, pageExtractor)) ??
			false,
	);

	useEffect(() => {
		let paths = [];
		if (spinnerPath1) paths.push(spinnerPath1);
		if (spinnerPath2) paths.push(spinnerPath2);
		if (spinnerPath3) paths.push(spinnerPath3);
		if (spinnerPath4) paths.push(spinnerPath4);

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
	const onLeftIconEvent = onLeftIconClick
		? props.pageDefinition.eventFunctions?.[onLeftIconClick]
		: undefined;
	const onRightIconEvent = onRightIconClick
		? props.pageDefinition.eventFunctions?.[onRightIconClick]
		: undefined;
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
			if (temp === mapValue[emptyValue]) {
				setValue(mapValue[emptyValue]);
				return;
			}
			if (numberFormat) {
				const formatter = new Intl.NumberFormat(
					numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
					{ style: 'decimal' },
				);
				const commaDot = formatter.format(1234.56) === '1,234.56';
				temp = temp?.toString() ?? '';
				const tempNumber = commaDot
					? temp.replace(/,/g, '')
					: temp.replace(/\./g, '').replace(/,/g, '.');
				temp = numberType === 'DECIMAL' ? parseFloat(tempNumber) : parseInt(tempNumber);
			} else {
				const tempNumber =
					value !== ''
						? numberType === 'DECIMAL'
							? parseFloat(value)
							: parseInt(value)
						: temp;
				temp = isNaN(tempNumber) ? temp : tempNumber;
			}
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

		let tempNumber;
		if (temp === mapValue[emptyValue]) {
			setValue(mapValue[emptyValue]);
		}
		if (numberFormat) {
			if (!REGEX_NUMBER.test(temp)) return;

			const formatter = new Intl.NumberFormat(
				numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
				{ style: 'decimal' },
			);
			const commaDot = formatter.format(1234.56) === '1,234.56';
			temp = temp?.toString();
			tempNumber = commaDot
				? temp.replace(/,/g, '')
				: temp.replace(/\./g, '').replace(/,/g, '.');
			tempNumber = numberType === 'DECIMAL' ? parseFloat(tempNumber) : parseInt(tempNumber);
			temp = formatter.format(tempNumber);
			if (text[text.length - 1] === ',' || text[text.length - 1] === '.')
				temp += text[text.length - 1];
			if (updateStoreImmediately && bindingPathPath) {
				if (text[text.length - 1] === ',' || text[text.length - 1] === '.') {
					setValue(temp);
				} else {
					setData(bindingPathPath, tempNumber, context?.pageName);
					callChangeEvent();
				}
			}
		} else {
			tempNumber = numberType === 'DECIMAL' ? parseFloat(temp) : parseInt(temp);
			temp = !isNaN(tempNumber) ? tempNumber : temp;
			if (updateStoreImmediately && bindingPathPath) {
				setData(bindingPathPath, temp, context?.pageName);
				callChangeEvent();
			}
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

	const handleLeftIcon = onLeftIconEvent
		? async () =>
				await runEvent(
					onLeftIconEvent,
					onLeftIconClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				)
		: undefined;

	const handleRightIcon = onRightIconEvent
		? async () => {
				await runEvent(
					onRightIconEvent,
					onRightIconClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			}
		: undefined;

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
				valueType={numberFormat ? 'text' : valueType}
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
				handleLeftIcon={handleLeftIcon}
				handleRightIcon={handleRightIcon}
				showMandatoryAsterisk={
					showMandatoryAsterisk &&
					(validation ?? []).find(
						(e: any) => e.type === undefined || e.type === 'MANDATORY',
					)
						? true
						: false
				}
			/>
		</>
	);
}

const component: Component = {
	order: 5,
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
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="3" fill="#EC255A" />
					<path
						id="_text_box_text"
						d="M22.0608 7.52344V11.4658H21.6741C21.4449 10.5563 21.1907 9.90462 20.9114 9.51074C20.6321 9.1097 20.2489 8.79102 19.762 8.55469C19.4898 8.42578 19.0136 8.36133 18.3333 8.36133H17.2483V19.5977C17.2483 20.3424 17.2877 20.8079 17.3665 20.9941C17.4524 21.1803 17.6135 21.3451 17.8499 21.4883C18.0933 21.6243 18.4228 21.6924 18.8381 21.6924H19.3215V22.0898H11.6946V21.6924H12.178C12.6005 21.6924 12.9407 21.6172 13.1985 21.4668C13.3847 21.3665 13.5315 21.1947 13.6389 20.9512C13.7177 20.7793 13.7571 20.3281 13.7571 19.5977V8.36133H12.7043C11.7232 8.36133 11.0107 8.56901 10.5667 8.98438C9.9436 9.56445 9.54972 10.3916 9.38501 11.4658H8.97681V7.52344H22.0608Z"
						fill="white"
					/>
					<g id="_text_box_caret" opacity={0}>
						<rect width="2" height="18" transform="translate(5 6)" fill="white" />
					</g>
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
