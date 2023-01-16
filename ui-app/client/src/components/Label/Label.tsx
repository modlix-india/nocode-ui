import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
	Translations,
} from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './labelProperties';
import { Component } from '../../types/common';
import LabelStyle from './LabelStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Label(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { text } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	return (
		<div className="comp compLabel">
			<HelperComponent definition={definition} />
			<span style={resolvedStyles.label ?? {}}>{getTranslations(text, translations)}</span>
		</div>
	);
}

const component: Component = {
	name: 'Label',
	displayName: 'Label',
	description: 'Label component',
	component: Label,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: LabelStyle,
};

export default component;
