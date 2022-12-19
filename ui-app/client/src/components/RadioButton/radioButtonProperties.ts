import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import { ComponentPropertyEditor, ComponentPropertyGroup } from '../../types/common';

export default [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'CheckBox label',
		description: `CheckBox's display label.`,
		translatable: true,
	},

	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'CheckBox will be rendered un editable when this property is true.',
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
