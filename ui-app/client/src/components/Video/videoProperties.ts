import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentStylePropertyDefinition } from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Source',
		description: 'Source of the video.',
	},
	{
		name: 'poster',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Poster',
		description: 'Image to load before the video comes up.',
	},
	{
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Autoplay',
		defaultValue: false,
	},
	{
		name: 'showSeekBar',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show seek bar',
		defaultValue: true,
	},
	{
		name: 'showAudioControls',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show audio controls',
		defaultValue: true,
	},
	{
		name: 'showFullScreenButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show full screen button',
		defaultValue: true,
	},
	{
		name: 'showPipButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Picture in Picture Button',
		defaultValue: true,
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
