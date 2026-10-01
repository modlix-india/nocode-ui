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

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'connectionName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Connection Name',
		description:
			"The calling connection to use, as named in the application connections. The provider is read from that connection, so it never has to be set here. Leave it empty to use the signed-in agent's own connection, so one page serves agents on different providers; an agent set up on more than one connection then needs it set. When it is bound to an expression, the phone waits for that expression to name a connection rather than starting on the agent's own in the meantime - so a binding that stays empty never starts the phone; to use the agent's own connection, leave this blank. A binding that later goes empty leaves a running phone on the connection it last named; it changes only when the binding names another.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoRegister',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Register Automatically',
		description:
			'Start taking calls as soon as the page loads. Turn off to have the agent go online explicitly.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'sdkUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Calling Library URL',
		description:
			"Where to load the calling provider's browser library from, for example api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js. Used when the calling connection names no library of its own; a connection that does wins, so each agent loads their own provider's. One of the two is required: there is no built-in default, because a built-in path would have to be true of every deployment. A configured CDN is applied automatically, the same way it is for an image. Changing it takes effect on the next page load.",
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onIncomingCall',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Incoming Call',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs when the phone starts ringing. Read the caller from Store.softphone.from - it is written before this runs.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onCallConnected',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Call Connected',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Runs when the call is answered and audio starts.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onCallEnded',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Call Ended',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs when the call finishes. The recording is not available here - it reaches the server minutes later, and is read from the deal call log.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onRegistrationChange',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Registration Change',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs when the phone comes online or goes offline. Read Store.softphone.registered.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs when the phone fails. Read Store.softphone.lastError.code to tell a blocked microphone from a broken integration.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'left',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Left',
		description: 'Left position of the design-mode marker',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
	{
		name: 'top',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Top',
		description: 'Top position of the design-mode marker',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [],
};

export { propertiesDefinition, stylePropertiesDefinition };
