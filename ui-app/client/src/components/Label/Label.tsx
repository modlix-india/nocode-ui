import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentProperty, DataLocation, RenderContext, Translations } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import properties from './labelProperties';
import { Component } from '../../types/component';
import LabelStyle from './LabelStyle';

interface LabelProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			text: ComponentProperty<string>;
		};
	};
	pageDefinition: {
		translations: Translations;
	};
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
}

function Label(props: LabelProps) {
	const {
		pageDefinition: { translations },
		definition: {
			properties: { text },
		},
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const labelText = getData(text, locationHistory, pageExtractor);
	return (
		<div className="comp compLabel">
			<HelperComponent definition={definition} />
			<span>{getTranslations(labelText, translations)}</span>
		</div>
	);
}

const component: Component = {
	name: 'Label',
	displayName: 'Label',
	description: 'Label component',
	component: Label,
	propertyValidation: (props: LabelProps): Array<string> => [],
	properties,
	styleComponent: LabelStyle,
};

export default component;
