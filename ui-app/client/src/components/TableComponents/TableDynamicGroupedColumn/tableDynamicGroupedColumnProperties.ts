import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	ComponentPropertyDefinition,
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
			'When false (default), only parent-group rollup columns render. When true, each parent is followed by one column per substage. Use this for a flat-expanded view when you want every substage column visible.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
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
