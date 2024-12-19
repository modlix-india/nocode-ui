import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../../types/common';
import {
	COMMON_COMPONENT_PROPERTIES,
	COMPONENT_STYLE_GROUP_PROPERTIES,
} from '../../util/properties';
import * as tableColumnsProperties from '../TableColumns/tableColumnsProperties';

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
		description: 'These columns will be excluded from the table',
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
		name: 'dontShowOtherColumns',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Only Included Columns',
		description: 'Shows only included columns',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	...tableColumnsProperties.propertiesDefinition,
];

const stylePropertiesDefinition = tableColumnsProperties.stylePropertiesDefinition;

export { propertiesDefinition, stylePropertiesDefinition };
