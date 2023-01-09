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

function TextBox(props: ComponentProps) {
	const [isDirty, setIsDirty] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState('');
	const [value, setvalue] = React.useState('');
	const [isFocussed, setIsFocussed] = React.useState(false);
	const [hasText, setHasText] = React.useState(false);
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
	const handleBlur = async () => {
		setIsFocussed(false);
	};
	const handleChange = (event: any) => {
		if (!isDirty) {
			setIsDirty(true);
		}
		setData(bindingPathPath, event?.target.value, context?.pageName);
	};
	const handleClickClose = () => {
		setvalue('');
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
					isFocussed && !value.length ? 'focussed' : ''
				} ${value.length && !readOnly ? 'hasText' : ''} ${
					readOnly ? 'textBoxDisabled' : ''
				} ${leftIcon ? 'textBoxwithIconContainer' : 'textBoxContainer'}`}
			>
				{leftIcon && <i className={`leftIcon ${leftIcon}`} />}
				<div className="inputContainer">
					<input
						className="textbox"
						type={'text'}
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
				{value.length ? (
					<i
						onClick={handleClickClose}
						className="clearText fa fa-solid fa-circle-xmark fa-fw"
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
};

export default component;
