import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { DataLocation, ComponentProperty, RenderContext } from '../../types/common';
import { Component } from '../../types/component';
import properties from './checkBoxProperties';

interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: ComponentProperty<string>;
			readOnly: ComponentProperty<boolean>;
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
			properties: { label, readOnly, bindingPath },
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
	const readOnlyCheckbox = !!getData(readOnly, locationHistory, pageExtractor);

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
					disabled={readOnlyCheckbox}
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

const component: Component = {
	name: 'CheckBox',
	displayName: 'CheckBox',
	description: 'CheckBox component',
	component: CheckBox,
	propertyValidation: (props: CheckBoxProps): Array<string> => [],
	properties,
};

export default component;
