import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'pageName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Page Name',
		description: 'Sub page name',
		group: ComponentPropertyGroup.BASIC,
		translatable: false,
	},
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'App Code',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Client Code',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'overrideThemeStyles',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Override Themes and Styles',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// A host page cannot make its sub page reload. `_.<fn>` does not cross the
		// boundary, so the host cannot call the pane's loader, and the pane has no
		// way to watch a store value. That left the host with only bad options:
		// copy the pane's whole load function into itself, or flip `pageName` to
		// something else and back to force a remount.
		//
		// This is the honest version of the same intent. Bind it to a value the
		// host bumps, and the sub page re-runs its OWN onLoadEvent, which is the
		// function that already knows how to load that pane.
		name: 'reloadOn',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Reload On',
		description:
			'Re-run the sub page’s own onLoadEvent whenever this value changes. Bind it to a counter or timestamp the host page updates when the pane’s data has gone stale.',
		group: ComponentPropertyGroup.ADVANCED,
		translatable: false,
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
};

export { propertiesDefinition, stylePropertiesDefinition };
