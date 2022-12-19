import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_DATA_LOCATION } from '../../constants';
import { ComponentPropertyGroup } from '../../types/common';

export default [
	{
		name: 'bindingPath',
		schema: Schema.ofRef(SCHEMA_REF_DATA_LOCATION),
		displayName: 'Binding Path',
		description: `Path in the store to which this Repeater is bound to. This path contains
			 the array the repeater uses to iterate on.`,
	},

	{
		name: 'showAdd',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show add button',
		description: 'When this option is set to true, User will be able to add items to repeater',
		notImplemented: true,
	},

	{
		name: 'showDelete',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show delete button',
		description:
			'When this option is set to true, User will be able to delete items from repeater',
		notImplemented: true,
	},

	{
		name: 'showMoveUp',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show move up button',
		description:
			'When this option is set to true, User will be able to move items up the index in the repeater',
		notImplemented: true,
	},

	{
		name: 'showMoveDown',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show move down button',
		description:
			'When this option is set to true, User will be able to move items down the index in the repeater',
		notImplemented: true,
	},

	{
		name: 'isItemDraggable',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Are items draggable ?',
		description:
			'When this option is set to true, User will be able to drag items up the index in the repeater',
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
