import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.linkPath,
	COMMON_COMPONENT_PROPERTIES.linkTargetType,
	COMMON_COMPONENT_PROPERTIES.layout,
	{
		name: 'dragData',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data',
		description: 'Drag Data.',
	},
	{
		name: 'onMouseEnter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Enter',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Enter.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMouseLeave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Leave',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Leave.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onEnteringViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Entering Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid enters view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: '_intermediateDefinition',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Intermediate  Definition',
		description: 'Intermediate definition generated from JSON Schema.',
		group: ComponentPropertyGroup.ADVANCED,
		hide: true,
	},
	{
		name: 'onLeavingViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Leaving Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid leaves view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'containerType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Container Type (SEO)',
		description: 'container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DIV',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'DIV', displayName: 'DIV', description: 'Div tag' },
			{ name: 'ARTICLE', displayName: 'ARTICLE', description: 'Article tag' },
			{ name: 'SECTION', displayName: 'SECTION', description: 'Section tag' },
			{ name: 'ASIDE', displayName: 'ASIDE', description: 'Aside tag' },
			{ name: 'FOOTER', displayName: 'FOOTER', description: 'Footer tag' },
			{ name: 'HEADER', displayName: 'HEADER', description: 'Header tag' },
			{ name: 'MAIN', displayName: 'MAIN', description: 'Main tag' },
			{ name: 'NAV', displayName: 'NAV', description: 'Nav tag' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.background,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
