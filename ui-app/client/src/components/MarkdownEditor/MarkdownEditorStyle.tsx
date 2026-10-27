import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { BLOCK_EDITOR_CSS } from './blockEditor/theme/baseStyles';
import { styleDefaults, styleProperties } from './markdownEditorStyleProperties';

const PREFIX = '.comp.compMarkdownEditor';

// The colour picker popover portals to <body>, outside the component, so the
// themed custom properties are written onto it as well.
const portalProperties = styleProperties
	.filter(p => p.cp?.startsWith('--'))
	.map(p => ({ ...p, sel: '.mde-cp-pop--portal' }));

// Editor variables that follow from the themed ones in
// markdownEditorStyleProperties.ts, so a theme only has to set the base set.
const DERIVED_VARS = `
	--mde-bg-secondary: var(--mde-bg-primary);
	--mde-surface: var(--mde-bg-primary);
	--mde-surface-elevated: var(--mde-bg-primary);
	--mde-surface-sidebar: var(--mde-bg-tertiary);
	--mde-border: var(--mde-border-primary);
	--mde-accent-hover: var(--mde-accent);
	--mde-block-menu-bg: var(--mde-bg-primary);
	--mde-block-menu-border: var(--mde-border-primary);
	--mde-block-menu-text: var(--mde-text-primary);
	--mde-block-menu-hover: var(--mde-bg-hover);
	--mde-block-menu-active: var(--mde-bg-active);
	--mde-block-menu-active-bg: var(--mde-bg-hover);
	--mde-block-menu-divider: var(--mde-border-subtle);
	--mde-block-menu-danger: var(--mde-text-danger);
	--mde-block-menu-font: inherit;
`;

export default function MarkdownEditorStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
	const css =
		`
		${PREFIX}, .mde-cp-pop--portal {
			${DERIVED_VARS}
		}

		${PREFIX} {
			position: relative;
			display: flex;
			flex-direction: column;
			width: 100%;
			min-height: 120px;
			color: var(--mde-text-primary);
		}

		${PREFIX} ._editorArea {
			position: relative;
			flex: 1;
			min-width: 0;
		}

		${PREFIX} ._editorArea .mde-editor-container {
			min-height: 100%;
		}

		${PREFIX} ._editorArea._readOnly {
			padding-left: 16px;
		}

		${PREFIX} ._rawText {
			flex: 1;
			width: 100%;
			min-height: 240px;
			box-sizing: border-box;
			resize: vertical;
			border: none;
			outline: none;
			background: transparent;
			color: inherit;
			line-height: 1.6;
			tab-size: 2;
		}

		${PREFIX} ._preview {
			width: 100%;
		}

		${PREFIX} ._modeSwitch {
			align-self: flex-end;
			margin: 6px 8px 0 0;
			z-index: 2;
			display: flex;
			gap: 2px;
			padding: 2px;
			border-radius: 7px;
			background: var(--mde-bg-primary);
			border: 1px solid var(--mde-border-subtle);
			opacity: 0.6;
			transition: opacity 120ms ease;
		}

		${PREFIX}:hover ._modeSwitch,
		${PREFIX}:focus-within ._modeSwitch {
			opacity: 1;
		}

		${PREFIX} ._modeButton {
			border: none;
			background: transparent;
			color: var(--mde-text-muted);
			font: inherit;
			font-size: 12px;
			line-height: 1;
			padding: 5px 8px;
			border-radius: 5px;
			cursor: pointer;
		}

		${PREFIX} ._modeButton:hover {
			background: var(--mde-bg-hover);
			color: var(--mde-text-primary);
		}

		${PREFIX} ._modeButton._active {
			background: var(--mde-bg-active);
			color: var(--mde-text-primary);
		}
		` +
		BLOCK_EDITOR_CSS +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme) +
		processStyleDefinition(PREFIX, portalProperties, styleDefaults, theme);

	return <style id="MarkdownEditorCSS">{css}</style>;
}
