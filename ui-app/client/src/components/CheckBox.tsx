import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { runEvent } from './util/runEvent';
import { getChildrenByType } from './util/getChildrenByType';
import { renderChildren } from './util/renderChildren';
import { HelperComponent } from './HelperComponent';
export interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
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

function CheckBoxComponent(props: CheckBoxProps) {
	const {
		pageDefinition: { eventFunctions },
		definition: {
			key,
			name,
			children,
			properties: {
				label,
				isDisabled,
				form,
				bindingPath: bindingPathLocation,
			},
		},
		...rest
	} = props;
	if (!bindingPathLocation) return <>Binding Path Required</>;
	const [checkBoxdata, setCheckBoxData] = useState(
		getData(getData(bindingPathLocation)) || false,
	);
	const formId = getData(form);
	const bindingPath = getData(bindingPathLocation);
	const checkBoxLabel = getData(label);
	const isDisabledCheckbox = getData(isDisabled);

	useEffect(() => {
		addListener(bindingPath, (_, value) => {
			setCheckBoxData(value);
		});
	}, [bindingPath, setCheckBoxData]);
	const handleChange = (event: any) => {
		setData(bindingPath, event.target.checked);
	};
	return (
		<div className='comp compCheckBox'>
			<HelperComponent/>
			<label className="checkbox" htmlFor={key}>
				<input
					disabled={isDisabledCheckbox}
					type="checkbox"
					id={key}
					name={name}
					onChange={handleChange}
					checked={checkBoxdata}
				/>
				{checkBoxLabel}
			</label>
			</div>
		
	);
}

CheckBoxComponent.propertiesSchema = Schema.ofObject('CheckBox')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const CheckBox = CheckBoxComponent;
