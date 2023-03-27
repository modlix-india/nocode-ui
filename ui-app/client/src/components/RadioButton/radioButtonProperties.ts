import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

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
		name: 'readOnly',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'orientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'CheckBox orientation',
		description: `CheckBox's display orientation.`,
		defaultValue: 'HORIZONATAL',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'HORIZONATAL',
				displayName: 'Horizonatal Orientation',
				description: "CheckBox's display orientation.",
			},
			{
				name: 'VERTICAL',
				displayName: 'Vertical Orientation',
				description: "CheckBox's display orientation.",
			},
		],
	},
	{
		name: 'layout',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Layout',
		description: 'Name of the layout',
		editor: ComponentPropertyEditor.LAYOUT,
		defaultValue: 'ROWLAYOUT',
		enumValues: [
			{ name: 'ROWLAYOUT', displayName: 'Row Layout', description: 'Default row layout' },
			{
				name: 'SINGLECOLUMNLAYOUT',
				displayName: 'Column Layout',
				description: 'Single Column layout in all resolutions',
			},
			{
				name: 'TWOCOLUMNSLAYOUT',
				displayName: 'Two Columns Layout',
				description: 'Two Columns layout in all resolutions except mobile',
			},
			{
				name: 'THREECOLUMNSLAYOUT',
				displayName: 'Three Columns Layout',
				description:
					'Three Columns layout in all resolutions and two in tablet and one in mobile',
			},
			{
				name: 'FOURCOLUMNSLAYOUT',
				displayName: 'Four Columns Layout',
				description:
					'Four Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
			{
				name: 'FIVECOLUMNSLAYOUT',
				displayName: 'Five Columns Layout',
				description:
					'Five Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
		],
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
	label: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
			name: 'labelBackdropFilter',
			displayName: 'Label Backdrop Filter',
			description: 'Label Backdrop Filter',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'labelBackground',
			displayName: 'Label Background',
			description: 'Label Background',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'labelBorder',
			displayName: 'Label Border',
			description: 'Label Border',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'labelBoxShadow',
			displayName: 'Label Box Shadow',
			description: 'Label Box Shadow',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'labelContainer',
			displayName: 'Label Container',
			description: 'Label Container',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'labelFlex',
			displayName: 'Label Flex',
			description: 'Label Flex',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'labelMargin',
			displayName: 'Label Margin',
			description: 'Label Margin',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			name: 'labelOpacity',
			displayName: 'Label Opacity',
			description: 'Label Opacity',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'labelPadding',
			displayName: 'Label Padding',
			description: 'Label Padding',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.position,
			name: 'labelPosition',
			displayName: 'Label Position',
			description: 'Label Position',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
			name: 'labelRotate',
			displayName: 'Label Rotate',
			description: 'Label Rotate',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'labelSize',
			displayName: 'Label Size',
			description: 'Label Size',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			name: 'labelTransform',
			displayName: 'Label Transform',
			description: 'Label Transform',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'labelFont',
			displayName: 'Label Font',
			description: 'Label Font',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'labelColor',
			displayName: 'Label Color',
			description: 'Label Color',
			prefix: 'label',
			target: ['label'],
		},
	},
	radio: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'inputMargin',
			displayName: 'Radio Box Margin',
			description: 'Radio Box Margin',
			prefix: 'radio',
			target: ['radio'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'inputPadding',
			displayName: 'Radio Box Padding',
			description: 'Radio Box Padding',
			prefix: 'radio',
			target: ['radio'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
