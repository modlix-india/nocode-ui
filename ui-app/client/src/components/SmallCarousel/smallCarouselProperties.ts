import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showArrowButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Previous and Next Arrow Buttons',
		description: 'Previous and Next arrow buttons to control carousel',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'slideSpeed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Carousel slide speed',
		description: `Adjust the slide speed by giving the time in milliseconds.`,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 2000,
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
		],
	},
	{
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Auto Play',
		description: 'Play automatically without interaction',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'autoPlayDirection',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Auto Play Direction',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'forward',
		enumValues: [
			{ name: 'forward', displayName: 'Forward', description: 'Forward' },
			{ name: 'backward', displayName: 'Backward', description: 'Backward' },
		],
	},
	{
		name: 'arrowButtonsPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Arrow Buttons Placement',
		description: 'Arrow buttons Placement outside or inside',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_insideArrow',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_insideArrow',
				displayName: 'Inside',
				description: 'Arrow navigations button positioned inside',
			},
			{
				name: '_outsideArrow',
				displayName: 'Outside',
				description: 'Arrow navigations button positioned outside',
			},
		],
	},
	{
		name: 'arrowButtonsVerticalPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Arrow Buttons Vertical Placement',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_centerArrow',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_topArrow',
				displayName: 'Top',
				description:
					'Arrows are placed on the top in the vertical slider and in horizontal slider they are moved to the top based on the horizontal placement',
			},
			{
				name: '_centerArrow',
				displayName: 'Center',
				description:
					'Arrows are placed on the either side of the vertical slider and in horizontal slider they are moved to the center based on the horizontal placement',
			},
			{
				name: '_bottomArrow',
				displayName: 'Bottom',
				description:
					'Arrows are placed on the bottom in the vertical slider and in horizontal slider they are moved to the bottom based on the horizontal placement',
			},
		],
	},
	{
		name: 'arrowButtonsHorizontalPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Arrow Buttons Horizontal Placement',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_middleArrow',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_leftArrow',
				displayName: 'Left',
				description:
					'Arrows are placed on the left in the horizontal slider and in vertical slider they are moved to the left based on the vertical placement',
			},
			{
				name: '_middleArrow',
				displayName: 'Middle',
				description:
					'Arrows are placed on the either side of the horizontal slider and in vertical slider they are moved to the middle based on the vertical placement',
			},
			{
				name: '_rightArrow',
				displayName: 'Right',
				description:
					'Arrows are placed on the right in the horizontal slider and in vertical slider they are moved to the right based on the vertical placement',
			},
		],
	},
	{
		name: 'showNavigationControlsOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show navigation controls on hover',
		description:
			'This property display navigation controls, i.e; navigation and buttons, when the carousel is hovered upon.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'showSlideNav',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Slide Navigation',
		description: 'Enable slide navigation buttons',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'designType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Deisgn Type',
		description: 'Design Type',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '_horizontal',
		enumValues: [
			{ name: '_horizontal', displayName: 'Horizontal Slider' },
			{ name: '_vertical', displayName: 'Vertical Slider' },
		],
	},
	{
		name: 'slideNavOrientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Navigation Orientation',
		description: 'Orientation of slide navigation buttons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'horizontalBottom',
		enumValues: [
			{
				name: 'horizontalTop',
				displayName: 'Horizontal Top',
				description: 'Horizontal Orientation Top',
			},
			{
				name: 'horizontalBottom',
				displayName: 'Horizontal Bottom',
				description: 'Horizontal Orientation Bottom',
			},
			{
				name: 'verticalLeft',
				displayName: 'Vertical Left',
				description: 'Vertical orientation Left',
			},
			{
				name: 'verticalRight',
				displayName: 'Vertical Right',
				description: 'Vertical orientation Right',
			},
		],
	},
	{
		name: 'slideNavPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Navigation Placement',
		description: 'Placement of slide navigation buttons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'outside',
		enumValues: [
			{ name: 'inside', displayName: 'Inside', description: 'Inside the carousel' },
			{ name: 'outside', displayName: 'Outside', description: 'Outside the carousel' },
		],
	},
	{
		name: 'showSlideNumbersInDots',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Slide Numbers In Dots',
		description: 'Show Slide number in the dots',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'slideNavIconType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Navigation Icon Type',
		description: 'Icon type for slide navigation buttons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'circle',
		enumValues: [
			{ name: 'circle', displayName: 'Circle', description: 'Circle icon' },
			{ name: 'square', displayName: 'Square', description: 'Square icon' },
			{ name: 'dash', displayName: 'Dash', description: 'Dash icon' },
		],
	},
	{
		name: 'slideNavIconFill',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Navigation Icon Fill',
		description: 'Fill type for slide navigation icons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'solid',
		enumValues: [
			{ name: 'solid', displayName: 'Solid', description: 'Solid fill' },
			{ name: 'outline', displayName: 'Outline', description: 'Outline fill' },
		],
	},

	{
		name: 'showArrowButtonsOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Arrow Buttons on hover',
		description:
			'This property display arrow buttons, i.e; arrows buttons, when the carousel is hovered upon.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'slidesToScroll',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Number of slides to scroll',
		description: 'Add the number of slides you want to scroll at once',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 1,
	},
	{
		name: 'pauseOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Pause on hover over the slide',
		description: 'You can enable pause on hover on current slide',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'noOfChilds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Number of slides to show',
		description: 'This is the number of slides to show when fixed child is selected',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: -1,
	},
	{
		name: 'visibleSlideNavButtons',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Visible Slide Nav Buttons',
		description: 'Number of visible slide navigation buttons',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: -1,
	},
	{
		name: 'showNavArrowButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show NavigationArrow Buttons',
		description: 'This property display arrow buttons on navigation.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Data',
		description: 'Data For Repeater',
		group: ComponentPropertyGroup.DATA,
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
		name: 'prevImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Previous Arrow Image',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'nextImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Next Arrow Image',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.selectionKey,
	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.selectionType,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
];

const stylePropertiesDefinition = {
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
	prevButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	nextButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	slideButtonsContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	slidesContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	slideNavButtons: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	slideItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
