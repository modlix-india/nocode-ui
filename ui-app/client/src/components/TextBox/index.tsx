import React from 'react';
import {
	addListener,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentProperty, DataLocation, RenderContext } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import { Validation } from '../../types/validation';
import { Component } from '../../types/component';
import properties from './textBoxProperties';

interface TextBoxProperties {
	bindingPath: DataLocation;
	mandatory?: ComponentProperty<boolean>;
	label: ComponentProperty<string>;
	leftIcon: ComponentProperty<string>;
	readOnly?: ComponentProperty<boolean>;
	defaultValue: ComponentProperty<any>;
	supportingText: ComponentProperty<string>;
	validations: Array<Validation>;
}

interface TextBoxComponentProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		properties: TextBoxProperties;
	};
	pageDefinition: {
		name: string;
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function TextBox(props: TextBoxComponentProps) {
	const {
		definition: {
			key,
			properties: {
				label,
				bindingPath,
				leftIcon = {},
				readOnly,
				defaultValue,
				supportingText,
			},
		},
		definition,
		pageDefinition: { name: pageName, eventFunctions, translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const textBoxLeftIcon = leftIcon
		? getData(leftIcon, locationHistory, pageExtractor)
		: undefined;
	const isDisabledTextBox = getData(readOnly, locationHistory, pageExtractor);
	const textBoxBindingPath = getPathFromLocation(bindingPath, locationHistory);
	const textBoxDefaultValue = getData(defaultValue, locationHistory, pageExtractor);
	const textBoxSupportingText = getData(supportingText, locationHistory, pageExtractor);
	const [isDirty, setIsDirty] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState('');
	const [value, setvalue] = React.useState('');
	const [isFocussed, setIsFocussed] = React.useState(false);
	const [hasText, setHasText] = React.useState(false);
	const textBoxLabel = getData(label, locationHistory, pageExtractor);
	React.useEffect(
		() =>
			addListener((_, value) => {
				setvalue(value ?? textBoxDefaultValue);
			}, textBoxBindingPath),
		[],
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
		setData(textBoxBindingPath, event?.target.value, context?.pageName);
	};
	const handleClickClose = () => {
		setvalue('');
	};

	return (
		<div className="comp compTextBox">
			<HelperComponent definition={definition} />
			<div
				className={`textBoxDiv ${errorMessage ? 'error' : ''} ${
					isFocussed && !value.length ? 'focussed' : ''
				} ${value.length && !isDisabledTextBox ? 'hasText' : ''} ${
					isDisabledTextBox ? 'textBoxDisabled' : ''
				} ${textBoxLeftIcon ? 'textBoxwithIconContainer' : 'textBoxContainer'}`}
			>
				{textBoxLeftIcon && <i className={`leftIcon ${textBoxLeftIcon}`} />}
				<div className="inputContainer">
					<input
						className="textbox"
						type={'text'}
						value={value}
						onChange={handleChange}
						placeholder={getTranslations(textBoxLabel, translations)}
						onFocus={handleFocus}
						onBlur={handleBlur}
						name={key}
						id={key}
						disabled={isDisabledTextBox}
					/>
					<label
						htmlFor={key}
						className={`textBoxLabel ${errorMessage ? 'error' : ''} ${
							isDisabledTextBox ? 'disabled' : ''
						}`}
					>
						{getTranslations(textBoxLabel, translations)}
					</label>
				</div>
				{value.length ? (
					<i
						onClick={handleClickClose}
						className="clearText fa fa-solid fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			<label
				className={`supportText ${isDisabledTextBox ? 'disabled' : ''} ${
					errorMessage ? 'error' : ''
				}`}
			>
				{errorMessage ? errorMessage : textBoxSupportingText}
			</label>
		</div>
	);
}

const component: Component = {
	name: 'TextBox',
	displayName: 'TextBox',
	description: 'TextBox component',
	component: TextBox,
	propertyValidation: (props: TextBoxProperties): Array<string> => [],
	properties,
};

export default component;
