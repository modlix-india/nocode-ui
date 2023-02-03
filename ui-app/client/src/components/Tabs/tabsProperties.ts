import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_ANY_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
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
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'Tabs list (CSV)',
		description: 'Tabs to be present on the component, comma seperated list of tab names',
		defaultValue: '',
	},
	{
		name: 'defaultActive',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Active tab name',
		description: 'Active default tab',
	},
	{
		name: 'icon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'icon list (CSV)',
		description: "icon's to be present on the component, comma seperated list of icon links",
		defaultValue:
			'fa-brands fa-linkedin,fa-brands fa-github,fa-brands fa-discord,fa-solid fa-ghost',
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
			target: ['container'],
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
	container: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'containerBackground',
			description: 'Background css for container',
			displayName: 'Container Background props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'containerBackground',
			description: 'Background css for container',
			displayName: 'container Background props',
			prefix: 'button',
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'containerBorder',
			description: 'border css for container',
			displayName: 'container border props',
			prefix: 'container',
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'containerMargin',
			description: 'margin css for container',
			displayName: 'container margin props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'containerPadding',
			description: 'padding css for container',
			displayName: 'container padding props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'containerSize',
			description: 'size css for container',
			displayName: 'container size props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'containerBoxShadow',
			description: 'boxShadow css for container',
			displayName: 'container boxShadow props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'containerContainer',
			description: 'container css for container',
			displayName: 'container container props',
			prefix: 'container',
			target: ['container'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'containerFlex',
			description: 'flex css for container',
			displayName: 'container flex props',
			prefix: 'container',
			target: ['container'],
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
