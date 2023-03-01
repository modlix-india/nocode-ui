import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyEditor } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'position',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Popover position',
		description: `Popover position.`,
		defaultValue: 'bottom-end',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'bottom',
				displayName: 'Bottom Center',
				description: 'Position Bottom Center.',
			},
			{
				name: 'bottom-start',
				displayName: 'Bottom Start',
				description: 'Position Bottom Start.',
			},
			{
				name: 'bottom-end',
				displayName: 'Bottom End',
				description: 'Position Bottom End.',
			},
			{ name: 'top', displayName: 'Top Center', description: 'Position Top Center.' },
			{ name: 'top-start', displayName: 'Top Start', description: 'Position Top Start.' },
			{ name: 'top-end', displayName: 'Top End', description: 'Position Top End.' },
			{ name: 'left', displayName: 'Left Center', description: 'Position Left Center.' },
			{ name: 'left-start', displayName: 'Left Start', description: 'Position Left Start.' },
			{
				name: 'left-end',
				displayName: 'Left End',
				description: 'Position Left End.',
			},
			{ name: 'right', displayName: 'Right Center', description: 'Position Right Center.' },
			{
				name: 'right-start',
				displayName: 'Right Start',
				description: 'Position Right Start.',
			},
			{
				name: 'right-end',
				displayName: 'Right End',
				description: 'Position Right End.',
			},
		],
	},
	{
		name: 'showTip',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Popover tip',
		description: `Show Popover tip.`,
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			target: ['popoverContainer'],
		},
	},
	popoverContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'popoverContainerSize',
			displayName: 'Popover Container Size',
			description: 'Popover Container Size',
			prefix: 'popoverContainer',
			target: ['popoverContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'popoverContainerPadding',
			displayName: 'Popover Container Padding',
			description: 'Popover Container Padding',
			prefix: 'popoverContainer',
			target: ['popoverContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'popoverContainerMargin',
			displayName: 'Popover Container Margin',
			description: 'Popover Container Margin',
			prefix: 'popoverContainer',
			target: ['popoverContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'popoverContainerBorder',
			displayName: 'Popover Container Border',
			description: 'Popover Container Border',
			prefix: 'popoverContainer',
			target: ['popoverContainer'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };

/// on mouse leave
// ::before- 10px 10px rotate 45* zindex -1

// --fa-style-family-brands: "Font Awesome 6 Brands";
// --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
// --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";
// --fa-style-family-classic: "Font Awesome 6 Free";
// --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
// font-family: 'Open Sans', 'Microsoft Sans Serif', sans-serif;
// color: #000000;
// box-sizing: border-box;
// transition: width 1s, height 1s, padding-left 1s, padding-right 1s, padding-top 1s, padding-bottom 1s, color 1s, background-size 1s;
// left: 50%;
// position: absolute;
// transform: translateX(-50%);
// width: 16px;
// height: 16px;

//	  ::before
//     content: ' ';
//     width: 16px;
//     height: 16px;
//     background-color: black;
//     position: absolute;
//     top: 0;
//     left: 3px;
//     /* transform: rotate(45deg); */
//     clip-path: polygon(50% 0%, 100% 50%, 0% 50%);
//     display: block;

// 	=> for popover div
// 	border-radius: 5px;
//     /* background-color: rgb(188, 188, 188); */
//     width: 200px;
//     height: 300px;
//     margin-top: 8px;
//     margin-left: -2px;
//     border: 3px solid;
