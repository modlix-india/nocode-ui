import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData, PageStoreExtractor } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { ComponentProperty, Translations } from './Types';
import { getTranslations } from './util/getTranslations';

interface LabelProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			text: ComponentProperty<string>;
		};
	};
	pageDefinition: {
		translations: Translations;
	};
	context: string;
}

function Label(props: LabelProps) {
	const {
		pageDefinition: { translations },
		definition: {
			properties: { text },
		},
		definition,
		context,
	} = props;
	const labelText = getData(text, PageStoreExtractor.getForContext(context));
	return (
		<div className="comp compLabel">
			<HelperComponent definition={definition} />
			<span>{getTranslations(labelText, translations)}</span>
		</div>
	);
}

Label.propertiesSchema = Schema.ofObject('Label')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(new Map([['text', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)]]));

export default Label;
