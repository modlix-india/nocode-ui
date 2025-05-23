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
		name: 'dotsButtonType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dots Button Type',
		description: 'Types of Dot buttons',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'circle',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'circle', displayName: 'dots', description: 'dots' },
			{ name: 'square', displayName: 'square', description: 'square buttons' },
			{ name: 'minus', displayName: 'dash', description: 'dash icon' },
			{ name: 'none', displayName: 'none', description: 'none' },
		],
	},
	{
		name: 'dotsButtonIconType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dots Button Type',
		description: 'Position of Dot buttons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'regular',
		enumValues: [
			{ name: 'regular', displayName: 'regular', description: 'hallow icon' },
			{ name: 'solid', displayName: 'solid', description: 'solid icon' },
		],
	},
	{
		name: 'show Slide Numbers In Dots',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Slide Numbers In Dots',
		description: 'Show Slide number in the dots',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'slideNavButtonPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Nav Button Placement',
		description: 'Slide navigation buttons placement',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_insideNavButton',
		enumValues: [
			{
				name: '_insideNavButton',
				displayName: 'Inside',
				description: 'Slide navigations button inside placement',
			},
			{
				name: '_outsideNavButton',
				displayName: 'Outside',
				description: 'Slide navigations button outside placement',
			},
		],
	},
	{
		name: 'slideNavButtonVerticalAlignment',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Nav Button Vertical Alignment',
		description: 'Slide navigation buttons vertical alignment',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_bottomNavButton',
		enumValues: [
			{
				name: '_topNavButton',
				displayName: 'Top',
				description: 'slide navigations button positioned on top',
			},
			{
				name: '_bottomNavButton',
				displayName: 'Bottom',
				description: 'slide navigations button positioned on bottom',
			},
		],
	},
	{
		name: 'slideNavButtonHorizontalAlignment',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Slide Nav Button Horizontal Alignment',
		description: 'Slide navigation buttons horizontal alignment',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_middleNavigation',
		enumValues: [
			{
				name: '_rightNavigation',
				displayName: 'Right',
				description: 'slide navigations button positioned right',
			},
			{
				name: '_middleNavigation',
				displayName: 'Middle',
				description: 'slide navigations button positioned Middle',
			},
			{
				name: '_leftNavigation',
				displayName: 'Left',
				description: 'slide navigations button positioned Left',
			},
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
		name: 'showArrowButtonsOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Arrow Buttons on hover',
		description:
			'This property display arrow buttons, i.e; arrows buttons, when the carousel is hovered upon.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		defaultValue: '_horizontal',
		enumValues: [
			{ name: '_horizontal', displayName: 'Horizontal Slider' },
			{ name: '_vertical', displayName: 'Vertical Slider' },
		],
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
	dotButtons: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	slidesContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
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
