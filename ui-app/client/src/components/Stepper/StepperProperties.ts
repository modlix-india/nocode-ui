import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'countingType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Counting type of Stepper',
		description: "Stepper's counting type",
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'NUMBER',
		enumValues: [
			{
				name: 'NUMBER',
				displayName: 'Numbers',
				description: 'Numbers',
			},
			{
				name: 'ROMAN',
				displayName: 'Lowercase Roman Numerals',
				description: 'Lowercase Roman Numerals',
			},
			{
				name: 'UPPER_ROMAN',
				displayName: 'Uppercase Roman Numerals',
				description: 'Uppercase Roman Numerals',
			},
			{
				name: 'UPPER_ALPHA',
				displayName: 'Uppercase Alphabets',
				description: 'Uppercase Alphabets',
			},
			{
				name: 'ALPHA',
				displayName: 'Lowercase alphabets',
				description: 'Lowercase alphabets',
			},
		],
	},

	{
		name: 'titles',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Comma separated titles',
		description: 'List of titles that are comma separated and should be in order.',
		defaultValue: '',
		translatable: true,
	},

	{
		name: 'icons',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Comma separated icons',
		description: 'List of icon that are comma separated and should be in order of titles.',
		defaultValue: '',
	},

	{
		name: 'showCheckOnComplete',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Displays a check icon in complete steps',
		description: 'Displays a check icon in complete steps.',
		defaultValue: false,
	},

	{
		name: 'textPosition',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Text position',
		description: 'Text position relative to icon',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'RIGHT',
		enumValues: [
			{
				name: 'RIGHT',
				displayName: 'Right',
				description: 'Right',
			},
			{
				name: 'LEFT',
				displayName: 'Left',
				description: 'Left',
			},
			{
				name: 'TOP',
				displayName: 'Top',
				description: 'Top',
			},
			{
				name: 'BOTTOM',
				displayName: 'Bottom',
				description: 'Bottom',
			},
		],
	},

	{
		name: 'moveToAnyPreviousStep',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Can Move to any previous step',
		description: 'Can Move to any previous step.',
		defaultValue: false,
	},

	{
		name: 'moveToAnyFutureStep',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Can Move to any Future step',
		description: 'Can Move to any Future step.',
		defaultValue: false,
	},
	{
		name: 'isStepperVertical',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Make stepper vertical',
		description: 'Make stepper vertival.',
		defaultValue: false,
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
	'': {},
};

export { propertiesDefinition, stylePropertiesDefinition };
