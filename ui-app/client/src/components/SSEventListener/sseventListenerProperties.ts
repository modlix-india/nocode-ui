import { SCHEMA_NUM_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'url',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'URL',
		description:
			"URL of the server sent event stream, for example /api/notification/subscribe?appCode=<app>. The stream opens when URL and On Event are set; it sends the signed in user's token and reconnects on its own.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'eventName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Event Name',
		description:
			"Event names to deliver, for example a data notification's event name. Leave empty to deliver every event except the connect event init. Keepalives are never delivered.",
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
	},
	{
		name: 'onEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Event',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs once per event, in arrival order; a run finishes before the next starts. Arguments: eventName (the event type), data (parsed JSON when the data is JSON, else the text), id (the event id) and receivedAt (epoch milliseconds). When Events Binding is set, the raw data text is also appended to that array first.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'left',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Left',
		description: 'Left position of the timer',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
	{
		name: 'top',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Top',
		description: 'Top position of the timer',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [],
};

export { propertiesDefinition, stylePropertiesDefinition };
