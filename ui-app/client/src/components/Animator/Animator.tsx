import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import useDefinition from '../util/useDefinition';
import AnimatorStyle from './AnimatorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './animatorProperties';
import { HelperComponent } from '../HelperComponent';

function Animator(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={context}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	return (
		<div className="comp compAnimator" style={resolvedStyles.comp}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
			{childs}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-wand-magic-sparkles',
	name: 'Animator',
	displayName: 'Animator',
	description: 'Animator component',
	component: Animator,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: AnimatorStyle,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Animator',
		type: 'Animator',
	},
};

export default component;
