import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';

export interface TextBoxProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
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
			leftIcon?: {
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
			rightIcon?: {
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
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
}

export function TextBoxComponent(props: TextBoxProps) {
	const {
		definition: {
			properties: {
				label,
				bindingPath,
				leftIcon,
				rightIcon,
				mandatory,
				readonly,
			},
		},
		pageDefinition: { translations },
		...rest
	} = props;
	const [value, setvalue] = React.useState('');
	const [hasText, setHasText] = React.useState(false);
	const textBoxLabel = getData(label);
	const textBoxBindingPath = getData(bindingPath);
	const textBoxMandatory = getData(mandatory);
	const textBoxMandatoryJSX = textBoxMandatory?.length ? (
		<i className="fa-regular fa-circle-exclamation fa-fw textBoxIcon" />
	) : null;
	React.useEffect(() => {
		const unsubscribe = addListener(textBoxBindingPath, (_, value) => {
			setvalue(value);
		});
		return () => {
			unsubscribe();
		};
	}, []);

	const handleChange = (event: any) => {
		console.log(event?.target.value);
		setData(textBoxBindingPath, event?.target.value);
	};
	const handleClickClose = (event: any) => {
		setvalue('');
	};

	return (
		<div className="comp compTextBox">
			<HelperComponent />
			<div
				className={
					textBoxMandatory && !value.length
						? 'textBoxDivSupport'
						: 'textBoxDiv'
				}
			>
				<i
					className={'fa-solid fa-magnifying-glass textBoxIcon fa-fw'}
				/>
				<input
					className="textbox"
					type={'text'}
					value={value}
					onChange={handleChange}
					placeholder={getTranslations(textBoxLabel, translations)}
				/>
				<label className={'textBoxLabel'}>
					{getTranslations(textBoxLabel, translations)}
				</label>
				{value.length ? (
					<i
						className={
							'fa-regular fa-circle-xmark textBoxIcon fa-fw'
						}
						onClick={handleClickClose}
					/>
				) : (
					textBoxMandatoryJSX
				)}
			</div>
			{textBoxMandatory && !value.length ? (
				<label className="textboxSupportText">{textBoxMandatory}</label>
			) : (
				''
			)}
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
