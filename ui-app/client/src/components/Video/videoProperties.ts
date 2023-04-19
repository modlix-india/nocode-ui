import { SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentStylePropertyDefinition } from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'source',
		description: 'source of the video.',
		translatable: true,
	},
	{
		name: 'width',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'width',
		description: 'width of the video.',
		translatable: true,
	},

	{
		name: 'height',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'height',
		description: 'height of the video.',
		translatable: true,
	},
	{
		name: 'poster',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'poster',
		description: 'poster of the video.',
		translatable: true,
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
