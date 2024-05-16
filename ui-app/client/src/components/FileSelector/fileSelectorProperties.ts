import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'designType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Design Type',
		defaultValue: 'button',
		enumValues: [
			{ name: 'button', displayName: 'Button to open browser' },
			{ name: 'browser', displayName: 'Full broswer' },
		],
		group: ComponentPropertyGroup.BASIC,
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	{
		name: 'resourceType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Resource Type',
		defaultValue: 'static',
		enumValues: [
			{ name: 'static', displayName: 'Static' },
			{ name: 'secured', displayName: 'Secured' },
		],
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'hideCreateFolder',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Create Folder',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'hideUploadFile',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Upload File',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'hideDelete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Delete',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'hideEdit',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Edit',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'cropToWidth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Width in pixels',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Height in pixels',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToCircle',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Crop to Circle (width is considered as diameter)',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToMaxWidth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Max Width',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToMaxHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Max Height',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToMinWidth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Min Width',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'cropToMinHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Crop to Min Height',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selection Type',
		defaultValue: '_files',
		enumValues: [
			{ name: '_files', displayName: 'Files only' },
			{ name: '_folders', displayName: 'Folders only' },
			{ name: '_both', displayName: 'Files and Folders' },
		],
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'fileCategory',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'File Category',
		enumValues: [
			{ name: '', displayName: 'All' },
			{ name: 'FILES', displayName: 'Files Only' },
			{ name: 'DIRECTORIES', displayName: 'Folders Only' },
			{ name: 'ARCHIVE', displayName: 'Archive types' },
			{ name: 'DOCUMENTS', displayName: 'Documents' },
			{ name: 'IMAGES', displayName: 'Images' },
			{ name: 'VIDEOS', displayName: 'Videos' },
		],
		multiValued: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'restrictSelectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Restrict Selection File Type',
		multiValued: true,
	},
	{
		name: 'restrictUploadType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Restrict Upload File Type',
		multiValued: true,
	},
	{
		name: 'fileUploadSizeLimit',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'File Upload Size Limit (MB)',
		defaultValue: 0,
	},
	{
		name: 'uploadImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image to show for upload prompt',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'startLocation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Start Location',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'restrictNavigationToTopLevel',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Restrict Navigation to folders above',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'editOnUpload',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Edit on Upload',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		group: ComponentPropertyGroup.VALIDATION,
		validationList: [{ name: 'MANDATORY', displayName: 'File Selection Mandatory' }],
		multiValued: true,
	},
	COMMON_COMPONENT_PROPERTIES.onSelect,
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
	image: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorTextContainer: [
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
