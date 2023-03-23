import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'src',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'source',
		description: 'source of the iframe',
	},
	{
		name: 'width',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'width',
		description: 'width of the iframe',
	},
	{
		name: 'height',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'height',
		description: 'height of the iframe',
	},
	{
		name: 'name',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'name',
		description: 'name of the iframe',
	},
	{
		name: 'srcdoc',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'srcdoc',
		description: 'srcdoc of the iframe',
	},
	{
		name: 'sandbox',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'sandbox',
		description: 'sandbox of the iframe',
	},
	{
		name: 'referrerpolicy',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'referrerpolicy',
		description: 'referrerpolicy of the iframe',
	},
	{
		name: 'loading',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'loading',
		description: 'loading of the iframe',
	},
	{
		name: 'loading',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'loading',
		description: 'loading of the iframe',
	},
	{
		name: 'csp',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'loacspding',
		description: 'csp of the iframe',
	},
	{
		name: 'allowfullscreen',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'allowfullscreen',
		description: 'allowfullscreen of the iframe',
	},
	{
		name: 'allow',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'allow',
		description: 'allow of the iframe',
	},
];
const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
