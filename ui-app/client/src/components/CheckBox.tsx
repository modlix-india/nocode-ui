import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
import { Location } from './types';
export interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: {
				value: string;
				location: Location;
			};
			form: {
				value: string;
				location: Location;
			};
			isDisabled: {
				value: string;
				location: Location;
			};
			bindingPath: {
				value: string;
				location: Location;
			};
		};
	};
	locationHistory: Array<string | Location>;
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: { [key: string]: string };
		};
	};
}

function CheckBoxComponent(props: CheckBoxProps) {
	const {
		pageDefinition: { eventFunctions, translations },
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
		locationHistory,
		...rest
	} = props;
	if (!bindingPathLocation) return <>Binding Path Required</>;
	const [checkBoxdata, setCheckBoxData] = useState(
		getData(
			getData(bindingPathLocation, locationHistory),
			locationHistory,
		) || false,
	);
	const formId = getData(form, locationHistory);
	const bindingPath = getData(bindingPathLocation, locationHistory);
	const checkBoxLabel = getData(label, locationHistory);
	const isDisabledCheckbox = getData(isDisabled, locationHistory);

	useEffect(() => {
		addListener(bindingPath, (_, value) => {
			setCheckBoxData(value);
		});
	}, [bindingPath, setCheckBoxData]);
	const handleChange = (event: any) => {
		setData(bindingPath, event.target.checked);
	};
	return (
		<div className="comp compCheckBox">
			<HelperComponent />
			<label className="checkbox" htmlFor={key}>
				<input
					disabled={isDisabledCheckbox}
					type="checkbox"
					id={key}
					name={name}
					onChange={handleChange}
					checked={checkBoxdata}
				/>
				{getTranslations(checkBoxLabel, translations)}
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
