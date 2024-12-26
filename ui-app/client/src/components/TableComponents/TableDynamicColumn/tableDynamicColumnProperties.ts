import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
} from '../../../types/common';
import { COMMON_COMPONENT_PROPERTIES } from '../../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'excludeColumns',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Exclude Columns List',
		description: 'These columns will be excluded from the table',
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
	},
	{
		name: 'columnsOrder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Columns Order',
		description: 'This order is used to display the columns in the table',
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
	},
	{
		name: 'includeColumns',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Include Columns List',
		description: 'These columns will be included from the table',
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
	},
	{
		name: 'enableSorting',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Sorting',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sortColumns',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sort Columns List',
		description:
			'These columns will be sorted in the table, if not provided all the dynamic columns will be sorted',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
	},
	{
		name: 'dontShowOtherColumns',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Only Included Columns',
		description: 'Shows only included columns',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'sortAscendingIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sort Ascending Icon',
		description: 'Icon to be shown when sorting in ascending order.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sortDescendingIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sort Descending Icon',
		description: 'Icon to be shown when sorting in descending order.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sortNoneIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sort None Icon',
		description: 'Icon to be shown when sorting is not applied.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},

	COMMON_COMPONENT_PROPERTIES.visibility,
];

export { propertiesDefinition };
