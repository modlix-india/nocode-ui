import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_STRING_COMP_PROP } from '../../constants';

export default [
	{
		name: 'buttonLable',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Button label',
		description: `Button's display label.`,
		translatable: true,
	},
	{
		name: 'modalHeading',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Modal heading',
		description: `Modal's display heading.`,
		translatable: true,
	},
	{
		name: 'modalcontent',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'modalcontent',
		description: `modal's display content.`,
		translatable: true,
	},
];
