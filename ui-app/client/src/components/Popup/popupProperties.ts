import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showClose',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Close Button',
		description: 'Show Close button on Modal.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
		translatable: false,
	},
	{
		name: 'closeButtonPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Show Close on desired side',
		description: 'Show Close on desired side either left or right.',
		defaultValue: 'RIGHT',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'LEFT', displayName: 'Left', description: 'Show close on left' },
			{ name: 'RIGHT', displayName: 'Right', description: 'Show close on right' },
		],
	},
	{
		name: 'closeOnEscape',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Modal on ESC',
		description: 'Close Modal when escape key is pressed.',
		group: ComponentPropertyGroup.BASIC,
		translatable: false,
		defaultValue: true,
	},
	{
		name: 'closeOnOutsideClick',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Modal on clicking outside the modal',
		description: 'Closes Modal when clicked outside the modal.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'eventOnOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'event to be run on Modal Open',
		description: 'Event that is triggered when Modal is open.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'eventOnClose',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'event to be run on Modal close',
		description: `Event that is triggered when Modal is closed.`,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'modelTitle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Title of the modal',
		description: 'Title of the modal that is displayed on top.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'popupDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Popup Design',
		description: 'Popup design selection',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '_design1',
		enumValues: [
			{
				name: '_design1',
				displayName: 'Design 1',
				description: 'Padding with close button in title grid',
			},
			{
				name: '_design2',
				displayName: 'Design 2',
				description: 'No padding with close button as absolute top-right',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.showInDesign,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	modal: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	titleGrid: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	closeButton: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	modalTitle: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	closeButtonContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
