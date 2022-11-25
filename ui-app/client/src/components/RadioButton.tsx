import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData, PageStoreExtractor } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { DataLocation, ComponentProperty, RenderContext } from '../types/common';
import { getTranslations } from './util/getTranslations';

interface RadioButtonProps extends React.ComponentPropsWithoutRef<'input'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			label: ComponentProperty<string>;
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
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function RadioButton(props: RadioButtonProps) {
	const {
		definition: {
			name,
			properties: { label },
		},
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const labelValue = getData(label, locationHistory, pageExtractor);
	return (
		<div className="comp compRadioButton">
			<HelperComponent definition={definition} />
			<label className=" radiobutton">
				<input type="radio" name={name} />
				{getTranslations(labelValue, translations)}
			</label>
		</div>
	);
}

RadioButton.propertiesSchema = Schema.ofObject('RadioButton')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['form', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['isDisabled', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default RadioButton;
