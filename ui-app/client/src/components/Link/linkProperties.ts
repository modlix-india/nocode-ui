import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
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
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.border,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.conatiner,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.position,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.size,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		// 	target: ['container'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.color,
		// 	target: ['link'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.font,
		// 	target: ['link'],
		// },
	},
	icon: {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.color,
		// 	name: 'iconColor',
		// 	displayName: 'Icon Color',
		// 	description: 'Icon Color',
		// 	prefix: 'icon',
		// 	target: ['icon'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.font,
		// 	name: 'iconFont',
		// 	displayName: 'Icon Font',
		// 	description: 'Icon Font properties',
		// 	prefix: 'icon',
		// 	target: ['icon'],
		// },
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
