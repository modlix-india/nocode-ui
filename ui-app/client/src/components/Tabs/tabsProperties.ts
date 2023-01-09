import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_ANY_COMP_PROP, SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'tabs',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'tabs',
		description: 'Tabs to be present on the component.',
		defaultValue: [],
	},
	{
		name: 'defaultActive',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'defaultActive',
		description: 'Active default tab',
	},
	{
		name: 'bindingPath',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'defaultActive',
		description: 'Active default tab',
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {};
export { propertiesDefinition, stylePropertiesDefinition };
