import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
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
		name: 'penColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pen colour',
		description:
			'Ink colour, as a CSS colour such as #111827. It is drawn into the saved image, so ' +
			'keep it dark enough to read on paper whatever the page theme is.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '#111827',
	},
	{
		name: 'penWidth',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pen width',
		description: 'Line width in CSS pixels.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 2.5,
		min: 1,
		max: 8,
		step: 0.5,
	},
	{
		name: 'padHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pad height',
		description: 'Height of the drawing area in CSS pixels. The width follows the container.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 180,
	},
	{
		name: 'padBackground',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pad background',
		description:
			'Background of the drawing area on screen. Empty: the theme style. The saved image ' +
			'is always transparent.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Hint',
		description: 'Shown above the signature line while nothing is drawn.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'Sign here',
		translatable: true,
	},
	{
		name: 'clearLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Clear button label',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'Clear',
		translatable: true,
	},
	{
		name: 'showUndo',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show undo',
		description: 'Show a button that removes the last stroke.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'undoLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Undo button label',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'Undo',
		translatable: true,
	},
	{
		name: 'trimImage',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Trim image',
		description:
			'Crop the saved PNG to the drawn ink (with a small margin). Off: the image is the ' +
			'whole pad area.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.onChange,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	pad: [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	hint: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
	],
	button: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
