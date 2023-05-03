import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Source',
		description: 'Source of the video.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'poster',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Poster',
		description: 'Image to load before the video comes up.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'type',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Type',
		description: 'Type of the resource.',
		defaultValue: 'mp4',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Autoplay',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showSeekBar',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show seek bar',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showAudioControls',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show audio controls',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showFullScreenButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show full screen button',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showPipButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Picture in Picture Button',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showPlaypause',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show playpause Button',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showTime',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Time ',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
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
	player: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	volumeSlider: [COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type],
	seekSlider: [COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type],
	playPauseButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	pipButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	fullScreenButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	timeText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	seekTimeTextOnHover: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
