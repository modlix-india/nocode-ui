import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showAdd',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Add button',
		description: 'When this option is set to true, User will be able to add items to repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'showDelete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Delete button',
		description:
			'When this option is set to true, User will be able to delete items from repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'showMove',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Move buttons',
		description:
			'When this option is set to true, User will be able to move items up/down the index in the repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'isItemDraggable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Draggable Items',
		description:
			'When this option is set to true, User will be able to drag items up the index in the repeater',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'layout',
		schema: SCHEMA_STRING_COMP_PROP,
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
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
		notImplemented: true,
	},
	{
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
