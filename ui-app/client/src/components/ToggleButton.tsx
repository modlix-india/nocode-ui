import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData } from '../context/StoreContext';

export interface ToggelButtonProps
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
	};
}

function ToggelButtonComponent(props: ToggelButtonProps) {
	const {
		definition: {
			key,
			name,
			properties: { label },
		},
	} = props;
	const labelValue = getData(label);
	return (
		<>
			<label className="compToggleButton toggleButton">
				<input type="checkbox" name={name} id={key} />
				{labelValue}
			</label>
		</>
	);
}

ToggelButtonComponent.propertiesSchema = Schema.ofObject('ToggleButton')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const ToggleButton = ToggelButtonComponent;
