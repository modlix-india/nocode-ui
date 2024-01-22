import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
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
	COMMON_COMPONENT_PROPERTIES.layout,
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
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'sectionProperties',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Section Properties',
		editor: ComponentPropertyEditor.SECTION_PROPERTIES_EDITOR,
		defaultValue: {},
		group: ComponentPropertyGroup.ADVANCED,
		hide: true,
		multiValued: true,
	},
	{
		name: 'enableChildrenSelection',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Children Selection',
		defaultValue: false,
	},
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
