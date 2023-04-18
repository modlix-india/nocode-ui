import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
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
		name: 'editorType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Editor Type',
		description: 'Editor Type UI or Backend',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'backend',
		enumValues: [
			{ name: 'backend', displayName: 'Backend', description: 'Backend only' },
			{ name: 'ui', displayName: 'UI', description: 'UI only' },
		],
	},
	{
		name: 'onChangePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Change',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on personalization changed.',
	},

	{
		name: 'onDeletePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Delete',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on personalization cleared.',
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {},
};

export { propertiesDefinition, stylePropertiesDefinition };
