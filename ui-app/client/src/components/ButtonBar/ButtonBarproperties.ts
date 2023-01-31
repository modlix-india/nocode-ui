import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'read',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'readOnly',
		description: `ButtonBar will be rendered un editable when this property is true.',`,
		defaultValue: true,
	},

	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'Header text',
		description: `Header text that\'s shown on top of ButtonBar.`,
		defaultValue: 'button Bar',
	},

	{
		name: 'isMultiSelect',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Is MultiSelect',
		description: `Allows the users to select multiple options.`,
		defaultValue: false,
	},
	{
		name: 'data',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'ButtonBar data',
		description: `Data that is used to render ButtonBar.`,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
		defaultValue: false,
	},
	{
		name: 'datatype',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'ButtonBar data type',
		description: `ButtonBar's data format.`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'LIST_OF_STRINGS',
				displayName: 'List of strings',
				description: 'data has an array of strings',
			},
			{
				name: 'LIST_OF_OBJECTS',
				displayName: 'List of objects',
				description: 'data has an array of objects',
			},
			{
				name: 'LIST_OF_LISTS',
				displayName: 'List of lists',
				description: 'data has an array of arrays',
			},
			{
				name: 'OBJECT_OF_PRIMITIVES',
				displayName: 'Object of primitives',
				description: 'Object with key value pairs where values are primitives',
			},
			{
				name: 'OBJECT_OF_OBJECTS',
				displayName: 'Object of objects',
				description: 'Object with key value pairs where values are objects',
			},
			{
				name: 'OBJECT_OF_LISTS',
				displayName: 'Object of lists',
				description: 'Object with key value pairs where values are lists',
			},
		],
	},
	{
		name: 'onClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Event trigger on click',
		description: `The event that is triggered on click of ButtonBar `,
	},

	{
		name: 'uniqueKeyType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Unique key's type",
		description: `Type for selection unique key`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as unique key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as unique key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as unique key's value",
			},
		],
	},

	{
		name: 'selectionType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Selection value type',
		description: `type of value that needs to be selected on selection`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as selection key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as selection key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as selection key's value",
			},
		],
	},

	{
		name: 'labelKeyType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Label's key type",
		description: `type of value that needs to be selected for dispaly label`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as label key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as label key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as label key's value",
			},
		],
	},

	{
		name: 'selectionKey',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Selection key's value ",
		description: `Key value that is used to generate Selection value.`,
		translatable: true,
	},

	{
		name: 'uniqueKey',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Unique key's value ",
		description: `Key value that is used to generate unique key value.`,
		translatable: true,
	},

	{
		name: 'labelKey',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Labels key's value ",
		description: `Key value that is used to generate label value.`,
		translatable: true,
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['compButtobBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			target: ['compButtobBar'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['_button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			target: ['_button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			target: ['_button'],
		},
	},
};
export { propertiesDefinition, stylePropertiesDefinition };
