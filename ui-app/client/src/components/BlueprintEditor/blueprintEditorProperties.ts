import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'mode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mode',
		description:
			'Prose shows one readable line per card. Advanced additionally reveals keys, kinds and order inline, without changing the layout.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_prose',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_prose',
				displayName: 'Prose',
				description: 'A name and one line per card. What a customer needs.',
			},
			{
				name: '_advanced',
				displayName: 'Advanced',
				description:
					'Adds the uid, the kind and the order integer inline. Nothing moves when it is on.',
			},
		],
	},
	{
		name: 'bands',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Bands',
		description:
			'Comma separated kinds to show, in order, e.g. "page,storage". Empty shows every band the model has. A site shows fewer than an application.',
		defaultValue: '',
		group: ComponentPropertyGroup.BASIC,
	},
	// ─── the prompt, which is part of this component ───
	//
	// The chat is NOT a separate Prompt component sitting beside the board. The
	// board is the reply: you ask for a change and the cards change, so the only
	// prose worth keeping is the last thing said. Standing the two side by side
	// also made the selection a store round trip and forced a new capability
	// onto a shared component so that a board could talk to a chat next to it.
	{
		name: 'agentEndpoint',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Agent Endpoint',
		description: 'Where the prompt sends. The appbuilder agent unless an app has its own.',
		defaultValue: '/api/ai/appbuilder/chat',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'contextSurface',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Context Surface',
		description:
			'What kind of screen this is, told to the agent so it reads the selection correctly.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'askPlaceholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Ask Placeholder',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},

	// ─── no site chosen ───
	//
	// AI Studio hangs off the account rail, outside any one site, so arriving
	// with nothing selected is an ordinary first step. The board cannot guess
	// which site was meant and must not try: planning the wrong one is worse
	// than asking.
	{
		name: 'pickTitle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pick A Site Title',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'pickText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pick A Site Text',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'pickPlaceholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Pick A Site Search Placeholder',
		description:
			'The picker is a search, not a list. A real account has hundreds of sites and nobody scans them.',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'appTileImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Site Tile Image Url',
		description:
			'A url template for the picture on a site tile, with {appCode} where the code goes. Left empty the tiles are plain. This is a property and not something the component builds, because the service that renders a site to a picture belongs to the product, not here: SiteZump has one at urlimage.sitezump.ai and App Builder does not.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// ─── no plan yet ───
	//
	// Two different situations wearing one name. A site with nothing in it is
	// asked what we are building. A site that already exists is offered a read
	// of itself, because "what are we building" is an odd question to ask
	// somebody about the sixty-four pages they already have.
	{
		name: 'newTitle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Site Title',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'newText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Site Text',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'newPlaceholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Site Placeholder',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'newSubmitLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Site Submit Label',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'derivedTitle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Existing Site Title',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'derivedText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Existing Site Text',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'derivedSubmitLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Existing Site Submit Label',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'sendLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Send Label',
		description: 'The label on the prompt button once a plan exists.',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'buildEndpoint',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Build Progress Stream',
		description:
			'Where to watch a build, with {job} where the job id goes. Same contract as the plan stream, and a separate property because a build reports different work and a host may put the two behind different routes.',
		defaultValue: '/api/ai/blueprint/build/{job}/stream',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'buildLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Build Label',
		description:
			'The action that turns the plan into real objects. Shown with a count of what is outstanding, and disabled when there is nothing to make.',
		defaultValue: 'Build it',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'viewSiteLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'View Site Label',
		defaultValue: 'View site',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'whyLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Why These Choices Label',
		description:
			'Opens the record of decisions behind the site. Hidden when the plan records none, because an empty screen reached by a button is worse than no button.',
		defaultValue: 'Why these choices',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'draftUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Draft Site URL',
		description:
			'Where the site can be seen BEFORE it is published. Empty hides the action, which is the right answer when no draft link has been minted: minting one rotates any existing link and revokes it, so it is never something a view should do on its own.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'draftLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'View Draft Label',
		defaultValue: 'View draft',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'siteUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Site URL',
		description:
			'Where the site can be seen. Empty hides the action rather than offering a link to nowhere.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'progressEndpoint',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Plan Progress Stream',
		description:
			'Where to watch a planning sweep, with {job} where the job id goes. The component holds this open and the service writes when the progress changes; empty turns the live view off and leaves the host to update the board itself.',
		defaultValue: '/api/ai/blueprint/plan/{job}/stream',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'regenerateLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Regenerate Label',
		description:
			'The board header action that reads the whole app again and rewrites the plan from it. Never automatic: a plan is also a record of decisions, and re-deriving it on every open would spend tokens on the visits that only wanted to read it.',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'noteMessage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Foot Note',
		description: 'A quiet aside under the last band. Empty shows nothing.',
		defaultValue: '',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'readOnly',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Read Only',
		description: 'Render the board without any affordance that would change it.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'allowAdd',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Add',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'allowRemove',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Remove',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'allowReorder',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Reorder',
		description: 'Drag a card to move it. Rewrites the order integer across its siblings.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'showLens',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Feature Lens',
		description:
			'The row of feature chips along the top. A feature cuts across bands, so it is a filter rather than a band of its own.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},

	// ─── icons, one slot each per platform convention ───
	{
		name: 'pageIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Page Column Icon',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'storageIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Storage Column Icon',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'chromeIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Chrome Card Icon',
		description: 'Marks a nav bar or footer card as shell rather than content.',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'menuIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Card Menu Icon',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'addIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Add Icon',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// ─── events ───
	{
		name: 'onChange',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Change',
		description:
			'Any edit landed. The payload names WHICH object changed; without that the host cannot know which of N documents to save.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onSelect',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Select',
		description:
			'The selection changed. The selection is the prompt context, so this is normally wired to whatever feeds the chat.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Open',
		description: 'A card was expanded. Use it to select the matching component on a canvas.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onApply',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Apply',
		description:
			'Put a pending card onto the definition. That is a build, not an edit, so the host does it.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onUpdatePlan',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Update Plan',
		description:
			'Reconcile a drifted card. Runs definition to plan, and must never move the definition.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onExplain',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Explain',
		description:
			'Derive a description for a card or a column. Costs tokens, so it is always an explicit act and never automatic.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onNeedObject',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Need Object',
		description:
			'A column was opened whose detail is not loaded, or the agent reported saving one. The app plan indexes every object, so detail is fetched lazily.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onPickApp',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Pick Site',
		description:
			'A site was chosen on the picker. The host sets it as the current app and loads its plan.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onSearchApps',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Search Sites',
		description:
			'Somebody typed in the site search, debounced. The host queries the platform and replaces the list. Server-side on purpose: filtering a fetched page of sites omits whatever did not fit in it, and insists the missing ones do not exist.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onGeneratePlan',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Generate Plan',
		description:
			'Write a plan for a site that has none, by reading what is already built. The metered call, so it is always an explicit press and never automatic.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onBuild',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Build',
		description:
			'Turn the plan into objects that exist. The one action here that changes the site rather than the plan, so it is always an explicit press.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'publishLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Publish button label',
		description:
			'The button that puts what has been built on the site. The COUNT is appended ' +
			'by the component, so this is the verb only: a person should read "Put on the ' +
			'site · 5 changes" and know what they are about to do.',
		defaultValue: 'Put on the site',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'pendingCount',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'How much is waiting to go on the site',
		description:
			'How many built things are not yet published, from ' +
			'GET /api/ai/blueprint/pending. Zero HIDES the publish button rather than ' +
			'disabling it: a button offering to publish nothing is how people learn to ' +
			'distrust the next one.',
		defaultValue: 0,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'onPublish',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Publish',
		description:
			'Make what has been built visible to the public. Separate from building on purpose: the objects existing and the world seeing them are two decisions.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onRefresh',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Refresh',
		description:
			'A prompt turn ended. Re-read the plan rather than guessing what the agent changed: a turn can touch several objects.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
];

const { layout, position, spacing, typography, border, size, background, effects, scrollbar } =
	COMPONENT_STYLE_GROUP_PROPERTIES;

/**
 * Style slots.
 *
 * Three rules, and the second one is the trap:
 *
 * 1. Each name must be IDENTICAL here, in the `subComponentName` passed to
 *    <SubHelperComponent>, and in SubComponentDefinitions['BlueprintEditor'].
 * 2. No name may be a SUFFIX of another. SubHelperComponent matches with
 *    `selectedSubComponent.endsWith(subComponentName)`, so a slot called `card`
 *    alongside `chromeCard` would highlight both. Hence `planCard` not `card`,
 *    and `railColumn` not `column`.
 * 3. The registry entry list starts with the root, `name: ''`, mainComponent.
 *
 * Selected, expanded and hovered are PSEUDO STATES rather than slots, so every
 * slot gets each variant instead of only the card having one.
 */
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		layout.type,
		position.type,
		spacing.type,
		typography.type,
		border.type,
		size.type,
		background.type,
		effects.type,
		scrollbar.type,
	],

	boardHeader: [layout.type, spacing.type, size.type, border.type, background.type],
	boardTitle: [typography.type, spacing.type, size.type],
	boardDescription: [typography.type, spacing.type, size.type],

	lensRow: [layout.type, spacing.type, size.type],
	lensLabel: [typography.type, spacing.type],
	lensChip: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	lensChipCount: [typography.type, spacing.type, effects.type],

	band: [layout.type, spacing.type, size.type, background.type, border.type],
	bandHeading: [typography.type, spacing.type, size.type],
	bandSubLine: [typography.type, spacing.type, size.type],

	rail: [layout.type, spacing.type, size.type, background.type, scrollbar.type],
	railColumn: [layout.type, spacing.type, size.type, background.type, border.type],

	columnHeader: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	columnIcon: [typography.type, spacing.type, size.type, effects.type],
	columnHeadText: [layout.type, spacing.type, size.type],
	columnLine: [typography.type, spacing.type, size.type],
	// What a column touches and what touches it. Two slots, because a theme
	// that wants the row laid out differently and one that wants the chips
	// coloured differently are different wishes.
	columnConnections: [layout.type, spacing.type, size.type],
	connectionChip: [typography.type, spacing.type, background.type, border.type],
	columnName: [typography.type, spacing.type, size.type],
	columnRollup: [typography.type, spacing.type],
	columnMenu: [
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],

	planCard: [
		layout.type,
		position.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	cardTitle: [typography.type, spacing.type, size.type],
	cardDescription: [typography.type, spacing.type, size.type],
	cardMenu: [
		position.type,
		typography.type,
		spacing.type,
		size.type,
		background.type,
		effects.type,
	],
	chromeCard: [spacing.type, size.type, border.type, background.type, effects.type],
	chromeCardIcon: [typography.type, spacing.type, size.type, effects.type],

	statusMark: [layout.type, typography.type, spacing.type],
	statusDot: [size.type, border.type, background.type, effects.type],

	cardDetail: [layout.type, spacing.type, size.type, border.type, background.type],
	fieldRow: [layout.type, spacing.type, size.type],
	fieldLabel: [typography.type, spacing.type, size.type],
	fieldValue: [typography.type, spacing.type, size.type, border.type, background.type],
	fieldHint: [typography.type, spacing.type],
	optionChipRow: [layout.type, spacing.type, size.type],
	optionChip: [
		layout.type,
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	previewFrame: [
		layout.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	previewBody: [layout.type, spacing.type, size.type, background.type],
	previewCaption: [typography.type, spacing.type, size.type, border.type, background.type],
	actionRow: [layout.type, spacing.type, size.type],
	actionButton: [
		layout.type,
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],

	addCardBox: [
		layout.type,
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	addColumnBox: [
		layout.type,
		typography.type,
		spacing.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],

	emptyState: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
	],

	// The two screens before the board, and the prompt that belongs to it.
	// None of these is an add-on: without a site there is nothing to plan,
	// without a plan there is nothing to show, and the prompt is how both of
	// those states are left behind.
	soloState: [layout.type, spacing.type, size.type],
	soloTitle: [typography.type, spacing.type],
	soloText: [typography.type, spacing.type],
	// No `appSearchInput` slot. The field is the platform's TextBox, styled by
	// the TextBox theme wherever this component is dropped, so offering a slot
	// here would invite an override that then disagrees with every other input
	// on the host app's screens.
	appSearchRow: [layout.type, spacing.type, size.type],
	appPickerRow: [layout.type, spacing.type, size.type],
	appPickerCard: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
		effects.type,
	],
	noteAside: [layout.type, spacing.type, typography.type, size.type, border.type],
	planProgress: [layout.type, spacing.type, typography.type, size.type],
	driftBanner: [layout.type, spacing.type, typography.type, background.type, border.type],
	promptFoot: [
		layout.type,
		position.type,
		spacing.type,
		size.type,
		background.type,
		effects.type,
	],
	exchangeLine: [layout.type, spacing.type, typography.type],
	contextRow: [layout.type, spacing.type, size.type],
	contextChip: [
		layout.type,
		spacing.type,
		typography.type,
		size.type,
		border.type,
		background.type,
	],
	askBox: [layout.type, spacing.type, size.type, border.type, background.type, effects.type],
	askAttachMenu: [layout.type, spacing.type, size.type, border.type, background.type],
	askRow: [layout.type, spacing.type, size.type],
	askSend: [layout.type, spacing.type, typography.type, size.type, border.type, background.type],
};

export { propertiesDefinition, stylePropertiesDefinition };
