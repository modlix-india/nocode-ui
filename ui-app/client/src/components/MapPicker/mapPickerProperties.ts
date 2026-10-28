import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'apiKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Google Maps API key',
		description:
			'Browser key for the Google Maps JavaScript API. Without one the component shows the "no map" text and nothing else.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'centerLat',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Center latitude',
		description: 'Where the map opens when no point is picked yet.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 20.5937,
	},
	{
		name: 'centerLng',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Center longitude',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 78.9629,
	},
	{
		name: 'zoom',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Zoom',
		description: 'Zoom when no point is picked yet (a picked point opens closer).',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 5,
	},
	{
		name: 'radiusKm',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Radius (km)',
		description:
			'Draws a circle of this radius around the picked point. Empty or 0: no circle.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'noMapText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'No map text',
		description: 'Shown when there is no API key or the map could not load.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'The map is not available.',
		translatable: true,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.onChange,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
