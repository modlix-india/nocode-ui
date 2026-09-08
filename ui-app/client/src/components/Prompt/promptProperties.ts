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
	{
		name: 'agentEndpoint',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Agent Endpoint',
		description: 'SSE endpoint URL for the AI agent.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Placeholder',
		description: 'Placeholder text for the input field.',
		defaultValue: 'Ask the AI to build something...',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'welcomeMessage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Welcome Message',
		description: 'Heading shown when chat is empty.',
		defaultValue: 'What can I help with?',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		// A fixed opening question. To hand one over from another page use the
		// Pending Prompt binding instead: that one is cleared as it is sent, where
		// this one stays put and would fire again on every fresh load. Sent once,
		// and only into an empty chat, so reopening a session never replays it.
		name: 'initialPrompt',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Initial Prompt',
		description:
			'A fixed question to send automatically when the chat opens empty. To carry a question in from another page, use the Pending Prompt binding, which is taken and cleared instead of resent on every load.',
		group: ComponentPropertyGroup.BASIC,
		translatable: false,
	},
	// ── Editor context ──────────────────────────────────────────────────────
	// What the surrounding page has open. Sent with every message as
	// `editor_context`, so the agent can answer about the thing in front of the
	// user without spending a tool round-trip discovering it first. Plain
	// properties rather than one bound object, so what gets sent is visible by
	// name in the property editor. Set them as EXPRESSIONs.
	{
		// Without this the agent has to guess what kind of thing the names in
		// activeObject are. An org section called "Invites" reads exactly like a
		// page called "Invites", and the agent goes hunting with the page tools.
		name: 'contextSurface',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Context Surface',
		description:
			'What kind of screen this chat is embedded in, e.g. "the organization admin console". Tells the agent how to read the other context fields.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'targetAppCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Target App Code',
		description:
			'The app the user is working on, when it differs from the app hosting this chat. Scopes both the conversation and the session history to that app.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'activeObject',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active Object',
		description:
			'What the user is looking at right now, e.g. "storage:Lead". Told to the agent as the current focus.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'openTabs',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Open Tabs',
		description: 'Everything else the user has open, as a comma separated list.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'openTabIds',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Open Tab Ids',
		description:
			'Ids of the open objects, comma separated, so the agent can read them directly instead of searching by name.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// A PATH rather than the value, for two reasons. The expression engine
		// cannot resolve a dynamic root (`Page[Page.sk.ns]` comes back as the
		// literal string), and reading the path fresh on each send means the agent
		// gets the rows as they are now, not as they were when the tab was opened.
		// Point it at whatever the open tab keeps, warts and all: the payload is
		// serialised within a fixed budget, credential-looking values are redacted,
		// and the bulkiest entries are dropped first (dropdown option lists are
		// routinely bigger than the rows themselves).
		name: 'activeDataPath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active Tab Data Path',
		description:
			'Store path holding what the open tab is showing, e.g. "Page.pnInvites". Read fresh on every message and sent as JSON: capped, with anything named like a credential redacted.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// Objects the surrounding surface has open and unsaved. For exactly these,
		// the agent reads the user's copy and holds its writes there instead of
		// saving, so the change can be looked at before it is committed. Everything
		// else the agent touches is saved as it always was.
		//
		// A path rather than the descriptors themselves, for the same reason as
		// activeDataPath: read fresh on every message, so the agent gets the drafts
		// as they are now and not as they were when the chat mounted.
		//
		// Point it at a store path holding an array of {kind, path}, where `path`
		// names where that object's document lives. Everything else (id, name,
		// appCode) is read off the document, so there is nothing to keep in step.
		// Leave it unset and nothing is held, which is right for a chat that is not
		// embedded in an editor.
		name: 'openDraftsPath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Open Drafts Path',
		description:
			'Store path holding [{kind, path}] for the objects this surface has open and unsaved. The agent edits those in place instead of saving them. Declare only what this screen can show the user for review.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// Send the agent's definition edits to the app's DRAFT surface rather than
		// live, so the user gets a reviewable copy AND the agent can screenshot its
		// own work. That second half is why this exists: a change held in the
		// browser is invisible to a screenshot, which renders the live app out of
		// the database, so the agent looks at its own edit and sees nothing.
		//
		// Safe to leave on: the agent probes the deployment and keeps writing live
		// when there is no draft surface, rather than claiming a review step that
		// does not exist.
		name: 'draftMode',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Edit On The Draft Surface',
		description:
			"Send the agent's edits to the app's draft surface instead of live, so they can be reviewed and published deliberately.",
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// Turn ON for a chat with no editor around it. A surface with editor tabs
		// already carries the Draft link, the per-object Publish and the pending
		// panel, so a second set here is noise; a bare chat page has none of them,
		// and without this it can tell somebody a change is "waiting for Publish"
		// while offering nowhere to publish it from.
		name: 'showDraftReview',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Draft Review Bar',
		description:
			'Show what the agent has left unpublished, with links to open the draft or the workspace, and buttons to publish or discard. For chat surfaces with no editor of their own.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'quickActionLayout',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Quick Action Layout',
		description: 'Layout style for quick action buttons.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_list',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_list', displayName: 'List', description: 'Vertical bordered list' },
			{ name: '_pills', displayName: 'Pills', description: 'Horizontal pill buttons' },
			{ name: '_grid', displayName: 'Grid', description: '2-column card grid' },
		],
	},
	{
		name: 'quickActionLabels',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Quick Action Labels',
		description: 'Display text for each quick action button.',
		multiValued: true,
		defaultValue: [],
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'quickActionPrompts',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Quick Action Prompts',
		description: 'Message sent on click. Leave empty for "Coming Soon".',
		multiValued: true,
		defaultValue: [],
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'quickActionIcons',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Quick Action Icons',
		description: 'Icon for each quick action.',
		multiValued: true,
		defaultValue: [],
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showSessions',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Sessions',
		description: 'Show the session history sidebar.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		// The sidebar is a 260px column, which is most of the room in a docked side
		// panel. Auto measures the component (not the viewport) and floats the list
		// over the chat once there is no room to sit beside it.
		name: 'sessionsMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sessions Layout',
		description: 'Whether the session history sits beside the chat or floats over it.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_auto',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_auto',
				displayName: 'Auto',
				description: 'Beside the chat when there is room, over it when there is not',
			},
			{ name: '_sidebar', displayName: 'Sidebar', description: 'Always beside the chat' },
			{ name: '_overlay', displayName: 'Overlay', description: 'Always over the chat' },
		],
	},
	{
		name: 'newChatLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'New Chat Label',
		description: 'Label for the new chat button.',
		defaultValue: 'New chat',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'yourChatsLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Your Chats Label',
		description: 'Label for the session group heading.',
		defaultValue: 'Your chats',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'deleteConfirmMessage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Delete Confirm Message',
		description: 'Confirmation message shown when deleting a chat.',
		defaultValue: 'Delete this chat? This action cannot be undone.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'enableFeedback',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Feedback',
		description: 'Show thumbs up/down buttons on assistant messages for learning feedback.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'enableVoiceInput',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Voice Input',
		description: 'Show microphone button for speech-to-text input.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showModelSelector',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Model Selector',
		description: 'Show a dropdown to select the LLM model.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'selectedProviders',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selected Providers',
		description: 'Providers to show in model selector. If empty, all providers are shown.',
		multiValued: true,
		defaultValue: [],
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showToolCalls',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Tool Calls',
		description: 'Show tool call cards in the chat (default true).',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'enablePersonalization',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Personalization',
		description: 'Remember sidebar width per user via personalization service.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sidebarToggleIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Sidebar Toggle Icon',
		description: 'Icon class for sidebar toggle button.',
		defaultValue: 'fa fa-bars',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'scrollToBottomIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Scroll To Bottom Icon',
		description: 'Icon class for the scroll to bottom button.',
		defaultValue: 'fa fa-arrow-down',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'newChatTopIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'New Chat Top Icon',
		description: 'Icon class for the new chat button in top bar.',
		defaultValue: 'fa fa-pen-to-square',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'newChatSidebarIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'New Chat Sidebar Icon',
		description: 'Icon class for the new chat button in sidebar.',
		defaultValue: 'fa fa-plus',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sendIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Send Icon',
		description: 'Icon class for the send button.',
		defaultValue: 'fa fa-arrow-up',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'stopIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Stop Icon',
		description: 'Icon class for the stop button.',
		defaultValue: 'fa fa-stop',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'addAttachmentIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Add Attachment Icon',
		description: 'Icon class for the add attachment button.',
		defaultValue: 'fa fa-plus',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'removeAttachmentIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Remove Attachment Icon',
		description: 'Icon class for removing attachments.',
		defaultValue: 'fa fa-xmark',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'fileIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'File Icon',
		description: 'Icon class for file attachments.',
		defaultValue: 'fa fa-file',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'copyIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Copy Icon',
		description: 'Icon class for the copy button.',
		defaultValue: 'fa fa-clone',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'copySuccessIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Copy Success Icon',
		description: 'Icon class shown after successful copy.',
		defaultValue: 'fa fa-check',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'renameIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Rename Icon',
		description: 'Icon class for the rename session button.',
		defaultValue: 'fa fa-pen',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'deleteIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Delete Icon',
		description: 'Icon class for the delete session button.',
		defaultValue: 'fa fa-trash',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'toolRunningIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tool Running Icon',
		description: 'Icon class for running tool calls.',
		defaultValue: 'fa fa-circle-notch fa-spin',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'toolSuccessIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tool Success Icon',
		description: 'Icon class for successful tool calls.',
		defaultValue: 'fa fa-check',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'toolErrorIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tool Error Icon',
		description: 'Icon class for failed tool calls.',
		defaultValue: 'fa fa-xmark',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'expandIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Expand Icon',
		description: 'Icon class for expand/chevron down.',
		defaultValue: 'fa fa-chevron-down',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'collapseIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Collapse Icon',
		description: 'Icon class for collapse/chevron up.',
		defaultValue: 'fa fa-chevron-up',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'microphoneIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Microphone Icon',
		description: 'Icon class for the microphone button.',
		defaultValue: 'fa fa-microphone',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'microphoneActiveIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Microphone Active Icon',
		description: 'Icon shown while recording voice.',
		defaultValue: 'fa fa-stop',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'thumbsUpIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Thumbs Up Icon',
		description: 'Icon class for the thumbs up feedback button.',
		defaultValue: 'fa fa-thumbs-up',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'thumbsDownIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Thumbs Down Icon',
		description: 'Icon class for the thumbs down feedback button.',
		defaultValue: 'fa fa-thumbs-down',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sessionsPerPage',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Sessions Per Page',
		description: 'Number of sessions to load per page.',
		defaultValue: 20,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'messagesPerPage',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Messages Per Page',
		description: 'Number of message turns to load per page.',
		defaultValue: 20,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'onMessage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Message',
		description: 'Event fired when assistant message received.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		description: 'Event fired on error.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onComplete',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Complete',
		description: 'Event fired when a completion signal is received.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		// Writes the agent really committed, as opposed to the ones it held back
		// for review because `openDraftsPath` declared the object open. A surface
		// that shows an object it did not declare has to refetch it or it is
		// looking at a definition that no longer matches what is stored.
		//
		// The entry lands on the Changed Objects binding BEFORE this fires, and it
		// appends rather than replaces, because one turn can write a dozen objects
		// and a handler that only ever sees the last one silently loses the rest.
		// Drain the list in the handler.
		name: 'onObjectSaved',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Object Saved',
		description:
			'Event fired when the agent saves an object for real. The object lands on the Changed Objects binding as {kind, id, name, appCode, operation, draft}; the handler should drain that list.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	COMMON_COMPONENT_PROPERTIES.shortcutKey,
	COMMON_COMPONENT_PROPERTIES.shortcutAction,
	COMMON_COMPONENT_PROPERTIES.onShortcut,
	COMMON_COMPONENT_PROPERTIES.shortcutScope,
	COMMON_COMPONENT_PROPERTIES.shortcutPriority,
	COMMON_COMPONENT_PROPERTIES.shortcutGroup,
	COMMON_COMPONENT_PROPERTIES.allowInInput,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
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
	messagesContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	userMessage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	assistantMessage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thinkingBlock: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	inputBar: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	inputTextArea: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sendButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	shortcutHint: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sessionSidebar: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sidebarHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	newChatButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sessionItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	quickActions: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	craftPanel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	craftPanelHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	craftCard: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	craftBadge: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	craftContent: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
