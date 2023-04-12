import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown placeholder',
		description: "Placeholder that's shown when no item is selected in dropdown.",
		defaultValue: 'Select ...',
		group: ComponentPropertyGroup.IMPORTANT,
	},

	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is MultiSelect',
		description: 'Allows the users to select multiple options.',
		defaultValue: false,
		group: ComponentPropertyGroup.IMPORTANT,
	},

	{
		name: 'isSearchable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is Searchable',
		description: 'Allows the users search options.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Dropdown without floating label.',
		translatable: true,
		defaultValue: false,
		group: ComponentPropertyGroup.IMPORTANT,
	},

	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown header text',
		description: "Header text that's shown on top of dropdown.",
		group: ComponentPropertyGroup.IMPORTANT,
	},

	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Dropdown data',
		description: 'Data that is used to render dropdown.',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'datatype',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown data type',
		description: "Dropdown's data format.",
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
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
		group: ComponentPropertyGroup.EVENTS,
		description: 'The event that is triggered on click of dropdown option',
	},

	{
		name: 'uniqueKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's type",
		description: 'Type for selection unique key',
		defaultValue: 'LIST_OF_STRINGS',
		group: ComponentPropertyGroup.DATA,
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
		group: ComponentPropertyGroup.DATA,
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
		description: 'type of value that needs to be selected for dispaly label',
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
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
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Selection key's value ",
		description: 'Key value that is used to generate Selection value.',
		translatable: true,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's value ",
		description: 'Key value that is used to generate unique key value.',
		translatable: true,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'labelKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Labels key's value ",
		description: 'Key value that is used to generate label value.',
		translatable: true,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'clearSearchTextOnClose',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Clear Search on close',
		description: 'Clear Search on close.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'onSearch',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Search Event',
		description: 'Search event to run on search.',
		translatable: true,
		group: ComponentPropertyGroup.EVENTS,
	},

	{
		name: 'searchLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Search Label ',
		description: 'Label for searchbox.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		multiValued: true,
		group: ComponentPropertyGroup.VALIDATION,
	},
	{
		name: 'closeOnMouseLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close dropdown on mouse leave',
		description:
			'Dropdown will be closed on mouse cursor leaving dropdown container when this property is true.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
			target: ['dropDownContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['noFloatLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['noFloatLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['textBoxContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['textBoxContainer'],
		},
	},
	textBoxContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'textBoxContainer',
			displayName: 'textBoxContainer size properties',
			description: 'textBoxContainer size properties',
			prefix: 'textBoxContainer',
			target: ['textBoxContainer'],
		},
	},
	leftIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'leftIcon',
			displayName: 'leftIcon font properties',
			description: 'leftIcon font properties',
			prefix: 'leftIcon',
			target: ['leftIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'leftIcon',
			displayName: 'leftIcon color properties',
			description: 'leftIcon color properties',
			prefix: 'leftIcon',
			target: ['leftIcon'],
		},
	},
	rightIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'rightIcon',
			displayName: 'rightIcon font properties',
			description: 'rightIcon font properties',
			prefix: 'rightIcon',
			target: ['rightIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'rightIcon',
			displayName: 'rightIcon color properties',
			description: 'rightIcon color properties',
			prefix: 'rightIcon',
			target: ['rightIcon'],
		},
	},
	inputBox: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'inputBox',
			displayName: 'inputBox font properties',
			description: 'inputBox font properties',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'inputBox',
			displayName: 'inputBox color properties',
			description: 'inputBox color properties',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
	},
	floatingLabel: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'floatingLabel',
			displayName: 'floatingLabel font properties',
			description: 'floatingLabel font properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'floatingLabel',
			displayName: 'floatingLabel color properties',
			description: 'floatingLabel color properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'floatingLabel',
			displayName: 'floatingLabel background properties',
			description: 'floatingLabel background properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
	},
	supportText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'supportText',
			displayName: 'supportText font properties',
			description: 'supportText font properties',
			prefix: 'supportText',
			target: ['supportText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'supportText',
			displayName: 'supportText color properties',
			description: 'supportText color properties',
			prefix: 'supportText',
			target: ['supportText'],
		},
	},
	errorText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'errorText',
			displayName: 'errorText font properties',
			description: 'errorText font properties',
			prefix: 'errorText',
			target: ['errorText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'errorText',
			displayName: 'errorText color properties',
			description: 'errorText color properties',
			prefix: 'errorText',
			target: ['errorText'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
