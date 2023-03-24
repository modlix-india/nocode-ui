import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'layout',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Layout',
		description: 'Name of the layout',
		editor: ComponentPropertyEditor.LAYOUT,
		defaultValue: 'SINGLECOLUMNLAYOUT',
		enumValues: [
			{ name: 'ROWLAYOUT', displayName: 'Row Layout', description: 'Default row layout' },
			{
				name: 'SINGLECOLUMNLAYOUT',
				displayName: 'Column Layout',
				description: 'Single Column layout in all resolutions',
			},
			{
				name: 'TWOCOLUMNSLAYOUT',
				displayName: 'Two Columns Layout',
				description: 'Two Columns layout in all resolutions except mobile',
			},
			{
				name: 'THREECOLUMNSLAYOUT',
				displayName: 'Three Columns Layout',
				description:
					'Three Columns layout in all resolutions and two in tablet and one in mobile',
			},
			{
				name: 'FOURCOLUMNSLAYOUT',
				displayName: 'Four Columns Layout',
				description:
					'Four Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
			{
				name: 'FIVECOLUMNSLAYOUT',
				displayName: 'Five Columns Layout',
				description:
					'Five Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
		],
	},
	{
		name: 'containerType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Container Type (SEO)',
		description: 'container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DIV',
		enumValues: [
			{ name: 'DIV', displayName: 'DIV', description: 'Div tag' },
			{ name: 'ARTICLE', displayName: 'ARTICLE', description: 'Article tag' },
			{ name: 'SECTION', displayName: 'SECTION', description: 'Section tag' },
			{ name: 'ASIDE', displayName: 'ASIDE', description: 'Aside tag' },
			{ name: 'FOOTER', displayName: 'FOOTER', description: 'Footer tag' },
			{ name: 'HEADER', displayName: 'HEADER', description: 'Header tag' },
			{ name: 'MAIN', displayName: 'MAIN', description: 'Main tag' },
			{ name: 'NAV', displayName: 'NAV', description: 'Nav tag' },
		],
	},
	{
		name: 'background',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background',
		description: 'Background to be applied',
		editor: ComponentPropertyEditor.BACKGROUND,
		defaultValue: '',
		enumValues: [
			{ name: '', displayName: 'None', description: 'None' },
			{
				name: '_PRIMARYBG',
				displayName: 'Primary background',
				description: 'Primary background',
			},
			{
				name: '_SECONDARYBG',
				displayName: 'Secondary background',
				description: 'Secondary background',
			},
			{
				name: '_TERTIARYBG',
				displayName: 'Tertiary background',
				description: 'Tertiary background',
			},
			{
				name: '_QUATERNARYBG',
				displayName: 'Quaternary background',
				description: 'Quaternary background',
			},
			{
				name: '_QUINARYBG',
				displayName: 'Quinary background',
				description: 'Quinary background',
			},
			{
				name: '_SENARYBG',
				displayName: 'Senary background',
				description: 'Senary background',
			},
			{
				name: '_SEPTENARYBG',
				displayName: 'Septenary background',
				description: 'Septenary background',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
