import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Source',
		description: 'Source of the audio.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'type',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Type',
		description: 'Type of the resource.',
		defaultValue: 'audio/ogg',
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
		name: 'loop',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Loop',
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
	{
		name: 'muted',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Muted',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoUnMuteAfterPlaying',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Auto Unmute After Playing',
		defaultValue: false,
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
		name: 'audioDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'audio Player Design',
		description: 'Color Scheme',
		defaultValue: '_audioDesign1',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_audioDesign1',
				displayName: 'audio Player Design 1',
				description: 'audio Player Design 1',
			},
			{
				name: '_audioDesign2',
				displayName: 'audio Player Design 2',
				description: 'audio Player Design 2',
			},
			{
				name: '_audioDesign3',
				displayName: 'audio Player Design 3',
				description: 'audio Player Design 3',
			},
			{
				name: '_audioDesign4',
				displayName: 'audio Player Design 4',
				description: 'audio Player Design 4',
			},
		],
	},
	{
		name: 'autoUnMuteAfterPlaying',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Auto Unmute After Playing',
		defaultValue: false,
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
	volumeSlider: [COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type],
	seekSlider: [COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type],
	playPauseButton: [
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
