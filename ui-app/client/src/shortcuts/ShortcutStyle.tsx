import React from 'react';
import { processStyleDefinition } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './shortcutStyleProperties';

/**
 * Styles for the two global shortcut surfaces, the conflict chooser and the cheat
 * sheet, plus the reveal rules for the inline key chips.
 *
 * Only the chips' behaviour lives here, because it is the same for every host: a
 * chip is hidden until `ShortcutModifierHold` puts the modifier's class on the body.
 * How a chip looks belongs to the component that renders it, through that
 * component's own `shortcutHint` style slot.
 */
export default function ShortcutStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		._srOnly {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		._shortcutBackdrop {
			position: fixed;
			inset: 0;
			z-index: 13;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}

		._shortcutPanel {
			display: flex;
			flex-direction: column;
			max-height: 80vh;
			min-width: 320px;
			max-width: 560px;
			overflow: hidden;
			outline: none;
		}

		._shortcutPanelHeader {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 14px 16px;
			font-size: 13px;
			font-weight: 500;
			border-bottom: 1px solid rgba(127, 127, 127, 0.2);
		}

		/* Only a cap explicitly marked as trailing (the cheat sheet's Esc) is pushed
		   right; the chooser's leading cap has text after it and must stay put. */
		._shortcutPanelHeader ._shortcutKeyCap._headerEnd {
			margin-left: auto;
		}

		._shortcutPanelFooter {
			padding: 10px 16px;
			font-size: 11px;
			opacity: 0.65;
			border-top: 1px solid rgba(127, 127, 127, 0.2);
		}

		._shortcutKeyCap {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 22px;
			padding: 3px 6px;
			border-radius: 4px;
			border: 1px solid rgba(127, 127, 127, 0.3);
			font-size: 11px;
			line-height: 1;
			white-space: nowrap;
		}

		._shortcutOptions {
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			padding: 6px;
		}

		._shortcutOption {
			display: flex;
			align-items: center;
			gap: 10px;
			width: 100%;
			padding: 10px 12px;
			border: none;
			border-radius: 5px;
			background: transparent;
			color: inherit;
			font: inherit;
			text-align: left;
			cursor: pointer;
		}

		._shortcutOptionIndex {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 18px;
			height: 18px;
			border-radius: 3px;
			border: 1px solid rgba(127, 127, 127, 0.3);
			font-size: 10px;
			flex-shrink: 0;
		}

		._shortcutOptionLabel {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		._shortcutOptionScope {
			font-size: 11px;
			opacity: 0.6;
			flex-shrink: 0;
		}

		._shortcutCheatSheetBody {
			overflow-y: auto;
			padding: 8px 16px 16px 16px;
		}

		._shortcutGroup {
			margin-top: 12px;
		}

		._shortcutGroupHeader {
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			margin-bottom: 6px;
		}

		._shortcutRow {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 5px 0;
			font-size: 13px;
		}

		._shortcutRow ._shortcutKeyCap {
			flex-shrink: 0;
			min-width: 56px;
		}

		._shortcutEmpty {
			padding: 24px 0;
			text-align: center;
			font-size: 13px;
			opacity: 0.6;
		}

		/* The inline key chip. It sits in its host's normal flow, so it is aligned by
		   the host's own layout and never needs measuring. Everything here is
		   structure; colour, padding, radius and font come from the host's slot. */
		._shortcutHint {
			display: none;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			line-height: 1;
			white-space: nowrap;
			pointer-events: none;
			user-select: none;
		}

		/* A combo carries one class per modifier it uses, so ⇧⌘O reveals under Cmd.
		   Reveal rides on display, which means a host slot that sets display itself
		   gets a permanently visible chip. */
		body._modMeta ._shortcutHint._needsMeta,
		body._modCtrl ._shortcutHint._needsCtrl,
		body._modAlt ._shortcutHint._needsAlt {
			display: inline-flex;
		}

	` + processStyleDefinition('', styleProperties, styleDefaults, theme);

	return <style id="shortcutCss">{css}</style>;
}
