import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';

export interface RadioButtonProps
	extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			form: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			isDisabled: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			bindingPath: {
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
}

function RadioButtonComponent(props: RadioButtonProps) {
	const {
		definition: {
			name,
			properties: { label },
		},
		pageDefinition: { translations },
	} = props;
	const labelValue = getData(label);
	return (
		<div className="comp compRadioButton">
			<HelperComponent />
			<label className=" radiobutton">
				<input type="radio" name={name} />
				{getTranslations(labelValue, translations)}
			</label>
		</div>
	);
}

RadioButtonComponent.propertiesSchema = Schema.ofObject('RadioButton')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const RadioButton = RadioButtonComponent;
