import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Offline Data',
		description: 'When all the data is available to be served in the table',
		defaultValue: false,
	},
	{
		name: 'showSpinner',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Spinner',
		description: 'Show Spinner when the events are running',
		defaultValue: true,
	},
	{
		name: 'showPagination',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Pagination',
		description: 'Show Pagination',
		defaultValue: true,
	},
	{
		name: 'showPerPage',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Per Page',
		description: 'Show Per Page',
		defaultValue: true,
	},
	{
		name: 'perPageNumbers',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Per Page Numbers',
		description: 'Per Page Numbers',
		multiValued: true,
		defaultValue: [10, 20, 50],
	},
	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Unique Key',
		description: 'Unique Key in each row',
		defaultValue: 'id',
	},
	{
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
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
		name: 'multiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Select Multiple',
		description: 'Select multiple items',
		defaultValue: false,
	},
	{
		name: 'displayMode',
		schema: SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Default Size',
		description: 'Display size',
		defaultValue: 10,
	},
	{
		name: 'totalPages',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Total Pages',
		description: 'Total number of pages in the data',
	},
	{
		name: 'tableDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Table Design',
		description: 'Table Design',
		defaultValue: '_design1',
		enumValues: [
			{ name: '_design1', displayName: 'Design 1', description: 'Alternative row color' },
			{ name: '_design2', displayName: 'Design 2', description: 'Plain table' },
			{
				name: '_design3',
				displayName: 'Design 3',
				description: 'Alternative three row color',
			},
			{ name: '_design4', displayName: 'Design 4', description: 'Plain table 2' },
			{ name: '_design5', displayName: 'Design 5', description: 'Alternative row color 2' },
			{ name: '_design6', displayName: 'Design 6', description: 'Plain table 3' },
			{
				name: '_design7',
				displayName: 'Design 7',
				description: 'Alternative three row color 2',
			},
			{ name: '_design8', displayName: 'Design 8', description: 'Plain table 4' },
			{ name: '_design9', displayName: 'Design 9', description: 'Alternative row color 3' },
			{ name: '_design10', displayName: 'Design 10', description: 'Plain table 5' },
		],
	},
	{
		name: 'paginationPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pagination Position',
		description: 'Position where pagination will be shown',
		defaultValue: '_LEFT',
		enumValues: [
			{ name: '_LEFT', displayName: 'Left', description: 'Left' },
			{ name: '_RIGHT', displayName: 'Right', description: 'Right' },
			{ name: '_CENTER', displayName: 'Center', description: 'Center' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.onSelect,
	{
		name: 'onPagination',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Pagination',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when the page is changed.',
	},
	{
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
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
