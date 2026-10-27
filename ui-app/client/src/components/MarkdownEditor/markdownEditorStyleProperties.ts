import { StylePropertyDefinition } from '../../types/common';

/**
 * MarkdownEditor theme variables.
 *
 * The block editor paints with `--mde-*` custom properties (see
 * blockEditor/theme/baseStyles.ts). Each one is set here from the app theme so
 * a theme can override it, and the defaults derive from the few slots every
 * theme carries: `fontColorOne` (ink), `backgroundColorSeven` (surface),
 * `colorTen` (links) and the status colours. Muted text, borders and hovers are
 * the ink mixed toward transparent, so they read on light and dark themes alike.
 *
 * MarkdownEditorStyle also writes the colour variables onto
 * `.mde-cp-pop--portal`: the colour picker popover portals to <body>, outside
 * the component, and would otherwise lose every variable.
 */

const VARS_SEL = '.comp.compMarkdownEditor';

const ink = (percent: number) => `color-mix(in srgb, <fontColorOne> ${percent}%, transparent)`;

export const styleProperties: Array<StylePropertyDefinition> = [
	// ─── Colours ───
	{
		gn: 'Colours',
		dn: 'Text',
		n: 'markdownEditorTextColor',
		dv: '<fontColorOne>',
		cp: '--mde-text-primary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Secondary Text',
		n: 'markdownEditorSecondaryTextColor',
		dv: ink(75),
		cp: '--mde-text-secondary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Muted Text',
		n: 'markdownEditorMutedTextColor',
		dv: ink(50),
		cp: '--mde-text-muted',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Links and Caret',
		n: 'markdownEditorAccentColor',
		dv: '<colorTen>',
		cp: '--mde-accent',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Selection',
		n: 'markdownEditorSelectionColor',
		dv: 'color-mix(in srgb, <colorTen> 22%, transparent)',
		cp: '--mde-accent-muted',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Menu Background',
		n: 'markdownEditorMenuBackground',
		dv: '<backgroundColorSeven>',
		cp: '--mde-bg-primary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Code Background',
		n: 'markdownEditorCodeBackground',
		dv: ink(6),
		cp: '--mde-bg-tertiary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Hover Background',
		n: 'markdownEditorHoverBackground',
		dv: ink(6),
		cp: '--mde-bg-hover',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Active Background',
		n: 'markdownEditorActiveBackground',
		dv: ink(10),
		cp: '--mde-bg-active',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Border',
		n: 'markdownEditorBorderColor',
		dv: ink(14),
		cp: '--mde-border-primary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Strong Border',
		n: 'markdownEditorStrongBorderColor',
		dv: ink(22),
		cp: '--mde-border-secondary',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Subtle Border',
		n: 'markdownEditorSubtleBorderColor',
		dv: ink(8),
		cp: '--mde-border-subtle',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Menu Shadow',
		n: 'markdownEditorShadowColor',
		dv: 'rgba(15, 15, 15, 0.14)',
		cp: '--mde-shadow',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Danger',
		n: 'markdownEditorDangerColor',
		dv: '<errorColor>',
		cp: '--mde-text-danger',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Success',
		n: 'markdownEditorSuccessColor',
		dv: '<successColor>',
		cp: '--mde-success',
		sel: VARS_SEL,
		np: true,
	},
	{
		gn: 'Colours',
		dn: 'Warning',
		n: 'markdownEditorWarningColor',
		dv: '<warningColor>',
		cp: '--mde-warning',
		sel: VARS_SEL,
		np: true,
	},

	// ─── Text ───
	{
		gn: 'Text',
		dn: 'Font Family',
		n: 'markdownEditorFontFamily',
		dv: 'inherit',
		cp: 'font-family',
		sel: '.comp.compMarkdownEditor .mde-editor',
		np: true,
	},
	{
		gn: 'Text',
		dn: 'Font Size',
		n: 'markdownEditorFontSize',
		dv: '16px',
		cp: 'font-size',
		sel: '.comp.compMarkdownEditor .mde-editor',
		np: true,
	},
	{
		gn: 'Text',
		dn: 'Line Height',
		n: 'markdownEditorLineHeight',
		dv: '1.6',
		cp: 'line-height',
		sel: '.comp.compMarkdownEditor .mde-editor',
		np: true,
	},

	// ─── Layout ───
	{
		gn: 'Layout',
		dn: 'Editor Padding',
		n: 'markdownEditorPadding',
		dv: '8px 16px 8px 52px',
		cp: 'padding',
		sel: '.comp.compMarkdownEditor ._editorArea',
		np: true,
	},
	{
		gn: 'Layout',
		dn: 'Raw Markdown Padding',
		n: 'markdownEditorRawPadding',
		dv: '12px 16px',
		cp: 'padding',
		sel: '.comp.compMarkdownEditor ._rawText',
		np: true,
	},
	{
		gn: 'Layout',
		dn: 'Raw Markdown Font Family',
		n: 'markdownEditorRawFontFamily',
		dv: '"SF Mono", Menlo, Consolas, monospace',
		cp: 'font-family',
		sel: '.comp.compMarkdownEditor ._rawText',
		np: true,
	},
	{
		gn: 'Layout',
		dn: 'Raw Markdown Font Size',
		n: 'markdownEditorRawFontSize',
		dv: '13px',
		cp: 'font-size',
		sel: '.comp.compMarkdownEditor ._rawText',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = styleProperties;
