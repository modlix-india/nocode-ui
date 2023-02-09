import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_NUM_COMP_PROP,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'offlineData',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Offline Data',
		description: 'When all the data is available to be served in the table',
		defaultValue: false,
	},
	{
		name: 'showSpinner',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Spinner',
		description: 'Show Spinner when the events are running',
		defaultValue: true,
	},
	{
		name: 'showPagination',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Pagination',
		description: 'Show Pagination',
		defaultValue: true,
	},
	{
		name: 'uniqueKey',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Unique Key',
		description: 'Unique Key in each row',
	},
	{
		name: 'selectionType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Selection Type',
		description: 'Type of the selection of a row',
		defaultValue: 'NONE',
		enumValues: [
			{ name: 'NONE', displayName: 'No Selection', description: 'No selection is required' },
			{ name: 'PATH', displayName: 'Path', description: 'Path of the object of the row' },
			{
				name: 'OBJECT',
				displayName: 'Row Obect',
				description: 'Copy of the object that is selected',
			},
		],
	},
	{
		name: 'displayMode',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Display Mode',
		description: 'Display mode, either columns or grid',
		defaultValue: 'COLUMNS',
		enumValues: [
			{ name: 'COLUMNS', displayName: 'Columns', description: 'Columns mode' },
			{ name: 'GRID', displayName: 'Grid', description: 'Grid mode' },
		],
	},
	{
		name: 'previewMode',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Preview Mode',
		description: 'Preview mode, either columns or grid',
		defaultValue: 'BOTH',
		enumValues: [
			{ name: 'BOTH', displayName: 'All', description: 'All modes' },
			{ name: 'COLUMNS', displayName: 'Columns', description: 'Columns mode' },
			{ name: 'GRID', displayName: 'Grid', description: 'Grid mode' },
		],
	},
	{
		name: 'previewGridPosition',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Preview Grid Position',
		description: 'Preview grid position',
		defaultValue: 'BOTH',
		enumValues: [
			{
				name: 'LEFT',
				displayName: 'Left',
				description:
					'Position of the preview grid is left in the larger resolutions and in smaller resolutions it will be moved to top',
			},
			{
				name: 'RIGHT',
				displayName: 'Right',
				description:
					'Position of the preview grid is right in the larger resolutions and in smaller resolutions it will be moved to bottom',
			},
			{ name: 'TOP', displayName: 'Top', description: 'Position of the preview grid is top' },
			{
				name: 'BOTTOM',
				displayName: 'Bottom',
				description: 'Position of the preivew grid is bottom',
			},
		],
	},
	{
		name: 'defaultSize',
		schema: Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP),
		displayName: 'Default Size',
		description: 'Display size',
		defaultValue: 10,
	},
	{
		name: 'totalPages',
		schema: Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP),
		displayName: 'Total Pages',
		description: 'Total number of pages in the data',
	},
	{
		name: 'tableDesign',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Table Design',
		description: 'Table Design',
		defaultValue: '_design1',
		enumValues: [
			{ name: '_design1', displayName: 'Design 1', description: 'Alternative row color' },
			{ name: '_design2', displayName: 'Design 2', description: 'Plain table' },
		],
	},
	{
		name: 'paginationPosition',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Pagination Position',
		description: 'Position where pagination will be shown',
		defaultValue: 'LEFT',
		enumValues: [
			{ name: 'LEFT', displayName: 'Left', description: 'Left' },
			{ name: 'RIGHT', displayName: 'Right', description: 'Right' },
			{ name: 'CENTER', displayName: 'Center', description: 'Center' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.onSelect,
	{
		name: 'onPagination',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'On Pagination',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when the page is changed.',
	},
	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
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
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
