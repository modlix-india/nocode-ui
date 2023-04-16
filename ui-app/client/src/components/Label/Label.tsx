import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './labelProperties';
import LabelStyle from './LabelStyle';

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
	let finText = text;
	if (typeof finText === 'object') {
		finText = JSON.stringify(finText);
	} else {
		finText = '' + finText;
	}
	return (
		<div className="comp compLabel">
			<HelperComponent definition={definition} />
			<span style={resolvedStyles.text ?? {}}>{getTranslations(finText, translations)}</span>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-font',
	name: 'Label',
	displayName: 'Label',
	description: 'Label component',
	component: Label,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: LabelStyle,
	defaultTemplate: {
		key: '',
		name: 'Label',
		type: 'Label',
		properties: {
			text: { value: 'Label' },
		},
	},
};

export default component;
