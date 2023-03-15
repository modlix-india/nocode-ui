import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './iconProperties';
import { Component } from '../../types/common';
import IconStyle from './IconStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Icon(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { icon, iconPack } = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compIcon" style={styleProperties.comp ?? {}}>
			<HelperComponent definition={definition} />
			<i className={`_icon ${icon}`} style={styleProperties.icon ?? {}}></i>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-fonticons',
	name: 'Icon',
	displayName: 'Icon',
	description: 'Icon component',
	component: Icon,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: IconStyle,
};

export default component;
