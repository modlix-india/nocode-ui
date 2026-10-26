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
		defaultValue: 'button',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'button', displayName: 'Floating button' },
			{ name: 'compact', displayName: 'Floating prompt' },
			{ name: 'right', displayName: 'Docked right' },
			{ name: 'left', displayName: 'Docked left' },
		],
	},
	{
		name: 'runIn',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Run in',
		description:
			"Draft run: only on the app's draft host, signed in as the builder (AppBuilder, SiteZump, LeadZump or CXZump's cxzump.ai), never as the app's user. An app's own agent (LeadZump, CXZump) gets a token of the draft app itself. Live run: only on the live app, signed in as whoever is using it, talking to the agent named below. Each is hidden on the other surface.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'draft',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'draft', displayName: 'Draft run' },
			{ name: 'live', displayName: 'Live run' },
		],
	},
	{
		name: 'agent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Agent',
		description:
			"The agent's name. Live run: called at /api/ai/<name>/chat with this app's own sign-in, e.g. leadzump, appbuilder, adzump2; the agent must admit this app. Draft run: appbuilder, leadzump or cxzump; empty uses the app's draftAgent setting, then appbuilder.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'draftMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Where AI edits land',
		description:
			'DRAFT (default): every definition edit is a draft to review and publish. PAGE_ONLY_DRAFT: pages, styles and themes drafted, the rest live. LIVE: straight to production.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'DRAFT',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'DRAFT', displayName: 'Drafts' },
			{ name: 'PAGE_ONLY_DRAFT', displayName: 'Pages as drafts, rest live' },
			{ name: 'LIVE', displayName: 'Live' },
		],
	},
	{
		name: 'host',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sign-in host',
		description:
			"Draft run only. The host builders sign in on. Put <env.> where the environment goes, e.g. <env.>leadzump.ai (dev.leadzump.ai on dev, leadzump.ai on production) or leadzump.<env.>modlix.com. Without <env.>, the environment is added before the domain. Empty uses the app's draftAgentHost property, then the agent's default.",
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
			'Draft run only. With no builder session found silently, show a dimmed button that signs in through a small window. Needed for builders on another site (SiteZump, LeadZump), whose sessions a draft page cannot see on its own.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [],
};

export { propertiesDefinition, stylePropertiesDefinition };
