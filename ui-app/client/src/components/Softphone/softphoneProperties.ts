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
			'The calling connection to use, as named in the application connections. The provider is read from that connection, so it never has to be set here.',
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
		name: 'audioRingtoneUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Ringtone URL',
		description:
			'Sound to play on an incoming call. Plays only in the tab holding the call, so several open tabs do not ring at once.',
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
