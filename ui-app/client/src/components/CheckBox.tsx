import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import {
	addListener,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
import { DataLocation, ComponentProperty, RenderContext } from '../types/common';

interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: ComponentProperty<string>;
			isDisabled: ComponentProperty<string>;
			bindingPath: DataLocation;
		};
	};
	locationHistory: Array<string | DataLocation>;
	context: RenderContext;
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: { [key: string]: string };
		};
	};
}

function CheckBox(props: CheckBoxProps) {
	const {
		pageDefinition: { eventFunctions, translations },
		definition: {
			key,
			name,
			children,
			properties: { label, isDisabled, bindingPath },
		},
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	if (!bindingPath) return <>Binding Path Required</>;
	const [checkBoxdata, setCheckBoxData] = useState(
		getDataFromLocation(bindingPath, locationHistory, pageExtractor) || false,
	);
	const checkBoxLabel = getData(label, locationHistory, pageExtractor);
	const isDisabledCheckbox = !!getData(isDisabled, locationHistory, pageExtractor);

	useEffect(() => {
		return addListener((_, value) => {
			setCheckBoxData(value);
		}, getPathFromLocation(bindingPath, locationHistory));
	}, [bindingPath, setCheckBoxData]);
	const handleChange = (event: any) => {
		setData(getPathFromLocation(bindingPath, locationHistory), event.target.checked);
	};
	return (
		<div className="comp compCheckBox">
			<HelperComponent definition={definition} />
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

CheckBox.propertiesSchema = Schema.ofObject('CheckBox')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default CheckBox;
