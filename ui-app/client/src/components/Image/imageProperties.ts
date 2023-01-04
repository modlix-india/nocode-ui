import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentStylePropertyDefinition } from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'source',
		description: 'source of the image',
	},
	{
		name: 'alt',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'alternate text',
		description: 'alternate text if image is not loading',
	},

	{
		name: 'width',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'width',
		description: 'width of the image ',
	},
	{
		name: 'height',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'height',
		description: 'height of the image',
	},
	{
		name: 'onClickEvent',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'onClickEvent',
		description: 'onClick of the image we can run an event',
	},
	{
		name: 'zoom',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'zoom toggle',
		description: 'zoomed image will be shown if the value is true',
	},
	{
		name: 'zoomedImg',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'ZoomedImg',
		description: 'Zoomed image that will be loading on hover of the image',
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
