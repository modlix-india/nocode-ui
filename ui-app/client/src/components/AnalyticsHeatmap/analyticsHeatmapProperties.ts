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
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'App Code',
		description: 'Application whose clicks are drawn. Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'URL Client Code',
		description: 'URL client code (tenant). Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'siteUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Site URL',
		description:
			'Where the page is served from, e.g. https://example.com. The path is appended to ' +
			'it. The site must allow this page to frame it — set csp.frameAncestors on the ' +
			'application being measured, or the browser refuses and shows nothing.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'path',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Path',
		description: 'The page to draw, e.g. /pricing. Leave blank to use the busiest page.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'variant',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Experiment Variant',
		description:
			'Draw only one arm of a running experiment. Blank draws every arm together, which ' +
			'is what you want when nothing is being tested and misleading when something is.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'dateRangeDays',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Date Range (days)',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 30,
	},
	{
		name: 'dateFrom',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'From',
		description: 'Start of an explicit range. Set both From and To to override the day count.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'dateTo',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'To',
		description: 'End of an explicit range. Ignored unless From is set too.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'viewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Width',
		description:
			'Which layout to draw. Clicks are only comparable within a band of similar widths, ' +
			'because a band is a layout — a phone and a desktop are two different pages.',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '1440',
		enumValues: [
			{ name: '390', displayName: 'Phone (390px)' },
			{ name: '820', displayName: 'Tablet (820px)' },
			{ name: '1440', displayName: 'Desktop (1440px)' },
		],
	},
	{
		name: 'frameHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Page Height',
		description:
			'How tall to render the page, in pixels. The frame is made this tall rather than ' +
			'scrolled, because a cross-origin frame will not tell us where it has been ' +
			'scrolled to — and an overlay that cannot follow the scroll draws clicks in the ' +
			'wrong place. Raise it if the bottom of the page is cut off.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 2400,
	},
	{
		name: 'showOverlay',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Overlay',
		description:
			'Initial state of the overlay switch. Turning it off leaves the live page in the ' +
			'frame, which is how you sign in or open a menu to see the state the clicks ' +
			'happened in.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'refreshIntervalSeconds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Refresh Interval (seconds)',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	toolbar: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	stage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
