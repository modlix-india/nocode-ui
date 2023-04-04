import { Schema } from '@fincity/kirun-js';
import { SCHEMA_ANY_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,

	{
		name: 'tabs',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tabs list',
		description: 'Tabs to be present on the component, comma seperated list of tab names',
		multiValued: true,
		defaultValue: [],
	},
	{
		name: 'defaultActive',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active tab name',
		description: 'Active default tab',
	},
	{
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Icon list',
		editor: ComponentPropertyEditor.ICON,
		description: "Icon's to be present on the component, comma seperated list of icon links",
		multiValued: true,
		defaultValue: [],
	},
	{
		name: 'tabsOrientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tabs Orientation',
		description: 'Orientation of tabs coponent',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'HORIZONTAL',
		enumValues: [
			{ name: 'HORIZONTAL', displayName: 'Row Layout', description: 'Default row layout' },
			{
				name: 'VERTICAL',
				displayName: 'Column Layout',
				description: 'Single Column layout in all resolutions',
			},
		],
	},
	{
		name: 'activeStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active tab style',
		description: 'Orientation of tabs coponent',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'BORDER',
		enumValues: [
			{ name: 'BORDER', displayName: 'Border', description: 'Show border as a active style' },
			{
				name: 'HIGHLIGHT',
				displayName: 'Highlight',
				description: 'Show highlight as a active style',
			},
		],
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,

		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['button'],
		},
	},
	tabsContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'tabsContainerBackground',
			description: 'Background css for container',
			displayName: 'Tabs Container Background props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'tabsContainerBorder',
			description: 'border css for container',
			displayName: 'tabsContainer border props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'tabsContainerMargin',
			description: 'margin css for container',
			displayName: 'tabsContainer margin props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'tabsContainerPadding',
			description: 'padding css for container',
			displayName: 'tabsContainer padding props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'tabsContainerSize',
			description: 'size css for container',
			displayName: 'tabsContainer size props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'tabsContainerBoxShadow',
			description: 'boxShadow css for container',
			displayName: 'tabsContainer boxShadow props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'tabsContainerContainer',
			description: 'tabsContainer css for container',
			displayName: 'tabsContainer container props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'tabsContainerFlex',
			description: 'flex css for container',
			displayName: 'tabsContainer flex props',
			prefix: 'tabsContainer',
			target: ['tabsContainer'],
		},
	},
	tabDivContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'tabDivContainerPadding',
			description: 'padding css for tab div container',
			displayName: 'Tab div container padding props',
			prefix: 'tabDivContainer',
			target: ['tabDivContainer'],
		},
	},
	childContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'childContainerBackground',
			description: 'Background css for container',
			displayName: 'Child Container Background props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'childContainerBorder',
			description: 'border css for container',
			displayName: 'childContainer border props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'childContainerMargin',
			description: 'margin css for container',
			displayName: 'childContainer margin props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'childContainerPadding',
			description: 'padding css for container',
			displayName: 'childContainer padding props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'childContainerSize',
			description: 'size css for container',
			displayName: 'childContainer size props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'childContainerBoxShadow',
			description: 'boxShadow css for container',
			displayName: 'childContainer boxShadow props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'childContainerContainer',
			description: 'childContainer css for container',
			displayName: 'childContainer container props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'childContainerFlex',
			description: 'flex css for container',
			displayName: 'childContainer flex props',
			prefix: 'childContainer',
			target: ['childContainer'],
		},
	},
	button: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'buttonBackground',
			description: 'Background css for button',
			displayName: 'Button Background props',
			prefix: 'button',
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'buttonBorder',
			description: 'border css for button',
			displayName: 'Button border props',
			prefix: 'button',
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'buttonMargin',
			description: 'margin css for button',
			displayName: 'Button margin props',
			prefix: 'button',
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			name: 'buttonOpacity',
			description: 'opacity css for button',
			displayName: 'Button opacity props',
			prefix: 'button',
			target: ['button'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'buttonPadding',
			description: 'padding css for button',
			displayName: 'Button padding props',
			prefix: 'button',
			target: ['button'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'buttonSize',
			description: 'size css for button',
			displayName: 'Button size props',
			prefix: 'button',
			target: ['button'],
		},
	},

	icon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'iconFont',
			description: 'font css for icon',
			displayName: 'icon font props',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'iconColor',
			description: 'color css for icon',
			displayName: 'icon color  props',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'iconPadding',
			description: 'padding css for icon',
			displayName: 'icon padding  props',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'iconMargin',
			description: 'margin css for icon',
			displayName: 'icon margin props',
			prefix: 'icon',
			target: ['icon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
