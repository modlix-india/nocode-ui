import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Gallery Data',
		description: 'Gallery data to be displayed on the component.',
		group: ComponentPropertyGroup.DATA,
		multiValued: false,
		defaultValue: [],
	},

	{
		name: 'showClose',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Close Button',
		description: 'Show Close button on Gallery.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
		translatable: false,
	},

	{
		name: 'closeOnEscape',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Gallery on ESC',
		description: 'Close Gallery when escape key is pressed.',
		group: ComponentPropertyGroup.BASIC,
		translatable: false,
		defaultValue: true,
	},

	{
		name: 'closeOnOutsideClick',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Gallery on clicking outside the Image',
		description: 'Closes Gallery when clicked outside the Image.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},

	{
		name: 'zoom',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Zoom Feature',
		description: 'Magnification functionality',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'zoomInFactor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Zoom In Factor',
		description: 'Magnification fector',
		defaultValue: '1.6',
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'fullScreen',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Full Screen Feature',
		description: 'Full Screen functionality',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'showArrowButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Left and right Buttons',
		description: 'Left and right arrow buttons to control Gallery',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},

	{
		name: 'arrowButtons',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Arrow Buttons',
		description: 'Position of arrow buttons',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_Middle',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_Middle',
				displayName: 'Center',
				description: 'arrow navigations button positioned on middle',
			},
			{
				name: '_LeftTop',
				displayName: 'top left',
				description: 'arrow navigations button positioned on top-Left',
			},
			{
				name: '_RightTop',
				displayName: 'top right',
				description: 'arrow navigations button positioned on top-right ',
			},
			{
				name: '_LeftBottom',
				displayName: 'bottom left',
				description: 'arrow navigations button positioned on bottom-left',
			},
			{
				name: '_RightBottom',
				displayName: 'bottom right',
				description: 'arrow navigations button positioned on  Bottom-right',
			},
		],
	},
	{
		name: 'previewMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Preview Mode',
		description: 'Choose Preview Mode',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'Thumbnail',
		enumValues: [
			{
				name: 'Thumbnail',
				displayName: 'thumbnail',
				description: 'thumbnail',
			},
			{
				name: 'Preview',
				displayName: 'preview',
				description: 'preview',
			},
		],
	},
	{
		name: 'position',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Preview Position',
		description: 'Position of Preview',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'Right',
		enumValues: [
			{
				name: 'Top',
				displayName: 'top',
				description: 'slide navigations button positioned on top',
			},
			{
				name: 'Right',
				displayName: 'right',
				description: 'slide navigations button positioned on right',
			},
			{
				name: 'Bottom',
				displayName: 'bottom',
				description: 'slide navigations button positioned on bottom',
			},
			{
				name: 'Left',
				displayName: 'left',
				description: 'slide navigations button positioned on left',
			},
		],
	},

	{
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Auto Play',
		description: 'Play automatically without interaction',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},

	{
		name: 'slideSpeed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Gallery slide speed',
		description: `Adjust the slide speed by giving the time in milliseconds.`,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 2000,
	},

	{
		name: 'animationType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Animation Type',
		description: 'Animation Type',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'fadeover',
		enumValues: [
			{ name: 'slide', displayName: 'Slide', description: 'Slide' },
			{ name: 'slideover', displayName: 'Slide Over', description: 'Slide Over' },
			{ name: 'fadeover', displayName: 'Fade Over', description: 'Fade Over' },
			{ name: 'fadeoutin', displayName: 'Fade Out In', description: 'Fade Out In' },
			{ name: 'crossover', displayName: 'Cross Over', description: 'Cross Over' },
		],
	},

	{
		name: 'animationDuration',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Animation Duration',
		description: 'How long the animation should last.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 2000,
	},

	{
		name: 'easing',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Easing',
		description: 'Easing',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'ease',
		enumValues: [
			{ name: 'linear', displayName: 'Linear', description: 'Linear' },
			{ name: 'ease', displayName: 'Ease', description: 'Ease' },
			{ name: 'ease-in', displayName: 'Ease In', description: 'Ease In' },
			{ name: 'ease-out', displayName: 'Ease Out', description: 'Ease Out' },
			{ name: 'ease-in-out', displayName: 'Ease In Out', description: 'Ease In Out' },
			{ name: 'crossover', displayName: 'Cross Over', description: 'Cross Over' },
		],
	},

	{
		...COMMON_COMPONENT_PROPERTIES.datatype,
		enumValues: [
			{
				name: 'LIST_OF_STRINGS',
				displayName: 'List of strings',
				description: 'data has an array of strings',
			},
			{
				name: 'LIST_OF_OBJECTS',
				displayName: 'List of objects',
				description: 'data has an array of objects',
			},
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.selectionKey,
		displayName: "Source key's value",
		description: 'Key value that is used to generate src for Gallery.',
	},
	COMMON_COMPONENT_PROPERTIES.showInDesign,
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.readOnly,
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
	toolbarLeftColumn: [
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	toolbarRightColumn: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	toolbarButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	arrowButtons: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	slideImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumbnailContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],

	thumbnailImageDiv: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumbnailImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],

	previewContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	previewCloseButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	previewList: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	previewImageDiv: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	previewImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
