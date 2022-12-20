import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showClose',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Close Button',
		description: `Show Close button on Modal.`,
		translatable: false,
	},
	{
		name: 'closeOnEscape',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Close Modal on ESC',
		description: `Close Modal when escape key is pressed.`,
		translatable: false,
	},
	{
		name: 'closeOnOutsideClick',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Close Modal on clicking outside the modal',
		description: `Close Modal when clicked outside the modal.`,
		translatable: false,
	},
	{
		name: 'eventOnOpen',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'event to be run on Modal Open',
		description: `Event that is triggered when Modal is open.`,
	},
	{
		name: 'eventOnClose',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'event to be run on Modal close',
		description: `Event that is triggered when Modal is closed.`,
	},
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
