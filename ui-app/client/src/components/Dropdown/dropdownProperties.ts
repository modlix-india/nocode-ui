import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown placeholder',
		description: `Placeholder that\'s shown when no item is selected in dropdown.`,
		defaultValue: 'Select ...',
	},

	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is MultiSelect',
		description: `Allows the users to select multiple options.`,
		defaultValue: true,
	},

	{
		name: 'isSearchable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is Searchable',
		description: `Allows the users search options.`,
		defaultValue: true,
	},

	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Dropdown without floating label.',
		translatable: true,
		defaultValue: false,
	},

	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown header text',
		description: `Header text that\'s shown on top of dropdown.`,
	},

	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Dropdown data',
		description: `Data that is used to render dropdown.`,
	},

	{
		name: 'datatype',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown data type',
		description: `Dropdown's data format.`,
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
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Event trigger on click',
		description: `The event that is triggered on click of dropdown option`,
	},

	{
		name: 'uniqueKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
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
			{
				name: 'RANDOM',
				displayName: 'Random',
				description: 'A Random key is associated with value which is costly in rendering',
			},
		],
	},

	{
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_STRING_COMP_PROP,
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
		name: 'searchKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Search key type',
		description: `type of value that needs to be selected for search`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as label key's value",
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
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Selection key's value ",
		description: `Key value that is used to generate Selection value.`,
		translatable: true,
	},

	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's value ",
		description: `Key value that is used to generate unique key value.`,
		translatable: true,
	},

	{
		name: 'labelKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Labels key's value ",
		description: `Key value that is used to generate label value.`,
		translatable: true,
	},
	{
		name: 'searchKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Search key's value ",
		description: `Key value that is used to search dropdown data.`,
		translatable: true,
	},

	{
		name: 'closeOnMouseLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close dropdown',
		description:
			'Dropdown will be closed on mouse cursor leaving dropdown container when this property is true.',
		group: ComponentPropertyGroup.COMMON,
		defaultValue: true,
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
