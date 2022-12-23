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
		defaultValue: true,
		translatable: false,
	},
	{
		name: 'closeButtonPosition',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Show Close on desired side',
		description: `Show Close on desired side either left or right.`,
		defaultValue: 'RIGHT',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'LEFT', displayName: 'Left', description: 'Show close on left' },
			{ name: 'RIGHT', displayName: 'Right', description: 'Show close on right' },
		],
	},
	{
		name: 'closeOnEscape',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Close Modal on ESC',
		description: `Close Modal when escape key is pressed.`,
		translatable: false,
		defaultValue: true,
	},
	{
		name: 'closeOnOutsideClick',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Close Modal on clicking outside the modal',
		description: `Close Modal when clicked outside the modal.`,
		translatable: false,
		defaultValue: true,
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
	{
		name: 'modelTitle',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Title of the modal',
		description: 'Title of the modal',
	},
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
