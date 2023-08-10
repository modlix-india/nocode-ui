import { SCHEMA_STRING_COMP_PROP } from '../../constants';
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
		displayName: 'CheckBox label',
		description: "CheckBox's display label.",
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{ name: '_outlined', displayName: 'Outline type', description: 'Outline type' },
			{ name: '_squared', displayName: 'Squared type', description: 'Squared type' },
			{
				name: '_bigknob',
				displayName: 'Big Knob type',
				description: 'Big Knob type',
			},
			{
				name: '_small',
				displayName: 'Small type',
				description: 'small type',
			},
		],
	},

	{
		name: 'toggleButtonLabelAlignment',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label Position',
		description: 'Position of Label in toggle button.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_ontrack',
		enumValues: [
			{
				name: '_ontrack',
				displayName: 'Label position on track',
				description: 'Label position on track.',
			},
			{
				name: '_onknob',
				displayName: 'Label position on knob',
				description: 'Label position on knob.',
			},
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.colorScheme,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.colorScheme.enumValues!,
			{
				name: '_gradient1',
				displayName: 'Gradient one Scheme',
				description: 'Gradient one Scheme',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
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
		COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
