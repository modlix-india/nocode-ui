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
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'uploadViewType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'upload File UI type',
		description: `Show the UI type of the upload component which is selected.`,
		defaultValue: 'LARGE_VIEW',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'SMALL_VIEW',
				displayName: 'Mobile like small ui',
				description: 'A small view of the component',
			},
		],
	},
	{
		name: 'uploadIcon',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Upload Icon',
		description: `Upload Icon.`,
		defaultValue: 'fa fa-solid fa-upload',
	},
	{
		name: 'mainText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Main text for upload component',
		description: `Upload Component Main Text.`,
		defaultValue: 'Upload',
	},
	{
		name: 'subText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'sub text for upload component',
		description: `Upload Component sub Text.`,
		defaultValue: 'Or drag and drop here',
	},
	{
		name: 'isMultiple',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'upload multiple file selected for upload component',
		description: `Upload multiple file when file selected for Upload Component.`,
		defaultValue: true,
	},
	{
		name: 'maxFileSize',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Upload component max file size in bytes',
		description: 'Upload Component Max File Size in bytes',
		defaultValue: '1000000',
	},
	{
		name: 'options',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Upload file types options',
		description: 'Upload files type options',
		defaultValue: 'image/jpeg,image/png',
	},
	{
		name: 'showFileList',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'show files selected List in upload component',
		description: 'Show Selected File list in upload component',
		defaultValue: true,
	},
	{
		name: 'onSelectEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Upload files on selection event type',
		description: 'Upload files on selection event type',
	},
	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		multiValued: true,
		notImplemented: true,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.name]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['uploadContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['uploadContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['uploadContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['icon'],
		},
	},
	uploadContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			displayName: 'Upload Container margin',
			description: 'Upload Container margin',
			prefix: 'uploadContainer',
			target: ['uploadContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			displayName: 'Upload Container Padding',
			description: 'Upload Container Padding',
			prefix: 'uploadContainer',
			target: ['uploadContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			displayName: 'Upload Container size',
			description: 'Upload Container size',
			prefix: 'uploadContainer',
			target: ['uploadContainer'],
		},
	},
	mainText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container Main Text Font Styles',
			description: 'Upload Component Main Text Font Styles',
			prefix: 'mainText',
			target: ['mainText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container Font color',
			description: 'Upload Component Main Text Font Color',
			prefix: 'mainText',
			target: ['mainText'],
		},
	},
	label: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container label Font Styles',
			description: 'Upload Component label Font Styles',
			prefix: 'label',
			target: ['label'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container label Font color',
			description: 'Upload Component label Font Color',
			prefix: 'label',
			target: ['label'],
		},
	},
	inputStyles: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container inputStyles label Font Styles',
			description: 'Upload Component inputStyles label Text Font Styles',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container inputStyles label Text Font color',
			description: 'Upload Component inputStyles label Text Font Color',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			displayName: 'Upload Container inputStyles label background color',
			description: 'Upload Component inputStyles label background Color',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			displayName: 'Upload Container inputStyles label border styles',
			description: 'Upload Component inputStyles label border styles',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			displayName: 'Upload Container inputStyles padding styles',
			description: 'Upload Component inputStyles padding styles',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			displayName: 'Upload Container inputStyles margin styles',
			description: 'Upload Component inputStyles margin styles',
			prefix: 'inputStyles',
			target: ['inputStyles'],
		},
	},
	selectedFiles: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container selectedFiles Font Styles',
			description: 'Upload Component selectedFiles Font Styles',
			prefix: 'selectedFiles',
			target: ['selectedFiles'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container selectedFiles Font color',
			description: 'Upload Component selectedFiles Font Color',
			prefix: 'selectedFiles',
			target: ['selectedFiles'],
		},
	},
	selectedFileContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			displayName: 'Upload Container selectedFiles Main Div size style',
			description: 'Upload Component selectedFiles Main Div size style',
			prefix: 'selectedFileContainer',
			target: ['selectedFileContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			displayName: 'Upload Container selectedFiles Main Div background style',
			description: 'Upload Component selectedFiles Main Div background style',
			prefix: 'selectedFileContainer',
			target: ['selectedFileContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			displayName: 'Upload Container selectedFiles Main Div margin style',
			description: 'Upload Component selectedFiles Main Div margin style',
			prefix: 'selectedFileContainer',
			target: ['selectedFileContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			displayName: 'Upload Container selectedFiles Main Div border style',
			description: 'Upload Component selectedFiles Main Div border style',
			prefix: 'selectedFileContainer',
			target: ['selectedFileContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
			displayName: 'Upload Container selectedFiles Main Div sroll bar hide or show style',
			description: 'Upload Component selectedFiles Main Div sroll bar hide or show style',
			prefix: 'selectedFileContainer',
			target: ['selectedFileContainer'],
		},
	},
	errorText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container errorText Font Styles',
			description: 'Upload Component errorText Font Styles',
			prefix: 'errorText',
			target: ['errorText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container errorText Font color',
			description: 'Upload Component errorText Font Color',
			prefix: 'errorText',
			target: ['errorText'],
		},
	},
	closeIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'Upload Container closeIcon Font Styles',
			description: 'Upload Component closeIcon Font Styles',
			prefix: 'closeIcon',
			target: ['closeIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'Upload Container closeIcon Font color',
			description: 'Upload Component closeIcon Font Color',
			prefix: 'closeIcon',
			target: ['closeIcon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
