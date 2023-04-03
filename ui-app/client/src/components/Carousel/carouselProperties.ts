import { Schema } from '@fincity/kirun-js';
import { SCHEMA_NUM_COMP_PROP, SCHEMA_BOOL_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition } from '../../types/common';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showArrowButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Left and right Buttons',
		description: `Left and right arrow buttons to control carousel`,
		defaultValue: true,
	},
	{
		name: 'showDotsButtons',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Dot buttons in carousel',
		description: `Dot buttons that will show on bottom of the carousel.`,
		defaultValue: true,
	},
	{
		name: 'slideSpeed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Carousel slide speed',
		description: `Adjust the slide speed by giving the time in milliseconds.`,
		defaultValue: 2000,
	},
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
