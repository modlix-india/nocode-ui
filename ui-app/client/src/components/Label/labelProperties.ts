import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'text',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Label text',
		description: `Label's display text.`,
		translatable: true,
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
