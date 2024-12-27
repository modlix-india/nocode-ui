import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../../types/common';
import {
	COMMON_COMPONENT_PROPERTIES,
	COMPONENT_STYLE_GROUP_PROPERTIES,
} from '../../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'offlineData',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Offline Data',
		group: ComponentPropertyGroup.BASIC,
		description: 'When all the data is available to be served in the table',
		defaultValue: false,
	},
	{
		name: 'showSpinner',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Spinner',
		group: ComponentPropertyGroup.BASIC,
		description: 'Show Spinner when the events are running',
		defaultValue: true,
	},
	{
		name: 'showPagination',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Pagination',
		description: 'Show Pagination',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showPerPage',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Items per page selection.',
		description: 'Show Items Per page selection.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showPageSelectionDropdown',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show PageSelection Dropdown',
		description: 'Show PageSelection Dropdown.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'showSeperators',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Seperators in Pagination',
		description: 'Show Seperators in  Pagination',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showArrows',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Arrows for Pagination',
		description: 'Show Arrows for Pagination',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'perPageNumbers',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Options for per page',
		description: 'Options array for items per page selection.',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
		defaultValue: [10, 20, 50],
	},
	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Unique Key',
		description: 'Unique Key in each row',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'id',
	},
	{
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selection Type',
		description: 'Type of the selection of a row',
		defaultValue: 'NONE',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{ name: 'NONE', displayName: 'No Selection', description: 'No selection is required' },
			{ name: 'PATH', displayName: 'Path', description: 'Path of the object of the row' },
			{
				name: 'OBJECT',
				displayName: 'Row Object',
				description: 'Copy of the object that is selected',
			},
		],
	},
	{
		name: 'multiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Select Multiple',
		description: 'Select multiple items',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'displayMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Display Mode',
		description: 'Display mode, either columns or grid',
		defaultValue: 'COLUMNS',
		group: ComponentPropertyGroup.BASIC,
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
		group: ComponentPropertyGroup.BASIC,
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
		group: ComponentPropertyGroup.ADVANCED,
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
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 10,
	},
	{
		name: 'totalPages',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Total Pages',
		description: 'Total number of pages in the data',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'tableDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Table Design',
		description: 'Table Design',
		defaultValue: '_design1',
		group: ComponentPropertyGroup.ADVANCED,
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
		name: 'colorScheme',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Color Scheme',
		description: 'Color Scheme',
		defaultValue: '_primary',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_primary',
				displayName: 'Primary Color Scheme',
				description: 'Default Color Scheme',
			},
			{
				name: '_secondary',
				displayName: 'Secondary Color Scheme',
				description: 'Secondary Color Scheme',
			},
			{
				name: '_tertiary',
				displayName: 'Tertiary Color Scheme',
				description: 'Tertiary Color Scheme',
			},
			{
				name: '_quaternary',
				displayName: 'Quaternary Color Scheme',
				description: 'Quaternary Color Scheme',
			},
			{
				name: '_quinary',
				displayName: 'Quinary Color Scheme',
				description: 'Quinary Color Scheme',
			},
		],
	},
	{
		name: 'tableLayout',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Table Layout',
		description: 'Table Layout css property',
		defaultValue: 'AUTO',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'AUTO', displayName: 'Auto', description: 'Auto layout' },
			{ name: 'FIXED', displayName: 'Fixed', description: 'Fixed layout' },
		],
	},
	{
		name: 'paginationPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pagination Position',
		description: 'Position where pagination will be shown',
		defaultValue: '_LEFT',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: '_LEFT', displayName: 'Left', description: 'Left' },
			{ name: '_RIGHT', displayName: 'Right', description: 'Right' },
			{ name: '_CENTER', displayName: 'Center', description: 'Center' },
		],
	},
	{
		name: 'paginationDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pagination Design',
		description: 'Pagination Design',
		defaultValue: '_design1',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: '_design1', displayName: 'Design1', description: 'design1' },
			{ name: '_design2', displayName: 'Design2', description: 'design2' },
			{ name: '_design3', displayName: 'Design3', description: 'design3' },
			{ name: '_design4', displayName: 'Design4', description: 'design4' },
		],
	},
	{
		name: 'columnsModeIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Columns Mode Icon',
		description: 'Icon to be shown on the columns displaymode.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'gridModeIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Grid Mode Icon',
		description: 'Icon to be shown on the grid displaymode.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'columnsModeImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Columns Mode Image',
		description: 'Image to be shown on the columns displaymode.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'gridModeImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Grid Mode Image',
		description: 'Image to be shown on the grid displaymode.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'columnsModeActiveImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Columns Mode Active Image',
		description: 'Image to be shown on the columns displaymode.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'gridModeActiveImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Grid Mode Active Image',
		description: 'Image to be shown on the grid displaymode.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'leftArrowLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'LeftArrowLabel',
		description: 'Label to be displayed with Left Arrow',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.TRANSLATABLE_PROP,
	},
	{
		name: 'rightArrowLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'RightArrowLabel',
		description: 'Label to be displayed with Right Arrow',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.TRANSLATABLE_PROP,
	},
	{
		name: 'perPageLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'PerPageLabel',
		description: 'Label to be displayed with Per Page DropDown',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.TRANSLATABLE_PROP,
	},
	COMMON_COMPONENT_PROPERTIES.onSelect,

	{
		name: 'onPagination',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Pagination',
		group: ComponentPropertyGroup.EVENTS,
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when the page is changed.',
	},

	{
		name: 'onSort',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Sort',
		group: ComponentPropertyGroup.EVENTS,
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when the table is sorted.',
	},

	{
		name: 'multiSort',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Multi Sort',
		group: ComponentPropertyGroup.BASIC,
		description: 'Sort multiple columns',
		defaultValue: false,
	},

	{
		name: 'enablePersonalization',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Personalization for dragging and hiding columns',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},

	{
		name: 'disableColumnDragging',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Disable Column Dragging',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'hideContextMenu',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Context Menu',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
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
	modesContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	columnsModeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedColumnsModeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	columnsModeImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	gridModeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedGridModeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	gridModeImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	previousArrow: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	nextArrow: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	nextText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	previousText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	pageNumbers: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedPageNumber: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	itemsPerPageDropdown: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	perPageLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	pageSelectionDropdown: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	pageSelectionLabel: [
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
