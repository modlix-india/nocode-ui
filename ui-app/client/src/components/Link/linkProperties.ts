import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import { ComponentPropertyEditor, ComponentPropertyGroup } from '../../types/component';

export default [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link label',
		description: `Link's display label.`,
		translatable: true,
	},

	{
		name: 'linkPath',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link path',
		description: `Path that page needs to be redirected on click.`,
		translatable: false,
	},

	{
		name: 'showButton',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Link Button',
		description: 'Button beside the link to redirect.',
	},

	{
		name: 'target',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link target',
		description: `Link's target.`,
	},

	{
		name: 'externalButtonTarget',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link Button target',
		description: `Link Button's target.`,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];
