import { SCHEMA_ANY_COMP_PROP, SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../../types/common';
import {
	COMMON_COMPONENT_PROPERTIES,
	COMPONENT_STYLE_GROUP_PROPERTIES,
} from '../../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	// ---- Tree shape ----
	{
		name: 'idField',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Id Field',
		description: "Field on each tree node holding the group/leaf id. Defaults to 'id'.",
		defaultValue: 'id',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'labelField',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label Field',
		description: "Field on each tree node holding the display label. Defaults to 'name'.",
		defaultValue: 'name',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'childrenField',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Children Field',
		description:
			"Field on each tree node holding the substages/leaf array. Defaults to 'children'.",
		defaultValue: 'children',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// ---- Per-row cell access ----
	{
		name: 'cellPathTemplate',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Cell Path Template',
		description:
			"Per-row path to the cell object for a leaf. `{id}` is replaced with the leaf id. Default: 'stageCells.{id}'.",
		defaultValue: 'stageCells.{id}',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'subCellFields',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sub-Cell Fields',
		description:
			"Comma-separated fields read from each leaf cell. One body cell per field. Default: 'count,cpl'.",
		defaultValue: 'count,cpl',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'subCellLabels',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sub-Cell Labels',
		description:
			"Comma-separated labels for the sub-cells, parallel to Sub-Cell Fields. Shown in the bottom header row.",
		defaultValue: 'Count,CPL',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'layoutMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sub-Cell Layout',
		description:
			'Choose between separate flat columns per metric (default) or compact stacked cells (Count & CPL in a single column).',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'SEPARATE_COLUMNS',
		enumValues: [
			{ name: 'SEPARATE_COLUMNS', displayName: 'Separate Columns per Metric' },
			{ name: 'STACKED', displayName: 'Stacked (Single Column per Stage)' },
		],
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'subCellFormats',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sub-Cell Formats',
		description:
			"Comma-separated value formats parallel to Sub-Cell Fields. One of text|int|decimal|percent. Default: 'int,decimal'.",
		defaultValue: 'int,decimal',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'numberLocale',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Number Locale',
		description: "BCP-47 locale for number formatting. Default: 'en-IN'.",
		defaultValue: 'en-IN',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// ---- Filtering and ordering ----
	{
		name: 'excludeGroups',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Exclude Groups',
		description: 'Group ids that will not be rendered.',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
	},
	{
		name: 'includeGroups',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Include Groups',
		description:
			'When set, only these group ids are rendered. Empty means render all (minus excludeGroups).',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
	},
	{
		name: 'groupOrder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Group Order',
		description: 'Order of groups to render, by id. Unlisted appear after, in tree order.',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
	},

	// ---- Display options ----
	{
		name: 'showSubCellHeaderRow',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Sub-Cell Header Row',
		description:
			'Render a third header row that labels each sub-cell (e.g. Count / CPL). Otherwise sub-cell labels are inline.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'expandSubstages',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Expand Substages',
		description:
			'When false (default), only parent-group rollup columns render — and the user can expand a single stage by clicking its header (toggle written to expandedGroupsPath). When true, every parent is force-expanded into its substages regardless of click state — use for a flat-expanded view.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'expandedGroupsPath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Expanded Groups Path',
		description:
			"Page-state path holding the per-stage expanded flags. Keyed by sanitized stageId → truthy when expanded. Default: 'Page.expandedStages'. Clicking a parent stage's column header toggles the corresponding entry at this path.",
		defaultValue: 'Page.expandedStages',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'leafColspanOnEmptyGroup',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Leaf Spans Empty Group',
		description:
			"When a parent group has no children, treat the parent itself as a single leaf so the group header still aligns with one sub-cell pair.",
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'disableExpand',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Disable Expand',
		description:
			'When true, substages are never rendered and column headers are not clickable toggles (parent-only rollup view).',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'expandIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Expand Icon',
		description: 'Icon shown when a group column is collapsed and can be expanded.',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: 'fa fa-solid fa-plus',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'collapseIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Collapse Icon',
		description: 'Icon shown when a group column is expanded.',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: 'fa fa-solid fa-minus',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'stageAliases',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Stage Aliases',
		description:
			'Key-value map or object mapping stage names or IDs to custom display labels (e.g. {"Contactable": "Qualified", "Fresh": "M-Leads"}).',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'parentSeparator',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Parent Separator',
		description:
			"Separator symbol between parent stage and substage in the column header. Default: '›'. Examples: '/', '>', '→', '|'.",
		defaultValue: '›',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'headerLabelFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Header Label Format',
		description:
			"Template format for the column header label. Defaults to '{name}'. Can use '{parentName}' and '{name}' (e.g. '{parentName} › {name}' or '{name}').",
		defaultValue: '{name}',
		group: ComponentPropertyGroup.ADVANCED,
	},

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
	header: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	headerContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	expandIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	collapseIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	groupHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	leafHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	subCellHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	cell: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
