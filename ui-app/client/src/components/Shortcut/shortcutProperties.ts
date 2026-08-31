import { SCHEMA_BOOL_COMP_PROP, SCHEMA_NUM_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{ ...COMMON_COMPONENT_PROPERTIES.shortcutKey, group: ComponentPropertyGroup.BASIC },
	COMMON_COMPONENT_PROPERTIES.onShortcut,
	{
		...COMMON_COMPONENT_PROPERTIES.label,
		description:
			'What this shortcut does. Shown in the cheat sheet and in the chooser when two shortcuts collide.',
	},
	{ ...COMMON_COMPONENT_PROPERTIES.shortcutGroup, group: ComponentPropertyGroup.BASIC },
	{
		...COMMON_COMPONENT_PROPERTIES.shortcutScope,
		description:
			'Where the shortcut is active. Put this component on the shell page with Whole App to make it work on every page.',
	},
	COMMON_COMPONENT_PROPERTIES.shortcutPriority,
	{
		name: 'allowInInput',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Fire While Typing',
		description:
			'Fire even when the cursor is in a text field. Defaults on for combos that use Ctrl or Cmd, off for bare keys so typing never triggers them.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'preventDefault',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Prevent Browser Default',
		description:
			'Stop the browser doing its own thing with this key. Leave on unless the key should still reach the browser.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'left',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Left',
		description: 'Left position of the design mode marker',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
	{
		name: 'top',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Top',
		description: 'Top position of the design mode marker',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
		hide: true,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [],
};

export { propertiesDefinition, stylePropertiesDefinition };
