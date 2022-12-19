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

const properties: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Button label',
		description: `Button's display label.`,
		translatable: true,
	},

	{
		name: 'type',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Button label',
		description: `Button's display label.`,
		defaultValue: 'default',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'default', displayName: 'Default Button', description: 'Default Button type' },
			{ name: 'outlined', displayName: 'Outline Button', description: 'Outline Button type' },
			{ name: 'text', displayName: 'Outline Button', description: 'Outline Button type' },
			{ name: 'fabButton', displayName: 'Fab Button', description: 'Fab Button type' },
			{
				name: 'fabButtonMini',
				displayName: 'Fab Button Mini',
				description: 'Mini Fab Button type',
			},
		],
	},

	{
		name: 'onClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Button event on click',
		description: `Button's event to trigger on click.`,
	},

	{
		name: 'leftIcon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Button's left icon",
		description: `Button's icon to be displayed on left of label.`,
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'rightIcon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Button's right icon",
		description: `Button's icon to be displayed on right of label.`,
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

export default properties;
