import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'uploadViewType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Upload box type',
		description:
			'There are two different designs for upload component, you can choose either one.',
		defaultValue: 'LARGE_VIEW',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'SMALL_VIEW',
				displayName: 'Small inline upload component',
				description: 'A small view of the component',
			},
			{
				name: 'LARGE_VIEW',
				displayName: 'Upload with drag and drop',
				description: 'A large view of the component',
			},
		],
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'uploadType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Upload Value Type',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Value type of the upload component',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'FILE_OBJECT',
		enumValues: [
			{
				name: 'FILE_OBJECT',
				displayName: 'File Object',
				description: 'The value of the upload component is a file object',
			},
			{
				name: 'JSON_OBJECT',
				displayName: 'JSON Object',
				description: 'Reads the file and returns a JSON object from the file',
			},
			{
				name: 'JSON_LIST_CSV',
				displayName: 'JSON List of Lists from CSV',
				description: 'Reads the file and returns a JSON list of lists from the CSV file',
			},
			{
				name: 'JSON_LIST_TSV',
				displayName: 'JSON List of Lists from TSV',
				description: 'Reads the file and returns a JSON list of lists from the TSV file',
			},
			{
				name: 'JSON_LIST_CSV_OBJECTS',
				displayName: 'JSON List of Objects from CSV With Headers',
				description:
					'Reads the file and returns a JSON list of objects from the CSV file as the keys of the objects',
			},
			{
				name: 'JSON_LIST_TSV_OBJECTS',
				displayName: 'JSON List of Objects from TSV With Headers',
				description:
					'Reads the file and returns a JSON list of objects from the TSV file as the keys of the objects',
			},
			{
				name: 'STRING_TEXT',
				displayName: 'String Text',
				description: 'Reads the file and returns a string from the file',
			},
		],
	},
	{
		name: 'uploadIcon',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Upload Icon',
		description: 'The icon that is shown in the upload box.',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'mainText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Main text for upload component',
		description: 'The text that directly proceeds the upload icon.',
		defaultValue: 'Upload',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'subText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Helper text.',
		description:
			'This is the etxt below main text, usually used to help user with instructions on how to upload.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'isMultiple',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Upload multiple files at once.',
		description:
			'This values indicated whether the user can select multiple files or single file.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'maxFileSize',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Maximum file size (In bytes)',
		description: 'You can set a maximum size for a file that the user can upload.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '1000000',
	},
	{
		name: 'options',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Upload File types',
		group: ComponentPropertyGroup.ADVANCED,
		description:
			'You can send a string of acceptable file types, this string must be according to the HTML standard for options attrubute of the input type file.',
	},
	{
		name: 'showFileList',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show selected files ?',
		description:
			'This option when set to true displays a list of file(s) selected by the user.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'onSelectEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Event to be run on selection of files.',
		group: ComponentPropertyGroup.EVENTS,
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'This event is usually triggered after selection by user, used for upload immediately on selection instead of delegating the control to a button',
	},
	COMMON_COMPONENT_PROPERTIES.validation,
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
	],
	uploadContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	mainText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	buttonStyles: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedFiles: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	selectedFileContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	closeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	validationMessagesContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	validationMessage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
