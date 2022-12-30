import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'CheckBox label',
		description: `CheckBox's display label.`,
		translatable: true,
	},

	{
		name: 'orientation',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'CheckBox orientation',
		description: `CheckBox's display orientation.`,
		defaultValue: 'HORIZONATAL',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'HORIZONATAL',
				displayName: 'Horizonatal Orientation',
				description: "CheckBox's display orientation.",
			},
			{
				name: 'VERTICAL',
				displayName: 'Vertical Orientation',
				description: "CheckBox's display orientation.",
			},
		],
	},

	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'CheckBox will be rendered un editable when this property is true.',
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

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
