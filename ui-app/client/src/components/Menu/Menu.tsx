import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './menuProperties';
import { HelperComponent } from '../HelperComponent';
import { renderChildren } from '../util/renderChildren';
import { getTranslations } from '../util/getTranslations';
import MenuStyle from './MenuStyle';

function Menu(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: { label, onClick, icon } = {},
		styleProperties,
	} = useDefinition(props.definition, propertiesDefinition, props.locationHistory, pageExtractor);

	return (
		<div className="comp compMenu">
			<HelperComponent definition={props.definition} />
			{getTranslations(label, props.pageDefinition.translations)}
		</div>
	);
}

const component: Component = {
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: MenuStyle,
};

export default component;
