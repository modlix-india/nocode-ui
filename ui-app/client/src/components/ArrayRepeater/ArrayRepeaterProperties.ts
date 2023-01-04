import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showAdd',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Add button',
		description: 'When this option is set to true, User will be able to add items to repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'showDelete',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Delete button',
		description:
			'When this option is set to true, User will be able to delete items from repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'showMove',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Move buttons',
		description:
			'When this option is set to true, User will be able to move items up/down the index in the repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'isItemDraggable',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Draggable Items',
		description:
			'When this option is set to true, User will be able to drag items up the index in the repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
		notImplemented: true,
	},
	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
