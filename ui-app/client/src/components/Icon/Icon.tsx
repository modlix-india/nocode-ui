import React from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { Component, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './iconProperties';
import IconStyle from './IconStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './iconStyleProperies';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

function Icon(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties: { icon, designType, colorScheme } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
			urlExtractor,
		);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<i
			className={`comp compIcon _icon ${designType} ${colorScheme} ${icon}`}
			style={styleProperties.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
		</i>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 15,
	name: 'Icon',
	displayName: 'Icon',
	description: 'Icon component',
	component: Icon,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: IconStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Icon',
		type: 'Icon',
		properties: {
			icon: { value: 'fa fa-solid fa-icons' },
		},
	},
	sections: [{ name: 'Icons', pageName: 'icon' }],
		stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [designType, colorScheme],
};

export default component;
