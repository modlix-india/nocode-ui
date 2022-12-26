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

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'dataBinding',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'Menu data',
		description: `Data that is used to render menu.`,
	},
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu label',
		description: `Menu's display label.`,
		translatable: true,
	},
	{
		name: 'onClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu click event',
		description: `Menu's event to trigger on click.`,
	},
	{
		name: 'icon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Menu's icon",
		description: `Menu's icon to be displayed on left of label.`,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'isMenuOpen',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Menu open or not",
		description: `Menu open or not after click event.`,
	},
	{
		name: 'linkPath',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link path',
		description: `Path that page needs to be redirected on click.`,
		translatable: false,
	},
	{
		name: 'target',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link target',
		description: `Link's target.`,
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

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
