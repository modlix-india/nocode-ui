import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
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
	COMMON_COMPONENT_PROPERTIES.label,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Left Icon',
		description: 'Icon to be shown on the left side.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'rightIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Right Icon',
		description: 'Icon to be shown on the right side.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sortKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sort Key',
		description: 'Key to be used for sorting.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'initialSortOrder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Initial Sort Order',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'ASC',
		enumValues: [
			{ name: 'ASC', displayName: 'Ascending' },
			{ name: 'DESC', displayName: 'Descending' },
		],
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
	{
		name: 'hideIfNotPersonalized',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide If Not Personalized',
		description: 'Hide the column if not personalized.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'disableColumnDragging',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Disable Column Dragging',
		description: 'Disable the column dragging.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
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
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	rightIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
