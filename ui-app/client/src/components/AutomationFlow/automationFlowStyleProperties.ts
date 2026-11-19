import { StylePropertyDefinition } from '../../types/common';

/**
 * The flow's palette and geometry as theme variables, the BlueprintEditor way.
 *
 * Every rule in AutomationFlowStyle.tsx is written against the custom
 * properties declared on the root there, never against a literal, so a theme
 * repoints the whole flow by setting the names below. The literals live in the
 * root block of the style file, not as `dv` here: a `dv` is injected as a real
 * rule every theme would have to restate. `dv` appears only where a standard
 * app variable means the same thing (ink, surface, the status colours).
 */
const SEL = '.comp.compAutomationFlow';

const v = (
	gn: string,
	dn: string,
	n: string,
	cp: string,
	de?: string,
	dv?: string,
): StylePropertyDefinition => ({
	gn,
	dn,
	n,
	cp,
	sel: SEL,
	np: true,
	...(de ? { de } : {}),
	...(dv ? { dv } : {}),
});

export const styleProperties: Array<StylePropertyDefinition> = [
	// ── palette ──
	v(
		'Flow Palette',
		'Surface Background',
		'automationFlowSurface',
		'--_afSurface',
		'Card fill and the side panel.',
		'<backgroundColorSeven>',
	),
	v(
		'Flow Palette',
		'Ground Background',
		'automationFlowGround',
		'--_afGround',
		'Behind the flow and inside chips.',
	),
	v(
		'Flow Palette',
		'Ink Color',
		'automationFlowInk',
		'--_afInk',
		'Sentence text.',
		'<fontColorOne>',
	),
	v(
		'Flow Palette',
		'Muted Ink Color',
		'automationFlowInkMuted',
		'--_afInkMuted',
		'Verbs, lane labels, hints.',
	),
	v(
		'Flow Palette',
		'Border Color',
		'automationFlowBorder',
		'--_afBorder',
		'Card and input borders.',
	),
	v(
		'Flow Palette',
		'Rail Color',
		'automationFlowRail',
		'--_afRail',
		'The rail between cards and the lane bars.',
	),
	v(
		'Flow Palette',
		'Accent Color',
		'automationFlowAccent',
		'--_afAccent',
		'Selection ring, the "+" and the taken lane.',
	),
	v(
		'Flow Palette',
		'Chip Background',
		'automationFlowChip',
		'--_afChip',
		'Behind a chosen value in a sentence.',
	),
	v('Flow Palette', 'Chip Ink Color', 'automationFlowChipInk', '--_afChipInk'),
	// ── verbs ── one colour per card kind, on the card's left edge and its verb
	v('Card Kinds', 'When Color', 'automationFlowWhenColor', '--_afWhen'),
	v('Card Kinds', 'Do Color', 'automationFlowDoColor', '--_afDo'),
	v('Card Kinds', 'Wait Color', 'automationFlowWaitColor', '--_afWait'),
	v('Card Kinds', 'If Color', 'automationFlowIfColor', '--_afIf'),
	v('Card Kinds', 'At The Same Time Color', 'automationFlowSplitColor', '--_afSplit'),
	v('Card Kinds', 'End Color', 'automationFlowEndColor', '--_afEnd'),
	// ── status ──
	v(
		'Flow Status',
		'Done Color',
		'automationFlowDoneColor',
		'--_afDone',
		undefined,
		'<successColor>',
	),
	v(
		'Flow Status',
		'Waiting Color',
		'automationFlowWaitingColor',
		'--_afWaiting',
		undefined,
		'<informationColor>',
	),
	v(
		'Flow Status',
		'Warning Color',
		'automationFlowWarningColor',
		'--_afWarning',
		undefined,
		'<warningColor>',
	),
	v(
		'Flow Status',
		'Failed Color',
		'automationFlowFailedColor',
		'--_afFailed',
		undefined,
		'<errorColor>',
	),
	// ── geometry ──
	v('Flow Geometry', 'Card Radius', 'automationFlowCardRadius', '--_afCardRadius'),
	v(
		'Flow Geometry',
		'Card Gap',
		'automationFlowGap',
		'--_afGap',
		'The rail length between two cards.',
	),
	v('Flow Geometry', 'Panel Width', 'automationFlowPanelWidth', '--_afPanelWidth'),
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = styleProperties;
