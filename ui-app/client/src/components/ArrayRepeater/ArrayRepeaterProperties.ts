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
		name: 'layout',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Layout',
		description: 'Name of the layout',
		editor: ComponentPropertyEditor.LAYOUT,
		defaultValue: 'SINGLECOLUMNLAYOUT',
		enumValues: [
			{ name: 'ROWLAYOUT', displayName: 'Row Layout', description: 'Default row layout' },
			{
				name: 'SINGLECOLUMNLAYOUT',
				displayName: 'Column Layout',
				description: 'Single Column layout in all resolutions',
			},
			{
				name: 'TWOCOLUMNSLAYOUT',
				displayName: 'Two Columns Layout',
				description: 'Two Columns layout in all resolutions except mobile',
			},
			{
				name: 'THREECOLUMNSLAYOUT',
				displayName: 'Three Columns Layout',
				description:
					'Three Columns layout in all resolutions and two in tablet and one in mobile',
			},
			{
				name: 'FOURCOLUMNSLAYOUT',
				displayName: 'Four Columns Layout',
				description:
					'Four Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
			{
				name: 'FIVECOLUMNSLAYOUT',
				displayName: 'Five Columns Layout',
				description:
					'Five Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
		],
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
