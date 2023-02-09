import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_NUM_COMP_PROP,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Labels value ',
		description: `Label value.`,
		translatable: true,
	},
	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['progress'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['progress'],
		},
	},
	progressValue: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'Progress Bar Value Font',
			description: 'Progress Bar Value Font',
			displayName: 'Progress Bar Value Font',
			prefix: 'progress',
			target: ['progressValue'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'Progress Bar Value Color',
			description: 'Progress Bar Value Color',
			displayName: 'Progress Bar Value Color',
			prefix: 'progress',
			target: ['progressValue'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'Progress Bar Value Padding',
			description: 'Progress Bar Value Padding',
			displayName: 'Progress Bar Value Padding',
			prefix: 'progress',
			target: ['progressValue'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
