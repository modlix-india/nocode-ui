import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

/**
 * The document, catalog, run, check report and selection are BINDING PATHS
 * (see AutomationFlow.tsx), not properties: each is read from the page store
 * and the document and selection are also written back.
 */
const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'mode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mode',
		description:
			'View draws the cards. Edit adds a "+" on every gap, move and remove on each card, and the side panel. Run shows each card\'s state from the bound run.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'view',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'view', displayName: 'View', description: 'Read only cards.' },
			{ name: 'edit', displayName: 'Edit', description: 'Add, move, remove and edit steps.' },
			{ name: 'run', displayName: 'Run', description: 'Cards show what a run did.' },
		],
	},
	{
		name: 'showEditor',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Editor Panel',
		description:
			'In edit mode, open the built-in side panel for the selected card. Turn off when the page has its own editor for the selection.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'compact',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Compact',
		description: 'Smaller type and spacing, for narrow places such as a preview or a card.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Options App Code',
		description:
			"The app whose functions answer the pickers' options. Empty uses the document's appCode.",
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'emptyMessage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Message',
		description: 'Shown when there is no document yet.',
		defaultValue: 'Nothing to show yet.',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'onCardClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Card Click',
		description:
			'A card was clicked. Its node key (or "__trigger" for the WHEN card) is written to the Selected Node binding first, so the event reads it from there.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onChange',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Change',
		description:
			'An edit landed: the bound document has already been rewritten when this runs. Save it from here.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
];

const { layout, spacing, typography, border, size, background, effects } =
	COMPONENT_STYLE_GROUP_PROPERTIES;

/**
 * Style slots. Names match the `<SubHelperComponent subComponentName>` calls
 * and SubComponentDefinitions['AutomationFlow'], and none is a suffix of another.
 */
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		layout.type,
		spacing.type,
		typography.type,
		border.type,
		size.type,
		background.type,
		effects.type,
	],
	flow: [layout.type, spacing.type, size.type, background.type],
	card: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	lanes: [layout.type, spacing.type, size.type],
	laneLabel: [typography.type, spacing.type],
	addMenu: [layout.type, spacing.type, size.type, border.type, background.type, effects.type],
	panel: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
