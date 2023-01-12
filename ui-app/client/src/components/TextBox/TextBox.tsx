import React from 'react';
import {
	addListener,
	getDataFromLocation,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { Validation } from '../../types/validation';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import useDefinition from '../util/useDefinition';

interface mapType {
	[key: string]:  any
}

function TextBox(props: ComponentProps) {
	const [isDirty, setIsDirty] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState('');
	const [value, setvalue] = React.useState('');
	const [isFocussed, setIsFocussed] = React.useState(false);
	const [hasText, setHasText] = React.useState(false);
	const mapValue: mapType = {
		"UNDEFINED": undefined,
		"NULL": null,
		"ENMPTYSTRING": '',
		"ZERO": 0,
	}
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
			maxValue,
			minValue,
			valueType,
			emptyValue,
			validation,
			supportingText,
			readOnly,
			defaultValue,
			rightIcon,
			leftIcon,
			label,
			noFloat,
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
	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	const textBoxValue = getDataFromLocation(bindingPath, locationHistory, pageExtractor);
	React.useEffect(
		() =>
			addListener(
				(_, value) => {
					setvalue(value ?? defaultValue ?? '');
				},
				pageExtractor,
				bindingPathPath,
			),
		[bindingPathPath],
	);
	const handleFocus = () => {
		setIsFocussed(true);
	};
	const handleBlur = async (event: any) => {
		if(!updateStoreImmediately) {
			if(event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, value, context?.pageName);
			}
		}
		setIsFocussed(false);
	};
	const handleChange = (event: any) => {
		let temp = event?.target.value === '' && emptyValue ? mapValue[emptyValue] : event?.target.value;
		if (!isDirty) {
			setIsDirty(true);
		}
		if(valueType === 'number' && (temp > maxValue || temp < minValue)) {
			temp = event?.target.value > maxValue ? maxValue?.toString() : minValue?.toString();
		}
		if(updateStoreImmediately) {
			if(removeKeyWhenEmpty && temp === '') {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}	
		}
		else {
			setvalue(temp);
		}
	};
	const handleClickClose = () => {
		let temp = emptyValue ? mapValue[emptyValue] : value;
		if(removeKeyWhenEmpty) {
			setData(bindingPathPath, undefined, context?.pageName, true);
		} else {
			setData(bindingPathPath, temp, context?.pageName);
		}
	};
	return (
		<div className="comp compTextBox">
			<HelperComponent definition={definition} />
			{noFloat && (
				<label
					htmlFor={key}
					className={`textBoxLabel ${errorMessage ? 'error' : ''} ${
						readOnly ? 'disabled' : ''
					}`}
				>
					{getTranslations(label, translations)}
				</label>
			)}
			<div
				className={`textBoxDiv ${errorMessage ? 'error' : ''} ${
					isFocussed && !value?.length ? 'focussed' : ''
				} ${value?.length && !readOnly ? 'hasText' : ''} ${
					readOnly ? 'textBoxDisabled' : ''
				} ${leftIcon || rightIcon ? 'textBoxwithIconContainer' : 'textBoxContainer'}`}
			>
				{leftIcon && <i className={`leftIcon ${leftIcon}`} />}
				{rightIcon && <i className={`rightIcon ${rightIcon}`} />}
				<div className="inputContainer">
					<input
						className={`textbox ${valueType === "number" ? "remove-spin-button" : ""}`}
						type={valueType}
						value={value}
						onChange={handleChange}
						placeholder={getTranslations(label, translations)}
						onFocus={handleFocus}
						onBlur={handleBlur}
						name={key}
						id={key}
						disabled={readOnly}
					/>
					{!noFloat && (
						<label
							htmlFor={key}
							className={`textBoxLabel ${errorMessage ? 'error' : ''} ${
								readOnly ? 'disabled' : ''
							}`}
						>
							{getTranslations(label, translations)}
						</label>
					)}
				</div>
				{errorMessage ? 
				<i className={`errorIcon ${value?.length ? `hasText` : ``} fa fa-solid fa-circle-exclamation`}/>
				: value?.length ? (
					<i
						onClick={handleClickClose}
						className="clearText fa fa-regular fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			<label
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
	stylePseudoStates: ['focus', 'disabled']
};

export default component;
