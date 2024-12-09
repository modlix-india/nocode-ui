import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './iconProperties';
import { Component } from '../../types/common';
import IconStyle from './IconStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleDefaults } from './iconStyleProperies';
import { IconHelper } from '../util/IconHelper';

function Icon(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { icon, designType, colorScheme } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
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

const component: Component = {
	order: 15,
	name: 'Icon',
	displayName: 'Icon',
	description: 'Icon component',
	component: Icon,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: IconStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Icon',
		type: 'Icon',
		properties: {
			icon: { value: 'fa-solid fa-icons' },
		},
	},
	sections: [{ name: 'Icons', pageName: 'icon' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 15">
					<circle className="_iconcircle" cx="24.5" cy="10" r="5" fill="#02B694" />
					<path
						className="_icontriangle"
						d="M5.06292 6.78674C5.25342 6.44384 5.74658 6.44384 5.93708 6.78674L10.0873 14.2572C10.2725 14.5904 10.0315 15 9.65024 15L1.34976 15C0.968515 15 0.727531 14.5904 0.912679 14.2572L5.06292 6.78674Z"
						fill="#EC465E"
					/>
					<rect className="_iconbar" x="12" width="5" height="15" fill="#7B66FF" />
				</IconHelper>
			),
		},
	],
};

export default component;
