import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'progressValue',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Progress Value',
		description: 'Progress Value.',
		defaultValue: 0,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'minprogressValue',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Min Progress Value',
		description: 'Minimum Progress Value.',
		defaultValue: 0,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'circularProgressBarIndicatorWidth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Circular progress bar indicator width',
		description: 'Circular progress bar indicator width.',
		defaultValue: 2.5,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'maxprogressValue',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Max Progress Value',
		description: 'Maximum Progress Value.',
		defaultValue: 100,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'progressLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Label',
		description: 'Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '',
		translatable: true,
	},

	{
		name: 'progressLabelAlignment',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label and Value Container Position',
		description: 'Position of Label and Value Container.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_left',
		enumValues: [
			{
				name: '_left',
				displayName: 'Label and Value Container Left',
				description: 'Label and Value Container Left.',
			},
			{
				name: '_center',
				displayName: 'Label and Value Container Center',
				description: 'Label and Value Container Center.',
			},
			{
				name: '_right',
				displayName: 'Label and Value Container Right',
				description: 'Label and Value Container Right.',
			},
			{
				name: '_top',
				displayName: 'Label and Value Container Top',
				description: 'Label and Value Container Top.',
			},
			{
				name: '_bottom',
				displayName: 'Label and Value Container Bottom',
				description: 'Label and Value Container Bottom.',
			},
		],
	},

	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			{
				name: '_default',
				displayName: 'Progress Bar Deafault Design',
				description: 'Progress Bar Default Design.',
			},
			{
				name: '_striped',
				displayName: 'Progress Bar striped design.',
				description: 'Progress Bar striped design.',
			},
			{
				name: '_circular',
				displayName: 'Progress Bar circular design.',
				description: 'Progress Bar circular design.',
			},
			{
				name: '_circular_text_background',
				displayName: 'Progress Bar circular design with text background.',
				description: 'Progress Bar circular design with text background.',
			},

			{
				name: '_circular_text_background_outline',
				displayName: 'Progress Bar circular design with outline style text background.',
				description: 'Progress Bar circular design with outline style text background.',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
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
	progress: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	track: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	label: [
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
