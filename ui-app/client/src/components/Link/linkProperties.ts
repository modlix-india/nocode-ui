import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Link label',
		description: "Link's display label.",
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{ ...COMMON_COMPONENT_PROPERTIES.linkPath, group: ComponentPropertyGroup.BASIC },
	{ ...COMMON_COMPONENT_PROPERTIES.linkTargetType, group: ComponentPropertyGroup.BASIC },
	{
		name: 'showButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Link Button',
		description: 'Button beside the link to redirect.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'isExternalUrl',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is external url ?',
		description: 'Is the url an external url ?.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'externalButtonTarget',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Link Button target',
		description: `Link Button's target.`,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Link's left icon",
		description: "Link's icon to be displayed on left of Link label.",
		editor: ComponentPropertyEditor.ICON,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	link: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	icon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	secondLink: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
