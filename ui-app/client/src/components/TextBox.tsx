import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Location } from './types';
import { getTranslations } from './util/getTranslations';
import { runEvent } from './util/runEvent';

export interface TextBoxProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		properties: {
			bindingPath: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};

			mandatory?: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			label: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			leftIcon: {
				icon?: {
					value: string;
					location: {
						type: 'EXPRESSION' | 'VALUE';
						value?: string;
						expression?: string;
					};
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
			isDisabled: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			defaultValue: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			supportingText: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			validators: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			readonly?: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
	locationHistory: Array<Location | string>;
}

function TextBoxComponent(props: TextBoxProps) {
	const {
		definition: {
			key,
			properties: {
				label,
				bindingPath,
				leftIcon = {},
				isDisabled,
				defaultValue,
				supportingText,
				validators,
			},
		},
		pageDefinition: { eventFunctions, translations },
		locationHistory,
		...rest
	} = props;
	const { iconStyle: leftIconStyle = 'SOLID', icon: leftIconLocation } =
		leftIcon;
	const functionExecutionStorePath = `${FUNCTION_EXECUTION_PATH}.${key}.isRunning`;
	const textBoxLeftIcon = leftIconLocation
		? getData(leftIconLocation, locationHistory)
		: undefined;
	const textBoxValidators =
		eventFunctions[getData(validators, locationHistory)];
	const isDisabledTextBox = getData(isDisabled, locationHistory);
	const textBoxBindingPath = getData(bindingPath, locationHistory);
	const textBoxDefaultValue = getData(defaultValue, locationHistory);
	const textBoxSupportingText = getData(supportingText, locationHistory);
	const [isDirty, setIsDirty] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState('');
	const [value, setvalue] = React.useState(
		getData(textBoxBindingPath, locationHistory) ||
			textBoxDefaultValue ||
			'',
	);
	const [isFocussed, setIsFocussed] = React.useState(false);
	const [hasText, setHasText] = React.useState(false);
	const textBoxLabel = getData(label, locationHistory);
	React.useEffect(() => {
		const unsubscribe = addListener(textBoxBindingPath, (_, value) => {
			setvalue(value);
		});
		return () => {
			unsubscribe();
		};
	}, []);
	const handleFocus = () => {
		setIsFocussed(true);
	};
	const handleBlur = async () => {
		setIsFocussed(false);
		if (textBoxValidators) {
			const validatorResult: any = await runEvent(textBoxValidators, key);
			if (validatorResult?.error) {
				setErrorMessage(validatorResult.error);
			}
			setData(functionExecutionStorePath, false);
		}
	};
	const handleChange = (event: any) => {
		if (!isDirty) {
			setIsDirty(true);
		}
		setData(textBoxBindingPath, event?.target.value);
	};
	const handleClickClose = () => {
		setvalue('');
	};

	return (
		<div className="comp compTextBox">
			<HelperComponent />
			<div
				className={`textBoxDiv ${errorMessage ? 'error' : ''} ${
					isFocussed && !value.length ? 'focussed' : ''
				} ${value.length && !isDisabledTextBox ? 'hasText' : ''} ${
					isDisabledTextBox ? 'textBoxDisabled' : ''
				} ${
					textBoxLeftIcon
						? 'textBoxwithIconContainer'
						: 'textBoxContainer'
				}`}
			>
				{textBoxLeftIcon && (
					<i
						className={`leftIcon ${
							leftIconStyle === 'SOLID'
								? 'fa-solid'
								: 'fa-regular'
						} ${textBoxLeftIcon} fa-fw`}
					/>
				)}
				<div className="inputContainer">
					<input
						className="textbox"
						type={'text'}
						value={value}
						onChange={handleChange}
						placeholder={getTranslations(
							textBoxLabel,
							translations,
						)}
						onFocus={handleFocus}
						onBlur={handleBlur}
						name={key}
						id={key}
						disabled={isDisabledTextBox}
					/>
					<label
						htmlFor={key}
						className={`textBoxLabel ${
							errorMessage ? 'error' : ''
						} ${isDisabledTextBox ? 'disabled' : ''}`}
					>
						{getTranslations(textBoxLabel, translations)}
					</label>
				</div>
				{value.length ? (
					<i
						onClick={handleClickClose}
						className="clearText fa-solid fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			<label
				className={`supportText ${
					isDisabledTextBox ? 'disabled' : ''
				} ${errorMessage ? 'error' : ''}`}
			>
				{errorMessage ? errorMessage : textBoxSupportingText}
			</label>
		</div>
	);
}

TextBoxComponent.propertiesSchema = Schema.ofObject('TextBox')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['bindingPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const TextBox = TextBoxComponent;
