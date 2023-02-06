import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link label',
		description: `Link's display label.`,
		translatable: true,
	},

	{
		name: 'linkPath',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link path',
		description: `Path that page needs to be redirected on click.`,
		translatable: false,
	},

	{
		name: 'showButton',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Link Button',
		description: 'Button beside the link to redirect.',
	},

	{
		name: 'isExternalUrl',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Is external url ?',
		description: 'Is the url an external url ?.',
		defaultValue: false,
	},

	{
		name: 'target',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link target',
		description: `Link's target.`,
	},

	{
		name: 'externalButtonTarget',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link Button target',
		description: `Link Button's target.`,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.conatiner,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.position,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['link'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['link'],
		},
	},
	icon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'iconColor',
			displayName: 'Icon Color',
			description: 'Icon Color',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'iconFont',
			displayName: 'Icon Font',
			description: 'Icon Font properties',
			prefix: 'icon',
			target: ['icon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
