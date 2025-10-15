import { SCHEMA_NUM_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'url',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'URL',
		description: 'URL to listen to.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'eventName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Event Name',
		description: 'Event name to listen to.',
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
	},
	{
		name: 'onEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Event',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on sever sent event.',
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
