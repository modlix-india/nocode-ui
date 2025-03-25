import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Source',
		description: 'The URL or file path of the audio source.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	{
		name: 'audioDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Audio Player Design',
		description: 'Choose a design layout for the audio player.',
		defaultValue: '_audioDesign1',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_audioDesign1',
				displayName: 'Audio Player Design 1',
				description: 'A standard audio player design.',
			},
			{
				name: '_audioDesign2',
				displayName: 'Audio Player Design 2',
				description: 'An alternative design for the audio player.',
			},
			{
				name: '_audioDesign3',
				displayName: 'Audio Player Design 3',
				description: 'A modern and sleek audio player design.',
			},
			{
				name: '_audioDesign4',
				displayName: 'Audio Player Design 4',
				description: 'A compact and minimalistic design for the player.',
			},
		],
	},
	{
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Autoplay',
		description: 'Automatically start playing the audio when loaded.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'loop',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Loop',
		description: 'Enable looping to replay the audio continuously.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showSeekBar',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Seek Bar',
		description: 'Display a seek bar to allow users to navigate through the audio track.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showPlayPause',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Play/Pause Button',
		description: 'Display the play and pause buttons on the audio player.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showTime',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Time Text',
		description: 'Display the elapsed and total time of the audio.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'muted',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Muted',
		description: 'Start the audio in a muted state.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showVolumeControls',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Volume Controls',
		description: 'Display the volume control buttons for the player.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showPlayBackSpeed',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Playback Speed',
		description: 'Allow users to adjust the playback speed of the audio.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'playBackSpeedType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Playback Speed Type',
		description: 'Select playback speed (Dropdown, Grid, or Single Select).',
		defaultValue: 'DROPDOWN',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'DROPDOWN',
				displayName: 'Dropdown',
				description: 'Select playback speed from a dropdown list.',
			},
			{
				name: 'GRID',
				displayName: 'Grid',
				description: 'Choose playback speed from a grid of options.',
			},
			{
				name: 'SINGLESELECT',
				displayName: 'Single Select',
				description: 'Select a single playback speed option.',
			},
		],
	},
	{
		name: 'onHoverVolumeControl',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Volume Control on Hover',
		description: 'Display volume controls when the user hovers over the player.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'seekTimeTextOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Time Text on Hover',
		description: 'Display time indicators when hovering over the seek bar.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'showRewindAndFastForward',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Rewind and Forward Buttons',
		description: 'Display buttons for rewinding and fast-forwarding audio.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'playIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Play Icon',
		description: 'Icon to represent the play button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'playIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Play Image',
		description: 'Image to be used for the play button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'pauseIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Pause Icon',
		description: 'Icon to represent the pause button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'pauseIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Pause Image',
		description: 'Image to be used for the pause button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'rewindIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Rewind Icon',
		description: 'Icon for the rewind button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'rewindIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Rewind Image',
		description: 'Image to be displayed for the rewind button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'forwardIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Forward Icon',
		description: 'Icon for the fast forward button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'forwardIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Forward Image',
		description: 'Image to be displayed for the fast forward button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'volumeIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Volume Icon',
		description: 'Icon for the volume button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'volumeIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Volume Image',
		description: 'Image to be displayed for the volume button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'volumeMuteIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Volume Mute Icon',
		description: 'Icon for the volume mute button.',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'volumeMuteIconImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Volume Mute Image',
		description: 'Image to be displayed for the volume mute button.',
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'volumeSliderPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Volume Slider Position',
		description: 'Defines the position of the volume slider in the player.',
		defaultValue: '_leftHorizontal',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_rightHorizontal',
				displayName: 'Right Horizontal',
				description: 'Right Horizontal',
			},
			{
				name: '_leftHorizontal',
				displayName: 'Left Horizontal',
				description: 'Left Horizontal',
			},
			{
				name: '_topVertical',
				displayName: 'Top Vertical',
				description: 'Top Vertical',
			},
			{
				name: '_bottomVertical',
				displayName: 'Bottom Vertical',
				description: 'Bottom Vertical',
			},
		],
	},

	{
		name: 'type',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Type',
		description: 'Audio format type, e.g., audio/ogg or audio/mp3.',
		defaultValue: 'audio/ogg',
		group: ComponentPropertyGroup.ADVANCED,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	volumeSlider: [
		COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	seekSlider: [
		COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	playIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	pauseIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	volumeIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	volumeMuteIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	timeText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	seekTimeTextOnHover: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	playBackSpeed: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	rewindIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	forwardIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	volumeSliderContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	volumeButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	playBackSpeedGrid: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	playBackSpeedDropdown: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	playBackSpeedDropdownOption: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	fileName: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
