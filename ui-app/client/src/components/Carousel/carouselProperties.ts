import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
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
		displayName: 'Left and right Buttons',
		description: 'Left and right arrow buttons to control carousel',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showDotsButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Dot buttons in carousel',
		description: `Dot buttons that will show on bottom of the carousel.`,
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
		name: 'animationType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Animation Type',
		description: 'Animation Type',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'slide',
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
		defaultValue: 'linear',
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
		name: 'autoPlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Auto Play',
		description: 'Play automatically without interaction',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'dotsButtonType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'dotsButtonType',
		description: 'Types of Dot buttons',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'circle',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'circle', displayName: 'dots', description: 'dots' },
			{ name: 'square', displayName: 'square', description: 'square buttons' },
			{ name: 'none', displayName: 'none', description: 'none' },
		],
	},
	{
		name: 'dotsButtonIconType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'dotsButtonType',
		description: 'Position of Dot buttons',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'regular',
		enumValues: [
			{ name: 'regular', displayName: 'regular', description: 'hallo icon' },
			{ name: 'solid', displayName: 'solid', description: 'solid icon' },
		],
	},
	{
		name: 'hasNumbersInSlideNav',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'hasNumbersInSlideNav',
		description: 'has numbers in slide nav',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'slideNavButtonPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'slideNavButtonType',
		description: 'Types of Dot buttons',
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
			{
				name: 'OutsideBottom',
				displayName: 'OutsideBottom',
				description: 'slide navigations button positioned on outside bottom',
			},
			{
				name: 'OutsideTop',
				displayName: 'OutsideTop',
				description: 'slide navigations button positioned on outside Top',
			},
		],
	},

	{
		name: 'arrowButtons',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'arrowButtons',
		description: 'Position of arrow buttons',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'OutsideBottomRight',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'Middle',
				displayName: 'Center',
				description: 'arrow navigations button positioned on middle',
			},
			{
				name: 'LeftTop',
				displayName: 'top left',
				description: 'arrow navigations button positioned on top-Left',
			},
			{
				name: 'RightTop',
				displayName: 'top right',
				description: 'arrow navigations button positioned on top-right ',
			},
			{
				name: 'LeftBottom',
				displayName: 'bottom left',
				description: 'arrow navigations button positioned on bottom-left',
			},
			{
				name: 'RightBottom',
				displayName: 'bottom right',
				description: 'arrow navigations button positioned on  Bottom-right',
			},
			{
				name: 'OutsideBottomLeft',
				displayName: 'Outside-Bottom-Left',
				description: 'arrow navigations button positioned on outside-bottom-left',
			},
			{
				name: 'OutsideBottomRight',
				displayName: 'Outside-Bottom-Right',
				description: 'arrow navigations button positioned on outside-bottom-right',
			},
			{
				name: 'OutsideTopLeft',
				displayName: 'Outside-Top-Left',
				description: 'arrow navigations button positioned on outside-Top-left',
			},
			{
				name: 'OutsideTopRight',
				displayName: 'Outside-Top-Right',
				description: 'arrow navigations button positioned on outside-Top-right',
			},
		],
	},

	{
		name: 'showNavigationControlsOnHover',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show navigation controls on hover',
		description:
			'This property display navigation controls, i.e; arrows and buttons, when the carousel is hovered upon.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},

	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.shape.type]: COMPONENT_STYLE_GROUP_PROPERTIES.shape,
		[COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
