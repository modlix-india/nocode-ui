import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { DataLocation, ComponentProperty, RenderContext } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import properties from './radioButtonProperties';
import { Component } from '../../types/common';

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

const component: Component = {
	icon: 'fa-solid fa-circle-dot',
	name: 'RadioButton',
	displayName: 'RadioButton',
	description: 'RadioButton component',
	component: RadioButton,
	propertyValidation: (props: RadioButtonProps): Array<string> => [],
	properties,
};

export default component;
