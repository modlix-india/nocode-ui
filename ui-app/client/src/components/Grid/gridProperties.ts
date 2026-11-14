import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.linkPath,
	COMMON_COMPONENT_PROPERTIES.linkTargetType,
	COMMON_COMPONENT_PROPERTIES.layout,
	{
		name: 'keyboardClickable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Keyboard clickable',
		description:
			'With On Click: the grid acts as a button for the keyboard and screen readers. It takes Tab focus (with a visible focus ring), Enter or Space runs On Click, and it is announced as a button. Off by default.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'accessibleName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Accessible name',
		description:
			'The name screen readers announce for this grid (aria-label), for a grid whose own text does not say what it is, such as a tile or an icon. Empty: none.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'pressed',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Pressed',
		description:
			'For a keyboard clickable grid that is one choice of several (a tile, a toggle): true when it is the chosen one (aria-pressed). Empty: not a toggle.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dragData',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data',
	},
	{
		name: 'dragDataPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data Prefix',
	},
	{
		name: 'dragDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data Type',
		description: 'When prefix is used json is stringified and prefix is added to the string.',
		defaultValue: 'text/plain',
		enumValues: [
			{ name: 'text/plain', displayName: 'Text' },
			{ name: 'application/json', displayName: 'JSON' },
		],
	},
	{
		name: 'dropDataPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Prefix',
		description: 'Prefix to be removed from the dropped data and then parsed.',
	},
	{
		name: 'dropDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Type',
		defaultValue: 'text/plain',
		enumValues: [
			{ name: 'text/plain', displayName: 'Text' },
			{ name: 'application/json', displayName: 'JSON' },
		],
	},
	{
		name: 'onMouseEnter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Enter',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Enter.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMouseLeave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Leave',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Leave.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onEnteringViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Entering Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid enters view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onLeavingViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Leaving Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid leaves view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onDropData',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Drop Data',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when data is dropped.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'containerType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Container Type (SEO)',
		description: 'container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DIV',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'DIV', displayName: 'DIV', description: 'Div tag' },
			{ name: 'ARTICLE', displayName: 'ARTICLE', description: 'Article tag' },
			{ name: 'SECTION', displayName: 'SECTION', description: 'Section tag' },
			{ name: 'ASIDE', displayName: 'ASIDE', description: 'Aside tag' },
			{ name: 'FOOTER', displayName: 'FOOTER', description: 'Footer tag' },
			{ name: 'HEADER', displayName: 'HEADER', description: 'Header tag' },
			{ name: 'MAIN', displayName: 'MAIN', description: 'Main tag' },
			{ name: 'NAV', displayName: 'NAV', description: 'Nav tag' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.background,
	{
		name: 'borderRadius',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Border Type',
		description: 'Border Type',
		defaultValue: '_STRAIGHT',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_STRAIGHT', displayName: 'Straight', description: 'Straight' },
			{ name: '_SLIGHTROUND', displayName: 'Slight Round', description: 'Slight Round' },
			{ name: '_ROUND', displayName: 'Round', description: 'Round' },
			{ name: '_EXTRAROUND', displayName: 'Extra Round', description: 'Extra Round' },
			{ name: '_VERYROUND', displayName: 'Very Round', description: 'Very Round' },
			{ name: '_FULLROUND', displayName: 'Full Round', description: 'Full Round' },
		],
	},
	{
		name: 'border',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Border Size Type',
		description: 'Border Size Type',
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'None' },
			{ name: '_LIGHT', displayName: 'Light', description: 'Light' },
			{ name: '_MEDIUM', displayName: 'Medium', description: 'Medium' },
			{ name: '_HEAVY', displayName: 'Heavy', description: 'Heavy' },
			{ name: '_EXTREME', displayName: 'Extreme', description: 'Extreme' },
			{ name: '_ULTRA', displayName: 'Ultra', description: 'Ultra' },
			{ name: '_MAXIMUM', displayName: 'Maximum', description: 'Maximum' },
		],
	},
	{
		name: 'boxShadow',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'BoxShadow Type',
		description: 'BoxShadow Type',
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'None' },
			{
				name: '_DARKLOW',
				displayName: 'DarkLow',
				description: 'Light shadow for dark background',
			},
			{
				name: '_DARKMEDIUM',
				displayName: 'DarkMedium',
				description: 'Medium shadow for dark background',
			},
			{
				name: '_DARKHIGH',
				displayName: 'DarkHigh',
				description: 'High shadow for dark background',
			},
			{
				name: '_LIGHTLOW',
				displayName: 'LightLow',
				description: 'Light shadow for light background',
			},
			{
				name: '_LIGHTMEDIUM',
				displayName: 'LightMedium',
				description: 'Medium shadow for light background',
			},
			{
				name: '_LIGHTHIGH',
				displayName: 'LightHigh',
				description: 'High shadow for light shadow',
			},
		],
	},
	{
		name: 'padding',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Padding Type',
		description: 'Padding Type',
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'None' },
			{
				name: '_PADDINGONE',
				displayName: 'Padding Design One',
				description: 'Padding Design One',
			},
			{
				name: '_PADDINGTWO',
				displayName: 'Padding Design Two',
				description: 'Padding Design Two',
			},
			{
				name: '_PADDINGTHREE',
				displayName: 'Padding Design Three',
				description: 'Padding Design Three',
			},
			{
				name: '_PADDINGFOUR',
				displayName: 'Padding Design Four',
				description: 'Padding Design Four',
			},
			{
				name: '_PADDINGFIVE',
				displayName: 'Padding Design Five',
				description: 'Padding Design Five',
			},
			{
				name: '_PADDINGSIX',
				displayName: 'Padding Design Six',
				description: 'Padding Design Six',
			},
			{
				name: '_PADDINGSEVEN',
				displayName: 'Padding Design Seven',
				description: 'Padding Design Seven',
			},
		],
	},
	{
		name: 'stopPropagation',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Stop propagation of click event',
		description:
			'Stop propagation of click event which will not trigger the container click event.',
		defaultValue: false,
	},
	{
		name: 'preventDefault',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Prevent default of click event',
		description: 'Prevent default of click event.',
		defaultValue: false,
	},
	{
		name: 'linkForNewTabOnly',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Link only for a new tab',
		description:
			'With a Link Path and On Click: a plain click runs On Click and does not follow the link, while Cmd/Ctrl, Shift or middle click open the link in a new tab or window, as on any real link.',
		defaultValue: false,
	},
	{
		// Turns the grid into a user-resizable pane. Set it as an EXPRESSION to switch
		// resizing off in states where the size is not the user's to choose, e.g. a
		// collapsed rail: `Page.ui.sidekickCollapsed = true ? '_NONE' : '_LEFT'`.
		name: 'resizeHandle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Resize Handle',
		description:
			'Which edge carries a drag grip. The opposite edge stays put, so dragging that edge grows or shrinks the grid.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'Not resizable' },
			{
				name: '_LEFT',
				displayName: 'Left',
				description: 'Grip on the left edge, resizes width',
			},
			{
				name: '_RIGHT',
				displayName: 'Right',
				description: 'Grip on the right edge, resizes width',
			},
			{
				name: '_TOP',
				displayName: 'Top',
				description: 'Grip on the top edge, resizes height',
			},
			{
				name: '_BOTTOM',
				displayName: 'Bottom',
				description: 'Grip on the bottom edge, resizes height',
			},
		],
	},
	{
		name: 'resizeMin',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Resize Minimum (px)',
		description: 'Smallest size the grid can be dragged to.',
		defaultValue: 80,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'resizeMax',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Resize Maximum (px)',
		description: 'Largest size the grid can be dragged to.',
		defaultValue: 2000,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		// Only consulted when a resize handle is set: a grid with no handle has no
		// preference to remember, and Grid is common enough that fetching a
		// personalization document for every one of them would flood a page load.
		name: 'enablePersonalization',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Personalization for the dragged size',
		description: 'Remember the size this user dragged the grid to, per user, per grid.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dragToMove',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Move by dragging',
		description:
			"For a floating grid (position fixed): the person can drag it, with whatever is inside it, anywhere in the window with a mouse, a finger or a pen. A press that moves less than 5 px is a tap and reaches the grid's children as usual (a button inside still clicks); once a drag starts nothing inside the grid gets the drag's moves, release or click. The grid is kept inside the window. Off: the grid stays where its style puts it.",
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dragMemory',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Remember the dragged position',
		description:
			'With Move by dragging: where the spot the person dragged the grid to is kept. Personalization saves it for the signed in user on the server, so it follows them to other browsers and devices; signed out, or when it cannot be read, the grid starts where its style puts it.',
		defaultValue: '_NONE',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_NONE',
				displayName: 'Not remembered',
				description: 'Back to its style position on every load',
			},
			{
				name: '_PERSONALIZATION',
				displayName: 'Per user (personalization)',
				description: "Saved in the user's personalization, per page and grid",
			},
		],
	},
	{
		name: 'dragInset',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Drag margin (px)',
		description:
			'With Move by dragging: how close to the edges of the window the grid may be dragged. Use an expression to keep it clear of a bar, e.g. a phone bottom bar.',
		defaultValue: 4,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
