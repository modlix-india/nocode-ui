import React, { useEffect, useState } from 'react';
import {
	addListener,
	getDataFromLocation,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import useDefinition from '../util/useDefinition';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';

interface mapType {
	[key: string]: any;
}

function TextBox(props: ComponentProps) {
	const [isDirty, setIsDirty] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState('');
	const [focus, setFocus] = React.useState(false);
	const [show, setShow] = React.useState(false);
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
			updateStoreImmediately,
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
	const computedStyles = processComponentStylePseudoClasses(
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);
	const [value, setvalue] = React.useState(defaultValue ?? '');
	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	React.useEffect(() => {
		const initValue = getDataFromLocation(bindingPath, locationHistory, pageExtractor);
		if (!isNullValue(defaultValue) && isNullValue(initValue)) {
			setData(bindingPathPath, defaultValue, context.pageName);
		}
		setvalue(initValue ?? defaultValue?.toString() ?? '');
	}, []);
	React.useEffect(
		() =>
			addListener(
				(_, value) => {
					if (value === undefined || value === null) {
						setvalue('');
						return;
					}
					setvalue(value);
				},
				pageExtractor,
				bindingPathPath,
			),
		[],
	);

	const spinnerPath = onEnter
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onEnter,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		onEnter ? getDataFromPath(spinnerPath, props.locationHistory) ?? false : false,
	);

	useEffect(() => {
		if (spinnerPath) {
			return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath);
		}
	}, []);

	const handleBlur = async (event: any) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (valueType === 'NUMBER') {
			const tempNumber =
				value !== ''
					? numberType === 'DECIMAL'
						? parseFloat(value)
						: parseInt(value)
					: temp;
			temp = isNaN(tempNumber) ? temp : tempNumber;
		}
		if (!updateStoreImmediately) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
		}
		setFocus(false);
	};
	const handleTextChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '') {
			setData(bindingPathPath, undefined, context?.pageName, true);
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately) setData(bindingPathPath, temp, context?.pageName);
		if (!updateStoreImmediately) setvalue(text);
	};

	const handleNumberChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '') {
			setData(bindingPathPath, undefined, context?.pageName, true);
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		let tempNumber = numberType === 'DECIMAL' ? parseFloat(temp) : parseInt(temp);
		temp = !isNaN(tempNumber) ? tempNumber : temp;
		if (updateStoreImmediately) setData(bindingPathPath, temp, context?.pageName);
		if (!updateStoreImmediately) setvalue(!isNaN(tempNumber) ? temp?.toString() : '');
	};
	const handleChange = (event: any) => {
		if (!isDirty) {
			setIsDirty(true);
		}
		if (valueType === 'STRING') handleTextChange(event.target.value);
		else handleNumberChange(event.target.value);
	};
	const handleClickClose = () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty) {
			setData(bindingPathPath, undefined, context?.pageName, true);
		} else {
			setData(bindingPathPath, temp, context?.pageName);
		}
	};
	const clickEvent = onEnter ? props.pageDefinition.eventFunctions[onEnter] : undefined;
	const handleKeyUp = onEnter
		? async (e: React.KeyboardEvent) => {
				if (!clickEvent || isLoading || e.key !== 'Enter') return;
				if (!updateStoreImmediately) {
					await handleBlur(e);
				}
				await runEvent(clickEvent, onEnter, props.context.pageName);
		  }
		: undefined;
	return (
		<div className="comp compTextBox" style={computedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			{noFloat && (
				<label
					style={computedStyles.noFloatLabel ?? {}}
					htmlFor={key}
					className={`noFloatTextBoxLabel ${readOnly ? 'disabled' : ''}${
						value?.length ? `hasText` : ``
					}`}
				>
					{getTranslations(label, translations)}
				</label>
			)}
			<div
				style={computedStyles.textBoxContainer ?? {}}
				className={`textBoxDiv ${errorMessage ? 'error' : ''} ${
					focus && !value?.length ? 'focussed' : ''
				} ${value?.length && !readOnly ? 'hasText' : ''} ${
					readOnly && !errorMessage ? 'disabled' : ''
				} ${
					leftIcon || rightIcon
						? rightIcon
							? 'textBoxwithRightIconContainer'
							: 'textBoxwithIconContainer'
						: 'textBoxContainer'
				}`}
			>
				{leftIcon && (
					<i style={computedStyles.leftIcon ?? {}} className={`leftIcon ${leftIcon}`} />
				)}
				<div className={`inputContainer`}>
					<input
						style={computedStyles.inputBox ?? {}}
						className={`textbox ${valueType === 'NUMBER' ? 'remove-spin-button' : ''}`}
						type={isPassword && !show ? 'password' : valueType}
						value={value}
						onChange={handleChange}
						placeholder={getTranslations(label, translations)}
						onFocus={
							stylePropertiesWithPseudoStates?.focus
								? () => setFocus(true)
								: undefined
						}
						onBlur={handleBlur}
						onKeyUp={handleKeyUp}
						name={key}
						id={key}
						disabled={readOnly}
					/>
					{!noFloat && (
						<label
							style={computedStyles.floatingLabel ?? {}}
							htmlFor={key}
							className={`textBoxLabel ${readOnly ? 'disabled' : ''}${
								value?.length ? `hasText` : ``
							}`}
						>
							{getTranslations(label, translations)}
						</label>
					)}
				</div>
				{rightIcon && (
					<i
						style={computedStyles.rightIcon ?? {}}
						className={`rightIcon ${rightIcon}`}
					/>
				)}
				{isPassword && !readOnly && (
					<i
						style={computedStyles.passwordIcon ?? {}}
						className={`passwordIcon ${
							show ? `fa fa-regular fa-eye` : `fa fa-regular fa-eye-slash`
						}`}
						onClick={() => setShow(!show)}
					/>
				)}
				{errorMessage ? (
					<i
						style={computedStyles.errorText ?? {}}
						className={`errorIcon ${
							value?.length ? `hasText` : ``
						} fa fa-solid fa-circle-exclamation`}
					/>
				) : value?.length && !rightIcon && !readOnly && !isPassword ? (
					<i
						style={computedStyles.supportText ?? {}}
						onClick={handleClickClose}
						className="clearText fa fa-regular fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			<label
				title={errorMessage ? errorMessage : supportingText}
				className={`supportText ${readOnly ? 'disabled' : ''} ${
					errorMessage ? 'error' : ''
				}`}
			>
				{errorMessage ? errorMessage : supportingText}
			</label>
		</div>
	);
}

const component: Component = {
	name: 'TextBox',
	displayName: 'TextBox',
	description: 'TextBox component',
	component: TextBox,
	styleComponent: TextBoxStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
};

export default component;
