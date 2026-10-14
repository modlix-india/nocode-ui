import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES } from '../util/properties';

// Every draft host gets this agent without anyone placing it. Placing the
// component on a page is only for overriding these settings there; the app-wide
// ones live in the application's properties (draftAgent, draftAgentIcon,
// draftAgentHost) and win over the component's own icon.
const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'defaultMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Default layout',
		description:
			'How the AI first appears on the draft. The person can switch at any time and their choice is remembered.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'rail',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'rail', displayName: 'Side rail' },
			{ name: 'button', displayName: 'Floating button' },
			{ name: 'compact', displayName: 'Floating prompt' },
			{ name: 'right', displayName: 'Docked right' },
			{ name: 'left', displayName: 'Docked left' },
		],
	},
	{
		name: 'agent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Agent',
		description:
			"Which AI to talk to. Empty uses the app's draftAgent property, and AppBuilder when that is not set.",
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '', displayName: "App's setting" },
			{ name: 'appbuilder', displayName: 'AppBuilder' },
			{ name: 'leadzump', displayName: 'LeadZump' },
		],
	},
	{
		name: 'host',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sign-in host',
		description:
			"The production host builders sign in on, e.g. leadzump.ai. The environment is added for dev, stage and local. Empty uses the app's draftAgentHost property, then the agent's default.",
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Icon',
		description: "The button's icon. The app's draftAgentIcon property wins when set.",
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
		defaultValue: 'fa fa-solid fa-wand-magic-sparkles',
	},
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Placeholder',
		description: 'Hint in the floating prompt.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'Ask the AI to change this app...',
		translatable: true,
	},
	{
		name: 'showWhenSignedOut',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Offer to connect',
		description:
			'With no builder session found silently, show a dimmed button that signs in through a small window. Needed for builders on another site (SiteZump, LeadZump), whose sessions a draft page cannot see on its own.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [],
};

export { propertiesDefinition, stylePropertiesDefinition };
