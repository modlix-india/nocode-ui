import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	// ---------------------------------------------------------------- data shape
	{
		name: 'dataShape',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Data Shape',
		description: 'How the bound data expresses the hierarchy.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'NESTED',
		enumValues: [
			{
				name: 'NESTED',
				displayName: 'Nested children',
				description:
					'An array of nodes, each holding its children in an array under the Children Key.',
			},
			{
				name: 'FLAT',
				displayName: 'Flat list with parent key',
				description:
					'A flat array where each row names its parent. The hierarchy is built in memory.',
			},
			{
				name: 'OBJECT_MAP',
				displayName: 'Object map',
				description:
					'An object keyed by node id. Children may be a nested object map or an array.',
			},
			{
				name: 'RAW_JSON',
				displayName: 'Raw JSON (inferred)',
				description:
					'Arbitrary nested JSON. Keys become labels and primitives become leaves. Read only: structure editing is not available for this shape.',
			},
		],
	},
	{
		name: 'childrenKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Children Key',
		description:
			'Property holding a node\'s children. Add one entry per depth to support heterogeneous hierarchies (e.g. stages, then substages); the last entry is reused for deeper levels. Defaults to "children". Used by the Nested and Object map shapes.',
		group: ComponentPropertyGroup.DATA,
		multiValued: true,
	},
	{
		name: 'hasChildrenProperty',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Has Children Property',
		description:
			'Boolean property marking a node as expandable before its children have been loaded. Use with the On Expand event to load children on demand. Accepts one entry per depth.',
		group: ComponentPropertyGroup.DATA,
		multiValued: true,
	},
	{
		name: 'idKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Id Key',
		description: 'Property holding a row\'s own id. Flat shape only. Defaults to "id".',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'id',
	},
	{
		name: 'parentKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Parent Key',
		description:
			'Property holding the id of a row\'s parent. Flat shape only. Rows with no parent, or a parent that is not in the data, become roots. Defaults to "parentId".',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'parentId',
	},
	{
		name: 'maxDepth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Maximum Depth',
		description:
			'Hard limit on how deep the Raw JSON shape will walk. Guards against very deep or circular data.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 64,
	},
	{
		name: 'labelPath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label Key',
		description:
			"Property used as a node's text label. Drives the accessible name and keyboard type-ahead. When empty, the rendered text of the node is used instead.",
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'defaultData',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Default Data',
		description:
			'Written to the Tree Data Binding on mount. Useful for a starting hierarchy, or for previewing the tree without wiring a data source.',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// ---------------------------------------------------------------- expansion
	{
		name: 'defaultExpandLevel',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Default Expand Level',
		description:
			'How many levels start expanded. 0 collapses everything, -1 expands everything. Re-applied when the data changes, but never overriding nodes the user has toggled by hand.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	{
		name: 'singleExpand',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Expand One At A Time',
		description:
			'Expanding a node collapses its siblings. Usually wanted for the accordion design.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'expandIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Expand Icon',
		description:
			'Icon shown on a collapsed node. When left empty, a built-in caret is used and rotated on expand.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'collapseIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Collapse Icon',
		description: 'Icon shown on an expanded node.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'unmountCollapsedChildren',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Collapsed Children',
		description:
			'Whether a collapsed node keeps its children mounted. Keeping them mounted is what allows the accordion to animate open, but costs render time on large trees.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_auto',
		enumValues: [
			{
				name: '_auto',
				displayName: 'Automatic',
				description: 'Unmount for every design except the accordion.',
			},
			{ name: '_always', displayName: 'Always unmount', description: 'Never animates open.' },
			{
				name: '_never',
				displayName: 'Keep mounted',
				description: 'Mount on first expand and keep, so every open animates.',
			},
		],
	},
	{
		name: 'onExpand',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Expand',
		description:
			'Runs when a node is expanded, scoped to that node, so Parent.<children key> can be written to load children on demand.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onCollapse',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Collapse',
		description: 'Runs when a node is collapsed, scoped to that node.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},

	// ---------------------------------------------------------------- selection
	{
		// Deliberately declared here rather than spread from COMMON_COMPONENT_PROPERTIES,
		// which carries no defaultValue — leaving it unset silently resolves every node's
		// selection value to undefined, so the tree looks like it ignores clicks.
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selection Type',
		description: 'What gets written to the Selection Binding when a node is picked.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'NONE',
		enumValues: [
			{ name: 'NONE', displayName: 'No selection', description: 'Nodes are not selectable.' },
			{
				name: 'PATH',
				displayName: 'Path',
				description: 'The store path of the node, which other components can bind through.',
			},
			{
				name: 'OBJECT',
				displayName: 'Node object',
				description: 'A copy of the selected node object.',
			},
			{
				name: 'KEY',
				displayName: 'Key',
				description: 'The value of the Selection Key property on the node.',
			},
			{
				name: 'TREE_KEY',
				displayName: 'Tree key',
				description:
					"The node's position-based key. The only unambiguous choice when the same object appears more than once in the tree.",
			},
		],
	},
	{
		name: 'selectionKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selection Key',
		description: 'Property read from the node when Selection Type is Key.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'multiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Multi Select',
		description: 'Allow several nodes to be selected. The binding then holds an array.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'showCheckBoxes',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Check Boxes',
		description: 'Render a checkbox on each node. Multi select only.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'multiSelectNoSelectionValue',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Selection Value',
		description: 'What to store when the last selected node is deselected.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'EMPTY_ARRAY',
		enumValues: [
			{ name: 'EMPTY_ARRAY', displayName: 'Empty array' },
			{ name: 'UNDEFINED', displayName: 'Undefined' },
			{ name: 'NULL', displayName: 'Null' },
		],
	},
	{
		name: 'clearOnSelectingSameValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Clear On Reselect',
		description: 'Clicking the already selected node clears the selection. Single select only.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	{
		name: 'removeKeyWhenEmpty',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Remove Key When Empty',
		description: 'Delete the binding key entirely instead of storing an empty value.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'selectionBehaviour',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selectable Nodes',
		description: 'Restrict which nodes may be selected.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'NODE',
		enumValues: [
			{ name: 'NODE', displayName: 'Any node' },
			{
				name: 'LEAF_ONLY',
				displayName: 'Leaves only',
				description: 'Nodes with children only expand; they cannot be selected.',
			},
			{ name: 'BRANCH_ONLY', displayName: 'Branches only' },
		],
	},
	{
		name: 'onSelect',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Select',
		description: 'Runs after the selection is written, scoped to the selected node.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onNodeClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Node Click',
		description: 'Runs on every node click, whether or not selection is enabled.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},

	// ---------------------------------------------------------------- editing
	{
		name: 'editable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Editable',
		description:
			'Master switch for editing. While off the tree is read only and no drag handles or add/delete buttons are rendered. Not available for the Raw JSON shape.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'allowReorder',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Reorder',
		description: 'Let a node be dragged to a new position among its siblings.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'allowReparent',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Reparent',
		description: 'Let a node be dropped onto another node to change its parent.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'allowAdd',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Add',
		description: 'Show add-child and add-sibling controls on each node.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'allowDelete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Delete',
		description:
			'Show a delete control on each node. Deleting a node also deletes its subtree.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'newNodeTemplate',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'New Node Template',
		description: 'Object used as the starting value for an added node.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'canDragCondition',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Can Drag Condition',
		description:
			'Per-node expression deciding whether it may be dragged. Use the Data prefix to read the node, e.g. Data.locked = false.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'canDropCondition',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Can Drop Condition',
		description:
			'Per-node expression deciding whether something may be dropped onto it. Use the Data prefix to read the node.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dropAutoExpandDelay',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Drop Auto Expand Delay',
		description:
			'Milliseconds a drag must hover a collapsed node before it opens, so a node can be dropped deep in the tree. 0 disables it.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 600,
	},
	{
		name: 'addIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Add Icon',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'deleteIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Delete Icon',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dragHandleIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Drag Handle Icon',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onNodeMove',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Node Move',
		description: 'Runs after a node has been reordered or reparented.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onNodeAdd',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Node Add',
		description: 'Runs after a node has been added.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onNodeDelete',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Node Delete',
		description: 'Runs after a node has been deleted.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},

	// ---------------------------------------------------------------- appearance
	{
		name: 'treeDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tree Design',
		description: 'Overall layout of the tree.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '_indented',
		enumValues: [
			{
				name: '_indented',
				displayName: 'Indented list',
				description: 'File-explorer look: indentation per level with optional guide lines.',
			},
			{
				name: '_accordion',
				displayName: 'Accordion',
				description: 'Full-width stacked panels that slide open. No guide lines.',
			},
			{
				name: '_orgChart',
				displayName: 'Org chart',
				description:
					'Boxes laid out top-down with connector lines between parent and children.',
			},
			{
				name: '_columns',
				displayName: 'Columns',
				description:
					'Finder-style columns, one per level of the active path, driven by the Active Path Binding.',
			},
		],
	},
	{
		name: 'treeOrientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Orientation',
		description: 'Org chart only: which way the hierarchy grows.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_vertical',
		enumValues: [
			{ name: '_vertical', displayName: 'Top down' },
			{ name: '_horizontal', displayName: 'Left to right' },
		],
	},
	{
		name: 'showGuides',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Guide Lines',
		description: 'Draw connector lines. Applies to the indented and org chart designs.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'toggleStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Toggle Style',
		description: 'Shape of the built-in expand control when no icons are set.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_caret',
		enumValues: [
			{
				name: '_caret',
				displayName: 'Caret',
				description: 'A chevron that rotates on expand.',
			},
			{ name: '_plusMinus', displayName: 'Plus / minus' },
		],
	},
	{
		name: 'showColumnHeaders',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Column Headers',
		description: 'Columns design only: label each column with its depth.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'emptyStateText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty State Text',
		description: 'Shown when the bound data yields no nodes.',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
];

const {
	layout,
	spacing,
	size,
	position,
	typography,
	background,
	border,
	effects,
	rotate,
	scrollbar,
} = COMPONENT_STYLE_GROUP_PROPERTIES;

/**
 * Style slots.
 *
 * Slot names must be identical here, in the `subComponentName` props, and in
 * `SubComponentDefinitions['Tree']`. They must also never be a suffix of one another:
 * `SubHelperComponent` matches the editor's selection with
 * `selectedSubComponent.endsWith(subComponentName)`, so a slot called `toggle` alongside
 * `expandedToggle` would highlight both at once. Hence `toggleExpanded`, not `expandedToggle`.
 *
 * Selected and hovered states are pseudo states rather than slots, so every slot gets a
 * selected and hovered variant instead of only the row having one.
 */
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		layout.type,
		position.type,
		spacing.type,
		typography.type,
		border.type,
		size.type,
		background.type,
		effects.type,
		scrollbar.type,
	],
	viewport: [layout.type, spacing.type, size.type, background.type, border.type, scrollbar.type],
	nodeContainer: [
		layout.type,
		spacing.type,
		border.type,
		background.type,
		size.type,
		effects.type,
	],
	nodeRow: [
		layout.type,
		position.type,
		spacing.type,
		typography.type,
		border.type,
		size.type,
		background.type,
		effects.type,
	],
	nodeContent: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		background.type,
		effects.type,
	],
	nodeActions: [layout.type, spacing.type, size.type, effects.type],
	toggle: [
		spacing.type,
		typography.type,
		border.type,
		size.type,
		background.type,
		effects.type,
		rotate.type,
	],
	toggleExpanded: [typography.type, border.type, size.type, background.type, rotate.type],
	toggleCollapsed: [typography.type, border.type, size.type, background.type, rotate.type],
	guideLine: [border.type, size.type, effects.type],
	// Keeps a leaf row's content aligned with rows that have a toggle. Depth indentation
	// itself comes from padding on the nested children container, not from spacer elements.
	leafSpacer: [size.type, spacing.type, border.type, background.type],
	childrenContainer: [
		layout.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	checkBox: [size.type, spacing.type, border.type, background.type, effects.type],
	dragHandle: [typography.type, spacing.type, size.type, background.type, effects.type],
	dropBefore: [border.type, size.type, spacing.type, background.type, effects.type],
	dropAfter: [border.type, size.type, spacing.type, background.type, effects.type],
	dropInto: [border.type, size.type, spacing.type, background.type, effects.type],
	buttonAdd: [
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	buttonDelete: [
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	column: [
		layout.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		scrollbar.type,
		effects.type,
	],
	columnHeaderPart: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
	],
	columnDividerLine: [size.type, spacing.type, border.type, background.type],
	columnChevronIcon: [typography.type, size.type, spacing.type, effects.type, rotate.type],
	emptyState: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
